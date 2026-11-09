import express from 'express';

const route = express.Router();

route.get('/', (req: any, res: any)=>{
    res.redirect('/home');
})

route.get('/home', (req: any, res: any)=>{
    res.render('home');
})

export default route;