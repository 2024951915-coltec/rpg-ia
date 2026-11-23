import {app} from './models/app.js'
import home from './routes/home.route.js';
import game from './routes/game.route.js';


/**
 * Carrega todas as rotas ao mesmo tempo
 */
function loadroutes(): void
{
    app.use('/', home);
    app.use('/game', game);
}

export default loadroutes;