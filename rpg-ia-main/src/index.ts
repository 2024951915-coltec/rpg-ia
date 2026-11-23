import {init} from './models/app.js';
import routes from './route.js';
import { GameMaster } from './game/gamemaster.js';
import sockets from './sockets.js'

let t: boolean = false;

console.log("Testando a conectividade com a IA");
console.log("OBS.: em certos casos, a IA demora a processar. Isso acontece quando há alta demanda, e é normal")

while(!t)
{
    try
    {
        t = await GameMaster.test();
    }
    catch(e)
    {
        console.log("Erro ao testar a IA! Tentando conectar novamente...", e);
    }
}

sockets();
routes();
init();