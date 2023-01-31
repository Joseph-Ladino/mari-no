import Vec from "./engine/src/vec.js";
class Frame {
    constructor(img, startX, startY, sizeX, sizeY, frameDuration = 3, mirrored = false) {
        this.img = img;
        this.start = new Vec(startX, startY);
        this.size = new Vec(sizeX, sizeY);
        this.duration = frameDuration;
        this.mirrored = mirrored;
    }
}
