import WebSocket from "ws";
import { Chess ,ChessInstance, Square  } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from "./messages.js";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: ChessInstance ;
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        console.log("Creating new game with player1 and player2...");
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date(); // FIX: Added ()

        // Notify players of the game start and their colors
        console.log("Sending INIT_GAME message to player1...");
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }));

        console.log("Sending INIT_GAME message to player2...");
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }

    makeMove(socket: WebSocket, move: { from: Square; to: Square; }) {
        // 1. Validate whose turn it is
        const isWhiteTurn = this.board.turn() === 'w';
        if ((isWhiteTurn && socket !== this.player1) || (!isWhiteTurn && socket !== this.player2)) {
            console.error("Error: Move received from wrong player.");
            return;
        }
    
        // 2. Try to make the move
        try {
            this.board.move(move);
        } catch (e) {
            console.error("Error: Invalid move attempted.");
            return;
        }
    
        // 3. Check for game over
        if (this.board.game_over()) {
            const winnerColor = this.board.turn() === 'w' ? "black" : "white";
            const gameOverMessage = JSON.stringify({
                type: GAME_OVER,
                payload: { winner: winnerColor }
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
            return;
        }
    
        // 4. Broadcast the move to the OPPONENT
        const moveMessage = JSON.stringify({ type: MOVE, payload: move });
    
        // FIX: Explicitly check who the opponent is
        if (socket === this.player1) {
            // Player 1 just moved, send to Player 2
            console.log("Sending Player 1's move to Player 2...");
            if (this.player2.readyState === WebSocket.OPEN) {
                this.player2.send(moveMessage);
            } else {
                console.error("Error: Player 2 connection is not open.");
            }
        } else {
            // Player 2 just moved, send to Player 1
            console.log("Sending Player 2's move to Player 1...");
            if (this.player1.readyState === WebSocket.OPEN) {
                this.player1.send(moveMessage);
            } else {
                console.error("Error: Player 1 connection is not open.");
            }
        }
    }
}