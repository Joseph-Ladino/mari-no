import Player from "player.js";
import { WORLD } from "globals.js";
import { defaultController, defaultKeyboard } from "controlSettings.js";

var player: Player;

export default class Game {
    friction = 0.75;
    gravity = 0.38;
	drawDebug = false;
    controllerSettings = defaultController;
    keyboardSettings = defaultKeyboard;

    constructor() {

    }

    draw(alpha: number) {
        player.draw(alpha);
    }

    update(ms: number) {
        player.update(ms);
    }

    init() {
        WORLD.game = this;
        WORLD.player = player = new Player();
        player.init();
    }
}