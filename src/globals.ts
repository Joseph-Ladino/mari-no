export * from "@engine/globals.js"
import { defaultController, defaultKeyboard } from "iControlSettings.js";

const WORLD = {
	friction: 0.75,
	drawDebug: false,
    controllerSettings: defaultController,
    keyboardSettings: defaultKeyboard
};

Object.assign(window, WORLD);

export { WORLD };