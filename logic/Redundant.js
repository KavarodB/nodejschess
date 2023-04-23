class Redundant {
    enPassantCheck(pawn, _x, _y) {
        //Being pushed with 2.
        if (Math.abs((pawn.x - _x)) == 2) {
            const pawnEn1 = this.getFigure(_x, _y - 1);
            const pawnEn2 = this.getFigure(_x, _y + 1);
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
        if (x == _x && y == _y) {
            const pawnEn = this.getFigure(pawn.x, _y);
            if (!(pawnEn instanceof Pawn)) return false;
            if (pawnEn.side == pawn.side) return false;
            if (!pawnEn.at2fromStart) return false;

            //Taking enemy pawn.
            this.matrix[pawn.x][_y] = {};
            return true;
        }
        return false;
    }

    getAdjacentKingMoves(king) {

        //Some initials
        let i = king.x;
        let j = king.y;

        // Size of given 2d array
        let n = arr.length;
        let m = arr[0].length;

        // Initialising a vector array where
        // adjacent elements will be stored
        let v = [];

        // Checking for adjacent elements
        // and adding them to array

        // Deviation of row that gets adjusted
        // according to the provided position
        for (var dx = (i > 0 ? -1 : 0); dx <= (i < n ? 1 : 0);
            ++dx) {
            // Deviation of the column that
            // gets adjusted according to
            // the provided position
            for (var dy = (j > 0 ? -1 : 0);
                dy <= (j < m ? 1 : 0); ++dy) {
                if (dx != 0 || dy != 0) {
                    const sqr = this.matrix[i + dx][j + dy];
                    if (sqr instanceof Figure && sqr.side != king.side) {
                        v.push(new Coordinate(i + dx, j + dy));
                    }
                }
            }
        }

        // Returning the vector array
        return v;
    }
}