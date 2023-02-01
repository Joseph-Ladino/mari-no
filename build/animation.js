import Vec from "./engine/src/vec.js";
import { display } from "./globals.js";
export class Frame {
    constructor(startX, startY, sizeX, sizeY, frameDuration = 3, mirrored = false) {
        // this.img = img;
        this.source = new Vec(startX, startY);
        this.size = new Vec(sizeX, sizeY);
        this.duration = frameDuration;
        this.mirrored = mirrored;
    }
}
export class FrameSet {
    constructor(img, frames = []) {
        this.index = 0;
        this.img = img;
        this.frames = frames;
    }
    add(frame) {
        this.frames.push(frame);
    }
    next() {
        this.index = ++this.index % this.length;
    }
    get length() {
        return this.frames.length;
    }
    get activeFrame() {
        return this.frames[this.index];
    }
}
export class Animator {
    constructor() {
        this.frameSets = {};
        this.frameTimer = 0;
        this.frameTimerStep = 1.1;
        this.frameSetIndex = "";
    }
    add(name, frameSet) {
        this.frameSets[name] = frameSet;
    }
    set(name) {
        if (name == this.frameSetIndex)
            return;
        if (!(name in this.frameSets))
            throw new Error(`frame set "${name}" does not exist`);
        this.frameTimer = 0;
        if (this.frameSetIndex in this.frameSets)
            this.activeFrameSet.index = 0;
        this.frameSetIndex = name;
    }
    update() {
        this.frameTimer += this.frameTimerStep;
        if (this.frameTimer >= this.activeFrame.duration) {
            this.activeFrameSet.next();
            this.frameTimer = 0;
        }
    }
    drawActiveFrame(destPos, destSize, offset = new Vec()) {
        let buf = display.buf;
        let frame = this.activeFrame;
        let img = this.activeFrameImg;
        let mirrored = this.activeFrame.mirrored;
        if (!img.loaded)
            return;
        destPos = destPos.add(offset);
        if (!mirrored)
            buf.drawImage(img.image, frame.source.x, frame.source.y, frame.size.x, frame.size.y, destPos.x, destPos.y, destSize.x, destSize.y);
        else {
            buf.save();
            buf.translate(destPos.x + destSize.x, destPos.y);
            buf.scale(-1, 1);
            buf.drawImage(img.image, frame.source.x, frame.source.y, frame.size.x, frame.size.y, 0, 0, destSize.x, destSize.y);
            buf.restore();
        }
    }
    get activeFrameSet() {
        return this.frameSets[this.frameSetIndex];
    }
    get activeFrame() {
        return this.activeFrameSet.activeFrame;
    }
    get activeFrameImg() {
        return this.activeFrameSet.img;
    }
}
