// my reference: https://github.com/CodingTrain/QuadTree

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


///////////////////////////////////////////////

var highlight = false;
var mousePos = new Vec2(0, 0);
var circle = 0;
var points = [];
var height = window.innerHeight;
var width = window.innerWidth;
var move = false;
var ctx = document.getElementById("mycan").getContext("2d");
var qt;
var di = 100;
var pr = 5;

// for(var y = 0; y < height; y+=height/(pr * pr)) {
//     for(var x = 0; x < width; x+=width/(pr * pr)) {
//         points.push(new Vec2(x, y, false));
//     }
// }

// for(var y = 0; y < height; y+=pr*3) {
//     for(var x = 0; x < width; x+=pr*3) {
//         points.push(new Vec2(x, y, false));
//     }
// }

for(var i = 0; i < 1500; i++) {
    points.push(new Vec2(Math.random() * width, Math.random() * height));
}

function drawTree(qt) {
    ctx.strokeRect(qt.x, qt.y, qt.width, qt.height);
    if(qt.split) {
        drawTree(qt.tl);
        drawTree(qt.tr);
        drawTree(qt.bl);
        drawTree(qt.br);
    }
}

var triPoints;

function loop(_e) {
    height = window.innerHeight;
    width = window.innerWidth;

    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    var offsetMousePos = circle != 1 ? mousePos : new Vec2(mousePos.x - di / 2, mousePos.y - di / 2);

////////////////////////////////////////////////////

    triPoints = [mousePos.x - (di * 0.33), mousePos.y + (di / 2), mousePos.x, mousePos.y - (di * 0.43), mousePos.x + (di * 0.33), mousePos.y + (di / 2)];

    qt = new Quadtree(0, 0, width, height, 4);
    for(var p of points) {
        if(move) {
            p.x += (Math.random() - 0.5) * 2;
            p.y += (Math.random() - 0.5) * 2;
        }

        qt.insert(p);

        ctx.fillStyle = (p.data) ? "crimson" : "black";
        ctx.beginPath();
        ctx.arc(p.x, p.y, pr, 0, 2 * Math.PI);
        ctx.fill();

        p.data = false;
    }

    drawTree(qt);

    if(highlight) {
        for(var p2 of points) {
            var innies = qt.extractCirc(p2.x, p2.y, pr * 2);
            // var innies = points;
            for(var inn of innies) {
                if(inn !== p2 && (Math.hypot(inn.x-p2.x, inn.y-p2.y) <= pr * 2)) inn.data = true;
            }
        }
    }

    var collides = circle == 0 ? qt.extractCirc(offsetMousePos.x, offsetMousePos.y, di/2) : (circle == 1 ? qt.extract(offsetMousePos.x, offsetMousePos.y, di, di) : qt.extractTri(...triPoints));
    for(var c of collides) {
        c.data = true;
    }

    ctx.fillStyle = "rgb(100, 0, 0)";
    ctx.globalAlpha = 0.3;

    if(circle == 0) {
        ctx.beginPath();
        ctx.arc(offsetMousePos.x, offsetMousePos.y, di / 2, 0, 2 * Math.PI);
        ctx.fill();
    } else if(circle == 1) ctx.fillRect(offsetMousePos.x, offsetMousePos.y, di, di);
    else {
        ctx.beginPath();
        ctx.moveTo(triPoints[0], triPoints[1]);
        ctx.lineTo(triPoints[2], triPoints[3]);
        ctx.lineTo(triPoints[4], triPoints[5]);
        ctx.closePath();
        ctx.fill();
    }

    // points.push(new Vec2(width * Math.random(), height * Math.random(), false));

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

ctx.canvas.addEventListener("mousemove", (e)=>{
    mousePos.x = e.x - ctx.canvas.offsetLeft;
    mousePos.y = e.y - ctx.canvas.offsetTop;
});

ctx.canvas.addEventListener("mousedown", ()=>{circle++; circle %= 3});

addEventListener("mousewheel", (e)=>{
    di -= e.deltaY * 0.1;
    di = di < 0 ? 0 : di;
});
