import {init} from './models/app.js';
import routes from './route.js';
import { GameMaster } from './game/gamemaster.js';

if(await GameMaster.test())
{
    routes();
    init();
}