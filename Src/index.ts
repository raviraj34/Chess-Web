import express from "express";
import { WebSocketServer ,WebSocket } from "ws";
import { GameManeger } from "./GameManeger.js";
const app = express();

app.use(express.json());
app.listen(3000);


const wss= new WebSocketServer({port:8080});

const gameManeger = new GameManeger();
wss.on("connection", function connection(ws){
    gameManeger.addUser(ws)
    console.log("Client connected");

    ws.on("message", function(message){

        console.log(message.toString());
        
    })

    ws.on("disconnect", function(){
        gameManeger.removeUser(ws);
    })


})


