import Coordinate from "./Coordinate.js";
import Figure from "./Figure.js";
import Board from "./board.js";
import Rook from "./pieces/rook.js";
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
		this.positionHistory = {}; // For position counts
        this.#recordPosition();
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

	// In logic/Chess.js
	getAvaliableMoves(figure) {
    if (!(figure instanceof Figure)) {
        return []; // Always return an array
    }

    const king = (this.turn === figure.side) ? (figure.side === "w" ? this.board.white_king : this.board.black_king) : null;
    if (!king) {
        // This case should ideally not be reached if figure.side always matches this.turn
        // or if getAvaliableMoves is only called for pieces of the current player.
        // console.warn("getAvaliableMoves called for a figure whose side does not match current turn, or king not found.");
        return [];
    }

    const pseudoLegalMoves = figure.getAdjacentMoves(this.board);
    let candidateMoves = pseudoLegalMoves;

    const currentKingCheckers = this.board.isKingInCheck(king.x, king.y, king.side);

    if (currentKingCheckers.length > 0) {
        const dangerResolvingSquares = this.board.generateDangerSquares(currentKingCheckers, king.x, king.y);
        candidateMoves = pseudoLegalMoves.filter(move =>
            dangerResolvingSquares.some(sqr => Coordinate.compare(move, sqr))
        );
    } else if (figure !== king) {
        const pinners = this.board.checkForPin(figure, king);
        if (pinners.length > 0) {
            const pinResolvingSquares = this.board.generateDangerSquares(pinners, king.x, king.y);
            candidateMoves = pseudoLegalMoves.filter(move =>
                pinResolvingSquares.some(sqr => Coordinate.compare(move, sqr))
            );
        }
    }

    const legalMoves = [];
    for (const move of candidateMoves) {
        // ---- START DEFENSIVE CHECK & FIX ----
        if (!move || typeof move.x !== 'number' || typeof move.y !== 'number' ||
            move.x < 0 || move.x > Board.MAX_SIZE ||
            move.y < 0 || move.y > Board.MAX_SIZE) {
            console.error(
                `Invalid 'move' object (${JSON.stringify(move)}) passed to simulation loop in getAvaliableMoves.`,
                `Originating piece: ${figure.notation} at (${figure.x}, ${figure.y}). Skipping this move.`
            );
            continue; // Skip this invalid/out-of-bounds move object
        }
        // ---- END DEFENSIVE CHECK & FIX ----

        const originalFigX = figure.x;
        const originalFigY = figure.y;
        // This was the crashing line if move.x was out of bounds for this.board.matrix:
        const pieceAtTarget = this.board.matrix[move.x][move.y];

        let capturedPieceList = null;
        let capturedPieceIndex = -1;
        let originalFigureLists = { // Store original lists for perfect restoration
            white: [...this.board.whitefigures],
            black: [...this.board.blackfigures]
        };


        this.board.matrix[originalFigX][originalFigY] = {};
        this.board.matrix[move.x][move.y] = figure;
        figure.x = move.x;
        figure.y = move.y;

        if (pieceAtTarget instanceof Figure && pieceAtTarget.side !== figure.side) {
            capturedPieceList = (pieceAtTarget.side === 'w') ? this.board.whitefigures : this.board.blackfigures;
            capturedPieceIndex = capturedPieceList.indexOf(pieceAtTarget);
            if (capturedPieceIndex > -1) {
                capturedPieceList.splice(capturedPieceIndex, 1);
            }
        }

        const kingIsSafeAfterMove = this.board.isKingInCheck(king.x, king.y, king.side).length === 0;

        figure.x = originalFigX;
        figure.y = originalFigY;
        this.board.matrix[originalFigX][originalFigY] = figure;
        this.board.matrix[move.x][move.y] = pieceAtTarget;

        // Restore figure lists more robustly if they were modified
        this.board.whitefigures = originalFigureLists.white;
        this.board.blackfigures = originalFigureLists.black;
        // Re-find king references if the lists were fully replaced,
        // or ensure king objects themselves were not removed if they weren't the captured piece.
        // This part is tricky if lists are fully replaced; better to splice/add back if possible.
        // The provided splice/add back logic:
        if (capturedPieceList && capturedPieceIndex > -1 && pieceAtTarget) { // Ensure pieceAtTarget is defined
             // This restoration was for the simple splice. If lists are fully restored above, this is not needed
             // unless the lists were not fully restored.
             // Let's assume for now the original splice/add back is preferred if lists aren't fully copied/restored.
             // If using full list restoration:
             // The piece was removed from the *copied* list implicitly.
             // The original lists are now restored, so no need to add it back here if using list copy.
             // However, the provided code has:
             // if (capturedPieceList && capturedPieceIndex > -1) {
             //     capturedPieceList.splice(capturedPieceIndex, 0, pieceAtTarget);
             // }
             // This needs to operate on the *actual current* lists, not potentially stale `capturedPieceList` if lists were swapped.
             // Sticking to the original intent of targeted splice/add:
             if (pieceAtTarget instanceof Figure && pieceAtTarget.side !== figure.side) { // Re-check pieceAtTarget
                const actualCurrentList = (pieceAtTarget.side === 'w') ? this.board.whitefigures : this.board.blackfigures;
                // Check if it's already restored by full list copy, or if it needs to be added back
                if (actualCurrentList.indexOf(pieceAtTarget) === -1) { // if not found, it means it was indeed removed
                     const correctIndexForRestoration = originalFigureLists[pieceAtTarget.side === 'w' ? 'white' : 'black'].indexOf(pieceAtTarget);
                     if(correctIndexForRestoration > -1) {
                        actualCurrentList.splice(correctIndexForRestoration, 0, pieceAtTarget);
                     } else {
                        // Fallback if original index not found (should not happen with list copy)
                        // Or if not using list copy, this is the main restoration path:
                        // capturedPieceList.splice(capturedPieceIndex, 0, pieceAtTarget);
                     }
                }
             }
        }


        if (kingIsSafeAfterMove) {
            legalMoves.push(new Coordinate(move.x, move.y));
        }
    }
    return legalMoves;
	}

	playMove(move) {
		if (this.#ended) return [false, "Game has already ended."];
		const played = this.#parseAndTryMove(move);
		if (played[0] == false) {
			return played;
		}
		this.#history.push(move);
		this.#switchTurn();
		this.#recordPosition();
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

	// Checkmate
	isCheckmate() {
    const king = this.turn === "w" ? this.board.white_king : this.board.black_king;
    const opponentSide = this.turn === "w" ? "b" : "w";

    // 1. Is the king currently in check?
    const checkingFigures = this.board.isKingInCheck(king.x, king.y, king.side);
    if (checkingFigures.length === 0) {
        return false; // Not in check, so not checkmate
    }

    // 2. Can the king move to a safe square?
    // Get all valid king moves (squares it can move to according to its pattern)
    const kingPossibleMoves = king.getAdjacentMoves(this.board);
    for (const move of kingPossibleMoves) {
        // Temporarily move king to simulate
        const originalKingX = king.x;
        const originalKingY = king.y;
        const pieceAtDestination = this.board.matrix[move.x][move.y];

        this.board.matrix[originalKingX][originalKingY] = {}; // Clear old king position
        this.board.matrix[move.x][move.y] = king; // Move king
        king.x = move.x;
        king.y = move.y;

        const isSafe = this.board.isKingInCheck(move.x, move.y, king.side).length === 0;

        // Undo the temporary move
        king.x = originalKingX;
        king.y = originalKingY;
        this.board.matrix[originalKingX][originalKingY] = king;
        this.board.matrix[move.x][move.y] = pieceAtDestination;

        if (isSafe) {
            return false; // King can move to a safe square
        }
    }

    // 3. Can any other piece block the check or capture the checking piece?
    // This is more complex if there are multiple checking pieces (double check)
    if (checkingFigures.length === 1) { // Only one piece checking the king
        const checker = checkingFigures[0];
        const allPlayerPieces = this.turn === "w" ? this.board.whitefigures : this.board.blackfigures;

        for (const piece of allPlayerPieces) {
            if (piece === king) continue; // Already handled king moves

            const availableMovesForPiece = this.getAvaliableMoves(piece); // This should consider pins!
            for (const move of availableMovesForPiece) {
                // Can this move capture the checker?
                if (move.x === checker.x && move.y === checker.y) {
                    return false; // Checker can be captured
                }
                // Can this move block the check? (Only for sliding pieces: R, B, Q)
                if (['r', 'b', 'q'].includes(checker.notationsmall.toLowerCase())) {
                    const pathBetween = checker.getMoveVector(king.x, king.y);
                    if (pathBetween) { // Ensure pathBetween is not null
                       for (const pathSquare of pathBetween) {
                           if (move.x === pathSquare.x && move.y === pathSquare.y) {
                               return false; // Check can be blocked
                           }
                       }
                    }
                }
            }
        }
    }
    // If double check, only king move can save, which was handled in step 2.
    // If we reach here, it's checkmate.
    return true;
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
	#generatePositionKey() {
        const boardFenPart = this.board.generatePositionKeyFen(); // Get FEN for board, castling, en passant
        return boardFenPart + " " + this.turn; // Add active color
    }

    #recordPosition() {
        const key = this.#generatePositionKey();
        this.positionHistory[key] = (this.positionHistory[key] || 0) + 1;
        //console.log(`Recorded: ${key}, Count: ${this.positionHistory[key]}`); // Debug
    }

    #drawByThreeFoldRep() {
        const key = this.#generatePositionKey();
        //console.log(`Checking 3-fold for: ${key}, Count: ${this.positionHistory[key] || 0}`); // Debug
        if ((this.positionHistory[key] || 0) >= 3) {
            return true;
        }
        return false;
    }

	#hasLegalMoves() { // Helper function to check for any legal move
    const pieces = (this.turn === "w") ? this.board.whitefigures : this.board.blackfigures;

    for (const piece of pieces) {
		
        const availableMoves = this.getAvaliableMoves(piece); // Crucial: This must return ONLY legal moves
                                                            // (i.e., moves that don't leave own king in check)
        if (availableMoves && availableMoves.length > 0) {
            return true; // Found at least one legal move
        }
    }
    return false; // No legal moves found for any piece
	}

	#drawByStaleMate() {
    const king = (this.turn === "w") ? this.board.white_king : this.board.black_king;

    // 1. King must NOT be in check
    if (this.board.isKingInCheck(king.x, king.y, king.side).length > 0) {
        return false;
    }

    // 2. There must be NO legal moves for the current player
    if (!this.#hasLegalMoves()) {
        return true; // Stalemate
    }

    return false;
	}

	#drawByInsufficientMaterial() {
    const whitePieces = this.board.whitefigures;
    const blackPieces = this.board.blackfigures;
    const whiteCount = whitePieces.length;
    const blackCount = blackPieces.length;

    // Helper function to count specific piece types
    const countPiece = (pieces, PieceType) => pieces.filter(p => p instanceof PieceType).length;
    const getPiece = (pieces, PieceType) => pieces.find(p => p instanceof PieceType);
    // K vs K
    if (whiteCount === 1 && blackCount === 1) return true;

    // K vs K + Minor Piece (Bishop or Knight)
    if (whiteCount === 1 && blackCount === 2) {
        if (countPiece(blackPieces, Knight) === 1 || countPiece(blackPieces, Bishop) === 1) return true;
    }
    if (blackCount === 1 && whiteCount === 2) {
        if (countPiece(whitePieces, Knight) === 1 || countPiece(whitePieces, Bishop) === 1) return true;
    }
    // K + B vs K + B (Bishops on same color squares)
    if (whiteCount === 2 && blackCount === 2) {
        const whiteBishop = getPiece(whitePieces, Bishop);
        const blackBishop = getPiece(blackPieces, Bishop);
        if (whiteBishop && blackBishop) { // Both sides have a bishop
            if (countPiece(whitePieces, Knight) === 0 && countPiece(blackPieces, Knight) === 0 &&
                countPiece(whitePieces, Rook) === 0 && countPiece(blackPieces, Rook) === 0 &&
                countPiece(whitePieces, Queen) === 0 && countPiece(blackPieces, Queen) === 0 &&
                countPiece(whitePieces, Pawn) === 0 && countPiece(blackPieces, Pawn) === 0) {
                if (whiteBishop.isWhiteColor() === blackBishop.isWhiteColor()) return true;
            }
        }
    }
    // Note: There are other rare cases like K+N+N vs K, which are generally not draws
    // unless the side with knights cannot force checkmate. This simplified version covers the most common FIDE rules for automatic draws.
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
