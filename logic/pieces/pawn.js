import Figure from "../Figure.js";
import Board from "../board.js";
import Coordinate from "../Coordinate.js";
import Queen from "./queen.js";

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
        if (this.x == x) return Figure.INVAL_COORD;

        //Check for possible miss matches.
        if (this.side == "w") {
            if (x < this.x) return Figure.INVAL_COORD;
        } else {
            if (x > this.x) return Figure.INVAL_COORD;
        }

        let path = [];

        //Can move with two on first move.
        if (Math.abs((this.x - x)) == 2) {
            //Can move with two on first move.
            if (this.hasMoved) return Figure.INVAL_COORD;
            if (this.y != y) return Figure.INVAL_COORD;
            const deltax = x - this.x;
            const iterations = Math.abs(deltax);
            for (let i = 1; i < iterations; i++) {
                let next_coord_x = this.x + i * (deltax / iterations);
                let next_coord_y = this.y;
                path.push(new Coordinate(next_coord_x, next_coord_y));
            }
        } else {
            //Not a legal move.
            if (Math.abs((this.x - x)) > 1) return Figure.INVAL_COORD;
            if (Math.abs((this.y - y)) > 1) return Figure.INVAL_COORD;

        }

        return path;
    }
    canPromote(_x, _y) {
        if (_x == Board.MAX_SIZE || _x == 0) {
            const queen = new Queen(this.x, this.y, this.side);
            return queen;
        }
        return this;
    }
    allowMove(_x, _y) {
        if (Math.abs((this.x - _x)) == 2) {
            this.at2fromStart = true;
        } else {
            this.at2fromStart = false;
        }
        //do the successfull move 
        this.x = _x;
        this.y = _y;
        this.hasMoved = true;
    }
}

export default Pawn;