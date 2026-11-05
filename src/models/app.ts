import express from 'express';
import session from 'express-session';

/** A porta onde o servidor é aberto */
const PORT = 3000;

/** 
 * Uma aplicação do Express. 
 * 
 * É marcada como ANY, pois o Express é escrito em JS e não possui definições de tipo
 */
const app: any = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use(session({
    secret: 'patos-alados-boiados-noiados',
    resave: false,
    saveUninitialized: false
}))

function auth(req: any, res: any, next: any): void {
    if(req.session.user !== undefined)
        next();
    else res.status(401).render('errors/401');
}
/** 
 * Inicializa o servidor 
 */
function init(): void {
    app.use((req:any, res:any)=>{
        res.render('errors/404');
    })

    app.listen(PORT, ()=>{console.log(`http://localhost:${PORT}/`)});
}

export {init, app};