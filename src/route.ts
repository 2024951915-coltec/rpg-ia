import {app} from './models/app.js'
import rota from './routes/exemplo.route.js'


/**
 * Carrega todas as rotas ao mesmo tempo
 */
function loadroutes(): void
{
    app.use('/', rota);
}

export default loadroutes;