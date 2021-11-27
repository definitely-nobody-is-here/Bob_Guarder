var canvas = document.getElementById('ctx');
var ctx = canvas.getContext('2d');
var player = new Player();

document.onkeydown = function(e) {
    if (!player.dead) {
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
    }
};
document.onkeyup = function(e) {
    if (!player.dead) {
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
    }
};

document.onclick = function(e) {
    if (!player.dead) {
        if (Inventory.equips['weapon']) {
            if (Inventory.equips['weapon'].id.includes('bow')) {
                new Projectile(player.x, player.y, 'arrow', true, e.clientX+player.x-window.innerWidth/2, e.clientY+player.y-window.innerHeight/2);
            } else if (Inventory.equips['weapon'].id.includes('sword')) {
                new Projectile(player.x, player.y, 'meleeDamage', true, player.x, player.y);
            }
        }
    }
};
document.getElementById('respawnbutton').onclick = function() {
    player.hp = 100;
    player.dead = false;
    document.getElementById('deathScreen').style.display = 'none';
};

Inventory = {
    items: [],
    equips: []
};
Inventory.equipItem = function(slot) {
    for (var i in Inventory.equips) {
        if (Inventory.equips[i] != null) {
            if (Inventory.equips[i].equipType == Inventory.items[slot].equipType) {
                Inventory.unequipItem(i);
            }
        }
    }
    var item = Inventory.items[slot];
    item.slotId = item.equipType;
    item.slot.innerHTML = '<img src="./client/img/' + item.id + '.png">' + item.name + '<button onclick="Inventory.unequipItem(\'' + item.slotId + '\');">Unequip</button>';
    Inventory.equips[item.slotId] = item;
    Inventory.items[slot] = null;
    Inventory.refresh();
};
Inventory.unequipItem = function(slot) {
    var slotId = 0;
    while (true) {
        if (Inventory.items[slotId] == null) {
            break;
        }
        slotId++;
    }
    var item = Inventory.equips[slot];
    item.slotId = slotId;
    item.slot.innerHTML = '<img src="./client/img/' + item.id + '.png">' + item.name + '<button onclick="Inventory.equipItem(' + item.slotId + ');">Equip</button>';
    Inventory.items[item.slotId] = item;
    Inventory.equips[slot] = null;
    Inventory.refresh();
};
Inventory.refresh = function() {
    document.getElementById('items').innerHTML = '';
    document.getElementById('equips').innerHTML = '';
    for (var i in Inventory.items) {
        if (Inventory.items[i] != null) {
            document.getElementById('items').appendChild(Inventory.items[i].slot);
        }
    }
    for (var i in Inventory.equips) {
        if (Inventory.equips[i] != null) {
            document.getElementById('equips').appendChild(Inventory.equips[i].slot);
        }
    }
};

Item = function(id) {
    var self = {
        id: id,
        name: 'Invalid Item'
    };
    switch (id) {
        case 'bow':
            self.equipType = 'weapon';
            self.name = 'Bow';
            break;
        case 'sword':
            self.equipType = 'weapon';
            self.name = 'Sword';
            break;
        default:
            break;
    }

    self.slotId = 0;
    while (true) {
        if (Inventory.items[self.slotId] == null) break;
        self.slotId++;
    }

    self.slot = document.createElement('div');
    self.slot.innerHTML = '<img src="./client/img/' + self.id + '.png">' + self.name + '<button onclick="Inventory.equipItem(' + self.slotId + ');">Equip</button>';

    Inventory.items[self.slotId] = self;
    Inventory.refresh();
    return self;
};
new Item('bow');

MAPS = [];
function loadMap(name) {
    MAPS[name] = {
        upper: new Image,
        lower: new Image
    };
    MAPS[name].upper.src = './client/maps/' + name + '_upper.png';
    MAPS[name].lower.src = './client/maps/' + name + '_lower.png';
};
loadMap('The Village');
loadMap('The River');

setInterval(function() {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.translate((window.innerWidth/2)-player.x, (window.innerHeight/2)-player.y);
    ctx.drawImage(MAPS[player.map].lower, 0, 0, 3200, 3200);
    player.update();
    Monster.update();
    Projectile.update();
    ctx.drawImage(MAPS[player.map].upper, 0, 0, 3200, 3200);
    ctx.restore();
}, 1000/60);

canvas.width = window.innerWidth*2;
canvas.height = window.innerHeight*2;
ctx.scale(2, 2);
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
window.onresize = function() {
    canvas.width = window.innerWidth*2;
    canvas.height = window.innerHeight*2;
    ctx.scale(2, 2);
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
};