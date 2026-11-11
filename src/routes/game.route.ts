import express from 'express';
import { rooms, type IRoom } from '../game/rooms.js';

const route = express.Router();

route.get('/host', (req: any, res: any)=>{
    res.render('new-campaign');
})

route.post('/host', (req: any, res: any)=>{
    const { name } = req.body;

    const room_tuple: [string, IRoom] = rooms.add(name);

    res.redirect('/game/' + room_tuple[0]);
})

route.get('/join', (req: any, res: any)=>{
    res.redirect('/game/' + req.query.room)
})

route.get('/:id', (req: any, res: any)=>{
    const { id } = req.params;

    const room: IRoom | null = rooms.get(id);

    if(room === null)
        return res.render('errors/room_not_exists', {ID: id});

    res.render('game');
})

export default route;