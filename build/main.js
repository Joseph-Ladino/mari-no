import { display, engine, mouse, tools } from "./globals.js";
import Player from "./player.js";
// engine.fps = 30;
display.updateBufSize(16 * 20, 16 * 14);
display.buf.imageSmoothingEnabled = false;
display.ctx.imageSmoothingEnabled = false;
const player = new Player();
// drawloop (runs as many times as possible per second)
function draw(alpha) {
    tools.fillCircle(mouse, 2);
    player.draw(alpha);
}
// gameloop (runs engine.fps times per second)
function loop(ms) {
    player.update(ms);
}
display.setDrawLoop(draw);
engine.setGameLoop(loop);
engine.start();
console.log(engine);
