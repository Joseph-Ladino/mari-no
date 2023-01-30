import { Circle } from '../shapes.js';
import { ImageAsset } from "../mediaasset.js";
import { lerp, lerpv, strokeCircle } from "../tools.js";
import { buf } from "../globals.js";
class Buckshot extends Circle {
    constructor(pos, vel, options = {}) {
        super(pos.x, pos.y, 25);
        this.minRadius = 25;
        this.maxDst = 300;
        this.cull = false;
        this.scale = 0.75;
        this.minScale = 0.5;
        this.maxScale = 3.5;
        this.options = options;
        this.origin = pos.clone;
        this.old = pos.clone;
        this.vel = vel;
        this.sprite = new ImageAsset("sprinkles", "assets/projectile.png");
        this.sprite.load();
    }
    get dst() {
        return this.origin.sub(this.pos).mag;
    }
    update(ms) {
        this.old.set(this.pos);
        this.pos.set(this.pos.add(this.vel));
        this.scale = lerp(this.minScale, this.maxScale, Math.min(1, this.dst / this.maxDst));
        this.radius = this.scale * this.minRadius;
        this.cull = this.dst >= this.maxDst;
    }
    draw(alpha) {
        let interp = lerpv(this.old, this.pos, alpha);
        buf.save();
        buf.translate(interp.x, interp.y);
        buf.rotate(this.vel.angle);
        buf.drawImage(this.sprite.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        buf.restore();
        if (this.options.drawDebug)
            strokeCircle(interp, this.radius);
    }
}
export { Buckshot };
