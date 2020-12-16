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
}

function clones(...vs) {
    for(var v of vs) if(v != vs[0]) return false;
    return true;
}

/////////////////////////////////////////////////////////////

var ctx = document.getElementById("mycan").getContext("2d");
ctx.canvas.width = 100;
ctx.canvas.height = 100;
var line1 = new Line(new Vec2(0, 25), new Vec2(50, 25));
var line2 = new Line(new Vec2(25, 0), new Vec2(25, 50));

function intersectTest(l1, l2) {
    // var t  = ((line1.v1.x - line2.v1.x) * (line2.v1.y - line2.v2.y)) - ((line1.v1.y - line2.v1.y) * (line2.v1.x - line2.v2.x));
    // var u = -((line1.v1.x - line1.v2.x) * (line1.v1.y - line2.v1.y)) - ((line1.v1.y - line1.v2.y) * (line1.v1.x - line2.v1.x));
    //
    // var den = ((line1.v1.x - line1.v2.x) * (line2.v1.y - line2.v2.y)) - ((line1.v1.y - line1.v2.y) * (line2.v1.x - line2.v2.x));

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
var ret;
function loop(_e) {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ret = intersectTest(line1, line2);
    if(ret) {
        ctx.beginPath();
        ctx.moveTo(line1.v1.x, line1.v1.y);
        ctx.lineTo(line1.v2.x, line1.v2.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(line2.v1.x, line2.v1.y);
        ctx.lineTo(line2.v2.x, line2.v2.y);
        ctx.stroke();
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
