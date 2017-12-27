var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
function Player(vxf, ax, x, y, sx, sy, jumpPower, gravityStrength) {
    var me = this;
    
    // Kinematic variables - set them to equal initial positions
    me.x = x;
    me.y = y;
    me.vx = 0;
    me.vy = 0;
    me.sx = sx;
    me.sy = sy;
    me.jumpPower = -jumpPower;
    me.jumped = false;
    var ay = 0;
    // Add onto current velocity
    me.accelerate = function() { 
        if (me.vx < vxf) {
            me.vx += ax;
        }
    }
    // Collision detection - if bullet position = position + sizeX of current position
    me.getShot = function(bullet) {
        var collide_x = bullet.x >= me.x && bullet.x <= me.x + sx;
        var collide_y = bullet.y >= me.y && bullet.y <= me.y + sy;
        return collide_x && collide_y;
    }

    me.jump = function() {
        me.y -= 5;
        me.vy = me.jumpPower;
        me.jumped = false;
    }
    // Collision detection for ground
    me.collideWithGround = function(ground) {
        var collide_x = (me.x >= ground.x && me.x <= ground.x + ground.sx);
        var collide_y = (me.y + sy >= ground.y && me.y + sy <= ground.y + me.vy); // Use this as a bufferzone
        if (collide_x && collide_y) {
             me.vy = 0;
             ay = 0;
             me.y = ground.y - sy;
             me.jumped = false;
             return true;
        }
    }
    me.fall = function() {
        if (!me.collidedWithGround) {
            ay = gravityStrength;
            me.vy += ay;
        }
    }
    me.die = function(height) {
        return me.y > height;
    }

    me.changePosition = function() {
        me.x += me.vx;
        me.y += me.vy;
    }
}

function Ground(x, y, sx_min, sx_max, sy, hole_distance_min, hole_distance_max) {
    var me = this;

    // Generate random integers - minimum inclusive
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; 
    }

    // Public attributes for the ground
    me.x = x;
    me.y = y;
    me.sx;
    me.sy = sy;
    me.hole_distance;
    me.spawn = function() {
        me.sx = getRandomInt(sx_min, sx_max);
    }
    me.makeHoleGap = function() {
        me.hole_distance = getRandomInt(hole_distance_min, hole_distance_max);
    }
}
var ground = [];
function Game() {
    var me = this;

    me.create = function(player) {
        var x = canvas.width / 2 - 700; // New x position for each ground that's spawned
        ground.push(new Ground(x, canvas.height / 2 + 25, 400, 600, 25, 50, 100)); // Push new ground objects
        if (ground.length > 0) {
            for (var i = 0; i < ground.length; i++) {
                ground[ground.length - 1].spawn();
                ground[ground.length - 1].makeHoleGap();
                x += ground[i].sx + ground[i].hole_distance;
                ground[ground.length - 1].x = x;
            }
        }
    }

    me.createPlayerFunctions = function(player) {
        player.accelerate();
        for (var i = 0; i < ground.length; i++) {
            player.collideWithGround(ground[i]);
        }
        player.changePosition();
    }
    // Pan to player's liking
    me.pan = function(player) {
        player.x -= player.vx;
        for (var i = 0; i < ground.length; i++) {
            ground[i].x -= player.vx;
        }
    }
    me.render = function(player) {
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, player.sx, player.sy);

        for (var i = 0; i < ground.length; i++) {
            ctx.fillRect(ground[i].x, ground[i].y, ground[i].sx, ground[i].sy);
        }
    }
}
// Player(vxf, ax, x, y, sx, sy, jumpPower, gravityStrength)
var player = new Player(5, 2, canvas.width / 2 - 100, canvas.height / 2, 25, 25, 25, 2);
var game = new Game();
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player.jumped) {
        player.jump();
    }
    player.fall();
    game.create(player);
    game.createPlayerFunctions(player);
    game.pan(player);
    game.render(player);
    window.addEventListener("keydown", function(e) {
        if (e.keyCode === 38 && !player.jumped) {
            player.jumped = true;
        }
    });
    if (player.die(canvas.height)) {
         location.reload();
    }
    
}
setInterval(update, 1000 / 60);
