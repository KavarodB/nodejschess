import Chess from "./Chess.js";
import Bishop from "./pieces/bishop.js";
import Knight from "./pieces/knight.js";
import Rook from "./pieces/rook.js";
import Pawn from "./pieces/pawn.js";
import King from "./pieces/king.js";
import Queen from "./pieces/queen.js";

const chess = new Chess();

function playPawnEnPassant() {
	//EN PASSANT.
	chess.playGame(`1. d4 h6 2. d5 e5 3. dxe6 h5 4. exf7+ Ke7 5. fxg8 end1 `);
	//INVALID GAME with Pawn.
	chess.playGame(`1. e4 h5 2. e5 f5 3. d4 h4 4. exf6 end1 `);
	//INVALID GAME with Queue.
	chess.playGame(`1. e4 h5 2. e5 f5 3. Qf3 h4 4. exf6 end1 `);
}

function playCheckMate() {
	chess.playMove("e4");
	chess.playMove("f5");
	chess.playMove("f4");
	chess.playMove("g5");
	chess.playMove("Qh5");
}

function playCheckAndPin() {
	chess.playMove("d4");
	chess.playMove("d5");
	chess.playMove("c3");
	chess.playMove("e5");
	//Check.
	chess.playMove("Qa4");
	//Invalid.
	chess.playMove("f5");
	//Block.
	chess.playMove("Bd7");
	//Stupid move but valid.
	chess.playMove("e3");
	//Moving pinned piece falsy.
	console.log(chess.playMove("Bf5"));
	//Moving pinned piece right.
	chess.playMove("Ba4");
	//Moving piece from same side twice.
	chess.playMove("a5");
}

function testAvaliableMovesKing() {
	chess.playMove("e4");
	chess.playMove("e5");
	chess.playMove("d4");
	chess.playMove("c6");
	const king = chess.board.matrix[0][4];
	if (king instanceof King) {
		console.log(king.getAdjacentMoves(chess.board));
	}
}

function testAvaliableMovesBishop() {
	chess.playMove("d4");
	chess.playMove("d5");
	chess.playMove("Bf4");
	chess.playMove("a5");
	const bishop = chess.board.matrix[3][5];
	if (bishop instanceof Bishop) {
		bishop.getAdjacentMoves(chess.board);
	}
}

function testAvaliableMovesKnigth() {
	chess.playMove("d4");
	chess.playMove("d5");
	const knight = chess.board.matrix[0][1];
	if (knight instanceof Knight) {
		console.log(knight.getAdjacentMoves(chess.board));
	}
}
function testAvaliableMovesRook() {
	chess.playMove("d4");
	chess.playMove("d5");
	chess.playMove("a4");
	chess.playMove("e5");
	chess.playMove("Ra3");
	chess.playMove("exd4");
	chess.playMove("Re3+");
	const rook = chess.board.matrix[2][4];
	if (rook instanceof Rook) {
		console.log(rook.getAdjacentMoves(chess.board));
	}
}
function testAvaliableMovesPawn() {
	chess.playMove("d4");
	chess.playMove("e5");
	chess.playMove("d5");
	chess.playMove("c5");
	const pawn = chess.board.matrix[4][3];
	if (pawn instanceof Pawn) {
		console.log(pawn.getAdjacentMoves(chess.board));
	}
}
function testAvaliableMovesQueen() {
	chess.playMove("e4");
	chess.playMove("e5");
	chess.playMove("d4");
	chess.playMove("c6");
	const queen = chess.board.matrix[0][3];
	if (queen instanceof Queen) {
		console.log(queen.getAdjacentMoves(chess.board));
	}
}
function testRestrictedMoves() {
	chess.playMove("c4");
	chess.playMove("e5");
	chess.playMove("d4");
	chess.playMove("d5");
	chess.playMove("Qa4+");
	const figure3 = chess.board.matrix[7][1];
	if (figure3 instanceof Knight) console.log(chess.getAvaliableMoves(figure3));
	const figure1 = chess.board.matrix[7][2];
	if (figure1 instanceof Bishop) console.log(chess.getAvaliableMoves(figure1));
	//If Queen and Bishop work than Rook works too. And vise versa.
	const figure2 = chess.board.matrix[7][3];
	if (figure2 instanceof Queen) console.log(chess.getAvaliableMoves(figure2));
}

//testAvaliableMovesPawn();
//testAvaliableMovesBishop();
//testAvaliableMovesKnigth();
//testAvaliableMovesRook();
//testAvaliableMovesQueen();
//testAvaliableMovesKing();
//playCheckAndPin();
testRestrictedMoves();
