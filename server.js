import makeid from "./utils.js";
import { Server } from "socket.io";
import Chess from "./logic/Chess.js";
import Room from "./Room.js";

const corsOptions = {
	origin: "http://127.0.0.1:5500",
	methods: ["GET", "POST"],
	credentials: true,
};
const io = new Server({ cors: corsOptions });
const ID_LENGTH = 6;

const state = {};
const clientRooms = {};

io.on("connection", (client) => {
	//!Leave the base room for each client.
	client.leave(client.id);

	console.log("rooms-old.", io.sockets.adapter.rooms);
	console.log("clients-old", clientRooms);

	client.on("move", handleMove);
	client.on("moveSingle", handleMoveSingle);

	client.on("newGame", handleNewGame);
	client.on("joinGame", handleJoinGame);

	client.on("newSingleGame", handleSingGame);
	client.on("newMatch", handleNewMatch);

	client.on("disconnect", handleClose);

	function handleJoinGame(roomName) {
		const room = io.sockets.adapter.rooms.get(roomName);
		if (room == undefined) {
			client.emit("unknownCode");
			return;
		}
		let numClients = room.size;

		if (numClients > 1) {
			client.emit("tooManyPlayers");
			return;
		}
		//Other client.
		const other_client = room.values().next().value;
		const new_room = new Room(
			roomName,
			1,
			clientRooms[other_client].first_turn
		);
		clientRooms[client.id] = new_room;
		client.join(roomName);
		client.number = new_room.first_turn == 1 ? 2 : 1;
		client.emit("init", client.number);

		//Start game when both users join.
		io.to(roomName).emit("start", state[roomName]);
	}

	//Room mode.
	function handleNewGame() {
		const roomName = makeid(ID_LENGTH);

		const room = new Room(roomName, 1);
		clientRooms[client.id] = room;
		state[roomName] = new Chess();

		client.join(roomName);
		client.number = room.first_turn;
		client.emit("init", room.first_turn);
		client.emit("gameCode", roomName);
	}

	//PvP mode.
	function handleNewMatch() {
		const rooms = io.sockets.adapter.rooms;
		let found = false;
		if (rooms) {
			for (let key of rooms.keys()) {
				if (found) return;
				if (rooms.get(key).size == 1) {
					const room_id = rooms.get(key).values().next().value;
					if (clientRooms[room_id].locked == 1) continue;
					found = true;
					const new_room = new Room(key, 0, clientRooms[room_id].first_turn);
					clientRooms[client.id] = new_room;
					client.join(key);
					client.number = new_room.first_turn == 1 ? 2 : 1;
					client.emit("init", client.number);

					//Start the match. there are already 2 players.
					io.to(key).emit("start", state[key]);
				}
			}
		}
		if (found) return;
		const roomName = makeid(ID_LENGTH);
		//Create state.
		state[roomName] = new Chess();
		const room = new Room(roomName, 0);
		clientRooms[client.id] = room;
		client.join(roomName);
		client.number = room.first_turn;
		client.emit("init", room.first_turn);
	}

	//Single mode.
	function handleSingGame() {
		let roomName = makeid(ID_LENGTH);
		clientRooms[client.id] = new Room(roomName, 1);

		state[roomName] = new Chess();
		client.join(roomName);
		client.emit("start", state[roomName]);
	}

	//Make a move in single player.
	function handleMoveSingle(move) {
		const roomName = clientRooms[client.id];

		if (!roomName) {
			console.log("?.");
			return;
		}

		if (move != "") {
			const winner = state[roomName.name].playMove(move);
			if (winner == 0) {
				emitGameState(roomName.name, state[roomName.name]);
			} else if (winner == "Error") {
				client.emit("error");
			} else {
				emitGameOver(roomName.name, winner, state[roomName.name]);
				state[roomName] = null;
			}
		}
	}

	//Make a move in multiplayer.
	function handleMove(move) {
		const roomName = clientRooms[client.id];

		if (!roomName) {
			console.log("?.");
			return;
		}

		const room = io.sockets.adapter.rooms.get(roomName.name);
		if (room.size != 2) {
			console.log("WAITING.");
			return;
		}
		if (state[roomName.name].turn == "w" && client.number == 2) {
			console.log("NOT your turn, white.");
			return;
		}

		if (state[roomName.name].turn == "b" && client.number == 1) {
			console.log("NOT your turn, black.");
			return;
		}

		if (move != "") {
			const winner = state[roomName.name].playMove(move);
			if (winner == 0) {
				emitGameState(roomName.name, state[roomName.name]);
			} else if (winner == "Error") {
				client.emit("error");
			} else {
				emitGameOver(roomName.name, winner, state[roomName.name]);
				const room = clientRooms[client.id];
				if (room == undefined) return;

				//Send chess game.
				//TODO:Figure it out.

				//Get clients.
				const clients = io.sockets.adapter.rooms.get(room.name);
				if (clients == undefined) return;
				//Remove server state.
				delete state[room.name];
				clients.forEach((client) => {
					//Remove client server state.
					delete clientRooms[client];
					//Kick player out from room.
					const clientSocket = io.sockets.sockets.get(client);
					clientSocket.leave(room.name);
				});
			}
		}
	}

	//!On client disconnect -> clear server state!
	function handleClose() {
		const roomName = clientRooms[client.id];
		if (roomName == undefined) return;

		//Send chess game.
		//TODO:Figure it out.

		//Get other client.
		const clients = io.sockets.adapter.rooms.get(roomName.name);
		if (!clients) {
			delete clientRooms[client.id];
			delete state[roomName.name];
			return;
		}
		const other_client = clients.values().next().value;

		//Remove server state.
		delete clientRooms[client.id];
		delete state[roomName.name];
		delete clientRooms[other_client];

		io.sockets
			.in(roomName.name)
			.emit("gameEnded", JSON.stringify({ reason: "player disconnected." }));

		//Kick other player out.
		const clientSocket = io.sockets.sockets.get(other_client);
		clientSocket.leave(roomName.name);
	}
});

function emitGameState(room, gameState) {
	// Send this event to everyone in the room.
	io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner, state) {
	// Send this event to everyone in the room.
	io.sockets.in(room).emit("gameOver", JSON.stringify({ winner, state }));
}

io.listen(3000);
