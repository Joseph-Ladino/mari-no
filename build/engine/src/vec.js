export default class Vec {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        // just useful to have available
        Object.assign(Math, {
            PI2: Math.PI * 2,
            PIHALF: Math.PI / 2,
            PIQUARTER: Math.PI / 4
        });
    }
    // vector arithmetic
    add(v) {
        return new Vec(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vec(this.x - v.x, this.y - v.y);
    }
    mlt(v) {
        return new Vec(this.x * v.x, this.y * v.y);
    }
    div(v) {
        return new Vec(this.x / v.x, this.y / v.y);
    }
    // scalar arithmetic
    adds(n) {
        return new Vec(this.x + n, this.y + n);
    }
    subs(n) {
        return new Vec(this.x - n, this.y - n);
    }
    mlts(n) {
        return new Vec(this.x * n, this.y * n);
    }
    divs(n) {
        return new Vec(this.x / n, this.y / n);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    set(v) {
        this.x = v.x || 0;
        this.y = v.y || 0;
    }
    project(v) {
        let dp = this.dot(v);
        let m = v.mag;
        return new Vec(dp, dp).mlts(1 / m);
    }
    // checks if the distance between two vecs are within a tolerance
    static compare(v1, v2, tolerance = 0.5) {
        return v2.sub(v1).magSq < Math.pow(tolerance, 2);
    }
    // mapped between 0 and 2 PI
    get angle() {
        return (Math.atan2(this.y, this.x) + (Math.PI * 2)) % (Math.PI * 2);
    }
    // mapped between -PI and PI
    get angle2() {
        return Math.atan2(this.y, this.x);
    }
    set angle(rad) {
        this.set(new Vec(Math.cos(rad), Math.sin(rad)).mlts(this.mag));
    }
    get clone() {
        return new Vec(this.x, this.y);
    }
    get abs() {
        return new Vec(Math.abs(this.x), Math.abs(this.y));
    }
    get mag() {
        return Math.hypot(this.x, this.y);
    }
    get magSq() {
        return this.dot(this);
    }
    get unit() {
        return this.divs(this.mag || 1);
    }
    get norml() {
        return new Vec(-this.y, this.x);
    }
    get normr() {
        return new Vec(this.y, -this.x);
    }
    get norm() {
        return this.norml;
    }
    set mag(n) {
        this.set(this.unit.mlts(n));
    }
}
// for console access
Object.assign(window, { Vec });
