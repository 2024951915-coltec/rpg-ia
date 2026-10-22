import express from 'express';

/** A porta onde o servidor é aberto */
const PORT = 3000;

/** 
 * Uma aplicação do Express. 
 * 
 * É marcada como ANY, pois o Express é escrito em JS e não possui definições de tipo
 */
const app: any = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

/** 
 * Inicializa o servidor 
 */
function init(): void {
    app.listen(PORT, ()=>{console.log(`http://localhost:${PORT}/`)});
}

export {init, app};