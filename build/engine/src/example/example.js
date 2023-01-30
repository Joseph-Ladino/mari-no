import { display, engine, mouse, tools } from "../globals.js";
import Player from "./player.js";
const worldOptions = {
    friction: 0.9,
    drawDebug: false,
    keyboardControls: {
        up: "w",
        down: "s",
        left: "a",
        right: "d",
        jump: " ",
        shoot: "l"
    },
    gamepadControls: {
        up: "dpadUp",
        down: "dpadDown",
        left: "dpadLeft",
        right: "dpadRight",
        jump: "x",
        shoot: "rTrigger"
    }
};
const player = new Player(800, 350, 130, worldOptions);
Object.assign(window, { player });
// drawloop (runs as many times as possible per second)
function draw(alpha) {
    player.draw(alpha);
    tools.fillCircle(mouse, 2);
}
// gameloop (runs engine.fps times per second)
function loop(ms) {
    player.update(ms);
}
display.setDrawLoop(draw);
engine.setGameLoop(loop);
engine.start();
