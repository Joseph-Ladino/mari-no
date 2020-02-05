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

class Player {
    constructor(x, y, size, minsize = 20) {
        this.accX = 1.5; this.accY = 1.5; this.accZ = 4;
        this.velX = 0; this.velY = 0; this.velZ = 0;
        this.dirX = 0; this.dirY = 0; this.dirZ = 0;
        this.facing = 1;
        this.oldX = x; this.oldY = y;
        this.x = x;
        this.y = y;
        this.size = size;
        this.minSize = minsize;
        this.alive = true;
        this.handledDeath = false;
        this.state = "standing"; this.oldState = "standing";
        this.activeFrame = document.createElement("img"); this.activeFrame.classList += "fitContent ";
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.frames = {
            standingRight: [new Frame("./sprites/mario strip.png", 80, 34, 16, 16, 3, false)],
            standingLeft: [new Frame("./sprites/mario strip.png", 80, 34, 16, 16, 3, true)],
            jumpingRight: [new Frame("./sprites/mario strip.png", 165, 34, 16, 16, 3, false)],
            jumpingLeft: [new Frame("./sprites/mario strip.png", 165, 34, 16, 16, 3, true)],
            walkingRight: [new Frame("./sprites/mario strip.png", 97, 34, 16, 16, 3, false), new Frame("./sprites/mario strip.png", 114, 34, 16, 16, 3, false), new Frame("./sprites/mario strip.png", 131, 34, 16, 16, 3, false)],
            walkingLeft: [new Frame("./sprites/mario strip.png", 97, 34, 16, 16, 3, true), new Frame("./sprites/mario strip.png", 114, 34, 16, 16, 3, true), new Frame("./sprites/mario strip.png", 131, 34, 16, 16, 3, true)],
            deadRight: [new Frame("./sprites/mario strip.png", 182, 34, 16, 16, 3, false)],
            deadLeft: [new Frame("./sprites/mario strip.png", 182, 34, 16, 16, 3, false)],
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

        if(Math.abs(this.velX) >= world.tilesize) this.velX = (Math.sign(this.velX) * world.tilesize);
        else if(Math.abs(this.velX) < world.roundThreshold) this.velX = 0;
        if(Math.abs(this.velY) >= world.tilesize) this.velY = (Math.sign(this.velY) * world.tilesize) - (Math.sign(this.velY));
        else if(Math.abs(this.velY) < world.roundThreshold) this.velY = 0;

        this.x += this.velX;
        this.y += this.velY;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        if(this.x - (this.size / 2) < options.renderOffsetX) this.x = options.renderOffsetX + (this.size / 2);
        this.size += this.velZ;

        this.dirX = Math.sign(this.velX);
        this.dirY = Math.sign(this.velY);
        this.dirZ = Math.sign(this.velZ);
        this.facing = (this.x - this.oldX > 0) ? 1 : ((this.x - this.oldX < 0) ? -1 : this.facing);

        if(!this.alive) this.state = "dead";
        else if(this.dirX == 0 && this.dirY == 0 && this.dirZ == 0) this.state = "standing";
        else if(this.dirZ != 0) this.state = "jumping";
        else if(this.dirX != 0 || this.dirY != 0) this.state = "walking";

        this.state += (this.facing == 1) ? "Right" : "Left";
    }

    reset() {
        this.alive = true;
        this.handledDeath = false;
        this.velX = 0;
        this.velY = 0;
        this.velZ = 0;
        this.oldX = 0;
        this.oldY = 0;
        this.x = (world.tilesize * 1.5) - world.offsetX;
        this.y = world.tilesize * (world.rows - 2) - (this.size / 2);
        options.renderOffsetX = 0;
        playSound("./sounds/smb_overworld.wav");
    }

    draw() {

        if(this.state == this.oldState && this.frameCounter % this.frames[this.state][this.frameIndex].delay == 0) this.frameIndex++;
        if(this.frameIndex >= this.frames[this.state].length || this.state != this.oldState) this.frameIndex = 0;

        var cur = this.frames[this.state][this.frameIndex];

        this.activeFrame.src = cur.img;
        if(!cur.mirrored) buffer.drawImage(this.activeFrame, cur.startX, cur.startY, cur.sizeX, cur.sizeY, this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size);
        else {
            buffer.save();
            buffer.translate(this.x + (this.size / 2), this.y - (this.size / 2));
            buffer.scale(-1, 1);
            buffer.drawImage(this.activeFrame, cur.startX, cur.startY, cur.sizeX, cur.sizeY, 0, 0, this.size, this.size);
            buffer.restore();
        }

        if(this.state == this.oldState) this.frameCounter++;
        else this.frameCounter = 0;
    }
}

class Level {
    constructor(widthORobject, height = 900, tilesize = 25, tiles = [], entities = []) {
        if(typeof(widthORobject) == "object") {
            this.width    = widthORobject.width;
            this.height   = widthORobject.height;
            this.tilesize = widthORobject.tilesize;
            this.offsetX  = widthORobject.offsetX;
            this.offsetY  = widthORobject.offsetY;
            this.cols     = widthORobject.cols;
            this.rows     = widthORobject.rows;
            this.tiles    = widthORobject.tiles;
            this.entities = widthORobject.entities;
            this.src      = widthORobject.src;
        } else {
            this.width    = widthORobject;
            this.height   = height;
            this.tilesize = tilesize;
            this.offsetX  = 0;
            this.offsetY  = 0;
            this.cols     = widthORobject / tilesize;
            this.rows     = height / tilesize;
            this.tiles    = tiles;
            this.entities = entities;
            this.src      = "";
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
        this.delay = 500;
    }
}

var world = {
    fps: 0,
    levelIndex: 0,
    levels: [],
    background: document.createElement("img"),
    state: 0,
    friction: 0.75,
    gravity: 0.4,
    roundThreshold: 0.5,
    sounds: [],
    keys: {},
    loaded: false,
};

var options = {
    keys: {
        jump:  " ",
        up:    "w",
        left:  "a",
        down:  "s",
        right: "d",
    },
    controller: {
        useAnalog: true,
    },
    renderOffsetX: 0,
    renderOffsetY: 0,
    screenSizeX: 16*20,
    screenSizeY: 16*14,
    outlineTiles: false,
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

    for(var i = 0, ent; i < world.entities.length; i++) {
        ent = world.entities[i];
        ent.draw();
    }

    ctx.drawImage(buffer.canvas, options.renderOffsetX, options.renderOffsetY, options.screenSizeX, options.screenSizeY, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function bindState(key, event, cb) {
    if(world.keys[key] && world.keys[key][event]) cb(world.keys[key]);
}

function loadLevel(level) {
    world.width = level.width;
    world.height = level.height;
    world.tilesize = level.tilesize;
    world.offsetX = level.offsetX;
    world.offsetY = level.offsetY;
    world.cols = level.cols;
    world.rows = level.rows;
    world.tiles = level.tiles;
    world.entities = level.entities;
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
    bindState(options.keys.up, "down", (_key)=>{if(p.alive) p.velY -= p.accY});
    bindState(options.keys.down, "down", (_key)=>{if(p.alive) p.velY += p.accY});
    bindState(options.keys.left, "down", (_key)=>{if(p.alive) p.velX -= p.accX});
    bindState(options.keys.right, "down", (_key)=>{if(p.alive) p.velX += p.accX});
    bindState(options.keys.jump, "firstDown", (_key)=>{if(p.dirZ == 0 && p.alive) p.velZ += p.accZ});

    if(!p.alive && !p.handledDeath) {
        for(var j = 0; j < world.sounds.length; j++) {
            removeSound(j);
        }
        playSound("./sounds/smb_mariodie.wav", ()=>{p.reset()});
        p.handledDeath = true;
    }

    for(var i = 0, ent; i < world.entities.length; i++) {
        ent = world.entities[i];
        ent.frame(delta);
    }

    options.screenSizeY = world.height;
    options.screenSizeX = world.tilesize * 20;

    var halfScreenWidth = (options.screenSizeX / 2);
    if(p.x < halfScreenWidth && options.renderOffsetX == 0) options.renderOffsetX = 0;
    else if(p.x + halfScreenWidth > world.width) options.renderOffsetX = world.width - options.screenSizeX;
    else if(p.x - halfScreenWidth > options.renderOffsetX) options.renderOffsetX = p.x - halfScreenWidth;
    collide(p);
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

        // load level/init
        case 1:

            loadLevel(world.levels[world.levelIndex]);

            buffer.canvas.width = world.width;
            buffer.canvas.height = world.height;
            p = new Player(24, 208, world.tilesize, world.tilesize);
            world.entities.push(p);

            resizeCanvas();

            world.state = 2;
            world.loaded = false;
            playSound("./sounds/smb_overworld.wav");

            break;

        // standard game stuff
        case 2:
            gameFrame(delta);
            render();
            break;
    }


    var objectKeys = Object.keys(world.keys);
    for(var key = 0; key < objectKeys.length; key++) {
        world.keys[objectKeys[key]].firstDown = false;
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
    var activeKey = world.keys[e.key];
    //e.preventDefault();
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
            var objectKeys = Object.keys(world.keys);
            for(var key = 0; key < objectKeys.length; key++) {
                world.keys[objectKeys[key]].up = true;
                world.keys[objectKeys[key]].down = false;
                world.keys[objectKeys[key]].held = false;
            }
    }
}

function toTileID(x, y) {
    return Math.floor((y - world.offsetY) / world.tilesize) * world.cols + Math.floor((x - world.offsetX) / world.tilesize);
}

function fromTileID(tileID) {
    var x = tileID % world.cols;
    var y = (tileID - x) / world.cols;
    return [(x * world.tilesize) + world.offsetX, (y * world.tilesize) + world.offsetY];
}

function collide(entity) {
    var bottom = entity.y + (entity.size / 2),
        right  = entity.x + (entity.size / 2),
        top    = entity.y - (entity.size / 2),
        left   = entity.x - (entity.size / 2);

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
                if(!platformCollision && entity.size <= entity.minSize) p.alive = false;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                platformCollision = true;
                p.alive = true;
                break;
        }
    }
}

function removeSound(index) {
    world.sounds[index].pause();
    world.sounds.splice(index, 1);
}

function playSound(url, cb = false) {
    var sound = document.createElement("audio"), index;
    sound.src = url;
    world.sounds.push(sound);
    index = world.sounds.length - 1;
    sound.play();
    if(cb) sound.addEventListener("ended", cb);
    sound.addEventListener("ended", ()=>{removeSound(index)});
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

    cancelAnimationFrame(afr);
}

startGame();

addEventListener("resize", resizeCanvas);
addEventListener("keydown", handleKeyboardEvents);
addEventListener("keyup", handleKeyboardEvents);
addEventListener("blur", handleKeyboardEvents);
