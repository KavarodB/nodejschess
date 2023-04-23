import Board from "./board.js";
import Bishop from "./pieces/bishop.js";
import King from "./pieces/king.js";
import Knight from "./pieces/knight.js";

class Chess {

    constructor() {
        this.setDefeault();
    }
    setDefeault() {
        this.board = new Board();
        this.turn = "w";
        this.ended = false;
        this.history = [];
    }
    parseStringToGame(str) {
        //1. d4 h6 2. Qd3 g5 3. Be3 f5 4. Nc3 e5 
        let moves_array = [];
        const regex = /\d+. ([a-zA-Z]{1,3}\d(\+|#)? |O-O-O |O-O )(([a-zA-Z]{1,3}\d(\+|#)? )|O-O-O |O-O )/gm;
        const matches = str.matchAll(regex);
        for (const match of matches) {
            moves_array.push(match[1].trim(), match[3].trim());
        }
        return moves_array;
    }
    playGame(str) {
        const moves_array = this.parseStringToGame(str);
        console.log("Parsed moves.", moves_array);
        for (let i = 0; i < moves_array.length; i++) {
            const move = moves_array[i];
            if (this.parseAndTryMove(move) == "Error") {
                console.log("Error@", move);
                break;
            }
            this.history.push(move);
            this.#switchTurn();
            this.board.showBoard();
            if (this.#isCheckmate()) {
                console.log("Game ended!\nWinner:", this.turn == "w" ? "Black" : "White");
                console.log("history", this.history);
                break;
            }
        }
        this.setDefeault();
    }

    playMove(move) {
        if (this.parseAndTryMove(move) == "Error") {
            console.log("Error@", move);
            return;
        }
        this.history.push(move);
        this.#switchTurn();
        this.board.showBoard();
        if (this.#isCheckmate()) {
            console.log("Game ended!\nWinner:", this.turn == "w" ? "Black" : "White");
            this.ended = true;
            return;
        }
        if (this.#isStaleMate()) {
            console.log("Game ended!\nDraw!");
            this.ended = true;
            return;
        }

    }

    parseAndTryMove(move) {
        if (move === "O-O") {
            const king = this.turn == "w" ? this.board.white_king : this.board.black_king;
            if (!this.board.castleKingShort(king))
                return "Error";
            return true;
        }
        if (move === "O-O-O") {
            const king = this.turn == "w" ? this.board.white_king : this.board.black_king;
            if (!this.board.castleKingLong(king))
                return "Error";
            return true;
        }
        if (move.includes('x')) {
            move = move.replace('x', '');
        }
        if (move.includes('+')) {
            move = move.replace('+', '');
        }
        if (move.includes('#')) {
            move = move.replace('#', '');
        }
        //Syntax checks.
        if (move.length > 3 || move.length < 2) {
            console.log("ERROR: move wrong format.");
            return "Error";
        }

        //Check for figure notation first.
        let figure_notation = "";
        let offset = 0;
        if (move.length == 2) {
            figure_notation = "p";
            //Offset for parsing pawn coordinates properly.
            offset = 1;
        } else {
            figure_notation = move.charAt(0);
        }
        const found_figures = this.board.parseFigure(figure_notation, this.turn);

        if (found_figures == []) return "Error";

        //Case sensitivity issue.
        move = move.toLowerCase();

        //Semantic checks for coordinates.
        let stry = move.charAt(1 - offset).charCodeAt(0);
        const y = Number.parseInt(String.fromCharCode(stry - 49));

        const x = Number.parseInt(move.charAt(2 - offset)) - 1;

        if (x > Board.MAX_SIZE || x < 0) return "Error";

        if (y > Board.MAX_SIZE || y < 0) return "Error";

        for (let i = 0; i < found_figures.length; i++) {
            if (this.board.moveFigure(found_figures[i], x, y))
                return true;
        }
        return "Error";
    }


    #isStaleMate() {
        //50-moves rule.( 50 moves per player => 100 in total. )
        if (this.board.fifty_rule == 100) return true;
        //no legal king & pawns moves
        //TODO:Implement
        //3 times repetition
        //TODO:Implement
        //Insufficient material
        if (this.board.whitefigures.length == 1) {
            if (this.board.blackfigures.length == 1) return true;
        }

        if (this.board.whitefigures.length == 1) {
            if (this.board.blackfigures.length == 2) {
                if (this.board.blackfigures.find(figure => figure instanceof Knight || figure instanceof Bishop) != undefined) return true;
            }
        }
        if (this.board.whitefigures.length == 2) {
            if (this.board.blackfigures.length == 1) {
                if (this.board.whitefigures.find(figure => figure instanceof Knight || figure instanceof Bishop) != undefined) return true;
            }
            if (this.board.blackfigures.length == 2) {
                const black_bishop = this.board.blackfigures.find(figure => figure instanceof Bishop);
                const white_bishop = this.board.whitefigures.find(figure => figure instanceof Bishop);
                if (black_bishop.isWhiteColor() == white_bishop.isWhiteColor()) return true;
            }
        }
        return false;
    }
    #isCheckmate() {
        //Get king.
        const king = this.turn == "w" ? this.board.white_king : this.board.black_king;
        if (this.board.isKingInCheck(king.x, king.y, king.side).length == 0) return false;
        //Check first if a figure other than king cna block the check.
        let can_be_blocked = this.#canFigureBlock(king);
        if (can_be_blocked) return false;
        //Check if king can move to safety.
        return !this.#canKingMove(king);
    }

    #canFigureBlock(king) {
        let can_be_blocked = false;
        //get checking figures
        const checkingfigs = this.board.isKingInCheck(king.x, king.y, king.side);
        //get danger sqrs
        const dangersqr = this.board.generateDangerSquares(checkingfigs, king.x, king.y);
        const allyfigures = king.side == "w" ? this.board.whitefigures : this.board.blackfigures;
        // for each danger sqr
        dangersqr.forEach(sqr => {
            allyfigures.forEach(figure => {
                if (!(figure instanceof King) && this.board.isValidMove(figure, sqr.x, sqr.y)) {
                    can_be_blocked = true;
                }
            })
        });
        return can_be_blocked;
    }

    #canKingMove(king) {
        //No blocking from other figures.
        //Can the king move on a safe square
        const validsqr = king.getAdjacentKingMoves(this.board.matrix);
        if (validsqr.length == 0) return false;
        const safesqr = validsqr.filter(sqr => {
            const checkingfigs = this.board.isKingInCheck(sqr.x, sqr.y, king.side);
            return checkingfigs.length == 0;
        });
        if (safesqr.length > 0) return true;
        return false;
    }

    //Trivial.
    #switchTurn() {
        this.turn = this.turn == "w" ? "b" : "w";
    }
}


export default Chess;