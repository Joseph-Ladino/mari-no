import Vec from "./engine/src/vec.js";
export default class Entity {
    constructor() {
        this.pos = new Vec();
        this.vel = new Vec();
        this.acc = new Vec();
        this.size = new Vec();
        this.lastFrameState = {
            pos: new Vec(),
            vel: new Vec(),
            acc: new Vec(),
            size: new Vec(),
        };
    }
    // alpha blend between engine update loop and draw loop
    draw(alpha) { }
    // fixed length of engine update loop in milliseconds
    update(ms) { }
    saveState() {
        this.lastFrameState.pos = this.pos.clone;
        this.lastFrameState.vel = this.vel.clone;
        this.lastFrameState.acc = this.acc.clone;
        this.lastFrameState.size = this.size.clone;
    }
    get width() {
        return this.size.x;
    }
    set width(w) {
        this.size.x = w;
    }
    get height() {
        return this.size.y;
    }
    set height(h) {
        this.size.y = h;
    }
}
