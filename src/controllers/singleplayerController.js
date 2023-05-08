import Chess from "../../logic/Chess.js";
import Room from "../models/Room.js";
import makeid from "../../utils.js";

class SingleSocketController {
	constructor(io, socket, ss) {
		this.io = io;
		this.socket = socket;
		this.serverState = ss;
		// Register event handlers
		this.socket.on("moveSingle", this.handleMoveSingle.bind(this));
		this.socket.on("newSingleGame", this.handleSingGame.bind(this));
	}

	//Single mode.
	handleSingGame() {
		let roomName = makeid(6);
		this.serverState.clientRooms[this.socket.id] = new Room(roomName, 1);

		this.serverState.state[roomName] = new Chess();
		this.socket.join(roomName);
		this.io.to(roomName).emit("start", this.serverState.state[roomName]);
	}

	//Make a move in single player.
	handleMoveSingle(move) {
		const roomName = this.serverState.clientRooms[this.socket.id];
		if (!roomName) {
			console.log("?.");
			return;
		}
		if (move.length == 0) {
			//this.socket.emit("error", "Move is not in the valid format.");
			this.io.to(roomName.name).emit("error", "GAY");
			return;
		}

		const winner = this.serverState.state[roomName.name].playMove(move);
		const gameState = this.serverState.state[roomName.name];
		if (winner == 0) {
			this.io.to(roomName.name).emit("gameState", gameState);
		} else if (winner[0] == false) {
			this.socket.emit("error", winner[1]);
		} else {
			this.io.to(roomName.name).emit("gameOver", { winner, gameState });
			this.serverState.state[roomName] = null;
		}
	}
}

export default SingleSocketController;
