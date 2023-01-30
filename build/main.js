import { display, engine, mouse, tools } from "./engine/src/globals.js";
const worldOptions = {
    friction: 0.9,
    drawDebug: false,
    keyboardControls: {
        up: "w",
        down: "s",
        left: "a",
        right: "d",
        jump: " ",
        shoot: "l",
    },
    gamepadControls: {
        up: "dpadUp",
        down: "dpadDown",
        left: "dpadLeft",
        right: "dpadRight",
        jump: "x",
        shoot: "rTrigger",
    },
};
// drawloop (runs as many times as possible per second)
function draw(alpha) {
    tools.fillCircle(mouse, 2);
}
// gameloop (runs engine.fps times per second)
function loop(ms) {
}
display.setDrawLoop(draw);
engine.setGameLoop(loop);
engine.start();
