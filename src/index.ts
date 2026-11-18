import {init} from './models/app.js';
import routes from './route.js';
import { GameMaster } from './game/gamemaster.js';
import sockets from './sockets.js'

if(await GameMaster.test())
{
    sockets();
    routes();
    init();
}