import { Server } from "socket.io";
import SingleSocketController from "./src/controllers/multiplayerController.js";
import MultiSocketController from "./src/controllers/multiplayerController.js";
import RoomsSocketController from "./src/controllers/roomsController.js";

const corsOptions = {
	origin: "http://127.0.0.1:5500",
	methods: ["GET", "POST"],
	credentials: true,
};

// Create a socket.io instance and listen to the server
const io = new Server({ cors: corsOptions });

let serverState = {
	state: {},
	clientRooms: {},
};

io.on("connection", (client) => {
	console.log(`User connected: ${client.id}`);
	client.leave(client.id);
	// Create a new instance of SocketController
	//const singleController = new SingleSocketController(io, client, serverState);
	const multiController = new MultiSocketController(io, client, serverState);
	const roomsController = new RoomsSocketController(io, client, serverState);
});

// Start the server
const port = process.env.PORT || 3000;
io.listen(port);
