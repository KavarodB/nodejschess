import Figure from "../Figure.js";
import Board from "../board.js";
import Coordinate from "../Coordinate.js";
class Bishop extends Figure {

    notationsmall = "b";
    notationbig = "B";

    constructor(x, y, side) {
        super(x, y, side);
        this.notation = side == "w" ? this.notationbig : this.notationsmall;
    }

    getMoveVector(x, y) {

        //Invalid initial cordinates
        if (x > Board.MAX_SIZE || x < 0) return Figure.INVAL_COORD;

        if (y > Board.MAX_SIZE || y < 0) return Figure.INVAL_COORD;

        //Same cordinates or invalid ones.
        if (this.x == x || this.y == y) return Figure.INVAL_COORD;

        let path = [];
        const deltax = x - this.x;
        const deltay = y - this.y;

        //Not a diagonal.
        if (Math.abs(deltax) != Math.abs(deltay)) return Figure.INVAL_COORD;

        const iterations = Math.abs(deltax);
        for (let i = 1; i < iterations; i++) {
            let next_coord_x = this.x + i * (deltax / iterations);
            let next_coord_y = this.y + i * (deltay / iterations);
            path.push(new Coordinate(next_coord_x, next_coord_y));
        }
        return path;
    }
    /**
    * Is the bishop white or black
    * ( true or false )
    */
    isWhiteColor() {
        if (this.x % 2 == 1) {
            if (this.y % 2 == 0) return true;
            return false;
        } else {
            if (this.y % 2 == 1) return true;
            return false;
        }
    }
}

export default Bishop;