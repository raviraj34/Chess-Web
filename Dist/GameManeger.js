import { INIT_GAME, MOVE } from "./messages.js";
import { Game } from "./Game.js";
//user , Game
export class GameManeger {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.Users = [];
    }
    addUser(socket) {
        this.Users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        //remove the user if it left the game
        this.Users = this.Users.filter(user => user !== socket);
    }
    addHandler(socket) {
        socket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
        });
    }
}
