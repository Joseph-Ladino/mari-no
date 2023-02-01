import { tools, WORLD } from "globals.js";
import Vec from "@engine/vec.js";
import Entity from "entity.js";
import { keyboard, gamepadManager } from "globals.js";
import { InputButton } from "@engine/input.js";
import { constrain } from "@engine/tools.js";

import { Frame, FrameSet, Animator } from "animation.js";
import { ImageAsset } from "@engine/mediaasset.js";

enum PlayerInput {
	UP = "up",
	DOWN = "down",
	LEFT = "left",
	RIGHT = "right",
	JUMP = "jump",
	SHOOT = "shoot",
}

enum AnimationState {
	STANDING,
	WALKING,
	JUMPING,
	DEAD,
	FLAGPOLE,
}

function getInput(p: PlayerInput): InputButton {
	return keyboard.key(WORLD.keyboardSettings[p]);
}

function isInputDown(p: PlayerInput) {
	return getInput(p).down;
}

export default class Player extends Entity {
	maxVelX = 16;
	maxVelY = 16;
	sizeVel = new Vec();
	minSize = new Vec(16, 16);
	roundThresh = 0.5;
	animState: AnimationState = AnimationState.STANDING;
    direction = {
        x: 1,
        y: 1,
        z: 0
    };

	constructor() {
		super();

		this.width = this.height = 16;
		this.pos.set(this.size.mlts(0.5));

		let sprite = new ImageAsset("mario", "../sprites/mario strip.png");
		sprite.load();

		this.animator = new Animator();

		this.animator.add("standingRight", new FrameSet(sprite, [new Frame(80, 34, 16, 16, 3, false)]));
		this.animator.add("standingLeft", new FrameSet(sprite, [new Frame(80, 34, 16, 16, 3, true)]));
		this.animator.add("jumpingRight", new FrameSet(sprite, [new Frame(165, 34, 16, 16, 3, false)]));
		this.animator.add("jumpingLeft", new FrameSet(sprite, [new Frame(165, 34, 16, 16, 3, true)]));
		this.animator.add(
			"walkingRight",
			new FrameSet(sprite, [new Frame(97, 34, 16, 16, 3, false), new Frame(114, 34, 16, 16, 3, false), new Frame(131, 34, 16, 16, 3, false)])
		);
		this.animator.add(
			"walkingLeft",
			new FrameSet(sprite, [new Frame(97, 34, 16, 16, 3, true), new Frame(114, 34, 16, 16, 3, true), new Frame(131, 34, 16, 16, 3, true)])
		);
		this.animator.add("deadRight", new FrameSet(sprite, [new Frame(182, 34, 16, 16, 3, false)]));
		this.animator.add("deadLeft", new FrameSet(sprite, [new Frame(182, 34, 16, 16, 3, false)]));
		this.animator.add("flagPoleRight", new FrameSet(sprite, [new Frame(216, 34, 16, 16, 3, false)]));
		this.animator.add("flagPoleLeft", new FrameSet(sprite, [new Frame(216, 34, 16, 16, 3, true)]));

		this.animator.set("standingRight");
	}

	draw(alpha: number): void {
		let interpPos = tools.lerpv(this.lastFrameState.pos, this.pos, alpha).sub(this.size.mlts(0.5));
		// tools.fillRect(interpPos, this.size, "red");
		this.animator.drawActiveFrame(interpPos, this.size);
	}

	update(ms: number): void {
		let speedX = 0.9;
		let speedY = 0.9;
		let speedZ = new Vec(4, 4);

		if (isInputDown(PlayerInput.LEFT)) this.acc.x -= speedX;
		if (isInputDown(PlayerInput.RIGHT)) this.acc.x += speedX;
		if (isInputDown(PlayerInput.UP)) this.acc.y -= speedY;
		if (isInputDown(PlayerInput.DOWN)) this.acc.y += speedY;

		if (getInput(PlayerInput.JUMP).down && this.direction.z == 0) {
			this.sizeVel.set(this.sizeVel.add(speedZ));
		}

		this.saveState();

		this.sizeVel.set(this.sizeVel.subs(WORLD.gravity));
		let nextSize = this.size.add(this.sizeVel);
		if (nextSize.x < this.minSize.x) {
			nextSize.x = this.size.x = this.minSize.x;
			this.sizeVel.x = 0;
		}
		if (nextSize.y < this.minSize.y) {
			nextSize.y = this.size.y = this.minSize.y;
			this.sizeVel.y = 0;
		}

		if (this.vel.magSq < this.roundThresh ** 2) this.vel = new Vec();

        if (this.vel.x != 0) this.direction.x = Math.sign(this.vel.x); // will never be zero
        if (this.vel.y != 0) this.direction.y = Math.sign(this.vel.y); // will never be zero
        this.direction.z = Math.sign(this.sizeVel.x + this.sizeVel.y);

		// console.log(this.direction);

        let frameDir = this.direction.x > 0 ? "Right" : "Left";

		if (!(this.vel.x == 0 && this.vel.y == 0)) this.animator.set("walking" + frameDir);
		else this.animator.set("standing" + frameDir);

		this.vel.x = constrain(this.vel.x, -this.maxVelX, this.maxVelX);
		this.vel.y = constrain(this.vel.y, -this.maxVelY, this.maxVelY);

		this.size.set(nextSize);

		this.vel.set(this.vel.add(this.acc));
		this.vel.set(this.vel.mlts(WORLD.friction));
		this.pos.set(this.pos.add(this.vel));
		this.acc.set(new Vec());

		this.animator.update();
	}
}
