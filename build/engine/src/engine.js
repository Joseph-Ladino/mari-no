import { Mouse, Keyboard, GamepadManager } from "./input.js";
export default class Engine {
    constructor(gameLoop, display, fps = 60) {
        this.gameLoop = gameLoop;
        this.display = display;
        this.fps = fps;
        this.mouse = new Mouse(display);
        this.keyboard = new Keyboard();
        this.gamepadManager = new GamepadManager();
        this.gamepadManager.init();
        // for console access
        Object.assign(window, { mouse: this.mouse, keyboard: this.keyboard, gamepadManager: this.gamepadManager });
        this.hnd = 0;
        this.timePrev = 0;
        this.timeStep = 1000 / fps;
        this.timeDelta = 0;
        this.elapsedTime = this.timeStep;
        this._loop = (now) => this.loop(now);
    }
    setGameLoop(gameLoop) {
        this.gameLoop = gameLoop;
    }
    // fixed timestep gameloop with interpolation
    loop(now) {
        this.start();
        this.timeDelta = now - this.timePrev;
        this.elapsedTime += this.timeDelta;
        this.timePrev = now;
        // if we miss 5 frames, only update once
        if (this.elapsedTime >= 5 * this.timeStep)
            this.elapsedTime = 0;
        while (this.elapsedTime >= this.timeStep) {
            this.gamepadManager.pollGamepads();
            this.gameLoop(this.timeStep);
            this.keyboard.clearPressed();
            this.mouse.clearClicked();
            this.gamepadManager.clearPressed();
            this.elapsedTime -= this.timeStep;
        }
        // this.mouse.interpolate(this.elapsedTime / this.timeStep);
        this.display.render(this.elapsedTime / this.timeStep);
    }
    get fps() {
        return 1000 / this.timeStep;
    }
    set fps(_fps) {
        this.timeStep = 1000 / _fps;
    }
    start() {
        this.hnd = window.requestAnimationFrame(this._loop);
    }
    stop() {
        window.cancelAnimationFrame(this.hnd);
    }
}
