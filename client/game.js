var canvas = document.getElementById('ctx');
var ctx = canvas.getContext('2d');
var player = new Player();

document.onkeydown = function(e) {
    switch (e.key) {
        case 'w':
            player.keys.up = true;
            break;
        case 's':
            player.keys.down = true;
            break;
        case 'a':
            player.keys.left = true;
            break;
        case 'd':
            player.keys.right = true;
            break;
    }
};
document.onkeyup = function(e) {
    switch (e.key) {
        case 'w':
            player.keys.up = false;
            break;
        case 's':
            player.keys.down = false;
            break;
        case 'a':
            player.keys.left = false;
            break;
        case 'd':
            player.keys.right = false;
            break;
    }
};
document.onclick = function(e) {
    new Projectile(player.x, player.y, true, e.clientX+player.x-window.innerWidth/2, e.clientY+player.y-window.innerHeight/2);
};

var map = new Image();
map.src = './maps/The Village.png';

setInterval(function() {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.translate((window.innerWidth/2)-player.x, (window.innerHeight/2)-player.y);
    ctx.drawImage(map, 0, 0, 3200, 3200);
    player.update();
    Monster.update();
    Projectile.update();
    ctx.restore();
}, 1000/60);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};