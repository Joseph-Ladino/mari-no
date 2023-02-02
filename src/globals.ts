export * from "@engine/globals.js";
import Game from "game.js";
import Player from "player.js";

export const WORLD: { game?: Game; player?: Player } = {};

Object.assign(window, WORLD);
