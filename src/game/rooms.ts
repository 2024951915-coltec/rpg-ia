import { type ICharacter } from "./rules.js";
import { createCharacter } from "./character.js";
import type { IConflict } from "./resolution.js";

interface IContext {
    /** Resumo da última cena */
    prevScene: string,
    /** O índice do check testado */
    attemptedCheck: string,
    /** Jogador que foi testado */
    playerTested: string,
    /** Se o jogador passou pela resolução de conflito */
    passedCheck: boolean,
}

interface IRoom {
    /** Descrição para a IA criar o mundo */
    desc: string,
    /** Nome da sala (não é o mesmo que o ID) */
    name: string,
    /** Lista de jogadores e seus respectivos personagens */
    characters: Map<string, ICharacter>,
    /** Para verificar se o jogo já está acontecendo */
    running: boolean,
    /** Número de jogadores na sala */
    n_players: number,

    players: string[],
    /** O turno atual */
    turn: number,
    /** Contexto da última cena */
    context: IContext | null,
    /** O conflito que os jogadores hão de passar */
    conflict: IConflict | null
}

const ROOM_MAP: Map<number, IRoom> = new Map<number, IRoom>();

interface IRooms {
    /** Adiciona uma sala ao servidor */
    add(name: string, desc: string): [string, IRoom],
    /** Pega uma sala do servidor */
    get(id: string): IRoom | null,
    /** Verifica se o jogo está em execução */
    isRunning(id: string): boolean,
    /** Adiciona um jogador ao jogo */
    addPlayer(id: string, player_name: string, char: ICharacter): void,
    /** Registra se o jogador passou o conflito */
    setContext(id: string, attemptedCheck: string, player_name: string, passed: boolean): void,
    /** Registra o conflito atual, e o contexto para a criação do próximo */
    setConflict(id: string, conflict: IConflict, context: IContext): void
    /** Pega o contexto da cena anterior */
    getContext(id: string): IContext | null,
    /** Pega o conflito atual */
    getConflict(id: string): IConflict | null
}

const rooms: IRooms = {
    add(name: string, desc: string): [string, IRoom] {
        let room_id = Math.round(Math.random() * 0xffffff);
        
        while(ROOM_MAP.has(room_id))
        {
            room_id = Math.round(Math.random() * 0xffffff);
        }

        ROOM_MAP.set(room_id, {
            desc: desc,
            name: name,
            characters: new Map<string, ICharacter>(),
            running: false,
            n_players: 0,
            players: [],
            turn: 0,
            context: null,
            conflict: null
        })

        return [room_id.toString(16).padStart(6, '0'), ROOM_MAP.get(room_id) as IRoom];
    },

    get(id: string): IRoom | null {
        const room_id: number = parseInt(id, 16);

        return ROOM_MAP.get(room_id) ?? null;
    },

    isRunning(id: string): boolean {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return true;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        return room.running;
    },

    addPlayer(id: string, player_name: string, char: ICharacter): void {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        if(room.running || room.characters.has(player_name)) return;

        room.n_players += 1;
        room.players.push(player_name);
        room.characters.set(player_name, char);
    },

    setConflict(id: string, conflict: IConflict, context: IContext): void {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        room.conflict = conflict;
        room.context = context;
    },

    setContext(id: string, attemptedCheck: string, player_name: string, passed: boolean): void {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        if(room.context === null) return;
        const ctxt = room.context as IContext;

        ctxt.attemptedCheck = attemptedCheck;
        ctxt.playerTested = player_name;
        ctxt.passedCheck = passed;
    },

    getContext(id: string): IContext | null {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return null;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        return room.context;
    },

    getConflict(id: string): IConflict | null {
        const room_id: number = parseInt(id, 16);

        if(!ROOM_MAP.has(room_id)) return null;
        const room: IRoom = ROOM_MAP.get(room_id) as IRoom;

        return room.conflict;
    },
}

export {rooms, type IRoom, type IContext};