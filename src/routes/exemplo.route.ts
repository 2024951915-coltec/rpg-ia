//exemplo de como criar subrotas usando o Express
//isso é pra evitar o problema do "pages()" no nosso primeiro projeto

import express from 'express'

//isso é uma subrota do Express
//na prática funciona de forma idêntica ao "app", mas podem ser transmitidos como módulos
const rota: any = express.Router();

//Assim você define uma página
rota.get("/", (req: any, res: any)=>{
    res.json({});
});

//por fim, só exportar a rota, e recebê-la da outra ponta:
//
//import rota from '../routes/exemplo.route.js';
//import {app} from '../models/app.js'
//
//app.use('/rota', rota);

export default rota;