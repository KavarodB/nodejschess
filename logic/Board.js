import Coordinate from "./Coordinate.js";
import Figure from "./Figure.js";
import Bishop from "./pieces/bishop.js";
import King from "./pieces/king.js";
import Knight from "./pieces/knight.js";
import Pawn from "./pieces/pawn.js";
import Queen from "./pieces/queen.js";
import Rook from "./pieces/rook.js";

class Board {

    static MAX_SIZE = 7;
    #enpassant = [-1, -1];
    white_king = {};
    black_king = {};

    constructor() {
        this.matrix = [];
        this.whitefigures = [];
        this.blackfigures = [];
        this.fifty_rule = 0;
        this.#customBoard();
    }

    #initBoard() {
        for (let x = 0; x <= Board.MAX_SIZE; x++) {
            this.matrix[x] = [];
            for (let y = 0; y <= Board.MAX_SIZE; y++) {
                let figure = {};
                if (x == 0) {
                    if (y == 0 || y == 7) {
                        figure = new Rook(x, y, "w");
                    }
                    if (y == 1 || y == 6) {
                        figure = new Knight(x, y, "w");
                    }
                    if (y == 2 || y == 5) {
                        figure = new Bishop(x, y, "w");
                    }
                    if (y == 3) {
                        figure = new Queen(x, y, "w");
                    }
                    if (y == 4) {
                        figure = new King(x, y, "w");
                        this.white_king = figure;
                    }
                } else if (x == 1) {
                    figure = new Pawn(x, y, "w");
                } else if (x == 6) {
                    figure = new Pawn(x, y, "b");
                } else if (x == 7) {
                    if (y == 0 || y == 7) {
                        figure = new Rook(x, y, "b");
                    }
                    if (y == 1 || y == 6) {
                        figure = new Knight(x, y, "b");
                    }
                    if (y == 2 || y == 5) {
                        figure = new Bishop(x, y, "b");
                    }
                    if (y == 3) {
                        figure = new Queen(x, y, "b");
                    }
                    if (y == 4) {
                        figure = new King(x, y, "b");
                        this.black_king = figure;
                    }
                }
                if (figure != {}) {
                    if (figure.side == "w") {
                        this.whitefigures.push(figure);
                    } else if (figure.side == "b") {
                        this.blackfigures.push(figure);
                    }
                }
                this.matrix[x][y] = figure;
            }
        }
    }

    #customBoard() {
        for (let x = 0; x <= Board.MAX_SIZE; x++) {
            this.matrix[x] = [];
            for (let y = 0; y <= Board.MAX_SIZE; y++) {
                let figure = {};
                if (x == 0) {
                    if (y == 4) {
                        figure = new King(x, y, "w");
                        this.white_king = figure;
                    }
                } else if (x == 1) {
                    figure = new Pawn(x, y, "w");
                } else if (x == 6) {
                   figure = new Pawn(x, y, "b");
                } else if (x == 7) {
                    if (y == 4) {
                        figure = new King(x, y, "b");
                        this.black_king = figure;
                    }
                }
                if (figure != {}) {
                    if (figure.side == "w") {
                        this.whitefigures.push(figure);
                    } else if (figure.side == "b") {
                        this.blackfigures.push(figure);
                    }
                }
                this.matrix[x][y] = figure;
            }
        }
    }

    showBoard() {
        let strboard = "";
        for (let x = Board.MAX_SIZE; x >= 0; x--) {
            for (let y = 0; y <= Board.MAX_SIZE; y++) {
                let figure = this.matrix[x][y];
                if (figure instanceof Figure) {
                    strboard += "[" + figure.notation + "]";
                } else {
                    strboard += "[ ]";
                }
            }
            strboard += "\n";
        }
        console.log(strboard);
    }

    castleKingShort(king) {
        const rook = this.getFigure(king.x, 7);
        if (!(king instanceof King) && !(rook instanceof Rook)) return false;

        //If either has moved.
        if (king.hasMoved || rook.hasMoved)
            return false;

        //Cordinate missmatch.
        if (king.y != 4 && rook.y != 7) return false;

        //Colision inbetween check.
        //Would king be in or passing through a check after castle.
        for (let y = rook.y - 1; y > king.y; y--) {
            if (this.getFigure(king.x, y) instanceof Figure) return false;
            if (this.isKingInCheck(king.x, y, king.side).length > 0) {
                console.log("CHECK DURING CASTLE");
                return false;
            }
        }

        //Do the castle
        this.matrix[king.x][king.y] = {};
        this.matrix[rook.x][rook.y] = {};
        king.allowMove(king.x, king.y + 2);
        rook.allowMove(rook.x, rook.y - 2);
        this.matrix[king.x][king.y] = king;
        this.matrix[rook.x][rook.y] = rook;
        return true;
    }

    castleKingLong(king) {
        const rook = this.getFigure(king.x, 0);
        if (!(king instanceof King) && !(rook instanceof Rook)) return false;

        if (king.hasMoved || rook.hasMoved)
            return false;

        //Cordinate missmatch. 
        if (king.y != 4 && rook.y != 0) return false;

        //Colision inbetween check.
        //Would king be in or passing through a check after castle.
        for (let y = king.y - 1; y > rook.y; y--) {
            if (this.getFigure(king.x, y) instanceof Figure) return false;
            if (y != 1 && this.isKingInCheck(king.x, y, king.side).length > 0) {
                console.log("CHECK DURING CASTLE");
                return false;
            }
        }


        //Do the castle
        this.matrix[king.x][king.y] = {};
        this.matrix[rook.x][rook.y] = {};
        king.allowMove(king.x, king.y - 2);
        rook.allowMove(rook.x, rook.y + 3);
        this.matrix[king.x][king.y] = king;
        this.matrix[rook.x][rook.y] = rook;
        return true;
    }

    /**
     * Main driving method for the board class.
     * @param {*} figure which figure to move.
     * @param {*} _x x position of destination
     * @param {*} _y y position of destination
     * @returns true or false
     */
    moveFigure(figure, _x, _y) {
        //Valid move, but not under the rules (checks).
        if (!this.isValidMove(figure, _x, _y)) return false;

        //If figure king => no need for checks.
        if (figure instanceof King) {
            if (this.isKingInCheck(_x, _y, figure.side).length > 0) return false;
            this.#doMove(figure, _x, _y);
            return true;
        }
        //Is the king in check.
        const king = figure.side == "w" ? this.white_king : this.black_king;
        const checkingfigs = this.isKingInCheck(king.x, king.y, king.side);
        if (checkingfigs.length > 0) {
            const dangersqrs = this.generateDangerSquares(checkingfigs, king.x, king.y);
            const dest = new Coordinate(_x, _y);
            if (dangersqrs.find(sqr => Coordinate.compare(sqr, dest)) == undefined) return false;
        } else {
            //Check if piece is pinned.
            //! By disappearing the piece.
            this.matrix[figure.x][figure.y] = {};
            const checkingfigs_after_remove = this.isKingInCheck(king.x, king.y, king.side);
            if (checkingfigs_after_remove.length > 0) {
                //Return the piece back.
                this.matrix[figure.x][figure.y] = figure;
                //Only avaliable moves for that pinned piece.
                const dangersqrs = this.generateDangerSquares(checkingfigs_after_remove, king.x, king.y);
                const dest = new Coordinate(_x, _y);
                if (dangersqrs.find(sqr => Coordinate.compare(sqr, dest)) == undefined) return false;
            }
            //Return the piece back.
            this.matrix[figure.x][figure.y] = figure;
        }

        //Pawn promoting.
        if (figure instanceof Pawn) {
            //Pawn move reset counter too.
            this.fifty_rule = 0;
            figure = figure.canPromote(_x, _y);
            if (figure instanceof Queen) {
                let arr_figs = figure.side == "w" ? this.whitefigures : this.blackfigures;
                //Necessary to have all 3 properties to change an element in the array.
                arr_figs.forEach((piece, index, arr) => {
                    if (piece.x === figure.x && piece.y == figure.y) {
                        arr[index] = figure;
                    }
                });
            }
            //!No enpassant yet.
        }
        this.#doMove(figure, _x, _y);
        return true;
    }
    #doMove(figure, _x, _y) {
        //Do the actuall move.
        this.matrix[figure.x][figure.y] = {};
        //Removing enemy figure after capture.
        const enemy = this.getFigure(_x, _y);
        if (enemy instanceof Figure) {
            //Obvy that it is an enemy.
            let fig_arr = figure.side == "w" ? this.blackfigures : this.whitefigures;
            fig_arr.forEach((item, index, arr) => {
                if (item.x == _x && item.y == _y) {
                    arr.splice(index, 1);
                }
            });
            //Captures reset counter.
            this.fifty_rule = 0;
        }
        this.fifty_rule++;
        figure.allowMove(_x, _y);
        this.matrix[_x][_y] = figure;
    }

    isValidMove(figure, _x, _y) {

        //If no real figure passed
        if (figure == {} || figure == undefined) return false;

        const move_vect = figure.getMoveVector(_x, _y);

        // If move is invalid.
        if (move_vect == null) return false;

        // Colision inbetween check.
        for (let index = 0; index < move_vect.length; index++) {
            const vect = move_vect[index];
            if (this.getFigure(vect.x, vect.y) instanceof Figure) return false;
        }

        // Taking your own figures.
        const enemyFig = this.getFigure(_x, _y);
        if (enemyFig instanceof Figure) {
            if (figure.side == enemyFig.side) return false;
        }

        //Pawn moving sideway.
        if (figure instanceof Pawn) {
            if (Math.abs(figure.y - _y) == 1) {
                //Enpassant prevention.
                if (!(enemyFig instanceof Figure)) return false;
            } else {
                //Pushing pawn into enemy figures prevention.
                if (enemyFig instanceof Figure && enemyFig.side != figure.side) return false;
            }
        }
        return true;
    }

    isKingInCheck(_x, _y, side) {
        let checkingfigures = [];
        // My king - enemy figures!
        const _iter_figures = side == "w" ? this.blackfigures : this.whitefigures;
        _iter_figures.forEach(figure => {
            if (this.isValidMove(figure, _x, _y)) {
                checkingfigures.push(figure);
            }
        });

        return checkingfigures;
    }

    generateDangerSquares(checkingFigures, kingx, kingy) {
        //If king already in check, what are the danger squares of that check.
        let dangersqrs = [];
        dangersqrs.push(new Coordinate(kingx, kingy));
        checkingFigures.forEach(figure => {
            dangersqrs.push(new Coordinate(figure.x, figure.y));
            dangersqrs.push(...figure.getMoveVector(kingx, kingy));
        });
        return dangersqrs;
    }

    getFigure(x, y) {
        return this.matrix[x][y];
    }

    parseFigure(notation, turn) {
        let figures = turn == "w" ? this.whitefigures : this.blackfigures;
        const return_fig = figures.filter(fig =>
            fig.notationsmall === notation.toLowerCase() && fig.side == turn);

        return return_fig;
    }

}

export default Board;