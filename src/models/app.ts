import express from 'express';
const app: any = express();


function init() {
    app.listen(3000, ()=>{console.log("http://localhost:3000/")});
}

export {init};