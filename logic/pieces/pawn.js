// In logic/pieces/pawn.js
import Figure from "../Figure.js";
import Board from "../board.js";
import Coordinate from "../Coordinate.js";

class Pawn extends Figure {
	notationsmall = "p";
	notationbig = "P";

	//Custom pawn field for en passant.
	at2fromStart = false;

	constructor(x, y, side) {
		super(x, y, side);
		this.notation = side == "w" ? this.notationbig : this.notationsmall;
	}

	getMoveVector(x, y) {
		//Invalid initial cordinates
		if (x > Board.MAX_SIZE || x < 0) return Figure.INVAL_COORD;
		if (y > Board.MAX_SIZE || y < 0) return Figure.INVAL_COORD;

		//Same cordinates.
		if (this.x == x && this.y == y) return Figure.INVAL_COORD; // Changed from this.x == x for pawn pushes

		//Check for possible miss matches.
		if (this.side == "w") {
			if (x < this.x) return Figure.INVAL_COORD;
		} else {
			if (x > this.x) return Figure.INVAL_COORD;
		}

		let path = [];

		//Can move with two on first move.
		if (Math.abs(this.x - x) == 2) {
			if (this.hasMoved) return Figure.INVAL_COORD;
			if (this.y != y) return Figure.INVAL_COORD; // Must be in the same column
			const deltax = x - this.x;
			const iterations = Math.abs(deltax);
			// Path for double move includes the intermediate square
			for (let i = 1; i < iterations; i++) { // Only add intermediate square to path
				let next_coord_x = this.x + i * (deltax / iterations);
				path.push(new Coordinate(next_coord_x, this.y));
			}
		} else { // Single step or capture
			if (Math.abs(this.x - x) > 1) return Figure.INVAL_COORD;
			if (Math.abs(this.y - y) > 1) return Figure.INVAL_COORD; // Cannot move more than 1 square sideways
            // For single push (y is same) or capture (y changes by 1), path is empty.
		}
		return path; // Returns intermediate squares for double push, empty for single/capture
	}

	getAdjacentMoves(board) {
		const potentialMoves = [];
		const deltax = this.side === "w" ? 1 : -1; // Direction of movement

		// 1. Single square push
		const singlePushX = this.x + deltax;
		const singlePushY = this.y;
		if (singlePushX >= 0 && singlePushX <= Board.MAX_SIZE) {
			if (!(board.matrix[singlePushX][singlePushY] instanceof Figure)) {
				potentialMoves.push(new Coordinate(singlePushX, singlePushY));
			}
		}

		// 2. Double square push (from starting position)
		if (!this.hasMoved) {
			const doublePushX = this.x + (2 * deltax);
			const doublePushY = this.y;
			// Ensure intermediate square is also on board and empty
			if (singlePushX >= 0 && singlePushX <= Board.MAX_SIZE &&
				doublePushX >= 0 && doublePushX <= Board.MAX_SIZE) {
				if (!(board.matrix[singlePushX][singlePushY] instanceof Figure) &&
					!(board.matrix[doublePushX][doublePushY] instanceof Figure)) {
					potentialMoves.push(new Coordinate(doublePushX, doublePushY));
				}
			}
		}

		// 3. Diagonal captures
		const captureX = this.x + deltax;
		if (captureX >= 0 && captureX <= Board.MAX_SIZE) {
			// Capture right (from white's perspective: y+1)
			const captureYRight = this.y + 1;
			if (captureYRight >= 0 && captureYRight <= Board.MAX_SIZE) {
				const targetPieceRight = board.matrix[captureX][captureYRight];
				if (targetPieceRight instanceof Figure && targetPieceRight.side !== this.side) {
					potentialMoves.push(new Coordinate(captureX, captureYRight));
				}
			}
			// Capture left (from white's perspective: y-1)
			const captureYLeft = this.y - 1;
			if (captureYLeft >= 0 && captureYLeft <= Board.MAX_SIZE) {
				const targetPieceLeft = board.matrix[captureX][captureYLeft];
				if (targetPieceLeft instanceof Figure && targetPieceLeft.side !== this.side) {
					potentialMoves.push(new Coordinate(captureX, captureYLeft));
				}
			}
		}

		// 4. En Passant
		const [epTargetX, epTargetY] = board.getEnpassant(); // This is the square pawn lands on
		if (epTargetX === captureX && // Must be on the correct rank for en passant capture
			(epTargetY === this.y + 1 || epTargetY === this.y - 1)) { // Target must be one of the diagonal captures
			// The opponent pawn to be captured is at (this.x, epTargetY)
			const enPassantVictim = board.matrix[this.x][epTargetY];
			if (enPassantVictim instanceof Pawn && enPassantVictim.side !== this.side) {
				// Basic check: an en-passant target exists and is on a diagonal attack square
				potentialMoves.push(new Coordinate(epTargetX, epTargetY));
			}
		}
		return potentialMoves;
	}

	canPromote(_x, _y) {
		if ((this.side === "w" && _x === Board.MAX_SIZE) || (this.side === "b" && _x === 0)) {
			// Return a new Queen instance, but the actual replacement happens in Board.js
			return new Queen(this.x, this.y, this.side);
		}
		return this;
	}

	allowMove(_x, _y) {
		if (Math.abs(this.x - _x) == 2 && !this.hasMoved) { // Check !this.hasMoved for initial double move
			this.at2fromStart = true;
		} else {
			this.at2fromStart = false;
		}
		this.x = _x;
		this.y = _y;
		this.hasMoved = true;
	}
}

export default Pawn;