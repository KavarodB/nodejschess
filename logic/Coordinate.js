class Coordinate {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static compare(coord1, coord2) {
        if (coord1.x == coord2.x && coord1.y == coord2.y) return true;
        return false;
    }
}

export default Coordinate;