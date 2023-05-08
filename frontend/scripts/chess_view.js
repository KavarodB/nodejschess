const socket = io("http://localhost:3000");

socket.on("init", handleInit);
socket.on("start", init);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameEnded", handleGameEnd);
socket.on("error", handleError);

const gameScreen = document.getElementById("gameScreen");
const inputGame = document.getElementById("gameInputField");

const gameTurn = document.getElementById("gameTurn");
const infoGame = document.getElementById("info_game");

const white_coords = document.getElementById("white_coords");
const black_coords = document.getElementById("black_coords");

const alert_error = document.getElementById("alert_error");

let canvas, ctx;
let playerNumber = 0;

//Game active status.
let gameActive = false;

//Start on fully load.
window.addEventListener("load", () => {
	socket.emit("newSingleGame");
	inputGame.addEventListener("keydown", keydown);
});

function init(base_state) {
	/*Basic part */
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
	if (!gameActive) return;
	if (e.keyCode == 13) {
		socket.emit("moveSingle", e.srcElement.value);
		inputGame.value = "";
		alert_error.style.display = "none";
		alert_error.innerText = "";
	}
}

function paintGame(state) {
	if (state.ended != true) {
		const p_turn = state.turn == "w" ? 0 : 1;
		handleInit(p_turn);
	}
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
	if (playerNumber == 0) {
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
	if (number == 0) {
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
	gameTurn.innerText = gameTurn.innerText == "White" ? "Black" : "White";
	requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
	if (!gameActive) {
		return;
	}
	requestAnimationFrame(() => paintGame(data.state));

	//End Game.
	gameActive = false;
	gameTurn.innerText = gameTurn.innerText == "White" ? "Black" : "White";
	inputGame.remove();
	infoGame.innerText = "Game Ended.";
}
function handleGameEnd(data) {
	infoGame.innerText = "You win, " + data.reason;
	gameActive = false;
	inputGame.remove();
}
function handleError(error) {
	alert_error.style.display = "block";
	alert_error.innerText = error;
}
