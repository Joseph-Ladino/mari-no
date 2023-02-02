import { display, engine, mouse, tools, WORLD } from "./globals.js";
import Game from "./game.js";
WORLD.game = new Game();
engine.fps = 60;
display.updateBufSize(16 * 20, 16 * 14);
display.buf.imageSmoothingEnabled = false;
display.ctx.imageSmoothingEnabled = false;
// drawloop (runs as many times as possible per second)
function draw(alpha) {
    tools.fillCircle(mouse, 2);
    WORLD.game.draw(alpha);
}
// gameloop (runs engine.fps times per second)
function loop(ms) {
    WORLD.game.update(ms);
}
WORLD.game.init();
display.setDrawLoop(draw);
engine.setGameLoop(loop);
engine.start();
