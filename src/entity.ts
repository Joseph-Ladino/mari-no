import Vec from "@engine/vec.js";
import { Animator } from "animation.js";

export default class Entity {
	pos: Vec; // position (centered)
	vel: Vec; // velocity
	acc: Vec; // acceleration
	size: Vec; // width and height

	// store old state for interpolation
	lastFrameState: {
		pos: Vec;
		vel: Vec;
		acc: Vec;
		size: Vec;
	};

    animator: Animator;

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
	draw(alpha: number) {}

	// fixed length of engine update loop in milliseconds
	update(ms: number) {}

	saveState() {
		this.lastFrameState.pos = this.pos.clone;
		this.lastFrameState.vel = this.vel.clone;
		this.lastFrameState.acc = this.acc.clone;
		this.lastFrameState.size = this.size.clone;
	}

	get width() {
		return this.size.x;
	}
	set width(w: number) {
		this.size.x = w;
	}
	get height() {
		return this.size.y;
	}
	set height(h: number) {
		this.size.y = h;
	}
}
