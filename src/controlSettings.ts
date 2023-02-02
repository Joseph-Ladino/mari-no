export default interface controlSettings {
	up: string;
	down: string;
	left: string;
	right: string;
	jump: string;
	shoot: string;
}

const defaultKeyboard: controlSettings = {
	up: "w",
	down: "s",
	left: "a",
	right: "d",
	jump: " ",
	shoot: "l",
};

const defaultController: controlSettings = {
	up: "dpadUp",
	down: "dpadDown",
	left: "dpadLeft",
	right: "dpadRight",
	jump: "x",
	shoot: "rTrigger",
};

export {controlSettings, defaultKeyboard, defaultController};