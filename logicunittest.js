import Coordinate from "./logic/Coordinate.js";
import Board from "./logic/board.js";
import Chess from "./logic/chess.js";

const chess = new Chess();
const board = new Board();

function testPawnBehavWhite() {
    board.showBoard();
    console.log("-------------pushing---------------");
    const figure = board.getFigure(1, 0);
    board.moveFigure(figure, 3, 0)
    board.showBoard();
    board.moveFigure(figure, 4, 0)
    board.showBoard();
    board.moveFigure(figure, 5, 0)
    board.showBoard();
    console.log("-------------taking---------------");
    board.moveFigure(figure, 6, 0);
    board.showBoard();
    console.log("-------------promoting---------------");
    board.moveFigure(figure, 7, 0);
    board.showBoard();
}

function testPawnEnPassBehavWhite() {
    board.showBoard();
    console.log("-------------pushing---------------");
    const figure = board.getFigure(1, 0);
    board.moveFigure(figure, 3, 0)
    board.showBoard();
    board.moveFigure(figure, 4, 0)
    board.showBoard();
    console.log("-------------pushing enemy---------------");
    const enm_pawn = board.getFigure(6, 1);
    board.moveFigure(enm_pawn, 4, 1);
    board.showBoard();
    console.log("-------------en passant---------------");
    board.moveFigure(figure, 5, 1);
    board.showBoard();
}

function play5Moves() {
    chess.parseAndTryMove("Pe4");
    chess.board.showBoard();
    chess.parseAndTryMove("pc6");
    chess.board.showBoard();
    chess.parseAndTryMove("Pd4");
    chess.board.showBoard();
    chess.parseAndTryMove("pd5");
    chess.board.showBoard();
    chess.parseAndTryMove("Pe5");
    chess.board.showBoard();
    chess.parseAndTryMove("pc5");
    chess.board.showBoard();
    chess.parseAndTryMove("Pc5");
    chess.board.showBoard();
    chess.parseAndTryMove("pe6");
    chess.board.showBoard();
    chess.parseAndTryMove("Qg4");
    chess.board.showBoard();
    chess.parseAndTryMove("nh6");
    chess.board.showBoard();
}

function playCheckMate() {
    chess.parseAndTryMove("Pe3");
    chess.board.showBoard();
    chess.parseAndTryMove("pg5");
    chess.board.showBoard();
    chess.parseAndTryMove("Pf4");
    chess.board.showBoard();
    chess.parseAndTryMove("pf6");
    chess.board.showBoard();
    chess.parseAndTryMove("Qh5");
    chess.board.showBoard();
    //SHOULD BE MATE.
    chess.parseAndTryMove("kf7");
    chess.board.showBoard();
}

function playCheckAndPin() {

    chess.parseAndTryMove("Pd4");
    chess.parseAndTryMove("pd5");
    chess.parseAndTryMove("Pc3");
    chess.parseAndTryMove("pe5");
    //Check.
    chess.parseAndTryMove("Qa4");
    chess.board.showBoard();
    //Invalid.
    chess.parseAndTryMove("pf5");
    chess.board.showBoard();
    //Block.
    chess.parseAndTryMove("bd7");
    chess.board.showBoard();

    //Stupid move but valid.
    chess.parseAndTryMove("Pe3");
    chess.board.showBoard();
    //Moving pinned piece falsy.
    chess.parseAndTryMove("bf5");
    chess.board.showBoard();
    //Moving pinned piece right.
    chess.parseAndTryMove("ba4");
    chess.board.showBoard();
    //Moving piece from same side twice.
    chess.parseAndTryMove("pa5");
    chess.board.showBoard();
}

function getKingValidMoves() {
    chess.parseAndTryMove("Pe4");
    chess.parseAndTryMove("pf5");
    chess.parseAndTryMove("Pf4");
    chess.parseAndTryMove("pg5");
    chess.parseAndTryMove("Qh5");
    chess.board.showBoard();
    const king = chess.board.matrix[7][4];
    console.log(chess.isCheckmate(king));
}

function playSomeGames() {

    //Random game.
    //chess.playGame(`1. d4 d5 2. Bf4 e6 3. Nf3 e5 4. Bxe5 g6 5. Bxh8 Nf6 6. Qd3 Qd6 `);

    //Scholar's mate.
    chess.playGame(`1. e4 f5 2. f4 g5 3. Qh5# end1 `);

    //Pawn -> Queen and reck havoc.
    chess.playGame(`1. a4 a5 2. h3 b5 3. b5 c5 4. b6 Ba6 5. b7 h5 6. a8 h4 7. Qxb8 Bxe2 8.
    Qxd8+ Kxd8 9. Bxe2 a4 `);

    //Rook takes checking queen.
    chess.playGame(`1. b4 a5 2. c3 b4 3. b4 d5 4. Qa4+ Rxa4 `);

    //Castle into a check -> should fail.
    chess.playGame(`1. Nc3 d5 2. d4 Qd6 3. Bg5 f6 4. Nxd5 Qxd5 5. Qd3 Qxg5 6. O-O-O end1 `);
}
function staleMateCheck() {
    chess.board.showBoard();
    //Test the 50-rule.
    for (let index = 0; index < 50; index++) {
        if (chess.ended == true) break;
        if (index % 2 == 0) {
            chess.playMove("Kd1");
            chess.playMove("Kd8");
        } else {
            chess.playMove("Ke1");
            chess.playMove("Ke8");
        }

    }
}
//play5Moves();

//playCheckMate();

//checkKingAndMore();
//getKingValidMoves

playSomeGames();
//staleMateCheck();