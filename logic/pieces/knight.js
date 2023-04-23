import Figure from "../Figure.js";
import Board from "../board.js";

class Knight extends Figure {

    notationsmall = "n";
    notationbig = "N";

    constructor(x, y, side) {
        super(x, y, side);
        this.notation = side == "w" ? this.notationbig : this.notationsmall;
    }

    getMoveVector(x, y) {

        //Invalid initial cordinates
        if (x > Board.MAX_SIZE || x < 0) return Figure.INVAL_COORD;

        if (y > Board.MAX_SIZE || y < 0) return Figure.INVAL_COORD;

        //Same cordinates.
        if (this.x == x && this.y == y) return Figure.INVAL_COORD;

        let path = [];
        const deltax = Math.abs(x - this.x);
        const deltay = Math.abs(y - this.y);

        //Only 8 valid moves.
        if ((deltax == 2 && deltay == 1) || (deltax == 1 && deltay == 2)) {
            return path;
        } else {
            //Not a valid move.
            return Figure.INVAL_COORD;
        }
    }
}

export default Knight;