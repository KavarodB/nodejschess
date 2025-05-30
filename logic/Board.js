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
		this.whitefigures = [];
		this.blackfigures = [];
		this.matrix = [];
		this.fifty_rule = 0;
		this.#initBoard();
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
		const rook = this.#getFigure(king.x, 7);
		if (!(king instanceof King) && !(rook instanceof Rook)) return false;

		//If either has moved.
		if (king.hasMoved || rook.hasMoved) return false;

		//Cordinate missmatch.
		if (king.y != 4 && rook.y != 7) return false;

		//Colision inbetween check.
		//Would king be in or passing through a check after castle.
		for (let y = rook.y - 1; y > king.y; y--) {
			if (this.#getFigure(king.x, y) instanceof Figure) return false;
			if (this.isKingInCheck(king.x, y, king.side).length > 0) {
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
		const rook = this.#getFigure(king.x, 0);
		if (!(king instanceof King) && !(rook instanceof Rook)) return false;

		if (king.hasMoved || rook.hasMoved) return false;

		//Cordinate missmatch.
		if (king.y != 4 && rook.y != 0) return false;

		//Colision inbetween check.
		//Would king be in or passing through a check after castle.
		for (let y = king.y - 1; y > rook.y; y--) {
			if (this.#getFigure(king.x, y) instanceof Figure) return false;
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

	isKingInCheck(_x, _y, side) {
		let checkingfigures = [];
		// My king - enemy figures!
		const my_king = side == "w" ? this.white_king : this.black_king;
		const _iter_figures = side == "w" ? this.blackfigures : this.whitefigures;

		//Move king to position.
		this.matrix[my_king.x][my_king.y] = {};
		this.matrix[_x][_y] = my_king;

		_iter_figures.forEach((figure) => {
			if (this.isValidMove(figure, _x, _y)) {
				checkingfigures.push(figure);
			}
		});

		//Retrun king to current position.
		this.matrix[_x][_y] = {};
		this.matrix[my_king.x][my_king.y] = my_king;

		return checkingfigures;
	}

	generateDangerSquares(checkingFigures, kingx, kingy) {
		//If king already in check, what are the danger squares of that check.
		let dangersqrs = [];
		if (checkingFigures.length == 0) return dangersqrs;
		dangersqrs.push(new Coordinate(kingx, kingy));
		checkingFigures.forEach((figure) => {
			dangersqrs.push(new Coordinate(figure.x, figure.y));
			dangersqrs.push(...figure.getMoveVector(kingx, kingy));
		});
		return dangersqrs;
	}

	canFigureBlock(king, checkingfigs) {
		let can_be_blocked = false;
		//get danger sqrs
		const dangersqr = this.generateDangerSquares(checkingfigs, king.x, king.y);
		const allyfigures =
			king.side == "w" ? this.whitefigures : this.blackfigures;
		// for each danger sqr
		dangersqr.forEach((sqr) => {
			allyfigures.forEach((figure) => {
				if (
					!(figure instanceof King) &&
					this.isValidMove(figure, sqr.x, sqr.y)
				) {
					can_be_blocked = true;
				}
			});
		});
		return can_be_blocked;
	}

	canKingMove(king) {
		//No blocking from other figures.
		//Can the king move on a safe square
		const validsqr = king.getAdjacentMoves(this);
		if (validsqr.length == 0) return false;
		const safesqr = validsqr.filter((sqr) => {
			const checkingfigs = this.isKingInCheck(sqr.x, sqr.y, king.side);
			return checkingfigs.length == 0;
		});
		if (safesqr.length > 0) return true;
		return false;
	}

	checkForPin(figure, king) {
		//Disappeare the piece.
		this.matrix[figure.x][figure.y] = {};
		//Check again.
		const checkingfigs = this.isKingInCheck(king.x, king.y, king.side);
		//Return the piece back.
		this.matrix[figure.x][figure.y] = figure;
		return checkingfigs;
	}

	/**
	 * Checks if the move made by the figure is possible based on the board.
	 * @param {Figure} figure
	 * @param {number} _x
	 * @param {number} _y
	 * @returns {boolean} true or false
	 */
	isValidMove(figure, _x, _y) {
		//If no real figure passed
		if (figure == {} || figure == undefined) return false;

		const move_vect = figure.getMoveVector(_x, _y);

		// If move is invalid.
		if (move_vect == null) return false;

		// Colision inbetween check.
		for (let index = 0; index < move_vect.length; index++) {
			const vect = move_vect[index];
			if (this.#getFigure(vect.x, vect.y) instanceof Figure) return false;
		}

		// Taking your own figures.
		const enemyFig = this.#getFigure(_x, _y);
		if (enemyFig instanceof Figure) {
			if (figure.side == enemyFig.side) return false;
		}

		//Pawn moving sideway.
		if (figure instanceof Pawn) {
			if (Math.abs(figure.y - _y) == 1) {
				//Enpassant check.
				const [x, y] = this.#enpassant;
				if (!(enemyFig instanceof Figure) && x == -1 && y == -1) return false;
			} else {
				//Pushing pawn into enemy figures prevention.
				if (enemyFig instanceof Figure && enemyFig.side != figure.side)
					return false;
			}
		}
		return true;
	}

	/**
	 * Main driving method for the board class.
	 * @param {Figure} figure which figure to move.
	 * @param {number} _x x position of destination
	 * @param {number} _y y position of destination
	 * @returns true or false
	 */
	moveFigure(figure, _x, _y) {
		//Valid move, but not under the rules (checks).
		if (!this.isValidMove(figure, _x, _y))
			return [false, "Move is not possible on the board"];

		//If figure king => no need for checks.
		if (figure instanceof King) {
			if (this.isKingInCheck(_x, _y, figure.side).length > 0)
				return [false, "King will be still in check"];
			this.#doMove(figure, _x, _y);
			return [true];
		}
		//Is the king in check.
		const king = figure.side == "w" ? this.white_king : this.black_king;
		const result = this.#isKingInCheckAfterMove(king, _x, _y);
		if (result[0] == false) return result;

		//Is piece pinned to king.
		//Disappeare the piece.
		this.matrix[figure.x][figure.y] = {};
		//Check again.
		const new_result = this.#isKingInCheckAfterMove(king, _x, _y);
		//Return the piece back.
		this.matrix[figure.x][figure.y] = figure;
		if (new_result[0] == false) return new_result;

		//Pawn specific behaviour.
		if (figure instanceof Pawn) {
			//Pawn moves reset counter .
			this.fifty_rule = 0;
			figure = figure.canPromote(_x, _y);
			if (figure instanceof Queen) {
				let arr_figs =
					figure.side == "w" ? this.whitefigures : this.blackfigures;
				//Necessary to have all 3 properties to change an element in the array.
				arr_figs.forEach((piece, index, arr) => {
					if (piece.x === figure.x && piece.y == figure.y) {
						arr[index] = figure;
					}
				});
			}
			//En passant check.
			if (this.#enPassantCheck(figure, _x, _y) == true) {
				this.#doMove(figure, _x, _y);
				return [true];
			} else {
				this.#enpassant = [-1, -1];
			}
		}
		this.#doMove(figure, _x, _y);
		return [true];
	}

	#isKingInCheckAfterMove(king, _x, _y) {
		const checkingfigs = this.isKingInCheck(king.x, king.y, king.side);
		if (checkingfigs.length == 0) return [true];
		const dangersqrs = this.generateDangerSquares(checkingfigs, king.x, king.y);
		const dest = new Coordinate(_x, _y);
		if (!dangersqrs.find((sqr) => Coordinate.compare(sqr, dest))) {
			return [false, "King is in check, move does not remove the check."];
		}
		if (checkingfigs.length == 2) return [false, "Other piece should block"];
		return [true];
	}

	#enPassantCheck(pawn, _x, _y) {
		//Being pushed with 2.
		if (Math.abs(pawn.x - _x) == 2) {
			const pawnEn1 = this.#getFigure(_x, _y - 1);
			const pawnEn2 = this.#getFigure(_x, _y + 1);
			if (pawnEn1 instanceof Pawn) {
				if (pawnEn1.side == pawn.side) return false;
			} else if (pawnEn2 instanceof Pawn) {
				if (pawnEn2.side == pawn.side) return false;
			} else {
				return false;
			}
			this.#enpassant = pawn.side == "w" ? [_x - 1, _y] : [_x + 1, _y];
			return true;
		}
		//Taking the enpassant srq.
		let [x, y] = this.#enpassant;
		if (x == -1 && y == -1) return false;
		if (x == _x && y == _y) {
			const pawnEn = this.#getFigure(pawn.x, _y);
			if (!(pawnEn instanceof Pawn)) return false;
			if (pawnEn.side == pawn.side) return false;
			if (!pawnEn.at2fromStart) return false;

			//Taking enemy pawn.
			this.matrix[pawn.x][_y] = {};
			return true;
		}
		return false;
	}

	#doMove(figure, _x, _y) {
		//Do the actuall move.
		this.matrix[figure.x][figure.y] = {};
		//Removing enemy figure after capture.
		const enemy = this.#getFigure(_x, _y);
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

	#getFigure(x, y) {
		return this.matrix[x][y];
	}
	
	generatePositionKeyFen() {
        let fen = "";

        // 1. Piece placement
        for (let r = Board.MAX_SIZE; r >= 0; r--) { // Iterate ranks from 8 (index 7) down to 1 (index 0)
            let emptyCount = 0;
            for (let c = 0; c <= Board.MAX_SIZE; c++) { // Iterate files from 'a' (index 0) to 'h' (index 7)
                const figure = this.matrix[r][c];
                if (figure instanceof Figure) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    fen += figure.notation; // Assumes figure.notation is 'P', 'p', 'N', 'n', etc.
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            if (r > 0) {
                fen += "/";
            }
        }

        // 2. Castling availability
        let castlingRights = "";
        // White King side (K)
        const wk = this.white_king;
        if (wk instanceof King && !wk.hasMoved) {
            const kRook = this.matrix[0][Board.MAX_SIZE]; // H1
            if (kRook instanceof Rook && !kRook.hasMoved) {
                castlingRights += "K";
            }
            // White Queen side (Q)
            const qRook = this.matrix[0][0]; // A1
            if (qRook instanceof Rook && !qRook.hasMoved) {
                castlingRights += "Q";
            }
        }

        // Black King side (k)
        const bk = this.black_king;
        if (bk instanceof King && !bk.hasMoved) {
            const kRook = this.matrix[Board.MAX_SIZE][Board.MAX_SIZE]; // H8
            if (kRook instanceof Rook && !kRook.hasMoved) {
                castlingRights += "k";
            }
            // Black Queen side (q)
            const qRook = this.matrix[Board.MAX_SIZE][0]; // A8
            if (qRook instanceof Rook && !qRook.hasMoved) {
                castlingRights += "q";
            }
        }
        fen += " " + (castlingRights || "-");

        // 3. En passant target square
        const [epRow, epCol] = this.#enpassant; // Assumes this.#enpassant is [row, col] of target square or [-1,-1]
        if (epRow !== -1) {
            const colChar = String.fromCharCode('a'.charCodeAt(0) + epCol);
            const rowChar = (epRow + 1).toString(); // Convert 0-indexed row to 1-indexed FEN rank
            fen += " " + colChar + rowChar;
        } else {
            fen += " -";
        }

        return fen;
    }

	parseFigure(notation, turn) {
		let figures = turn == "w" ? this.whitefigures : this.blackfigures;
		const return_fig = figures.filter(
			(fig) => fig.notationsmall === notation.toLowerCase() && fig.side == turn
		);

		return return_fig;
	}
	
	getEnpassant() {
		return this.#enpassant;
	}
}

export default Board;
