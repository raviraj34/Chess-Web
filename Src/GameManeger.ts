import { json } from "express";
import WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages.js";
import { Game } from "./Game.js";
//user , Game

export class GameManeger {
    private games: Game[];
    private pendingUser :WebSocket | null;
    private Users:WebSocket[];

    constructor(){
        this.games =[];
        this.pendingUser = null;
        this.Users = [];
    }

    addUser(socket: WebSocket){
        this.Users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket){
        //remove the user if it left the game
        this.Users =this.Users.filter(user => user !== socket);
    }

    private addHandler(socket:WebSocket){
        socket.on('message' ,(data)=>{
                const message = JSON.parse(data.toString());


             if(message.type === INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser ,socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser= socket;
                }
             }

                if(message.type === MOVE){
                    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                    if(game){
                        game.makeMove(socket, message.move);
                    }
                }





        }) 
    }

}