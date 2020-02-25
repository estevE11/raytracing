class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(p) {
        this.x += p.x;
        this.y += p.y;
    }

    add(x, y) {
        this.x += x;
        this.y += y;
    }

    sub(p) {
        this.x -= p.x;
        this.y -= p.y;
    }

    sub(x, y) {
        this.x -= x;
        this.y -= y;
    }

    static add(p0, p1) {
        return new Point(p0.x+p1.x, p0.y+p1.y);
    }

    static sub(p0, p1) {
        return new Point(p0.x-p1.x, p0.y-p1.y);
    }

    static abs(p) {
        return new Point(Math.abs(p.x), Math.abs(p.y));
    }

    static a(p0, p1) {
        let dx = p1.x-p0.x;
        let dy = p1.y-p0.y;
        return Math.atan2(dy, dx);
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
}