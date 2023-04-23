class Figure {

    static INVAL_COORD = null;

    hasMoved = false;

    notationsmall = "f";
    notationbig = "F";

    constructor(x, y, side) {
        this.x = x;
        this.y = y;
        this.side = side;
        //default
        this.notation = "f";
    }

    getMoveVector(x, y) {
        // overridable function.
        // validate the passed coordinates and
        // if coordinates are valid, get the path of coordinates inbetween.
        return Figure.INVAL_COORD;
    }

    allowMove(_x, _y) {
        //does the successfull move.
        this.x = _x;
        this.y = _y;
        this.hasMoved = true;
        //void function.
    }
}

export default Figure;