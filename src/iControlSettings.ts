export default interface iControlSettings {
	up: string;
	down: string;
	left: string;
	right: string;
	jump: string;
	shoot: string;
}

const defaultKeyboard: iControlSettings = {
	up: "w",
	down: "s",
	left: "a",
	right: "d",
	jump: " ",
	shoot: "l",
};

const defaultController: iControlSettings = {
	up: "dpadUp",
	down: "dpadDown",
	left: "dpadLeft",
	right: "dpadRight",
	jump: "x",
	shoot: "rTrigger",
};

export {iControlSettings, defaultKeyboard, defaultController};