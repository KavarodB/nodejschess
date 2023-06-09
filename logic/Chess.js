import Coordinate from "./Coordinate.js";
import Figure from "./Figure.js";
import Board from "./board.js";
import Bishop from "./pieces/bishop.js";
import King from "./pieces/king.js";
import Knight from "./pieces/knight.js";
import Pawn from "./pieces/pawn.js";

class Chess {
	#number_regex = /^[1-8]$/gm;
	#char_regex = /^[a-h]$/gm;
	#history = [];
	#ended = false;
	constructor() {
		this.setDefeault();
	}

	setDefeault() {
		this.board = new Board();
		this.turn = "w";
		this.#ended = false;
		this.#history = [];
	}

	parseHistory(reduced) {
		let strn = "";
		let index = 0;
		if (reduced) {
			index = this.#history.length > 6 ? this.#history.length - 5 : 0;
		}
		for (; index < this.#history.length; index++) {
			const turn = this.#history[index];
			if (index % 2 == 0) {
				strn += `${index / 2 + 1}. ${turn} `;
			} else {
				strn += `${turn} `;
			}
		}
		return strn;
	}

	getAvaliableMoves(figure) {
		if (!(figure instanceof Figure)) return null;
		const king =
			this.turn == "w" ? this.board.white_king : this.board.black_king;
		const allMoves = figure.getAdjacentMoves(this.board);
		let checking_figures = this.board.isKingInCheck(king.x, king.y, king.side);
		if (checking_figures.length == 0)
			checking_figures = this.board.checkForPin(figure, king);
		const dangersqr = this.board.generateDangerSquares(
			checking_figures,
			king.x,
			king.y
		);
		const avaliableMoves = allMoves.filter((move) => {
			for (let index = 0; index < dangersqr.length; index++) {
				const sqr = dangersqr[index];
				if (Coordinate.compare(move, sqr)) {
					return move;
				}
			}
		});

		return avaliableMoves;
	}

	playMove(move) {
		if (this.#ended) return [false, "Game has already ended."];
		const played = this.#parseAndTryMove(move);
		if (played[0] == false) {
			return played;
		}
		this.#history.push(move);
		this.#switchTurn();
		this.board.showBoard();
		if (this.isCheckmate()) {
			console.log("Game ended!\nWinner:", this.turn == "w" ? "Black" : "White");
			this.#ended = true;
			return this.turn == "w" ? 2 : 1;
		}
		if (this.isDraw()) {
			console.log("Game ended!\nDraw!");
			this.#ended = true;
			return 3;
		}
		//Countinue playing.
		return 0;
	}

	isDraw() {
		return (
			//50-moves rule.( 50 moves per player => 100 in total. )
			this.board.fifty_rule >= 100 ||
			this.#drawByInsufficientMaterial() ||
			this.#drawByStaleMate() ||
			this.#drawByThreeFoldRep()
		);
	}

	isCheckmate() {
		//Get king.
		const king =
			this.turn == "w" ? this.board.white_king : this.board.black_king;
		const checking_figures = this.board.isKingInCheck(
			king.x,
			king.y,
			king.side
		);
		if (checking_figures.length == 0) return false;
		//Check first if a figure other than king can block the check.
		let can_be_blocked = this.board.canFigureBlock(king, checking_figures);
		if (can_be_blocked) return false;
		//Check if king can move to safety.
		return !this.board.canKingMove(king);
	}

	#parseAndTryMove(move) {
		if (move === "O-O") {
			const king =
				this.turn == "w" ? this.board.white_king : this.board.black_king;
			if (!this.board.castleKingShort(king))
				return [false, "You can not castle short"];
			return [true];
		}
		if (move === "O-O-O") {
			const king =
				this.turn == "w" ? this.board.white_king : this.board.black_king;
			if (!this.board.castleKingLong(king))
				return [false, "You can not castle long"];
			return [true];
		}
		if (move.includes("x")) {
			move = move.replace("x", "");
		}
		if (move.includes("+")) {
			move = move.replace("+", "");
		}
		if (move.includes("#")) {
			move = move.replace("#", "");
		}
		//Syntax checks.
		if (move.length > 4 || move.length < 2) {
			return [false, "move is not in the rigth format"];
		}

		//Check for figure notation first.
		let figure_notation = "";
		let offset = 0;
		let filter = "";
		let isNumber = true;
		if (move.length == 2) {
			figure_notation = "p";
			//Offset for parsing pawn coordinates properly.
			offset = -1;
		} else if (move.length == 3) {
			figure_notation = move.charAt(0);
			// Pawn filter.
			if (figure_notation.match(this.#char_regex) != null) {
				const stry = figure_notation.charCodeAt(0);
				filter = Number.parseInt(String.fromCharCode(stry - 49));
				isNumber = false;
				figure_notation = "p";
			}
		} else if (move.length == 4) {
			figure_notation = move.charAt(0);
			filter = move.charAt(1);
			offset = 1;
			// Rook,Bishop or Knight filter.
			if (filter.match(this.#number_regex) != null) {
				filter = Number.parseInt(filter) - 1;
			} else if (filter.match(this.#char_regex) != null) {
				let stry = filter.charCodeAt(0);
				filter = Number.parseInt(String.fromCharCode(stry - 49));
				isNumber = false;
			}
		}
		const found_figures = this.board
			.parseFigure(figure_notation, this.turn)
			.filter((figure) => {
				if (filter != "") {
					if (isNumber) {
						return figure.x == filter;
					} else {
						return figure.y == filter;
					}
				}
				return figure;
			});

		if (found_figures == []) {
			return [false, "The piece you try to move is not on the board"];
		}
		//Case sensitivity issue.
		move = move.toLowerCase();
		//Semantic checks for coordinates.
		let stry = move.charAt(1 + offset).charCodeAt(0);
		const y = Number.parseInt(String.fromCharCode(stry - 49));

		const x = Number.parseInt(move.charAt(2 + offset)) - 1;

		if (x > Board.MAX_SIZE || x < 0) return [false, "Out of bounds"];

		if (y > Board.MAX_SIZE || y < 0) return [false, "Out of bounds"];
		let last_error = "";
		for (let i = 0; i < found_figures.length; i++) {
			const result = this.board.moveFigure(found_figures[i], x, y);
			if (result[0] == true) return [true];
			last_error = result[1];
		}
		return [false, last_error || "Move can not be played"];
	}

	#drawByStaleMate() {
		//no legal king & pawns moves.
		let is_stalemate = true;
		const figure_arr =
			this.turn == "w" ? this.board.whitefigures : this.board.blackfigures;
		const result = figure_arr.filter(
			(figure) => figure instanceof King || figure instanceof Pawn
		);
		if (result.length == figure_arr.length) {
			result.forEach((figure) => {
				if (!(figure instanceof King)) {
					if (this.board.isValidMove(figure, figure.x + 1, figure.y)) {
						is_stalemate = false;
					}
				} else {
					if (this.board.canKingMove(figure)) {
						is_stalemate = false;
					}
				}
			});
		} else {
			is_stalemate = false;
		}
		return is_stalemate;
	}

	#drawByInsufficientMaterial() {
		//Insufficient material
		if (this.board.whitefigures.length == 1) {
			if (this.board.blackfigures.length == 1) return true;
		}

		if (this.board.whitefigures.length == 1) {
			if (this.board.blackfigures.length == 2) {
				if (
					this.board.blackfigures.find(
						(figure) => figure instanceof Knight || figure instanceof Bishop
					) != undefined
				)
					return true;
			}
		}
		if (this.board.whitefigures.length == 2) {
			if (this.board.blackfigures.length == 1) {
				if (
					this.board.whitefigures.find(
						(figure) => figure instanceof Knight || figure instanceof Bishop
					) != undefined
				)
					return true;
			}
			if (this.board.blackfigures.length == 2) {
				const black_bishop = this.board.blackfigures.find(
					(figure) => figure instanceof Bishop
				);
				const white_bishop = this.board.whitefigures.find(
					(figure) => figure instanceof Bishop
				);
				if (black_bishop.isWhiteColor() == white_bishop.isWhiteColor())
					return true;
			}
		}
		return false;
	}

	//Not quite accurate.
	#drawByThreeFoldRep() {
		const last_ten = this.#history.slice(
			Math.max(this.#history.length - 10, 1)
		);
		let counters = [0, 0, 0, 0];
		if (last_ten.length <= 8) return false;
		let last_moves = last_ten.slice(0, 4);
		for (let i = 4; i < 10; i++) {
			const move = last_ten[i];
			if (move === last_moves[i % 4]) {
				counters[i % 4]++;
			}
		}
		if (
			counters[0] == 2 &&
			counters[1] >= 1 &&
			counters[2] == 1 &&
			counters[3] == 1
		)
			return true;

		return false;
	}

	//Trivial.
	#switchTurn() {
		this.turn = this.turn == "w" ? "b" : "w";
	}

	//!Testing purpouses only.
	playGame(str) {
		//1. d4 h6 2. Qd3 g5 3. Be3 f5 4. Nc3 e5
		let moves_array = [];
		const regex =
			/\d+. ([a-zA-Z0-9]{1,3}\d(\+|#)? |O-O-O |O-O )(([a-zA-Z0-9]{1,3}\d(\+|#)? )|O-O-O |O-O )/gm;
		const matches = str.matchAll(regex);
		for (const match of matches) {
			moves_array.push(match[1].trim(), match[3].trim());
		}
		for (let i = 0; i < moves_array.length; i++) {
			if (this.ended == true) {
				console.log("skipped, ", moves_array[i]);
				continue;
			}
			const move = moves_array[i];
			this.playMove(move);
		}
		//this.setDefeault();
	}
}

export default Chess;
