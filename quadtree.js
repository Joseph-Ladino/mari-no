class Vec2 {
    constructor(x, y, data) {
        this.x = x;
        this.y = y;
        this.data = data;
    }

    inRect(x, y, width, height) {
        return (this.x >= x) &&
               (this.x <= x + width) &&
               (this.y >= y) &&
               (this.y <= y + height);
    }

    inCirc(x, y, radius) {
        return Math.hypot(this.x - x, this.y - y) <= radius;
    }

    inTri(x1, y1, x2, y2, x3, y3) {
        var longest = Math.max(x1, x2, x3) + 1;
        var extendo = new Line(new Vec2(this.x, this.y), new Vec2(longest, this.y));
        var lines = [
            new Line(new Vec2(x1, y1), new Vec2(x2, y2)),
            new Line(new Vec2(x2, y2), new Vec2(x3, y3)),
            new Line(new Vec2(x3, y3), new Vec2(x1, y1))
        ];
        var count = 0;

        for(var l of lines) if(Line.intersects(extendo, l)) count++;

        return count % 2 == 1;
    }

    static crs(v1, v2) {
        return (v1.x * v2.y) - (v1.y * v2.x);
    }

    static sub(v1, v2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    static eql(v1, v2) {
        return v1.x == v2.x && v1.y == v2.y;
    }
}

class Line {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    get slope() {
        return (this.v2.y - this.v1.y) / (this.v2.x - this.v1.x);
    }

    get yIntercept() {
        return this.v1.y - (this.slope * this.v1.x);
    }

    get xIntercept() {
        return -this.yIntercept / this.slope;
    }

    static eql(l1, l2) {
        return Vec2.eql(l1.v1, l2.v1) && Vec2.eql(l1.v2, l2.v2);
    }

    static intersects(l1, l2) {
        var r = Vec2.sub(l1.v2, l1.v1);
        var s = Vec2.sub(l2.v2, l2.v1);

        var u = Vec2.crs(Vec2.sub(l2.v1, l1.v1), r);
        var t = Vec2.crs(Vec2.sub(l2.v1, l1.v1), s);

        var d = Vec2.crs(r, s);


        if(d == 0) {
            if(u == 0) {
                if(Vec2.eql(l1.v1, l2.v1) || Vec2.eql(l1.v1, l2.v2) || Vec2.eql(l1.v2, l2.v1) || Vec2.eql(l1.v2, l2.v2)) return true;
                else return !clones((l2.v1.x - l1.v1.x < 0), (l2.v1.x - l1.v2.x < 0), (l2.v2.x - l1.v1.x < 0), (l2.v2.x - l1.v2.x < 0)) ||
                            !clones((l2.v1.y - l1.v1.y < 0), (l2.v1.y - l1.v2.y < 0), (l2.v2.y - l1.v1.y < 0), (l2.v2.y - l1.v2.y < 0));
            }
            return false;
        }

        t /= d;
        u /= d;

        return (t >= 0 && t <= 1) && (u >= 0 && u <= 1);
    }
}

function clones(...vs) {
    for(var v of vs) if(v != vs[0]) return false;
    return true;
}

class Quadtree {
    constructor(x, y, width, height, capacity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.capacity = capacity;
        this.points = [];
        this.split = false;
    }

    rectOverlap(x, y, width, height) {
        return !(x - width  > this.x + this.width  ||
                 x + width  < this.x - this.width  ||
                 y - height > this.y + this.height ||
                 y + height < this.y - this.height);
    }

    circOverlap(x, y, radius) {
        // https://yal.cc/rectangle-circle-intersection-test/

        var dx = x - Math.max(this.x, Math.min(x, this.x + this.width ));
        var dy = y - Math.max(this.y, Math.min(y, this.y + this.height));
        return dx * dx + dy * dy <= radius * radius;
    }

    triOverlap(x1, y1, x2, y2, x3, y3) {

        var triCorners = [new Vec2(x1, y1), new Vec2(x2, y2), new Vec2(x3, y3)];
        var recCorners = [new Vec2(this.x, this.y), new Vec2(this.x + this.width, this.y), new Vec2(this.x + this.width, this.y + this.height), new Vec2(this.x, this.y + this.height)];

        for(var t of triCorners) if(t.inRect(this.x, this.y, this.width, this.height)) return true;
        for(var r of recCorners) if(r.inTri(x1, y1, x2, y2, x3, y3)) return true;

        var recLines = [
            new Line(recCorners[0], recCorners[1]),
            new Line(recCorners[1], recCorners[2]),
            new Line(recCorners[2], recCorners[3]),
            new Line(recCorners[3], recCorners[0]),
        ];

        var triLines = [
            new Line(triCorners[0], triCorners[1]),
            new Line(triCorners[1], triCorners[2]),
            new Line(triCorners[2], triCorners[0])
        ];

        for(var tl of triLines) {
            for(var rl of recLines) if(Line.intersects(tl, rl)) return true;
        }

        return false;
    }

    insert(v) {
        if(!v.inRect(this.x, this.y, this.width, this.height)) return false;

        if(!this.split && this.points.length <= this.capacity) {
            this.points.push(v)
            if(this.points.length > this.capacity) {
                this.divide();
                for(var p of this.points) {
                    if(this.tl.insert(p)) continue;
                    if(this.tr.insert(p)) continue;
                    if(this.bl.insert(p)) continue;
                    if(this.br.insert(p)) continue;
                }
                this.points = [];
            }
            return true;
        } else {
            if(this.tl.insert(v)) return true;
            if(this.tr.insert(v)) return true;
            if(this.bl.insert(v)) return true;
            if(this.br.insert(v)) return true;
        }
        return false;
    }

    extract(x, y, width, height, arr = []) {
        if(!this.rectOverlap(x, y, width, height)) return arr;
        if(!this.split) {
            for(var p of this.points) if(p.inRect(x, y, width, height)) arr.push(p);
        } else {
            this.tl.extract(x, y, width, height, arr);
            this.tr.extract(x, y, width, height, arr);
            this.bl.extract(x, y, width, height, arr);
            this.br.extract(x, y, width, height, arr);
        }

        return arr;
    }

    extractAll() {
        return this.extract(this.x, this.y, this.width, this.height);
    }

    extractCirc(x, y, radius, arr = []) {
        if(!this.circOverlap(x, y, radius)) return arr;
        if(!this.split) {
            for(var p of this.points) if(p.inCirc(x, y, radius)) arr.push(p);
        } else {
            this.tl.extractCirc(x, y, radius, arr);
            this.tr.extractCirc(x, y, radius, arr);
            this.bl.extractCirc(x, y, radius, arr);
            this.br.extractCirc(x, y, radius, arr);
        }

        return arr;
    }

    extractTri(x1, y1, x2, y2, x3, y3, arr = []) {
        if(!this.triOverlap(x1, y1, x2, y2, x3, y3)) return arr;
        if(!this.split) {
            for(var p of this.points) if(p.inTri(x1, y1, x2, y2, x3, y3)) arr.push(p);
        } else {
            this.tl.extractTri(x1, y1, x2, y2, x3, y3, arr);
            this.tr.extractTri(x1, y1, x2, y2, x3, y3, arr);
            this.bl.extractTri(x1, y1, x2, y2, x3, y3, arr);
            this.br.extractTri(x1, y1, x2, y2, x3, y3, arr);
        }

        return arr;
    }
    
    divide() {
        if(!this.split) {
            this.tl = new Quadtree(this.x, this.y, this.width / 2, this.height / 2, this.capacity);
            this.tr = new Quadtree(this.x + this.width / 2, this.y, this.width / 2, this.height / 2, this.capacity);
            this.bl = new Quadtree(this.x, this.y + this.height / 2, this.width / 2, this.height / 2, this.capacity);
            this.br = new Quadtree(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, this.capacity);
            this.split = true;
        }
    }

    empty() {
        this.split = false;
        this.tl = undefined;
        this.tr = undefined;
        this.bl = undefined;
        this.br = undefined;
    }
}
