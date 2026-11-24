import { io } from "./models/app.js";
import { createCharacter } from "./game/character.js";
import { type ICharacter, type IPrimAtts, type Skill } from "./game/rules.js";
import { rooms, type IContext, type IRoom } from "./game/rooms.js";
import { GameMaster } from "./game/gamemaster.js";
import { type IConflict, type IPACheck, type ISkillCheck, Check } from "./game/resolution.js";

interface CreateCharPayload {
    room_id: string;
    nome: string;
    pas: IPrimAtts;
    tagged_skills: [Skill, Skill, Skill];
    uname: string;
}

interface CheckPayload {
    room_id?: string;
    player_name: string;
    sc_idx?: number;
    pac_idx?: number;
}

const MAX_RETRIES = 5;
const busyRooms = new Set<string>();

async function generateConflictWithRetry(
    generator: () => Promise<[IConflict | null, IContext | null]>,
    errorMessage: string,
    maxRetries = MAX_RETRIES
): Promise<[IConflict, IContext] | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const [conflict, context] = await generator();
            if (conflict && context) {
                return [conflict, context];
            }
        } catch (err) {
            console.error(`${errorMessage} (tentativa ${attempt}/${maxRetries}):`, err);
        }
    }
    return null;
}

function getRoomSnapshot(room: IRoom) {
    const playerNames = Array.from(room.characters.keys());
    const playerInfo: ICharacter[] = [];

    room.players.forEach((player: string) => {
        const char = room.characters.get(player);
        if (char) playerInfo.push(char);
    });

    return { playerNames, playerInfo };
}

function sockets(): void {
    io.on("connection", (socket) => {
        let currentRoom: string | undefined;

        const resolveRoomId = (payloadRoomId?: string): string | undefined => {
            return payloadRoomId ?? currentRoom;
        };

        async function handleCheckResolution(
            type: "skill" | "pa",
            payload: CheckPayload
        ): Promise<void> {
            const roomId = resolveRoomId(payload.room_id);
            if (!roomId) {
                socket.emit("socket-error", { message: "Sala não identificada." });
                return;
            }

            if (busyRooms.has(roomId)) {
                socket.emit("socket-error", { message: "Aguarde a resolução do teste atual." });
                return;
            }

            const room = rooms.get(roomId) as IRoom | undefined;
            if (!room || !room.conflict) {
                socket.emit("socket-error", { message: "Sala ou conflito ativo não encontrado." });
                return;
            }

            const char = room.characters.get(payload.player_name);
            if (!char) {
                socket.emit("socket-error", { message: "Personagem não encontrado na sala." });
                return;
            }

            let passed: boolean;
            let checkDesc: string;

            if (type === "skill") {
                const idx = payload.sc_idx ?? -1;
                const skillCheck = room.conflict.skillchecks[idx] as ISkillCheck | undefined;
                if (!skillCheck) {
                    socket.emit("socket-error", { message: "Teste de perícia inválido." });
                    return;
                }
                passed = Check.Skill(char, skillCheck);
                checkDesc = skillCheck.desc;
            } else {
                const idx = payload.pac_idx ?? -1;
                const paCheck = room.conflict.pachecks[idx] as IPACheck | undefined;
                if (!paCheck) {
                    socket.emit("socket-error", { message: "Teste de PA inválido." });
                    return;
                }
                passed = Check.PA(char, paCheck);
                checkDesc = paCheck.desc;
            }

            busyRooms.add(roomId);
            try {
                rooms.setContext(roomId, checkDesc, char.name, passed);

                const result = await generateConflictWithRetry(
                    () => GameMaster.createConflictWithContext(rooms.getContext(roomId) as IContext),
                    "Falha ao criar novo conflito"
                );

                if (!result) {
                    io.to(roomId).emit("conflict-error", {
                        message: "Não foi possível gerar o próximo conflito no momento."
                    });
                    return;
                }

                const [nextConflict, nextContext] = result;
                rooms.setConflict(roomId, nextConflict, nextContext);

                io.to(roomId).emit("next-conflict", {
                    passed,
                    conflict: nextConflict
                });
            } finally {
                busyRooms.delete(roomId);
            }
        }

        socket.on("create-char", async (charInfo: CreateCharPayload) => {
            try {
                if (!charInfo?.room_id || !charInfo?.uname || !charInfo?.nome) {
                    socket.emit("socket-error", { message: "Dados de criação de personagem incompletos." });
                    return;
                }

                currentRoom = charInfo.room_id;
                await socket.join(currentRoom);

                const char: ICharacter = createCharacter(
                    charInfo.nome,
                    charInfo.pas,
                    charInfo.tagged_skills
                );

                rooms.addPlayer(currentRoom, charInfo.uname, char);

                const room = rooms.get(currentRoom) as IRoom | undefined;
                if (!room) {
                    socket.emit("socket-error", { message: "Sala não encontrada após entrar." });
                    return;
                }

                const playerTurn = Math.max(0, room.n_players - 1);
                const { playerNames, playerInfo } = getRoomSnapshot(room);

                socket.emit("created-char", {
                    username: charInfo.uname,
                    turn: playerTurn,
                    player_names: playerNames,
                    player_info: playerInfo
                });

                socket.to(currentRoom).emit("player-joined", {
                    username: charInfo.uname,
                    char
                });

                console.log(`${charInfo.uname} joined room ${currentRoom}!`);
            } catch (err) {
                console.error("Erro em create-char:", err);
                socket.emit("socket-error", { message: "Erro ao criar personagem." });
            }
        });

        socket.on("start-game", async (payload?: { room_id?: string }) => {
            const roomId = resolveRoomId(payload?.room_id);
            if (!roomId) {
                socket.emit("socket-error", { message: "Sala não identificada para iniciar o jogo." });
                return;
            }

            if (busyRooms.has(roomId)) {
                socket.emit("socket-error", { message: "A sala já está processando uma ação." });
                return;
            }

            const room = rooms.get(roomId) as IRoom | undefined;
            if (!room) {
                socket.emit("socket-error", { message: "Sala não encontrada." });
                return;
            }

            busyRooms.add(roomId);
            try {
                room.running = true;

                const result = await generateConflictWithRetry(
                    () => GameMaster.createInitialConflict(room.desc),
                    "Falha ao criar primeiro conflito"
                );

                if (!result) {
                    room.running = false;
                    io.to(roomId).emit("conflict-error", {
                        message: "Não foi possível gerar o conflito inicial."
                    });
                    return;
                }

                const [initialConflict, initialContext] = result;
                rooms.setConflict(roomId, initialConflict, initialContext);

                console.log("Conflito inicial criado para a sala:", roomId);
                io.to(roomId).emit("game-started", initialConflict);
            } finally {
                busyRooms.delete(roomId);
            }
        });

        socket.on("skill-check", async (check: CheckPayload) => {
            await handleCheckResolution("skill", check);
        });

        socket.on("pa-check", async (check: CheckPayload) => {
            await handleCheckResolution("pa", check);
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket ${socket.id} desconectado (${reason}) da sala ${currentRoom ?? "sem sala"}`);
        });
    });
}

export default sockets;