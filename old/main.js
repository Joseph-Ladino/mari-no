//--------------Classes & Objects--------------//
class Frame {
    constructor(img, startX, startY, sizeX, sizeY, frameLength = 3, mirrored = false) {
        this.img = img;
        this.startX = startX;
        this.startY = startY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.delay = frameLength;
        this.mirrored = mirrored;
    }
}

class Sound {
    constructor(url, cb = false) {
        this.playable = false;
        this.playing = false;
        this.elm = new Audio(url);
        this.elm.addEventListener("canplay", ()=>{this.playable = true});
        if(cb) this.elm.onended = cb;
    }

    set cb(cb) {
        this.elm.onended = cb;
    }

    get cb() {
        return this.elm.onended;
    }

    play() {
        this.elm.play();
        this.playing = true;
    }

    pause() {
        this.elm.pause();
        this.playing = false;
    }

    reset() {
        if(this.playing) this.pause();
        this.elm.currentTime = 0;
    }

    restart() {
        this.reset();
        this.play();
    }
}

class Entity {
    constructor(x, y, size, minsize = 16) {
        this.accX = 1; this.accY = 1; this.accZ = 2.5;
        this.velX = 0; this.velY = 0; this.velZ = 0;
        this.dirX = 0; this.dirY = 0; this.dirZ = 0;
        this.oldX = x; this.oldY = y;
        this.x = x; this.y = y;
        this.size = size;
        this.minSize = minsize;
        this.facing = 1;
        this.alive = true;
        this.noclip = false;
        this.handledDeath = false;
        this.controllable = false;
        this.lastCollidedWith = false;
        this.type = "";
        this.state = ""; this.oldState = "";
        this.activeFrame = new Image();
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.frames = {};
    }

    dynamicCollision(entity) {
        // console.log(entity);
    }

    frame() {

    }

    reset() {

    }

    get leftSide() {
        return this.x - (this.size / 2);
    }

    get rightSide() {
        return this.x + (this.size / 2);
    }

    get topSide() {
        return this.y - (this.size / 2);
    }

    get bottomSide() {
        return this.y + (this.size / 2);
    }

    set leftSide(val) {
        this.x = val + (this.size / 2);
    }

    set rightSide(val) {
        this.x = val - (this.size / 2);
    }

    set topSide(val) {
        this.y = val + (this.size / 2);
    }

    set bottomSide(val) {
        this.y = val - (this.size / 2);
    }

    static overlaps(entity, otherEntity) {
        return !(entity.x - entity.size > otherEntity.x + otherEntity.size ||
                 entity.x + entity.size < otherEntity.x - otherEntity.size ||
                 entity.y - entity.size > otherEntity.y + otherEntity.size ||
                 entity.y + entity.size < otherEntity.y - otherEntity.size);
    }

    alignToTile() {
        var coords = fromTileID(toTileID(this.x, this.y));
        this.leftSide = coords[0];
        this.topSide = coords[1];
    }


    delete() {
        for(var val in this) {
            if(val != "delete") delete this[val];
        }
        world.entities.splice(world.entities.indexOf(this), 1);
    }
}

class DynamicTile extends Entity {
    constructor(x, y) {
        super(x, y, world.tilesize, world.tilesize);
        this.staticX = x;
        this.staticY = y;
    }
}

class QuestionBlock extends DynamicTile {
    constructor(x, y, item) {
        super(x, y);
        this.item = item;
        this.opened = false;
        this.type = "qb";
        this.state = "inactive"; this.oldState = "inactive";
        this.frames = {
            inactive: [new Frame(world.tileset, 384, 0, world.tilesize, world.tilesize)],
            activated: [new Frame(world.tileset, 432, 0, world.tilesize, world.tilesize)],
        };
    }

    frame() {

    }
}

class Player extends Entity {
    constructor(x, y, minsize = 16) {
        super(x, y, minsize, minsize);
        this.accX = 0.9; this.accY = 0.9; this.accZ = 4;
        this.type = "player";
        this.state = "standingRight"; this.oldState = "standingRight";
        this.flagPole = false;
        this.won = false;
        this.controllable = true;
        this.frames = {
            standingRight: [new Frame("./sprites/mario strip.png", 80, 34, 16, 16, 3, false)],
            standingLeft: [new Frame("./sprites/mario strip.png", 80, 34, 16, 16, 3, true)],
            jumpingRight: [new Frame("./sprites/mario strip.png", 165, 34, 16, 16, 3, false)],
            jumpingLeft: [new Frame("./sprites/mario strip.png", 165, 34, 16, 16, 3, true)],
            walkingRight: [new Frame("./sprites/mario strip.png", 97, 34, 16, 16, 3, false), new Frame("./sprites/mario strip.png", 114, 34, 16, 16, 3, false), new Frame("./sprites/mario strip.png", 131, 34, 16, 16, 3, false)],
            walkingLeft: [new Frame("./sprites/mario strip.png", 97, 34, 16, 16, 3, true), new Frame("./sprites/mario strip.png", 114, 34, 16, 16, 3, true), new Frame("./sprites/mario strip.png", 131, 34, 16, 16, 3, true)],
            deadRight: [new Frame("./sprites/mario strip.png", 182, 34, 16, 16, 3, false)],
            deadLeft: [new Frame("./sprites/mario strip.png", 182, 34, 16, 16, 3, false)],
            flagPoleRight: [new Frame("./sprites/mario strip.png", 216, 34, 16, 16, 3, false)],
            flagPoleLeft: [new Frame("./sprites/mario strip.png", 216, 34, 16, 16, 3, true)],
        };
    }

    frame(_delta) {
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldState = this.state;

        this.velZ -= world.gravity;
        if(this.size + this.velZ <= this.minSize && this.alive) {
            this.size = this.minSize;
            this.velZ = 0;
        } else if(this.size < 0) {
            this.size = 0;
            this.velZ = 0;
        }

        this.velX *= world.friction;
        this.velY *= world.friction;

        if(Math.abs(this.velX) >= world.tilesize) this.velX = (Math.sign(this.velX) * world.tilesize) - (Math.sign(this.velX));
        else if(Math.abs(this.velX) < world.roundThreshold) this.velX = 0;
        if(Math.abs(this.velY) >= world.tilesize) this.velY = (Math.sign(this.velY) * world.tilesize) - (Math.sign(this.velY));
        else if(Math.abs(this.velY) < world.roundThreshold) this.velY = 0;

        this.x += this.velX;
        this.y += this.velY;
        this.size += this.velZ;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        if(this.leftSide < options.renderOffsetX) {
            this.leftSide = options.renderOffsetX;
            this.velX = 0;
        } else if(this.rightSide > options.renderOffsetX + options.screenSizeX) {
            this.rightSide = options.renderOffsetX + options.screenSizeX;
            this.velX = 0;
        }
        if(this.topSide < options.renderOffsetY) {
            this.topSide = options.renderOffsetY;
            this.velY = 0;
        } else if(this.bottomSide > options.renderOffsetY + options.screenSizeY) {
            this.bottomSide = options.renderOffsetY + options.screenSizeY;
            this.velY = 0;
        }

        this.dirX = Math.sign(this.velX);
        this.dirY = Math.sign(this.velY);
        this.dirZ = Math.sign(this.velZ);
        this.facing = (this.x - this.oldX > 0) ? 1 : ((this.x - this.oldX < 0) ? -1 : this.facing);

        if(!this.alive) this.state = "dead";
        else if(this.flagPole) {this.state = "flagPole"; this.win()}
        else if(this.dirX == 0 && this.dirY == 0 && this.dirZ == 0) this.state = "standing";
        else if(this.dirZ != 0) this.state = "jumping";
        else if(this.dirX != 0 || this.dirY != 0) this.state = "walking";

        this.state += (this.facing == 1) ? "Right" : "Left";
    }

    win() {
        // 100 - ((y-top) / (top + (height)))
        var flagPoleTop, flagPoleBottom, flagPoleHeight, xTile = Math.floor(this.x / world.tilesize), yTile = Math.floor(this.y / world.tilesize);
        for(var i = yTile; i > 0; i--) {
            if(world.tiles[(i * world.cols) + xTile] - 1 != 5 && i != yTile) {
                flagPoleTop = i + 1;
                break;
            }
        }

        for(var j = yTile; j < world.rows; j++) {
            var tile = (j * world.cols) + xTile;
            if(world.tiles[tile] - 1 != 5) {
                flagPoleBottom = (fromTileID(tile)[1] + world.offsetY) / world.tilesize;
                break;
            }
        }

        flagPoleHeight = flagPoleBottom - flagPoleTop;

        if(yTile < flagPoleBottom) this.y += world.gravity * 2;

        if(!this.won) {
            var score = ((flagPoleHeight - (yTile - flagPoleTop)) / flagPoleHeight) * 1000;
            score -= score % 100;
            world.score += score;
            pauseSound(world.sounds.loop);
            playSound(world.sounds.win);
            this.won = true;
        }
    }

    // dynamicCollision(ent) {
    //     console.log(ent);
    // }

    reset() {
        this.alive = true;
        this.handledDeath = false;
        this.velX = 0;
        this.velY = 0;
        this.velZ = 0;
        this.oldX = 0;
        this.oldY = 0;
        this.x = (world.tilesize * 1.5) - world.offsetX;
        this.bottomSide = world.tilesize * (world.rows - 2);
        options.renderOffsetX = 0;
    }
}

class Level {
    constructor(jsonObj) {
        for(var prop in jsonObj) {
            this[prop] = jsonObj[prop];
        }
    }
}

class Key {
    constructor() {
        this.firstDown = false;
        this.held = false;
        this.down = false;
        this.up = true;
        this.timestamp = 0;
    }
}

class Button extends Key {
    constructor(value) {
        super();
        this.down = (value > 0);
        this.up = !this.down;
        this.value = value;
        this.minThreshold = 0.15;
    }
}

var world = {
    fps: 0,
    levelIndex: 0,
    levels: [],
    background: document.createElement("img"),
    qt: {},
    state: 0,
    score: 0,
    friction: 0.75,
    gravity: 0.4,
    roundThreshold: 0.5,
    keys: {},
    buttons: [],
    axes: [],
    loaded: false,
    sounds: {
        die: new Sound("./sounds/smb_mariodie.wav", ()=>{world.state = 3}),
        jump: new Sound("./sounds/smb_jump-small.wav"),
        win: new Sound("./sounds/smb_stage_clear.wav", ()=>{world.state = 3}),
    },
};

var options = {
    keys: {
        jump:  " ",
        up:    "w",
        left:  "a",
        down:  "s",
        right: "d",
        slam:  "f",
    },
    buttons: {
        jump:    0,
        up:     12,
        left:   14,
        down:   13,
        right:  15,
        slam:    1,
    },
    controller: {},
    renderOffsetX: 0,
    renderOffsetY: 0,
    screenSizeX: 16*20,
    screenSizeY: 16*14,
    outlineTiles: false,
    usingController: false,
};

//--------------Global Vars--------------//
var ctx = document.getElementById("mycan").getContext("2d"),
    buffer = document.createElement("canvas").getContext("2d"),
    menuIndex = 0,
    menus = [],
    afr,
    p,
    delta,
    old;

//--------------Functions--------------//
function entityAnimation(entity) {
    if(entity.state == entity.oldState && entity.frameCounter % entity.frames[entity.state][entity.frameIndex].delay == 0) entity.frameIndex++;
    if(entity.frameIndex >= entity.frames[entity.state].length || entity.state != entity.oldState) entity.frameIndex = 0;

    var cur = entity.frames[entity.state][entity.frameIndex];

    entity.activeFrame.src = cur.img;
    if(!cur.mirrored) buffer.drawImage(entity.activeFrame, cur.startX, cur.startY, cur.sizeX, cur.sizeY, entity.leftSide, entity.topSide, entity.size, entity.size);
    else {
        buffer.save();
        buffer.translate(entity.rightSide, entity.topSide);
        buffer.scale(-1, 1);
        buffer.drawImage(entity.activeFrame, cur.startX, cur.startY, cur.sizeX, cur.sizeY, 0, 0, entity.size, entity.size);
        buffer.restore();
    }

    if(entity.state == entity.oldState) entity.frameCounter++;
    else entity.frameCounter = 0;
}

function render() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    buffer.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);

    world.background.src = world.levels[world.levelIndex].src;
    world.background.width = world.width;
    world.background.height = world.height;

    buffer.drawImage(world.background, 0, 0, world.width, world.height);

    if(options.outlineTiles) {
        for(var y = 0; y < world.rows; y++) {
            for(var x = 0; x < world.cols; x++) {
                buffer.beginPath();
                buffer.moveTo((x * world.tilesize) + world.offsetX, (y * world.tilesize) + world.offsetY);
                buffer.lineTo((x * world.tilesize) + world.tilesize + world.offsetX, (y * world.tilesize) + world.offsetY);
                buffer.lineTo((x * world.tilesize) + world.tilesize + world.offsetX, (y * world.tilesize) + world.tilesize + world.offsetY);
                buffer.lineWidth = 1;
                buffer.stroke();
            }
        }
    }

    for(var i = 0; i < world.entities.length; i++) {
        entityAnimation(world.entities[i]);
    }

    ctx.drawImage(buffer.canvas, options.renderOffsetX, options.renderOffsetY, options.screenSizeX, options.screenSizeY, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function bindState(state, event, cb) {
    var conts = (!options.usingController) ? "keys" : "buttons";
    var toCheck = options[conts][state];
    if(world[conts][toCheck] && world[conts][toCheck][event]) cb(world[conts][toCheck]);
}

function loadLevel(level) {
    for(var prop in level) {
        if(prop != "src" && prop != "music") world[prop] = level[prop];
    }
    world.sounds.loop = new Sound(level.music.loop);
}

function grabLevelsFromFile(filePath) {
    fetch(filePath)
    .then(res => res.json())
    .then(json => {
        var levels = json;
        world.levels = [];
        for(var i = 0; i < levels.length; i++) {
            world.levels.push(new Level(levels[i]));
        }
    });
}

function gameFrame(delta) {

    bindState("up", "down", (_key)=>{if(p.alive && p.controllable) p.velY -= p.accY});
    bindState("down", "down", (_key)=>{if(p.alive && p.controllable) p.velY += p.accY});
    bindState("left", "down", (_key)=>{if(p.alive && p.controllable) p.velX -= p.accX});
    bindState("right", "down", (_key)=>{if(p.alive && p.controllable) p.velX += p.accX});
    bindState("jump", "firstDown", (_key)=>{if(p.dirZ == 0 && p.alive && p.controllable) {p.velZ += p.accZ; playSound(world.sounds.jump)}});
    bindState("slam", "down", (_key)=>{if(p.alive && p.controllable && p.dirZ == -1) console.log("powermove")});

    if(!p.alive && !p.handledDeath) {
        for(var j in world.sounds) {
            resetSound(world.sounds[j]);
        }
        playSound(world.sounds.die);
        p.handledDeath = true;
        // p.controllable = true;
    }

    world.qt = new Quadtree(0, 0, world.width, world.height, 4);
    var ent, biggest = 0;
    for(ent of world.entities) {
        ent.frame(delta);
        ent.lastCollidedWith = false;

        world.qt.insert(new Vec2(ent.leftSide, ent.topSide, ent));
        world.qt.insert(new Vec2(ent.rightSide, ent.topSide, ent));
        world.qt.insert(new Vec2(ent.leftSide, ent.bottomSide, ent));
        world.qt.insert(new Vec2(ent.rightSide, ent.bottomSide, ent));

        if(ent.size > biggest) biggest = ent.size;
    }

    for(ent of world.entities) {
        dynamicCollide(ent);
        staticCollide(ent);
    }

    options.screenSizeY = world.height;
    options.screenSizeX = world.tilesize * 20;

    var halfScreenWidth = (options.screenSizeX * 0.5);
    if(p.x < halfScreenWidth && options.renderOffsetX == 0) options.renderOffsetX = 0;
    else if(p.x + halfScreenWidth > world.width) options.renderOffsetX = world.width - options.screenSizeX;
    else if(p.x - halfScreenWidth > options.renderOffsetX) options.renderOffsetX = p.x - halfScreenWidth;
}

function loop(e) {
    delta = (e - old) / 1000; world.fps = 1 / delta;

    switch(world.state) {

        // main menu screen/discret loading
        case 0:

            menus[menuIndex].style.display = "flex";
            for(var j = 0; j < menus.length; j++) {
                if(j != menuIndex && menus[j].style.display != "none") {
                    menus[j].style.display = "none";
                }
            }

            if(!world.loaded) grabLevelsFromFile("./levels.json");
            world.loaded = true;
            break;

        // prepare for gameplay
        case 1:

            loadLevel(world.levels[world.levelIndex]);

            buffer.canvas.width = world.width;
            buffer.canvas.height = world.height;
            p = new Player(world.playerStartX, world.playerStartY);
            world.entities.push(p);

            resizeCanvas();

            world.state = 2;
            world.loaded = false;
            playSound(world.sounds.loop);
            break;

        // standard game stuff
        case 2:

            updateGamepadInputs();
            gameFrame(delta);
            render();
            break;

        // reset level
        case 3:

            p.delete();
            p = new Player(world.playerStartX, world.playerStartY);
            world.entities.push(p);

            for(var sound in world.sounds) {
                resetSound(world.sounds[sound]);
            }
            playSound(world.sounds.loop);

            options.renderOffsetX = 0;
            options.renderOffsetY = 0;

            world.state = 2;
            break;
    }

    for(var key in world.keys) {
        world.keys[key].firstDown = false;
    }

    old = e;
    afr = requestAnimationFrame(loop);
}

function resizeCanvas() {
    var hwr = options.screenSizeY / options.screenSizeX;
    if(window.innerHeight / window.innerWidth > hwr) {
        ctx.canvas.height = window.innerWidth * hwr;
        ctx.canvas.width = window.innerWidth;
    } else {
        ctx.canvas.height = window.innerHeight;
        ctx.canvas.width = window.innerHeight / hwr;
    }
    buffer.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}

function handleKeyboardEvents(e) {
    if(e.key && !world.keys[e.key]) world.keys[e.key] = new Key();

    if(options.usingController && (e.type == "keydown" || e.type == "keyup")) return;

    var activeKey = world.keys[e.key];
    switch(e.type) {
        case "keydown":
            activeKey.up = false;
            activeKey.down = true;
            activeKey.held = e.repeat;
            activeKey.firstDown = !e.repeat;
            activeKey.timestamp = e.timeStamp;
            break;
        case "keyup":
            activeKey.up = true;
            activeKey.down = false;
            activeKey.held = e.repeat;
            activeKey.timestamp = e.timeStamp;
            break;
        case "blur":
            for(var key in world.keys) {
                world.keys[key].up = true;
                world.keys[key].down = false;
                world.keys[key].held = false;
            }
    }
}

function handleGamepadEvents(e) {
    if(e.type == "gamepadconnected") {
        options.controller = e.gamepad;
        options.usingController = e.gamepad.index + 1;
        for(var button in options.controller.buttons) {
            world.buttons[button] = new Button(options.controller.buttons[button].value);
        }
        // requestAnimationFrame(updateGamepadInputs);
    } else {
        options.usingController = false;
    }
}

function updateGamepadInputs() {
    navigator.getGamepads = (navigator.webkitGetGamepads) ? navigator.webkitGetGamepads : navigator.getGamepads;

    if(!options.usingController || navigator.getGamepads == undefined) return;
    options.controller = navigator.getGamepads()[options.usingController - 1];

    for(var button in options.controller.buttons) {
        var b = options.controller.buttons[button];
        var mb = world.buttons[button];
        mb.value = b.value;
        mb.down = mb.value > mb.minThreshold;
        mb.firstDown = (mb.up && mb.down);
        mb.held = (!mb.firstDown && mb.down);
        mb.up = !mb.down;
        if(mb.down) mb.timestamp = options.controller.timestamp;
    }

    world.axes = options.controller.axes;
}

function toTileID(x, y) {
    return Math.floor((y - world.offsetY) / world.tilesize) * world.cols + Math.floor((x - world.offsetX) / world.tilesize);
}

function fromTileID(tileID) {
    var x = tileID % world.cols;
    var y = (tileID - x) / world.cols;
    return [(x * world.tilesize) + world.offsetX, (y * world.tilesize) + world.offsetY];
}

function dynamicCollide(entity) {
    var intersects = world.qt.extract(entity.leftSide, entity.topSide, entity.size, entity.size);
    if(intersects.length == 0) return;
    for(var other of intersects) {
        if(other.data != entity && other.data.lastCollidedWith != entity) {
            other.data.dynamicCollision(entity);
            other.data.lastCollidedWith = entity;
            // entity.lastCollidedWith = other.data;
        }
    }
}

function staticCollide(entity) {
    var bottom = entity.bottomSide,
        right  = entity.rightSide,
        top    = entity.topSide,
        left   = entity.leftSide;

    var tileID, xy, tilebottom, tileright, tiletop, tileleft, platformCollision = false;

    var pairs = [
            [left,     top],
            [left,  bottom],
            [right, bottom],
            [right,    top],
        ];

    for(var i = 0; i < 4; i++) {
        tileID     = toTileID(pairs[i][0], pairs[i][1]);
        xy         = fromTileID(tileID);
        tilebottom = xy[1] + world.tilesize;
        tileright  = xy[0] + world.tilesize;
        tiletop    = xy[1];
        tileleft   = xy[0];

        switch(world.tiles[tileID] - 1) {
            case 0:
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                platformCollision = true;
                break;
            case 5:
                if(entity.dirZ == 0 && (i == 1 || i == 2)) {
                    platformCollision = true;
                    entity.flagPole = true;
                    entity.controllable = false;
                    entity.leftSide = tileleft + (world.tilesize * 0.25);
                    entity.facing = -1;
                    entity.dirX = 0;
                    entity.dirY = 0;
                }
                break;
        }
    }
    if(!platformCollision && entity.dirZ == 0 && !entity.noclip) {
        entity.alive = false;
        entity.velX = 0;
        entity.velY = 0;
    }
}

function playSound(soundObj, cb = false) {
    if(cb) soundObj.cb = cb;
    soundObj.restart();
}

function pauseSound(soundObj) {
    if(soundObj.playing) soundObj.pause();
}

function restartSound(soundObj) {
    soundObj.restart();
}
function resetSound(soundObj) {
    soundObj.reset();
}

function startGame() {
    world.state = 0;
    menuIndex = 0;
    menus = [document.getElementById("mainMenu"), document.getElementById("pauseMenu")];

    afr = requestAnimationFrame(loop);
}

function hideMenusSwitchState(state) {
    for(var k = 0; k < menus.length; k++) {
        menus[k].style.display = "none";
    }
    world.state = state;
}

function stopGame() {
    world.state = 0;
    menuIndex = 0;

    cancelAnimationFrame(afr);
}

startGame();

addEventListener("resize", resizeCanvas);
addEventListener("keydown", handleKeyboardEvents);
addEventListener("keyup", handleKeyboardEvents);
addEventListener("blur", handleKeyboardEvents);
addEventListener("gamepadconnected", handleGamepadEvents);
addEventListener("gamepaddisconnected", handleGamepadEvents);
