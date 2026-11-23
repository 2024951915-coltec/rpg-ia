import { io } from "./models/app.js";
import { createCharacter } from "./game/character.js";
import { type ICharacter, type IPrimAtts, type Skill} from "./game/rules.js";
import { rooms, type IContext, type IRoom } from "./game/rooms.js";
import { GameMaster } from "./game/gamemaster.js";
import { type IConflict, type IPACheck, type ISkillCheck, Check } from "./game/resolution.js";

function sockets(): void
{
    io.on('connection',(socket)=>{
        let room: string;

        socket.on('create-char', async (char_info: any)=>{
            room = char_info.room_id as string;
            await socket.join(room);


            let char: ICharacter = createCharacter(
                char_info.nome as string, 
                char_info.pas as IPrimAtts, 
                char_info.tagged_skills as [Skill, Skill, Skill]
            );

            let username: string = char_info.uname as string;
            
            rooms.addPlayer(room, username, char);

            let r: IRoom = rooms.get(room) as IRoom;
            let player_turn: number = r.n_players - 1;
            let player_names: string[] = r.characters.keys().toArray();
            let player_info: ICharacter[] = [];
            r.players.forEach((player:string)=>{
                player_info.push(r.characters.get(player) as ICharacter);
            })

            socket.emit('created-char', { username: username, turn: player_turn, player_names: player_names, player_info: player_info});
            socket.to(room).emit('player-joined', {username: username, char: char});
            console.log(`${username} joined room ${room}!`);
        });

        socket.on('start-game', async ()=>{
            let r: IRoom = rooms.get(room) as IRoom;
            r.running = true;

            let cflt_ctxt_tuple: [IConflict | null, IContext | null] = [null, null];
            while(cflt_ctxt_tuple[0] === null)
            {
                try
                {
                    cflt_ctxt_tuple = await GameMaster.createInitialConflict(r.desc);
                }
                catch(e)
                {
                    console.log('Falhou ao tentar criar primeiro conflito. Tentando novamente...')
                    continue;
                }
            }
            rooms.setConflict(room, cflt_ctxt_tuple[0] as IConflict, cflt_ctxt_tuple[1] as IContext);

            console.log('Conseguiu:', cflt_ctxt_tuple);

            io.to(room).emit('game-started', cflt_ctxt_tuple[0]);
        });

        socket.on('skill-check', async (check: any)=>{
            let r: IRoom = rooms.get(room) as IRoom;
            if(r.conflict === null) return;

            let cflt: IConflict = r.conflict as IConflict;
            let skill_check: ISkillCheck = cflt.skillchecks[check.sc_idx as number] as ISkillCheck;

            let p_name: string = check.player_name as string;
            let char: ICharacter = r.characters.get(p_name) as ICharacter;
            let passed: boolean = Check.Skill(char, skill_check);

            rooms.setContext(room, skill_check.desc, char.name, passed);
            
            let cflt_ctxt_tuple: [IConflict | null, IContext | null] = [null, null];
            while(cflt_ctxt_tuple[0] === null)
            {
                try
                {
                    cflt_ctxt_tuple = await GameMaster.createConflictWithContext(rooms.getContext(room) as IContext);
                }
                catch(e)
                {
                    console.log('Falhou ao criar novo conflito. Tentando de novo...')
                    continue;
                }
            }

            rooms.setConflict(room, cflt_ctxt_tuple[0], cflt_ctxt_tuple[1] as IContext);

            io.to(room).emit('next-conflict', {passed: passed, conflict: cflt_ctxt_tuple[0]});
        })

        socket.on('pa-check', async (check: any)=>{
            let r: IRoom = rooms.get(room) as IRoom;
            if(r.conflict === null) return;

            let cflt: IConflict = r.conflict as IConflict;
            let pa_check: IPACheck = cflt.pachecks[check.pac_idx as number] as IPACheck;

            let p_name: string = check.player_name as string;
            let char: ICharacter = r.characters.get(p_name) as ICharacter;
            let passed: boolean = Check.PA(char, pa_check);

            rooms.setContext(room, pa_check.desc, char.name, passed);
            
            let cflt_ctxt_tuple: [IConflict | null, IContext | null] = [null, null];
            while(cflt_ctxt_tuple[0] === null)
            {
                try
                {
                    cflt_ctxt_tuple = await GameMaster.createConflictWithContext(rooms.getContext(room) as IContext);
                }
                catch(e)
                {
                    console.log('Falhou ao criar novo conflito. Tentando de novo...')
                    continue;
                }
            }

            rooms.setConflict(room, cflt_ctxt_tuple[0], cflt_ctxt_tuple[1] as IContext);

            io.to(room).emit('next-conflict', {passed: passed, conflict: cflt_ctxt_tuple[0]});
        })
    })
}

export default sockets;