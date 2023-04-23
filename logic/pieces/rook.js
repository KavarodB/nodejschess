import Coordinate from "../Coordinate.js";
import Figure from "../Figure.js";
import Board from "../board.js";

class Rook extends Figure {

    notationsmall = "r";
    notationbig = "R";

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

        if (this.x != x && this.y != y) return Figure.INVAL_COORD;

        let path = [];
        const deltax = x - this.x;
        const deltay = y - this.y;
        const iterations = Math.max(Math.abs(deltax), Math.abs(deltay));
        for (let i = 1; i < iterations; i++) {
            let next_coord_x = 0;
            let next_coord_y = 0;
            if (deltax == 0) {
                next_coord_x = this.x;
                next_coord_y = this.y + i * (deltay / iterations);
            } else {
                next_coord_x = this.x + i * (deltax / iterations);
                next_coord_y = this.y;
            }
            path.push(new Coordinate(next_coord_x, next_coord_y));
        }
        return path;
    }
}

export default Rook;