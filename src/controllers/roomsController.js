import Chess from "../../logic/Chess.js";
import Room from "../models/Room.js";
import makeid from "../../utils.js";

class RoomsSocketController {
	constructor(io, socket, ss) {
		this.io = io;
		this.socket = socket;
		this.serverState = ss;
		// Register event handlers
		this.socket.on("newGame", this.handleNewGame.bind(this));
		this.socket.on("joinGame", this.handleJoinGame.bind(this));
	}
	//Room mode.
	handleJoinGame(roomName) {
		const room = this.io.sockets.adapter.rooms.get(roomName);
		if (room == undefined) {
			this.socket.emit("unknownCode");
			return;
		}
		let numClients = room.size;

		if (numClients > 1) {
			this.socket.emit("tooManyPlayers");
			return;
		}
		//Other client.
		const other_client = room.values().next().value;
		const new_room = new Room(
			roomName,
			1,
			this.serverState.clientRooms[other_client].first_turn,
			this.serverState.clientRooms[other_client].settings
		);
		this.serverState.clientRooms[this.socket.id] = new_room;
		this.socket.join(roomName);
		this.socket.number = new_room.first_turn == 1 ? 2 : 1;
		this.socket.emit("init", this.socket.number);
		this.socket.emit(
			"settings",
			this.serverState.clientRooms[other_client].settings
		);
		//Start game when both users join.
		this.io.to(roomName).emit("start", this.serverState.state[roomName]);
	}

	//Room mode.
	handleNewGame(settings) {
		const roomName = makeid(6);
		const room = new Room(roomName, 1, null, settings);
		this.serverState.clientRooms[this.socket.id] = room;
		this.serverState.state[roomName] = new Chess();

		this.socket.join(roomName);
		this.socket.number = room.first_turn;
		this.socket.emit("init", room.first_turn);
		this.socket.emit("gameCode", roomName);
	}
}

export default RoomsSocketController;
