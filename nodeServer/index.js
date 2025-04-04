const express = require('express');
const fs = require('node:fs')
const app = express();

app.get("/ai",(req, res)=>{




})


const PORT = process.env.PORT ?? 3000

app.listen(3000, ()=>{
    console.log(`Servidor escuchando por el puerto http://localhost:${PORT}`);
    
})