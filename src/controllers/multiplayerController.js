import Chess from "../../logic/Chess.js";
import Room from "../models/Room.js";
import makeid from "../../utils.js";
import Settings from "../models/Settings.js";

class MultiSocketController {
	constructor(io, socket, ss) {
		this.io = io;
		this.socket = socket;
		this.serverState = ss;
		// Register event handlers
		this.socket.on("newMatch", this.handleNewMatch.bind(this));
		this.socket.on("move", this.handleMove.bind(this));
		this.socket.on("disconnect", this.handleClose.bind(this));
	}
	//PvP mode.
	handleNewMatch(settings) {
		const rooms = this.io.sockets.adapter.rooms;
		for (let key of rooms.keys()) {
			if (rooms.get(key).size == 1) {
				const room_id = rooms.get(key).values().next().value;
				const found_room = this.serverState.clientRooms[room_id];
				//Is it locked for custom play.
				if (found_room.locked == 1) continue;
				//Does it match the settings enviroment.
				if (!Settings.compare(found_room.settings, settings)) continue;
				const new_room = new Room(
					key,
					0,
					this.serverState.clientRooms[room_id].first_turn,
					settings
				);
				this.serverState.clientRooms[this.socket.id] = new_room;
				this.socket.join(key);
				this.socket.number = new_room.first_turn == 1 ? 2 : 1;
				this.socket.emit("init", this.socket.number);
				//Start the match. there are already 2 players.
				this.io.to(key).emit("start", this.serverState.state[key]);
				return;
			}
		}
		//Create a new room.
		const roomName = makeid(6);
		//Create state.
		this.serverState.state[roomName] = new Chess();
		const room = new Room(roomName, 0, null, settings);
		this.serverState.clientRooms[this.socket.id] = room;
		this.socket.join(roomName);
		this.socket.number = room.first_turn;
		this.socket.emit("init", room.first_turn);
	}
	//Make a move in multiplayer.
	handleMove(move) {
		const roomName = this.serverState.clientRooms[this.socket.id];

		if (!roomName) {
			console.log("?.");
			return;
		}

		const room = this.io.sockets.adapter.rooms.get(roomName.name);
		if (room.size != 2) {
			console.log("WAITING.");
			return;
		}
		if (
			this.serverState.state[roomName.name].turn == "w" &&
			this.socket.number == 2
		)
			return;

		if (
			this.serverState.state[roomName.name].turn == "b" &&
			this.socket.number == 1
		)
			return;

		if (move.length == 0) {
			this.socket.emit("error", "Move is not in the valid format.");
			return;
		}
		const winner = this.serverState.state[roomName.name].playMove(move);
		const gameState = this.serverState.state[roomName.name];
		if (winner == 0) {
			this.io.to(roomName.name).emit("gameState", gameState);
			this.io
				.to(roomName.name)
				.emit(
					"history",
					gameState.parseHistory(roomName.settings.historyReduce)
				);
		} else if (winner[0] == false) {
			this.socket.emit("error", winner[1]);
		} else {
			this.io.to(roomName.name).emit("gameOver", { winner, gameState });
			this.io
				.to(roomName.name)
				.emit(
					"history",
					gameState.parseHistory(roomName.settings.historyReduce)
				);
			const room = this.serverState.clientRooms[this.socket.id];
			if (room == undefined) return;
			//Get clients.
			const clients = this.io.sockets.adapter.rooms.get(room.name);
			if (clients == undefined) return;
			//Remove server state.
			delete this.serverState.state[room.name];
			clients.forEach((client) => {
				//Remove this.socket server state.
				delete this.serverState.clientsRooms[client.id];
				//Kick player out from room.
				const clientSocket = this.io.sockets.sockets.get(client);
				clientSocket.leave(room.name);
			});
		}
	}

	//!On this.socket disconnect -> clear server state!
	handleClose() {
		const roomName = this.serverState.clientRooms[this.socket.id];
		if (roomName == undefined) return;
		//Get other this.socket.
		const clients = this.io.sockets.adapter.rooms.get(roomName.name);
		if (!clients) {
			delete this.serverState.clientRooms[this.socket.id];
			delete this.serverState.state[roomName.name];
			return;
		}
		const other_client = clients.values().next().value;

		//Remove server state.
		delete this.serverState.clientRooms[this.socket.id];
		delete this.serverState.state[roomName.name];
		delete this.serverState.clientRooms[other_client];

		this.io.sockets
			.in(roomName.name)
			.emit("gameEnded", { reason: "player disconnected." });

		//Kick other player out.
		const clientSocket = this.io.sockets.sockets.get(other_client);
		clientSocket.leave(roomName.name);
	}
}

export default MultiSocketController;
