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

function getInput(p: PlayerInput): InputButton {
	return keyboard.key(WORLD.keyboardSettings[p]);
}

function isInputDown(p: PlayerInput) {
	return getInput(p).down;
}

export default class Player extends Entity {
	maxVelX = 16;
	maxVelY = 16;
	roundThresh = 0.5;

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

        window.animator = this.animator;
	}

	draw(alpha: number): void {
		let interpPos = tools.lerpv(this.lastFrameState.pos, this.pos, alpha).sub(this.size.mlts(0.5));
		// tools.fillRect(interpPos, this.size, "red");
        this.animator.drawActiveFrame(interpPos, this.size);
	}

	update(ms: number): void {
		let speedX = 0.9;
		let speedY = 0.9;

		if (isInputDown(PlayerInput.LEFT)) this.acc.x -= speedX;
		if (isInputDown(PlayerInput.RIGHT)) this.acc.x += speedX;
		if (isInputDown(PlayerInput.UP)) this.acc.y -= speedY;
		if (isInputDown(PlayerInput.DOWN)) this.acc.y += speedY;

		this.saveState();

		if (this.vel.magSq < this.roundThresh ** 2) this.vel = new Vec();

        if(this.vel.x > 0 && this.animator.frameSetIndex != "walkingRight") this.animator.set("walkingRight");
        else if(this.vel.x < 0 && this.animator.frameSetIndex != "walkingLeft") this.animator.set("walkingLeft");
        
        if (this.vel.x == 0 && this.vel.y == 0 && this.lastFrameState.vel.x > 0) this.animator.set("standingRight");
        else if (this.vel.x == 0 && this.vel.y == 0 && this.lastFrameState.vel.x < 0) this.animator.set("standingLeft");

        this.vel.x = constrain(this.vel.x, -this.maxVelX, this.maxVelX);
		this.vel.y = constrain(this.vel.y, -this.maxVelY, this.maxVelY);

		this.vel.set(this.vel.add(this.acc));
		this.vel.set(this.vel.mlts(WORLD.friction));
		this.pos.set(this.pos.add(this.vel));
		this.acc.set(new Vec());

        this.animator.update();
	}
}