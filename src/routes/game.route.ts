import express from 'express';
import { rooms, type IRoom } from '../game/rooms.js';

const route = express.Router();

route.get('/host', (req: any, res: any)=>{
    res.render('new-campaign');
})

route.post('/host', (req: any, res: any)=>{
    const { name, desc } = req.body;

    const room_tuple: [string, IRoom] = rooms.add(name, desc);

    res.redirect('/game/' + room_tuple[0]);
})

route.get('/join', (req: any, res: any)=>{
    const {room} = req.query;

    const r: IRoom | null = rooms.get(room);

    if(r === null)
        return res.status(404).render('errors/room_not_exists', {ID: room})

    if(!rooms.isRunning(room))
        return res.redirect('/game/' + room)
    else
        return res.status(403).render('errors/game_in_session', {ID: room});
})

route.get('/:id', (req: any, res: any)=>{
    const { id } = req.params;

    res.render('game', {ROOMID: id});
})

export default route;