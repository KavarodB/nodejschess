import Coordinate from "./Coordinate.js";
import Chess from "./Chess.js";

const chess = new Chess();

function playPawnGame() {
	//NPC GAME.
	chess.playGame(
		`1. a4 b5 2. axb5 a6 3. bxa6 Nc6 4. b4 Nd4 5. b5 Nxe2 6. b6 Nxg1 7. b7 Bxb7 8. axb7 Nf3+ 9. gxf3 c5 10. bxa8 end1 `
	);
}

function playPawnEnPassant() {
	//EN PASSANT.
	chess.playGame(`1. d4 h6 2. d5 e5 3. dxe6 h5 4. exf7+ Ke7 5. fxg8 end1 `);
	//INVALID GAME with Pawn.
	chess.playGame(`1. e4 h5 2. e5 f5 3. d4 h4 4. exf6 end1 `);
	//INVALID GAME with Queue.
	chess.playGame(`1. e4 h5 2. e5 f5 3. Qf3 h4 4. exf6 end1 `);
}

function playCheckMate() {
	chess.playMove("Pe3");
	chess.board.showBoard();
	chess.playMove("pg5");
	chess.board.showBoard();
	chess.playMove("Pf4");
	chess.board.showBoard();
	chess.playMove("pf6");
	chess.board.showBoard();
	chess.playMove("Qh5");
	chess.board.showBoard();
	//SHOULD BE MATE.
	chess.playMove("kf7");
	chess.board.showBoard();
}

function playCheckAndPin() {
	chess.playMove("Pd4");
	chess.playMove("pd5");
	chess.playMove("Pc3");
	chess.playMove("pe5");
	//Check.
	chess.playMove("Qa4");
	chess.board.showBoard();
	//Invalid.
	chess.playMove("pf5");
	chess.board.showBoard();
	//Block.
	chess.playMove("bd7");
	chess.board.showBoard();

	//Stupid move but valid.
	chess.playMove("Pe3");
	chess.board.showBoard();
	//Moving pinned piece falsy.
	chess.playMove("bf5");
	chess.board.showBoard();
	//Moving pinned piece right.
	chess.playMove("ba4");
	chess.board.showBoard();
	//Moving piece from same side twice.
	chess.playMove("pa5");
	chess.board.showBoard();
}

function getKingValidMoves() {
	chess.playMove("Pe4");
	chess.playMove("pf5");
	chess.playMove("Pf4");
	chess.playMove("pg5");
	chess.playMove("Qh5");
	chess.board.showBoard();
	console.log(chess.isCheckmate(chess.board.black_king));
}
function playStaleMate() {
	chess.playGame(
		`1. e3 e6 2. Ke2 Ke7 3. Ke1 Ke8 4. Ke2 Ke7 5. Ke1 Ke8 6. Ke2 Ke7 `
	);
	chess.playGame(
		"1. d4 d5 2. Qd3 Qd6 3. Qf3 Qb6 4. Qd3 Qd6 5. Qf3 Qb6 6. Qd3 Qd6 "
	);
}

function playSomeGames() {
	//Random game.
	chess.playGame(
		`1. d4 d5 2. Bf4 e6 3. Nf3 e5 4. Bxe5 g6 5. Bxh8 Nf6 6. Qd3 Qd6 `
	);

	//Scholar's mate.
	chess.playGame(`1. e4 f5 2. f4 g5 3. Qh5# end1 `);

	//Pawn -> Queen and reck havoc.
	chess.playGame(`1. a4 a5 2. h3 b5 3. b5 c5 4. b6 Ba6 5. b7 h5 6. a8 h4 7. Qxb8 Bxe2 8.
    Qxd8+ Kxd8 9. Bxe2 a4 `);

	//Rook takes checking queen.
	chess.playGame(`1. b4 a5 2. c3 b4 3. b4 d5 4. Qa4+ Rxa4 `);

	//Castle into a check -> should fail.
	chess.playGame(
		`1. Nc3 d5 2. d4 Qd6 3. Bg5 f6 4. Nxd5 Qxd5 5. Qd3 Qxg5 6. O-O-O end1 `
	);
	// My game -> bad game but works.
	chess.playGame(
		`1. d4 e5 2. dxe5 Nc6 3. Nf3 Qe7 4. Bf4 Qb4+ 5. Bd2 Qxb2 6. Nc3 Nb4 7. Rb1 Nxc2 8. Qxc2 Qxc2 9. e3 Bb4 10. Bb5 Bxc3 11. Bxc3 Qxc3+ 12. Nd2 c6 13. Be2 Ne7 14. Rd1 Nd5 15. O-O Nxe3 16. fxe3 Qxe3+ 17. Kh1 h5 18. Bf3 h4 19. Nc4 Qh6 20. Nd6+ Kd8 21. Nxf7+ Ke7 22. Nxh6 Rxh6 23. h3 Ke6 24. Bg4+ Kxe5 25. Bxd7 Bxd7 26. Rxd7 Rf6 27. Rxf6 gxf6 28. Rxb7 f5 29. Re7+ Kf4 30. Kg1 Kg3 31. Rg7+ Kf4 32. Rh7 Kg3 33. Kf1 Re8 34. Rg7+ Kf4 35. Kf2 Re4 36. Rxa7 c5 37. Ra5 c4 38. Rc5 Rd4 39. a4 Rd2+ 40. Ke1 Rxg2 41. a5 Ke3 42. Rxc4 Rg1 `
	);
	// Aborted game.
	chess.playGame(
		`1. d4 c6 2. c4 d5 3. Nc3 Nf6 4. Nf3 e6 5. Bg5 Bb4 6. a3 Bxc3+ 7. bxc3 Bd7 8. cxd5 cxd5 9. c4 Bc6 10. cxd5 Bxd5 11. Rc1 Nc6 `
	);
}
function playTwoMoves() {
	chess.playGame(
		`1. Nf3 d5 2. Nc3 h6 3. Ng5 g6 4. Nh3 c6 5. Nf4 c5 6. Nh5 c4 7. Ng3 d4 8. Nge4 end1 `
	);
	chess.playGame(
		`1. Nc3 h6 2. Nf3 h5 3. Ne5 h4 4. Nc4 h3 5. e4 g5 6. Ne2 g4 7. Nd4 g3 8. c3 Rh7 9. Nc2 Rh6 10. e5 Rh5 11. N4e3 Rh4 `
	);
	chess.playGame(`1. e4 Nf6 2. Ba6 Nxe4 3. Nf3 Ng3 4. O-O Nf5 `);
}
//playSomeGames();
//playPawnGame();
//playPawnEnPassant();
playTwoMoves();
