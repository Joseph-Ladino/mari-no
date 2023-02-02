import Player from "./player.js";
import { WORLD } from "./globals.js";
import { defaultController, defaultKeyboard } from "./controlSettings.js";
var player;
export default class Game {
    constructor() {
        this.friction = 0.75;
        this.gravity = 0.38;
        this.drawDebug = false;
        this.controllerSettings = defaultController;
        this.keyboardSettings = defaultKeyboard;
    }
    draw(alpha) {
        player.draw(alpha);
    }
    update(ms) {
        player.update(ms);
    }
    init() {
        WORLD.game = this;
        WORLD.player = player = new Player();
        player.init();
    }
}
