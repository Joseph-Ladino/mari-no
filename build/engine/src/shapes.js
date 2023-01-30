import Vec from './vec.js';
import { fillRect, fillCircle } from './tools.js';
class Rectangle {
    constructor(x, y, width, height) {
        // pos is centered
        this.pos = new Vec(x, y);
        this.size = new Vec(width, height);
        this.halfSize = this.size.mlts(0.5);
    }
    closestPointToEdge(p) {
        let tl = this.tl, br = this.br;
        return new Vec(Math.max(tl.x, Math.min(p.x, br.x)), Math.max(tl.y, Math.min(p.y, br.y)));
    }
    pointOverlap(p) {
        let tl = this.tl;
        let br = this.br;
        return p.x <= br.x && p.x >= tl.x && p.y <= br.y && p.y >= tl.y;
    }
    rectOverlap(r) {
        let tl1 = this.tl;
        let br1 = this.br;
        let tl2 = r.tl;
        let br2 = r.br;
        return !(tl1.x >= br2.x || br1.x <= tl2.x || tl1.y >= br2.y || br1.y <= tl2.y);
    }
    circleOverlap(c) {
        // https://yal.cc/rectangle-circle-intersection-test/
        // tldr, if distance between closest point on rect and circle
        // is less than circle radius, collision = true
        return this.closestPointToEdge(c.pos).sub(c.pos).magSq <= c.radius * c.radius;
    }
    draw(alpha = 1) {
        fillRect(this.tl, this.size, "white");
    }
    get tl() {
        return this.pos.sub(this.halfSize);
    }
    get br() {
        return this.pos.add(this.halfSize);
    }
    get tr() {
        return new Vec(this.pos.x + this.halfSize.x, this.pos.y - this.halfSize.y);
    }
    get bl() {
        return new Vec(this.pos.x - this.halfSize.x, this.pos.y + this.halfSize.y);
    }
    get verts() {
        return [this.tl, this.tr, this.br, this.bl];
    }
    get sides() {
        let tl = this.tl, tr = this.tr, br = this.br, bl = this.bl;
        return [tr.sub(tl), br.sub(tr), bl.sub(br), tl.sub(bl)];
    }
}
class Circle {
    constructor(x, y, radius) {
        this.pos = new Vec(x, y);
        this.radius = radius;
    }
    pointOverlap(p) {
        return this.pos.sub(p).magSq <= Math.pow(this.radius, 2);
    }
    circleOverlap(c) {
        return this.pos.sub(c.pos).magSq <= Math.pow((this.radius + c.radius), 2);
    }
    draw(alpha = 1) {
        fillCircle(this.pos, this.radius, "red");
    }
}
export { Rectangle, Circle };
