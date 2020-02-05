//--------------Classes & Objects--------------//
class Player {
    constructor(x, y, size, minsize = 20) {
        this.accX = 1.5; this.accY = 1.5; this.accZ = 4;
        this.velX = 0; this.velY = 0; this.velZ = 0;
        this.dirX = 0; this.dirY = 0; this.dirZ = 0;
        this.oldX = x; this.oldY = y;
        this.x = x;
        this.y = y;
        this.size = size;
        this.minSize = minsize;
        this.alive = true;
    }

    frame(_delta) {
        this.oldX = this.x;
        this.oldY = this.y;

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
    }

    reset() {
        this.velX = 0;
        this.velY = 0;
        this.velZ = 0;
        this.oldX = 0;
        this.oldY = 0;
        this.x = world.tilesize * 1.5;
        this.y = world.tilesize * world.rows - (this.size / 2);
        options.renderOffsetX = 0;
    }

    draw() {
        buffer.fillRect(this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size);
    }
}

class Level {
    constructor(widthORobject, height = 900, tilesize = 25, tiles = [], entities = []) {
        if(typeof(widthORobject) == "object") {
            this.width    = widthORobject.width;
            this.height   = widthORobject.height;
            this.tilesize = widthORobject.tilesize;
            this.cols     = widthORobject.cols;
            this.rows     = widthORobject.rows;
            this.tiles    = widthORobject.tiles;
            this.entities = widthORobject.entities;
            this.src      = widthORobject.src;
        } else {
            this.width    = widthORobject;
            this.height   = height;
            this.tilesize = tilesize;
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
    gravity: 0.3,
    roundThreshold: 0.01,
    keys: {},
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
    bindState(options.keys.up, "down", (_key)=>{p.velY -= p.accY});
    bindState(options.keys.down, "down", (_key)=>{p.velY += p.accY});
    bindState(options.keys.left, "down", (_key)=>{p.velX -= p.accX});
    bindState(options.keys.right, "down", (_key)=>{p.velX += p.accX});
    bindState(options.keys.jump, "firstDown", (_key)=>{if(p.dirZ == 0) p.velZ += p.accZ});

    for(var i = 0, ent; i < world.entities.length; i++) {
        ent = world.entities[i];
        ent.frame(delta);
    }

    options.screenSizeY = world.tilesize * world.rows;
    options.screenSizeX = world.tilesize * 20;

    var halfScreenWidth = (options.screenSizeX / 2);
    if(p.x < halfScreenWidth && options.renderOffsetX == 0) options.renderOffsetX = 0;
    else if(p.x + halfScreenWidth > world.width) options.renderOffsetX = world.width - options.screenSizeX;
    else if(p.x - halfScreenWidth > options.renderOffsetX) options.renderOffsetX = p.x - halfScreenWidth;

}

function loop(e) {
    delta = (e - old) / 1000; world.fps = 1 / delta;

    switch(world.state) {

        // menu screens
        case 0:

            menus[menuIndex].style.display = "flex";
            for(var j = 0; j < menus.length; j++) {
                if(j != menuIndex && menus[j].style.display != "none") {
                    menus[j].style.display = "none";
                }
            }

            grabLevelsFromFile("./levels.json");
            break;

        // load level/init
        case 1:

            loadLevel(world.levels[world.levelIndex]);

            buffer.canvas.width = world.width;
            buffer.canvas.height = world.height;
            p = new Player(24, 200, world.tilesize, world.tilesize);
            world.entities.push(p);

            resizeCanvas();

            world.state = 2;

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

function tileID(x, y) {
    return Math.floor(y / world.tilesize) * world.cols + Math.floor(x / world.tilesize);
}

function fromTileID(tileID) {
    var x = tileID % world.cols;
    var y = (tileID - x) / world.cols;
    return [x * world.tilesize, y * world.tilesize];
}

function collide(entity) {
    var bottom = entity.y + (entity.size / 2),
        right  = entity.x + (entity.size / 2),
        top    = entity.y - (entity.size / 2),
        left   = entity.x - (entity.size / 2);

    var tileID, fromTileID, tilebottom, tileright, tiletop, tileleft;

    var pairs = [
            [left,     top],
            [left,  bottom],
            [right, bottom],
            [right,    top],
        ];

        for(var i = 0; i < 4; i++) {
            tileID = world.tiles[tileID(pairs[i][0], pairs[i][1])]
            fromTileID = fromTileID(tileID);
            tilebottom = fromTileID[1] + world.tilesize;
            tileright  = fromTileID[0] + world.tilesize;
            tiletop    = fromTileID[1];
            tileleft   = fromTileID[0];

            switch(tileID) {
                case 1:

                    break;
            }
        }
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
