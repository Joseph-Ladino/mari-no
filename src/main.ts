import { display, engine, mouse, tools, gamepadManager, WORLD } from "globals.js";
import Game from "game.js";

WORLD.game = new Game();

engine.fps = 60;
display.updateBufSize(16*20, 16*14);
display.buf.imageSmoothingEnabled = false;
display.ctx.imageSmoothingEnabled = false;

// drawloop (runs as many times as possible per second)
function draw(alpha: number) {
	tools.fillCircle(mouse, 2);
    WORLD.game.draw(alpha);
}

// gameloop (runs engine.fps times per second)
function loop(ms: number) {
    WORLD.game.update(ms);
}

WORLD.game.init();

display.setDrawLoop(draw);
engine.setGameLoop(loop);
engine.start();