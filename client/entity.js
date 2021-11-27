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
        map: 'The River',
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
    self.animationImage.src = './client/img/player.png';
    self.update = function() {
        self.xspeed = 0;
        self.yspeed = 0;
        if (self.keys.up) self.yspeed = -self.moveSpeed;
        if (self.keys.down) self.yspeed = self.moveSpeed;
        if (self.keys.left) self.xspeed = -self.moveSpeed;
        if (self.keys.right) self.xspeed = self.moveSpeed;
        ctx.fillStyle = '#000000';
        ctx.drawImage(self.animationImage, (self.animationFrame % 6)*self.width, (~~(self.animationFrame / 6))*self.height, self.width/4, self.height/2, self.x-self.width/2, self.y-self.height*3/2, self.width, self.height*2);
        self.collide();
        if (self.hp < 0) {
            self.hp = 0;
            self.dead = true;
            self.keys = {
                up: false,
                down: false,
                left: false,
                right: false,
            };
            document.getElementById('deathScreen').style.display = 'block';
        }
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
        path: [],
        range: 16
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
        case 'waterbottle':
            self.width = 30;
            self.height = 32;
            self.moveSpeed = 1;
            break;
        default:
            console.error('invalid mosnter type!')
            break;
    }
    self.lastAttack = 0;
    self.animationImage.src = './client/img/' + type + '.png';
    self.update = function() {
        ctx.drawImage(self.animationImage, (self.animationFrame % 6)*self.width, (~~(self.animationFrame / 6))*self.height, self.width, self.height, self.x-self.width*2, self.y-self.height*2, self.width*4, self.height*4);
        self.path();
        self.collide();
        self.attack();
        if (self.hp < 1) {
            var random = Math.random();
            if (random < 0.5) {
                new Item('bow');
            } else if (random < 1) {
                new Item('sword');
            }
            delete Monster.list[self.id];
        }
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
                if (self.lastAttack >= 60) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, 'ninjastar', false, player.x, player.y);
                }
                break;
            case 'greenbird':
                if (self.lastAttack >= 45) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, 'ninjastar', false, player.x+Math.random()*20-10, player.y+Math.random()*20-10);
                }
                break;
            case 'ball':
                if (self.lastAttack >= 1) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, 'laser', false, self.x+Math.random()*10-5, self.y+Math.random()*10-5);
                }
                break;
            case 'ballrammer':
                if (player.x < self.x) self.xspeed -= 10;
                if (player.x > self.x) self.xspeed += 10;
                if (player.y < self.y) self.yspeed -= 10;
                if (player.y > self.y) self.yspeed += 10;
                if (self.collideWith(player)) {
                    player.hp -= 10;
                }
                break;
            case 'waterbottle':
                if (self.lastAttack >= 2) {
                    self.lastAttack = 0;
                    new Projectile(self.x, self.y, 'smallwaterbottle', false, player.x+Math.random()*200-100, player.y+Math.random()*200-100);
                }
                break;
            default:
                break;
        }
    };
    self.path = function() {
        try {
            if (self.getDistance(player) < self.ai.range*64) {
                var offsetx = self.gridx-9;
                var offsety = self.gridy-9;
                var x1 = 9;
                var y1 = 9;
                var x2 = player.gridx-offsetx;
                var y2 = player.gridy-offsety;
                var size = self.ai.range*2+1;
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

Projectile = function(x, y, type, parentisPlayer, angleORMouseX, mouseY) {
    var self = new Entity();
    self.x = x;
    self.y = y;
    self.angle = angleORMouseX;
    if (mouseY) {
        self.angle = Math.atan2(mouseY-y, angleORMouseX-x);
    }
    self.xspeed = Math.cos(self.angle) * 20;
    self.yspeed = Math.sin(self.angle) * 20;
    self.type = type;
    self.travelTime = 0;
    switch (self.type) {
        case 'arrow':
            self.width = 80;
            self.height = 10;
            self.moveSpeed = 10;
            self.damage = 10;
            break;
        case 'meleeDamage':
            self.width = 80;
            self.height = 80;
            self.moveSpeed = 0;
            self.damage = 10;
            break;
        case 'ninjastar':
            self.width = 22;
            self.height = 22;
            self.moveSpeed = 30;
            self.damage = 10;
            break;
        case 'thing':
            self.width = 20;
            self.height = 20;
            self.moveSpeed = 20;
            self.damage = 5;
            break;
        case 'laser':
            self.width = 30;
            self.height = 6;
            self.moveSpeed = 40;
            self.damage = 5;
            break;
        case 'smallwaterbottle':
            self.width = 40;
            self.height = 40;
            self.moveSpeed = 40;
            self.damage = 2;
            break;
            default:
            console.error('invalid projetile type!')
            break;
    }
    self.image = new Image();
    self.image.src = './client/img/' + type + '.png';

    self.update = function() {
        ctx.save();
        ctx.translate(self.x, self.y);
        ctx.rotate(self.angle);
        ctx.drawImage(self.image, -self.width/2, -self.height/2, self.width, self.height);
        ctx.restore();
        self.collide();
        if (parentisPlayer) {
            for (var i in Monster.list) {
                if (self.collideWith(Monster.list[i])) {
                    if (Monster.list[i].hp) Monster.list[i].hp -= self.damage;
                }
            }
        } else {
            if (self.collideWith(player)) {
                player.hp -= self.damage;
            }
        }
        self.travelTime++;
        if (self.travelTime >= 3600) {
            delete (Projectile.list[self.id]);
        }
    };
    self.collideWith = function(entity) {
        var vertices = [
            {x: ((self.width/2)*Math.cos(self.angle))-((self.height/2)*Math.sin(self.angle))+self.x, y: ((self.width/2)*Math.sin(self.angle))+((self.height/2)*Math.cos(self.angle))+self.y},
            {x: ((self.width/2)*Math.cos(self.angle))-((-self.height/2)*Math.sin(self.angle))+self.x, y: ((self.width/2)*Math.sin(self.angle))+((-self.height/2)*Math.cos(self.angle))+self.y},
            {x: ((-self.width/2)*Math.cos(self.angle))-((-self.height/2)*Math.sin(self.angle))+self.x, y: ((-self.width/2)*Math.sin(self.angle))+((-self.height/2)*Math.cos(self.angle))+self.y},
            {x: ((-self.width/2)*Math.cos(self.angle))-((self.height/2)*Math.sin(self.angle))+self.x, y: ((-self.width/2)*Math.sin(self.angle))+((self.height/2)*Math.cos(self.angle))+self.y},
            {x: self.x, y: self.y}
        ];
        var vertices2 = [
            {x: entity.x+entity.width/2, y: entity.y+entity.height/2},
            {x: entity.x+entity.width/2, y: entity.y-entity.height/2},
            {x: entity.x-entity.width/2, y: entity.y-entity.height/2},
            {x: entity.x-entity.width/2, y: entity.y+entity.height/2}
        ];
        function getSlope(pt1, pt2) {
            return (pt2.y - pt1.y) / (pt2.x - pt1.x);
        };
        for (var i = 0; i < 4; i++) {
            if (vertices2[i].y-vertices[0].y < (getSlope(vertices[0],vertices[1])*(vertices2[i].x-vertices[0].x))) {
                if (vertices2[i].y-vertices[1].y > (getSlope(vertices[1],vertices[2])*(vertices2[i].x-vertices[1].x))) {
                    if (vertices2[i].y-vertices[2].y > (getSlope(vertices[2],vertices[3])*(vertices2[i].x-vertices[2].x))) {
                        if (vertices2[i].y-vertices[3].y < (getSlope(vertices[3],vertices[0])*(vertices2[i].x-vertices[3].x))) {
                            delete (Projectile.list[self.id]);
                            return true;
                        }
                    }
                }
            }
            if (vertices[i].x > vertices2[2].x && vertices[i].x < vertices2[0].x && vertices[i].y > vertices2[2].y && vertices[i].y < vertices2[0].y) {
                delete (Projectile.list[self.id]);
                return true;
            }
        }
        if (vertices[4].x > vertices2[2].x && vertices[4].x < vertices2[0].x && vertices[4].y > vertices2[2].y && vertices[4].y < vertices2[0].y) {
            delete (Projectile.list[self.id]);
            return true;
        }

        return false;
    };

    Projectile.list[self.id] = self;
    return self;
};
Projectile.update = function() {
    for (var i in Projectile.list) {
        Projectile.list[i].update();
    }
};
Projectile.list = [];