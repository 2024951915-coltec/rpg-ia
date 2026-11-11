import { type ICharacter } from "./rules.js";
import { createCharacter } from "./character.js";

interface IRoom {
    name: string,
    characters: Map<string, ICharacter>,
    running: boolean
}

const ROOM_MAP: Map<number, IRoom> = new Map<number, IRoom>();

interface IRooms {
    add(name: string): [string, IRoom],
    get(id: string): IRoom | null,
    isRunning(id: string): boolean,
    addPlayer(id: string, player_name: string, char: ICharacter): void
}

const rooms: IRooms = {
    add(name: string): [string, IRoom] {
        let room_id = Math.round(Math.random() * 0xffffff);
        
        while(ROOM_MAP.has(room_id))
        {
            room_id = Math.round(Math.random() * 0xffffff);
        }

        ROOM_MAP.set(room_id, {
            name: name,
            characters: new Map<string, ICharacter>(),
            running: false
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
        room.characters.set(player_name, char);
    },
}

export {rooms, type IRoom};