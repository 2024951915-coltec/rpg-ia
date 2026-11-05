import express from 'express';
import { table } from '../models/db.js';
import bcrypt from 'bcryptjs';
const route = express.Router();

route.get('/', (req: any, res: any)=>{
    res.redirect('/home');
})

route.get('/home', (req: any, res: any)=>{
    const user = req.session.user ?? null;
    res.render('home', {USER:user});
})

route.get('/login', (req: any, res: any)=>{
    res.render('login');
})

route.post('/login', async (req:any, res:any)=>{
    let {user, pass} = req.body;
    const u = await table.users.findByPk(user);

    if(u !== null)
    {
        if(await bcrypt.compare(pass, u.passhash))
        {
            req.session.user = u;
            return res.redirect('/home');
        }
    }
    res.redirect('/login');
})

route.get('/signin', (req:any, res:any)=>{
    res.render('signin');
})

route.post('/signin', async (req:any, res:any)=>{
    console.log(req.body)
    let {user, pass} = req.body;
    const u = await table.users.findByPk(user);
    console.log(u);
    if(u === null)
    {
        await table.users.create({username:user, passhash: pass});
        res.redirect('/login');
    }
    else res.redirect('/signin');
})

export default route;