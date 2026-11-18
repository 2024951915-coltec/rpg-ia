import { io } from "./models/app.js";
import { createCharacter } from "./game/character.js";
import { type ICharacter, type IPrimAtts, type Skill} from "./game/rules.js";
import { rooms, type IRoom } from "./game/rooms.js";

function sockets(): void
{
    io.on('connection',(socket)=>{
        socket.on('create-char',(char_info: any)=>{
            console.log(char_info);

            let char: ICharacter = createCharacter(
                char_info.nome as string, 
                char_info.pas as IPrimAtts, 
                char_info.tagged_skills as [Skill, Skill, Skill]
            );

            console.log('Criou:', char);
        })
    })
}

export default sockets;