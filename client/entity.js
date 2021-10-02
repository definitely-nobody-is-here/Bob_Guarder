var ctx = document.getElementById('ctx').getContext('2d');

Entity = function() {
    var self = {
        id: null,
        x: 0,
        y: 0,
        lastx: 0,
        lasty: 0,
        xspeed: 0,
        yspeed: 0,
        gridx: 0,
        gridy: 0,
        width: 16,
        height: 16,
        map: 'The Village',
        moveSpeed: 20,
        animationImage: new Image(),
        animationFrame: 0
    };
    self.id = Math.random();
    self.update = function() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(self.x-5, self.y-5, 10, 10);
        self.collide();
    };
    self.collide = function() {
        var xdir = self.xspeed/self.moveSpeed;
        var ydir = self.yspeed/self.moveSpeed;
        for (var i = 0; i < self.moveSpeed; i++) {
            self.lastx = self.x;
            self.lasty = self.y;
            self.x += xdir;
            self.y += ydir;
            self.gridx = Math.floor(self.x/64);
            self.gridy = Math.floor(self.y/64);
            self.checkCollision();
        }
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.gridx = Math.floor(self.x/64);
        self.gridy = Math.floor(self.y/64);
    };
    self.checkCollision = function() {
        var collisions = [];
        if (self.xspeed > 0) {
            for (var x = self.gridx+1; x >= self.gridx-1; x--) {
                if (self.yspeed > 0) {
                    for (var y = self.gridy+1; y >= self.gridy-1; y--) {
                        if (Collision.list[self.map][y]) if (Collision.list[self.map][y][x])
                        collisions.push(Collision.getColEntity(self.map, x, y));
                    }
                } else {
                    for (var y = self.gridy-1; y <= self.gridy+1; y++) {
                        if (Collision.list[self.map][y]) if (Collision.list[self.map][y][x])
                        collisions.push(Collision.getColEntity(self.map, x, y));
                    }
                }
            }
        } else {
            for (var x = self.gridx-1; x <= self.gridx+1; x++) {
                if (self.yspeed > 0) {
                    for (var y = self.gridy+1; y >= self.gridy-1; y--) {
                        if (Collision.list[self.map][y]) if (Collision.list[self.map][y][x])
                        collisions.push(Collision.getColEntity(self.map, x, y));
                    }
                } else {
                    for (var y = self.gridy-1; y <= self.gridy+1; y++) {
                        if (Collision.list[self.map][y]) if (Collision.list[self.map][y][x])
                        collisions.push(Collision.getColEntity(self.map, x, y));
                    }
                }
            }
        }
        var colliding = false;
        for (var i in collisions) {
            for (var j in collisions[i]) {
                if (self.collideWith(collisions[i][j])) {
                    colliding = true;
                }
            }
        }
        if (colliding) {
            colliding = false;
            var x = self.x;
            self.x = self.lastx;
            for (var i in collisions) {
                for (var j in collisions[i]) {
                    if (self.collideWith(collisions[i][j])) {
                        colliding = true;
                    }
                }
            }
            if (colliding) {
                colliding = false;
                self.x = x;
                self.y = self.lasty;
                for (var i in collisions) {
                    for (var j in collisions[i]) {
                        if (self.collideWith(collisions[i][j])) {
                            colliding = true;
                        }
                    }
                }
                if (colliding) {
                    colliding = false;
                    self.x = self.lastx;
                    self.y = self.lasty;
                }
            }
        }
    };
    self.collideWith = function(entity) {
        var bound1left = self.x-(self.width/2);
        var bound1right = self.x+(self.width/2);
        var bound1top = self.y-(self.height/2);
        var bound1bottom = self.y+(self.height/2);
        var bound2left = entity.x-(entity.width/2);
        var bound2right = entity.x+(entity.width/2);
        var bound2top = entity.y-(entity.height/2);
        var bound2bottom = entity.y+(entity.height/2);
        if (entity.map == self.map && bound1left < bound2right && bound1right > bound2left && bound1top < bound2bottom && bound1bottom > bound2top) {
            return true;
        }
        return false;
    };
    
    return self;
};

Player = function() {
    var self = new Entity();
    self.width = 32;
    self.height = 32;
    self.keys = {
        up: false,
        down: false,
        left: false,
        right: false,
    };
    self.moveSpeed = 5;
    self.hp = 100;
    self.update = function() {
        self.xspeed = 0;
        self.yspeed = 0;
        if (self.keys.up) self.yspeed = -self.moveSpeed;
        if (self.keys.down) self.yspeed = self.moveSpeed;
        if (self.keys.left) self.xspeed = -self.moveSpeed;
        if (self.keys.right) self.xspeed = self.moveSpeed;
        ctx.fillStyle = '#000000';
        ctx.fillRect(self.x-16, self.y-16, 32, 32);
        self.collide();
    };

    return self;
};

Monster = function(x, y, type) {
    var self = new Entity();
    self.x = x;
    self.y = y;
    self.keys = {
        up: false,
        down: false,
        left: false,
        right: false,
    };
    self.hp = 50;
    self.ai = {
        grid: new Grid(17, 17),
        pathfinder: new AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        }),
        path: []
    };
    self.type = type;
    switch (self.type) {
        case 'bluebird':
            self.width = 11;
            self.height = 13;
            self.moveSpeed = 3;
            break;
        case 'greenbird':
            self.width = 11;
            self.height = 13;
            self.moveSpeed = 4;
            break;
        case 'ball':
            self.width = 11;
            self.height = 11;
            self.moveSpeed = 2;
            break;
        case 'ballrammer':
            self.width = 20;
            self.height = 20;
            self.moveSpeed = 10;
            break;
        default:
            console.error('invalid mosnter type!')
            break;
    }
    self.lastAttack = 0;
    self.animationImage.src = './img/' + type + '.png';
    self.update = function() {
        ctx.drawImage(self.animationImage, self.animationFrame*self.width, 0, self.width, self.height, self.x-self.width*2, self.y-self.height*2, self.width*4, self.height*4);
        self.path();
        self.collide();
        self.attack();
        if (self.hp < 0) delete Monster.list[self.id];
    };
    self.collide = function() {
        for (var i = 0; i < self.moveSpeed; i++) {
            self.keys = {
                up: false,
                down: false,
                left: false,
                right: false,
            };
            self.xspeed = 0;
            self.yspeed = 0;
            if (self.ai.path[0]) {
                if (self.x < self.ai.path[0].x*64+32) self.keys.right = true;
                if (self.x > self.ai.path[0].x*64+32) self.keys.left = true;
                if (self.y < self.ai.path[0].y*64+32) self.keys.down = true;
                if (self.y > self.ai.path[0].y*64+32) self.keys.up = true;
                if (self.keys.up) self.yspeed = -self.moveSpeed;
                if (self.keys.down) self.yspeed = self.moveSpeed;
                if (self.keys.left) self.xspeed = -self.moveSpeed;
                if (self.keys.right) self.xspeed = self.moveSpeed;
                if (self.gridx == self.ai.path[0].x && self.gridy == self.ai.path[0].y) {
                    self.ai.path.shift();
                }
            }
            var xdir = self.xspeed/self.moveSpeed;
            var ydir = self.yspeed/self.moveSpeed;
            self.lastx = self.x;
            self.lasty = self.y;
            self.x += xdir;
            self.y += ydir;
            self.gridx = Math.floor(self.x/64);
            self.gridy = Math.floor(self.y/64);
            self.checkCollision();
        }
        self.x = Math.round(self.x);
        self.y = Math.round(self.y);
        self.gridx = Math.floor(self.x/64);
        self.gridy = Math.floor(self.y/64);
    };
    self.attack = function() {
        self.lastAttack++;
        switch (self.type) {
            case 'bluebird':
                if (self.lastAttack > 60) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, false, player.x, player.y);
                }
                break;
            case 'greenbird':
                if (self.lastAttack > 45) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, false, player.x, player.y);
                }
                break;
            case 'ball':
                if (self.lastAttack > 2) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, false, self.x+Math.random()*10-5, self.y+Math.random()*10-5);
                }
                break;
            case 'ballrammer':
                if (player.x < self.x) self.xspeed -= 1;
                if (player.x > self.x) self.xspeed += 1;
                if (player.y < self.y) self.yspeed -= 1;
                if (player.y > self.y) self.yspeed += 1;
                if (self.collideWith(player)) {
                    player.hp -= 10;
                }
                break;
            default:
                break;
        }
    };
    self.path = function() {
        try {
            if (self.getDistance(player) < 16*32) {
                var offsetx = self.gridx-9;
                var offsety = self.gridy-9;
                var x1 = 9;
                var y1 = 9;
                var x2 = player.gridx-offsetx;
                var y2 = player.gridy-offsety;
                var size = 17;
                self.ai.grid = new Grid(size, size);
                for (var y = 0; y < size; y++) {
                    for (var x = 0; x < size; x++) {
                        var checkx = x+offsetx;
                        var checky = y+offsety;
                        if (Collision.list[self.map][checky]) if (Collision.list[self.map][checky][checkx]) {
                            self.ai.grid.setWalkableAt(x, y, false);
                        }
                    }
                }
                var path = self.ai.pathfinder.findPath(x1, y1, x2, y2, self.ai.grid);
                self.ai.path = compressPath(path);
                self.ai.path = parseObject(self.ai.path);
                self.ai.path.shift();
                for (var i in self.ai.path) {
                    self.ai.path[i].x += offsetx;
                    self.ai.path[i].y += offsety;
                }
            }
        } catch (err) {
        }
    };
    self.getDistance = function(entity) {
        return Math.sqrt(Math.pow(self.x-entity.x, 2) + Math.pow(self.y-entity.y, 2));
    };

    Monster.list[self.id] = self;
    return self;
};
Monster.update = function() {
    for (var i in Monster.list) {
        Monster.list[i].update();
    }
};
Monster.list = [];

Projectile = function(x, y, parentisPlayer, angleORMouseX, mouseY) {
    var self = new Entity();
    self.x = x;
    self.y = y;
    self.angle = angleORMouseX;
    if (mouseY) {
        self.angle = Math.atan2(mouseY-y, angleORMouseX-x);
    }
    self.xspeed = Math.cos(self.angle) * 20;
    self.yspeed = Math.sin(self.angle) * 20;

    self.update = function() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(self.x-5, self.y-5, 10, 10);
        self.collide();
        if (parentisPlayer) {
            for (var i in Monster.list) {
                self.collideWith(Monster.list[i]);
            }
        } else {
            self.collideWith(player);
        }
    };
    self.collideWith = function(entity) {
        var bound1left = self.x-(self.width/2);
        var bound1right = self.x+(self.width/2);
        var bound1top = self.y-(self.height/2);
        var bound1bottom = self.y+(self.height/2);
        var bound2left = entity.x-(entity.width/2);
        var bound2right = entity.x+(entity.width/2);
        var bound2top = entity.y-(entity.height/2);
        var bound2bottom = entity.y+(entity.height/2);
        if (entity.map == self.map && bound1left < bound2right && bound1right > bound2left && bound1top < bound2bottom && bound1bottom > bound2top) {
            if (entity.hp) entity.hp -= 10;
            delete (Projectile.list[self.id]);
            return true;
        }
        return false;
    }

    Projectile.list[self.id] = self;
    return self;
};
Projectile.update = function() {
    for (var i in Projectile.list) {
        Projectile.list[i].update();
    }
};
Projectile.list = [];