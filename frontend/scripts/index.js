const socket = io("http://localhost:3000");

socket.on("init", handleInit);
socket.on("start", init);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("gameEnded", handleGameEnd);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("error", handleError);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const waitingScreen = document.getElementById("waitingScreen");

const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const startGameBtn = document.getElementById("startGameButton");

const gameCodeInput = document.getElementById("gameCodeInput");
const inputGame = document.getElementById("gameInputField");

const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const gameTurn = document.getElementById("gameTurn");
const infoGame = document.getElementById("info_game");

const white_coords = document.getElementById("white_coords");
const black_coords = document.getElementById("black_coords");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);
startGameBtn.addEventListener("click", startGame);
inputGame.addEventListener("keydown", keydown);

function startGame() {
	socket.emit("newMatch");
	waiting();
}
function newGame() {
	socket.emit("newGame");
	waiting();
}

function joinGame() {
	const code = gameCodeInput.value;
	socket.emit("joinGame", code);
}

let canvas, ctx;
let playerNumber;

//Game active status.
let gameActive = false;

function waiting() {
	initialScreen.style.display = "none";
	waitingScreen.style.display = "block";
}

function init(base_state) {
	/*Basic part */
	initialScreen.style.display = "none";
	waitingScreen.style.display = "none";
	gameScreen.style.display = "block";
	gameTurn.innerText = "White";

	/*Draw Board. */
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	paintGame(base_state);

	/*Start game */
	gameActive = true;
}

function keydown(e) {
	if (!gameActive) {
		return;
	}
	if (e.keyCode == 13) {
		socket.emit("move", e.srcElement.value);
		inputGame.value = "";
	}
}

function paintGame(state) {
	const number_of_sqr = 8;
	const matrix = state.board.matrix;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < number_of_sqr; i++) {
		for (let j = 0; j < number_of_sqr; j++) {
			if (matrix[i][j].notation != undefined) {
				const figure = matrix[i][j];
				drawFigure(figure);
			}
		}
	}
	if (state.turn == "w") {
		if (playerNumber == 2) {
			inputGame.disabled = true;
		} else {
			inputGame.disabled = false;
		}
	}
	if (state.turn == "b") {
		if (playerNumber == 1) {
			inputGame.disabled = true;
		} else {
			inputGame.disabled = false;
		}
	}
}

function drawFigure(figure) {
	const img_height = 60;
	const img_width = 60;
	const sqr_offset = canvas.width / 8;
	const base_image = new Image();

	//Sorry, chess.com :(
	let src = "https://www.chess.com/chess-themes/pieces/neo/150/";
	src += figure.side;
	src += figure.notationsmall;
	src += ".png";
	base_image.src = src;

	// Prespective change.
	if (playerNumber == 1) {
		figure.x = Math.abs(figure.x - 7);
	} else {
		figure.y = Math.abs(figure.y - 7);
	}
	//Invert coordinates.
	base_image.onload = function () {
		ctx.drawImage(
			base_image,
			figure.y * sqr_offset + 6,
			figure.x * sqr_offset + 4,
			img_width,
			img_height
		);
	};
}

function handleInit(number) {
	playerNumber = number;
	gameCodeDisplay.innerText = "";
	if (number == 1) {
		white_coords.style.display = "block";
		black_coords.style.display = "none";
	} else {
		black_coords.style.display = "block";
		white_coords.style.display = "none";
	}
}

function handleGameState(gameState) {
	if (!gameActive) {
		return;
	}
	gameState = JSON.parse(gameState);
	gameTurn.innerText = gameTurn.innerText == "White" ? "Black" : "White";
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
	if (!gameActive) {
		return;
	}
	data = JSON.parse(data);
	requestAnimationFrame(() => paintGame(data.state));

	//End Game.
	gameActive = false;
	gameTurn.innerText = gameTurn.innerText == "White" ? "Black" : "White";
	inputGame.remove();

	//Display final message.
	if (data.winner === playerNumber) {
		infoGame.innerText = "You win!";
	} else if (data.winner == 3) {
		infoGame.innerText = "Draw";
	} else {
		infoGame.innerText = "You loose.";
	}
}

function handleGameEnd(data) {
	data = JSON.parse(data);
	infoGame.innerText = "You win, " + data.reason;
	gameActive = false;
	inputGame.remove();
}

function handleError() {
	alert("Wrong move, play again.");
}

function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
	reset();
	alert("Unknown game code, try again.");
}

function handleTooManyPlayers() {
	reset();
	alert("This game is already in progress.");
}

function reset() {
	playerNumber = null;
	gameCodeInput.value = "";
	initialScreen.style.display = "block";
	gameScreen.style.display = "none";
}
