// Game Variables
const gameCanvas = document.getElementById('gameCanvas');
const passwordGate = document.getElementById('passwordGate');
const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const passwordMessage = document.getElementById('passwordMessage');

passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (passwordInput.value === '414256') {
        passwordGate.style.display = 'none';
        document.getElementById('gameContainer').style.display = 'flex';
        passwordMessage.textContent = '';
        passwordInput.value = '';
    } else {
        passwordMessage.textContent = 'Incorrect password.';
        passwordInput.select();
    }
});

passwordInput.focus();
let gameRunning = false;
let gamePaused = false;
let score = 0;
let health = 100;
let level = 1;
let gameDifficulty = 'medium';
let enemySpeed = 2;
let spawnRate = 1.5;
let powerupChance = 0.005;
let soundEnabled = true;
let coins = 100;
let fireRateMultiplier = 1;
let currentShopPage = 1;
let lastShotTime = 0;
let shootDelay = 1000; // 1 second in milliseconds
let rifleOwned = false; // Track if rifle has been purchased
let shotgunOwned = false; // Track if shotgun has been purchased
let rocketLauncherOwned = false; // Track if rocket launcher has been purchased
let minigunOwned = false; // Track if minigun has been purchased
let autoFlakCannonOwned = false; // Track if auto flak cannon has been purchased
let silencerOwned = false; // Track if silencer attachment has been purchased
let silencerEquipped = false; // Whether silencer is currently equipped
let nukeGunOwned = false; // Track if nuke gun has been purchased
let nukeGunEquipped = false; // Whether nuke gun is currently equipped
let ultimateNukeGunOwned = false; // Track if ultimate nuke gun has been purchased
let ultimateNukeGunEquipped = false; // Whether ultimate nuke gun is currently equipped
let shotgunMinigunOwned = false; // Track if shotgun minigun has been purchased
let shotgunMinigunEquipped = false; // Whether shotgun minigun is currently equipped
// Minigun continuous-fire tracking and cooldown
let minigunContinuousFireStart = null;
let minigunCoolingDown = false;
let minigunCooldownStart = 0;
const MINIGUN_CONTINUOUS_DURATION = 10000; // milliseconds (10 seconds)
const MINIGUN_COOLDOWN_DURATION = 2000; // milliseconds (2 seconds)
// Grenade launcher state
let grenadeLauncherOwned = false;
let grenadeLauncherEquipped = false;
let grenadeAmmo = 3;
let grenadeMaxAmmo = 3;
let grenadeReloading = false;
let grenadeReloadStart = 0;
const GRENADE_RELOAD_TIME = 5000; // 5 seconds reload
const GRENADE_FUSE_TIME = 500; // 0.5 seconds fuse before explosion
// Control scheme: 'arrows', 'wasd', or 'mobile'
let controlMode = 'arrows';
let mouseDown = false;
let mobileControlsActivated = false;
// Wave / enemy system
let enemiesPerWave = 5;
let enemiesSpawnedThisWave = 0;
let spawnLimitReached = false;
// level (already used) will act as wave number
let bossActive = false;

// Drone system variables
let companionDronesOwned = false;
let companionDronesEquipped = false;
let companionDroneCount = 0;
let defenderDronesOwned = false;
let defenderDronesEquipped = false;
let defenderDroneCount = 0;
let droneEnemyChance = 0.1; // Chance to spawn drone enemies
let companionDrones = [];
let defenderDrones = [];
let droneEnemies = [];

// Shop pages data
const shopPages = [
    [
        { id: 'speed', name: 'Speed Boost', cost: 50, reward: null, description: 'Cost: 50 coins' },
        { id: 'health', name: '+50 Health', cost: 50, reward: 50, description: 'Cost: 50 coins' }
    ],
    [
        { id: 'pistol', name: 'Pistol', cost: null, reward: null, description: 'Equip', isWeapon: true },
        { id: 'rifle', name: 'Rifle', cost: 50, reward: null, description: 'Cost: 50 coins', isWeapon: true }
    ],
    [
        { id: 'shotgun', name: 'Shotgun', cost: 75, reward: null, description: 'Cost: 75 coins', isWeapon: true },
        { id: 'rocketLauncher', name: 'Rocket Launcher', cost: 100, reward: null, description: 'Cost: 100 coins', isWeapon: true }
    ],
    [
        { id: 'minigun', name: 'Minigun', cost: 150, reward: null, description: 'Cost: 150 coins', isWeapon: true },
        { id: 'autoFlakCannon', name: 'Auto Flak Cannon', cost: 200, reward: null, description: 'Cost: 200 coins', isWeapon: true }
    ]
    ,[ // Page 5: Attachments
        { id: 'grenadeLauncher', name: 'Grenade Launcher', cost: 80, reward: null, description: 'Cost: 80 coins', isWeapon: false },
        { id: 'silencer', name: 'Silencer', cost: 25, reward: null, description: 'Cost: 25 coins', isWeapon: false }
    ]
    ,[ // Page 6: Ultimate Weapons
        { id: 'nukeGun', name: 'Nuke Gun', cost: 1000, reward: null, description: 'Cost: 1000 coins', isWeapon: true }
    ]
    ,[ // Page 7: Drones
        { id: 'companionDrones', name: 'Companion Drones (2x)', cost: 300, reward: null, description: 'Cost: 300 coins', isDrone: true },
        { id: 'defenderDrones', name: 'Defender Turrets (2x)', cost: 400, reward: null, description: 'Cost: 400 coins', isDrone: true }
    ]
    ,[ // Page 8: Secret page
        { id: 'ultimateNukeGun', name: 'Ultimate Nuke Gun (UNG)', cost: 10000, reward: null, description: 'Cost: 10000 coins', isWeapon: true },
        { id: 'shotgunMinigun', name: 'Shotgun Minigun (SM)', cost: 15000, reward: null, description: 'Cost: 15000 coins', isWeapon: true }
    ]
];

function getCanvasWidth() {
    return gameCanvas.getBoundingClientRect().width;
}

function getCanvasHeight() {
    return gameCanvas.getBoundingClientRect().height;
}

function shakeScreen() {
    gameCanvas.classList.add('shake');
    setTimeout(() => {
        gameCanvas.classList.remove('shake');
    }, 300);
}

// Game Objects
const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 5,
    baseSpeed: 5,
    element: null,
    create() {
        this.element = document.createElement('div');
        this.element.className = 'player';
        this.element.style.position = 'absolute';
        gameCanvas.appendChild(this.element);
        const canvasRect = gameCanvas.getBoundingClientRect();
        this.x = canvasRect.width / 2 - this.width / 2;
        this.y = canvasRect.height - 60;
        this.update();
    },
    update() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    },
    moveLeft() {
        if (this.x > 0) this.x -= this.speed;
    },
    moveRight() {
        if (this.x < getCanvasWidth() - this.width) this.x += this.speed;
    },
    moveUp() {
        if (this.y > 0) this.y -= this.speed;
    },
    moveDown() {
        if (this.y < getCanvasHeight() - this.height - 60) this.y += this.speed;
    },
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
};

// Arrays for game objects
let bullets = [];
let enemies = [];
let powerups = [];
let explosions = [];
let grenades = [];
let nukes = [];

// Auto Flak Cannon object
const autoFlakCannon = {
    x: 0,
    y: 0,
    width: 40,
    height: 4,
    element: null,
    lastShotTime: 0,
    shootDelay: 800, // 0.8 seconds between shots
    targetedEnemy: null,
    angle: 0, // Rotation angle in degrees
    
    create() {
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.backgroundColor = '#FFD700';
        this.element.style.transformOrigin = 'left center';
        this.element.style.boxShadow = '0 0 10px #FFAA00';
        gameCanvas.appendChild(this.element);
        this.positionAtBottom();
    },
    
    positionAtBottom() {
        const canvasRect = gameCanvas.getBoundingClientRect();
        this.x = canvasRect.width / 2 - this.width / 2;
        this.y = canvasRect.height - 25;
        this.update();
    },
    
    update() {
        if (this.element) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.transform = `rotate(${this.angle}deg)`;
        }
    },
    
    findNearestEnemy() {
        let nearest = null;
        let nearestDistance = 300; // Search radius
        
        for (let enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    },
    
    fire() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastShotTime < this.shootDelay) {
            return; // Too soon
        }
        
        // Find and target nearest enemy
        this.targetedEnemy = this.findNearestEnemy();
        
        if (this.targetedEnemy) {
            // Turn toward the target smoothly, then fire in the current facing direction
            const dx = this.targetedEnemy.x - this.x;
            const dy = this.targetedEnemy.y - this.y;
            const desiredAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
            this.angle = this.angle + (desiredAngle - this.angle) * 0.35;
            this.update();
            
            // Fire rocket from the tip of the cannon in its current facing direction
            const radians = (this.angle * Math.PI) / 180;
            const tipX = this.x + Math.cos(radians) * this.width;
            const tipY = this.y + Math.sin(radians) * this.width;
            const rocket = new Rocket(tipX, tipY);
            rocket.angle = this.angle;
            
            bullets.push(rocket);
            this.lastShotTime = currentTime;
        }
    }
};

// Keyboard input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
};

// include WASD keys in the keys map so key handlers work for either scheme
keys.w = false;
keys.a = false;
keys.s = false;
keys.d = false;

function setMobileKey(key, active) {
    keys[key] = active;
    if (active) {
        controlMode = 'arrows';
        localStorage.setItem('shootingGameControlMode', 'arrows');
    }
}

function addMobileButtonControl(buttonId, keyName) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    const start = (e) => {
        e.preventDefault();
        setMobileKey(keyName, true);
    };
    const stop = (e) => {
        e.preventDefault();
        setMobileKey(keyName, false);
    };
    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointerleave', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('touchstart', start, { passive: false });
    button.addEventListener('touchend', stop);
    button.addEventListener('touchcancel', stop);
    button.addEventListener('contextmenu', (e) => e.preventDefault());
}

function showMobileControls() {
    const controls = document.getElementById('mobileControls');
    if (controls) controls.classList.add('visible');
}

function hideMobileControls() {
    const controls = document.getElementById('mobileControls');
    if (controls) controls.classList.remove('visible');
}

function updateMobileControlVisibility() {
    if (controlMode === 'mobile' && mobileControlsActivated && gameRunning) {
        showMobileControls();
    } else {
        hideMobileControls();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Grenade fire (separate key so it can be fired while shooting main gun)
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        // Prevent default to avoid unwanted browser behavior
        e.preventDefault();
        fireGrenade();
    }
});

// Mouse handlers for click-to-shoot when using WASD controls
document.addEventListener('mousedown', (e) => {
    if (controlMode === 'wasd') {
        mouseDown = true;
        // allow left-click to shoot immediately
        if (e.button === 0) shootBullet();
    }
});
document.addEventListener('mouseup', (e) => {
    if (controlMode === 'wasd') {
        mouseDown = false;
    }
});

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 8;
        this.angle = 0; // angle in degrees (0 = straight up)
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        // Calculate movement based on angle
        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Rotate the bullet to match angle
        if (this.angle !== 0) {
            this.element.style.transform = `rotate(${this.angle}deg)`;
        }
    }

    isOffScreen() {
        return this.y < 0 || this.x < -50 || this.x > getCanvasWidth() + 50;
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Enemy class
class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type; // 'normal', 'fast', 'armored', 'boss'
        this.element = document.createElement('div');
        this.element.className = 'enemy';

        // Set properties based on type
        if (type === 'fast') {
            this.width = 28;
            this.height = 28;
            this.speed = enemySpeed + 2;
            this.hp = 30 + (level * 5);
            this.element.style.background = 'radial-gradient(circle, #ff8800 0%, #ff4400 100%)';
        } else if (type === 'armored') {
            this.width = 45;
            this.height = 45;
            this.speed = Math.max(1, enemySpeed - 0.5);
            this.hp = 50;
            this.element.style.background = 'radial-gradient(circle, #aa0000 0%, #550000 100%)';
        } else if (type === 'boss') {
            this.width = 100;
            this.height = 100;
            this.speed = Math.max(0.5, enemySpeed - 1);
            this.hp = 250 + (level * 50);
            this.element.style.background = 'radial-gradient(circle, #6600cc 0%, #330066 100%)';
            this.element.style.boxShadow = '0 0 20px #6600cc';
        } else {
            // normal
            this.width = 35;
            this.height = 35;
            this.speed = enemySpeed;
            this.hp = 10;
            this.element.style.background = 'radial-gradient(circle, #ff0000 0%, #aa0000 100%)';
        }

        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        // Boss can have different movement (e.g., side to side)
        if (this.type === 'boss') {
            // simple horizontal bobbing while moving down slowly
            this.x += Math.sin(Date.now() / 200) * 0.5;
            this.y += this.speed;
        } else {
            this.y += this.speed;
        }

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
    }

    isOffScreen() {
        return this.y > getCanvasHeight();
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Enemy Drone class - hovering drone enemies
class EnemyDrone {
    constructor(x, y, droneType = 'scout') {
        this.x = x;
        this.y = y;
        this.droneType = droneType; // 'scout', 'tank', 'swarm'
        this.element = document.createElement('div');
        this.element.className = 'enemy-drone';
        
        if (droneType === 'scout') {
            this.width = 20;
            this.height = 20;
            this.speed = enemySpeed + 1.5;
            this.hp = 15;
            this.element.style.background = 'radial-gradient(circle, #00ff88 0%, #00aa44 100%)';
        } else if (droneType === 'tank') {
            this.width = 30;
            this.height = 30;
            this.speed = Math.max(0.5, enemySpeed - 0.5);
            this.hp = 40;
            this.element.style.background = 'radial-gradient(circle, #ff00ff 0%, #aa00aa 100%)';
        } else {
            // swarm
            this.width = 15;
            this.height = 15;
            this.speed = enemySpeed + 2;
            this.hp = 8;
            this.element.style.background = 'radial-gradient(circle, #ffff00 0%, #cccc00 100%)';
        }
        
        this.element.style.position = 'absolute';
        this.element.style.borderRadius = '50%';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.boxShadow = '0 0 8px currentColor';
        this.yOffset = 0;
        this.yOffsetDir = 1;
        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        // Hovering movement - bob up and down while moving down
        this.yOffset += this.yOffsetDir * 0.5;
        if (this.yOffset > 15 || this.yOffset < -15) this.yOffsetDir *= -1;
        this.y += this.speed;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = (this.y + this.yOffset) + 'px';
    }

    isOffScreen() {
        return this.y > getCanvasHeight();
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y + this.yOffset,
            width: this.width,
            height: this.height
        };
    }
}

// Companion Drone class - player helper drones
class CompanionDrone {
    constructor(playerRef, index = 0) {
        this.player = playerRef;
        this.index = index; // 0 for left, 1 for right
        this.x = playerRef.x;
        this.y = playerRef.y;
        this.width = 18;
        this.height = 18;
        this.speed = 4;
        this.shootDelay = 400;
        this.lastShotTime = 0;
        this.element = document.createElement('div');
        this.element.className = 'companion-drone';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.background = 'radial-gradient(circle, #00aaff 0%, #0055cc 100%)';
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = '0 0 12px #00aaff';
        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        // Follow player with offset to left or right
        const offsetX = this.index === 0 ? -25 : 25;
        const targetX = this.player.x + this.player.width / 2 + offsetX;
        const targetY = this.player.y + this.player.height / 2;
        
        // Smooth following
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    fire() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shootDelay) return;
        
        // Find nearest enemy to shoot
        let nearest = null;
        let nearestDist = 150;
        for (let enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        }
        
        if (nearest) {
            const bullet = new Bullet(this.x, this.y);
            // Calculate angle to enemy
            const dx = nearest.x - this.x;
            const dy = nearest.y - this.y;
            bullet.angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
            bullets.push(bullet);
            // Audio disabled to prevent freeze
            this.lastShotTime = currentTime;
        }
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Defender Drone class - turret drones
class DefenderDrone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.shootDelay = 600;
        this.lastShotTime = 0;
        this.range = 200;
        this.targetedEnemy = null;
        this.rotation = 0;
        this.element = document.createElement('div');
        this.element.className = 'defender-drone';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.background = 'radial-gradient(circle, #ff6600 0%, #cc3300 100%)';
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = '0 0 15px #ff6600';
        this.element.style.border = '2px solid #ff8800';
        gameCanvas.appendChild(this.element);
        this.update();
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = this.range;
        for (let enemy of enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        }
        return nearest;
    }

    update() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }

    fire() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shootDelay) return;
        
        this.targetedEnemy = this.findNearestEnemy();
        if (this.targetedEnemy) {
            const dx = this.targetedEnemy.x - this.x;
            const dy = this.targetedEnemy.y - this.y;
            this.rotation = (Math.atan2(dx, -dy) * 180) / Math.PI;
            this.update();
            
            const bullet = new Bullet(this.x, this.y);
            bullet.angle = this.rotation;
            bullets.push(bullet);
            // Defender drones fire silently to avoid audio overload
            this.lastShotTime = currentTime;
        }
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 2;
        this.type = type; // 'health' or 'speed'
        this.element = document.createElement('div');
        this.element.className = 'powerup';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        if (type === 'health') {
            this.element.style.background = 'radial-gradient(circle, #00ff00 0%, #008800 100%)';
            this.element.style.boxShadow = '0 0 10px #00ff00';
        } else if (type === 'speed') {
            this.element.style.background = 'radial-gradient(circle, #ffff00 0%, #888800 100%)';
            this.element.style.boxShadow = '0 0 10px #ffff00';
        }
        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        this.y += this.speed;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    isOffScreen() {
        return this.y > getCanvasHeight();
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Rocket class
class Rocket {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 10;
        this.angle = 0; // Angle in degrees (0 = straight up)
        this.proximityRadius = 50; // Explosion radius
        this.element = document.createElement('div');
        this.element.className = 'rocket';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.backgroundColor = '#FF6B00';
        this.element.style.borderRadius = '50%';
        gameCanvas.appendChild(this.element);
        this.update();
    }

    update() {
        // Calculate movement based on angle
        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    isOffScreen() {
        return this.y < 0 || this.x < -50 || this.x > getCanvasWidth() + 50;
    }

    remove() {
        this.element.remove();
    }

    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    getProximityRect() {
        return {
            x: this.x - this.proximityRadius,
            y: this.y - this.proximityRadius,
            width: this.proximityRadius * 2,
            height: this.proximityRadius * 2
        };
    }
}

// Grenade projectile class
class Grenade {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 6;
        this.speed = 6;
        this.angle = 0; // straight up by default
        this.element = document.createElement('div');
        this.element.className = 'grenade';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.backgroundColor = '#FFAA33';
        this.element.style.borderRadius = '3px';
        gameCanvas.appendChild(this.element);
        this.exploded = false;
        this.createdAt = Date.now();

        // Schedule explosion after fuse time
        this.fuseTimeout = setTimeout(() => {
            this.explode();
        }, GRENADE_FUSE_TIME);
        
        this.update();
    }

    update() {
        if (this.exploded) return;
        
        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Check collision with enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (checkCollision(this.getRect(), enemies[i].getRect())) {
                this.explode();
                return;
            }
        }
    }
    
    explode() {
        if (this.exploded) return;
        this.exploded = true;
        clearTimeout(this.fuseTimeout);
        createGrenadeExplosion(this.x, this.y);
        this.remove();
        // Let the update loop handle removal from the array
    }

    isOffScreen() {
        return this.y < 0 || this.x < -50 || this.x > getCanvasWidth() + 50;
    }

    remove() {
        try { this.element.remove(); } catch (e) {}
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Nuke projectile class
class Nuke {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 25;
        this.speed = 8;
        this.angle = 0; // straight up
        this.element = document.createElement('div');
        this.element.className = 'nuke';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.backgroundColor = '#FFFF00';
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = '0 0 10px #FFFF00';
        gameCanvas.appendChild(this.element);
        this.exploded = false;
        this.createdAt = Date.now();

        // Schedule explosion after 0.5 seconds
        this.fuseTimeout = setTimeout(() => {
            this.explode();
        }, 500);
        
        this.update();
    }

    update() {
        if (this.exploded) return;
        
        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Check collision with enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (checkCollision(this.getRect(), enemies[i].getRect())) {
                this.explode();
                return;
            }
        }
    }
    
    explode() {
        if (this.exploded) return;
        this.exploded = true;
        clearTimeout(this.fuseTimeout);
        createNukeExplosion(this.x, this.y);
        this.remove();
        // Let the update loop handle removal from the array
    }

    isOffScreen() {
        return this.y < 0 || this.x < -50 || this.x > getCanvasWidth() + 50;
    }

    remove() {
        try { this.element.remove(); } catch (e) {}
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Ultimate nuke projectile class
class UltimateNuke {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 28;
        this.speed = 7;
        this.angle = 0;
        this.element = document.createElement('div');
        this.element.className = 'nuke';
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.backgroundColor = '#FF00FF';
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = '0 0 12px #FF00FF';
        gameCanvas.appendChild(this.element);
        this.exploded = false;
        this.createdAt = Date.now();

        this.fuseTimeout = setTimeout(() => {
            this.explode();
        }, 600);

        this.update();
    }

    update() {
        if (this.exploded) return;

        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.sin(radians) * this.speed;
        this.y -= Math.cos(radians) * this.speed;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        for (let i = enemies.length - 1; i >= 0; i--) {
            if (checkCollision(this.getRect(), enemies[i].getRect())) {
                this.explode();
                return;
            }
        }
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        clearTimeout(this.fuseTimeout);
        createUltimateNukeExplosion(this.x, this.y);
        this.remove();
    }

    isOffScreen() {
        return this.y < 0 || this.x < -50 || this.x > getCanvasWidth() + 50;
    }

    remove() {
        try { this.element.remove(); } catch (e) {}
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Create nuke explosion - massive damage to all enemies
function createNukeExplosion(x, y) {
    shakeScreen();
    const radius = 300; // Huge radius
    // Visual - massive explosion
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - radius) + 'px';
    explosion.style.top = (y - radius) + 'px';
    explosion.style.width = (radius * 2) + 'px';
    explosion.style.height = (radius * 2) + 'px';
    explosion.style.backgroundColor = '#FFFFFF';
    explosion.style.borderRadius = '50%';
    explosion.style.boxShadow = '0 0 100px #FFFFFF, 0 0 200px #FFFF00';
    explosion.style.animation = 'rocketExplosion 1s ease-out forwards';
    gameCanvas.appendChild(explosion);

    createParticles(x, y, 50, '#FFFFFF'); // Lots of white particles

    setTimeout(() => { try { explosion.remove(); } catch (e) {} }, 1000);

    // Damage ALL enemies (nuke effect)
    for (let i = enemies.length - 1; i >= 0; i--) {
        // Nuke destroys all enemies instantly
        createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
        playExplosionSound();
        score += 10 * level;
        coins += 1;
        if (enemies[i].type === 'boss') {
            bossActive = false;
            increaseDifficulty();
            enemiesSpawnedThisWave = 0;
            enemiesPerWave = 5 + (level * 2);
        }
        enemies[i].remove();
        enemies.splice(i, 1);
    }
}

function createUltimateNukeExplosion(x, y) {
    shakeScreen();
    const radius = 450;
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - radius) + 'px';
    explosion.style.top = (y - radius) + 'px';
    explosion.style.width = (radius * 2) + 'px';
    explosion.style.height = (radius * 2) + 'px';
    explosion.style.backgroundColor = '#FFFFFF';
    explosion.style.borderRadius = '50%';
    explosion.style.boxShadow = '0 0 140px #FF00FF, 0 0 260px #FFD700';
    explosion.style.animation = 'rocketExplosion 1.2s ease-out forwards';
    gameCanvas.appendChild(explosion);

    createParticles(x, y, 80, '#FFD700');

    setTimeout(() => { try { explosion.remove(); } catch (e) {} }, 1200);

    for (let i = enemies.length - 1; i >= 0; i--) {
        createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
        playExplosionSound();
        score += 25 * level;
        coins += 3;
        if (enemies[i].type === 'boss') {
            bossActive = false;
            increaseDifficulty();
            enemiesSpawnedThisWave = 0;
            enemiesPerWave = 5 + (level * 2);
        }
        enemies[i].remove();
        enemies.splice(i, 1);
    }
}

// Collision detection
function createGrenadeExplosion(x, y) {
    shakeScreen();
    const radius = 60;
    // Visual
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - radius) + 'px';
    explosion.style.top = (y - radius) + 'px';
    explosion.style.width = (radius * 2) + 'px';
    explosion.style.height = (radius * 2) + 'px';
    explosion.style.backgroundColor = '#FFB84D';
    explosion.style.borderRadius = '50%';
    explosion.style.boxShadow = '0 0 40px #FF8C00';
    explosion.style.opacity = '0.95';
    explosion.style.animation = 'rocketExplosion 0.45s ease-out forwards';
    gameCanvas.appendChild(explosion);

    createParticles(x, y, 15, '#ffb84d');

    setTimeout(() => { try { explosion.remove(); } catch (e) {} }, 450);

    // Damage enemies in radius
    for (let i = enemies.length - 1; i >= 0; i--) {
        const dx = (enemies[i].x + enemies[i].width / 2) - x;
        const dy = (enemies[i].y + enemies[i].height / 2) - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
            // apply damage
            enemies[i].hp -= 50;
            if (enemies[i].hp <= 0) {
                createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
                playExplosionSound();
                score += 10 * level;
                coins += 1;
                if (enemies[i].type === 'boss') {
                    bossActive = false;
                    increaseDifficulty();
                    enemiesSpawnedThisWave = 0;
                    enemiesPerWave = 5 + (level * 2);
                }
                enemies[i].remove();
                enemies.splice(i, 1);
            }
        }
    }
}
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Create explosion
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = (x - 20) + 'px';
    explosion.style.top = (y - 20) + 'px';
    gameCanvas.appendChild(explosion);
    
    createParticles(x, y, 8, '#ff5500');
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

// Create medium explosion for rockets
function createMediumExplosion(x, y) {
    shakeScreen();
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = (x - 40) + 'px';
    explosion.style.top = (y - 40) + 'px';
    explosion.style.width = '80px';
    explosion.style.height = '80px';
    explosion.style.backgroundColor = '#FF6B00';
    explosion.style.borderRadius = '50%';
    explosion.style.boxShadow = '0 0 30px #FFB800';
    explosion.style.animation = 'rocketExplosion 0.5s ease-out forwards';
    gameCanvas.appendChild(explosion);
    
    createParticles(x, y, 12, '#ff6b00');
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

// Create particle effects
function createParticles(x, y, count = 10, color = '#ffaa00') {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        
        // Random velocity
        const angle = Math.random() * 360;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle * Math.PI / 180) * speed;
        const vy = Math.sin(angle * Math.PI / 180) * speed;
        
        gameCanvas.appendChild(particle);
        
        // Animate particle
        let px = x;
        let py = y;
        const animate = () => {
            px += vx;
            py += vy;
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            if (particle.style.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        requestAnimationFrame(animate);
    }
}

// Shoot bullet
function shootBullet() {
    try {
        const currentTime = Date.now();
        
        // Check if enough time has passed since last shot
        if (currentTime - lastShotTime < shootDelay) {
            return; // Too soon, can't shoot yet
        }
        
        // Check if shotgun is equipped (5 bullets in spread)
        if (shotgunOwned && shootDelay === 300) {
            // Shotgun spread pattern - 5 bullets
            const spreadAngles = [-25, -12.5, 0, 12.5, 25]; // degrees
            for (let angle of spreadAngles) {
                const bullet = new Bullet(player.x + player.width / 2 - 2.5, player.y);
                bullet.angle = angle;
                bullets.push(bullet);
            }
        } else if (rocketLauncherOwned && shootDelay === 500) {
            // Rocket launcher fires a single rocket
            const rocket = new Rocket(player.x + player.width / 2 - 4, player.y);
            bullets.push(rocket);
        } else if (shotgunMinigunEquipped) {
            const spreadAngles = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];
            for (let angle of spreadAngles) {
                const bullet = new Bullet(player.x + player.width / 2 - 2.5, player.y);
                bullet.angle = angle;
                bullets.push(bullet);
            }
        } else if (minigunOwned && shootDelay === 2) {
            // Minigun: enforce continuous-fire cooldown
            const now = Date.now();

            // If currently cooling down, check if cooldown finished
            if (minigunCoolingDown) {
                if (now - minigunCooldownStart >= MINIGUN_COOLDOWN_DURATION) {
                    // cooldown finished
                    minigunCoolingDown = false;
                    minigunContinuousFireStart = null;
                } else {
                    // still cooling down -> cannot fire
                    return;
                }
            }

            // Start tracking continuous fire when first shot in a firing sequence
            if (!minigunContinuousFireStart) minigunContinuousFireStart = now;

            // If continuous firing exceeded allowed duration, trigger cooldown and block this shot
            if (now - minigunContinuousFireStart >= MINIGUN_CONTINUOUS_DURATION) {
                minigunCoolingDown = true;
                minigunCooldownStart = now;
                minigunContinuousFireStart = null;
                return;
            }

            // Fire a minigun bullet
            const bullet = new Bullet(player.x + player.width / 2 - 2.5, player.y);
            bullets.push(bullet);
        } else if (ultimateNukeGunEquipped) {
            const burstCount = 5;
            for (let i = 0; i < burstCount; i++) {
                const nuke = new UltimateNuke(player.x + player.width / 2 - 9, player.y);
                nukes.push(nuke);
            }
        } else if (nukeGunEquipped) {
            // Nuke gun fires a single nuke
            const nuke = new Nuke(player.x + player.width / 2 - 7.5, player.y);
            nukes.push(nuke);
        } else {
            // Normal single bullet
            const bullet = new Bullet(player.x + player.width / 2 - 2.5, player.y);
            bullets.push(bullet);
        }
        
        playLaserSound();
        lastShotTime = currentTime;
    } catch (error) {
        console.error('Error in shootBullet:', error);
    }
}

// Fire a grenade if owned/equipped and has ammo; can fire independently of main gun
function fireGrenade() {
    if (!gameRunning) return;
    if (!grenadeLauncherOwned || !grenadeLauncherEquipped) return;
    if (grenadeReloading) return;
    if (grenadeAmmo <= 0) {
        // trigger reload just in case
        grenadeReloading = true;
        grenadeReloadStart = Date.now();
        setTimeout(() => {
            grenadeAmmo = grenadeMaxAmmo;
            grenadeReloading = false;
        }, GRENADE_RELOAD_TIME);
        return;
    }

    const g = new Grenade(player.x + player.width / 2 - 5, player.y);
    
    grenades.push(g);
    grenadeAmmo--;
    playLaserSound();

    if (grenadeAmmo <= 0) {
        grenadeReloading = true;
        grenadeReloadStart = Date.now();
        setTimeout(() => {
            grenadeAmmo = grenadeMaxAmmo;
            grenadeReloading = false;
        }, GRENADE_RELOAD_TIME);
    }
}

// Spawn enemy
function spawnEnemy() {
    // Determine enemy type based on level probability
    const x = Math.random() * (getCanvasWidth() - 35);
    const fastChance = Math.min(0.3, 0.1 + level * 0.02);
    const armoredChance = Math.min(0.25, 0.05 + level * 0.02);
    const droneChance = Math.min(0.2, 0.05 + level * 0.01); // Drones appear more as level increases
    
    const roll = Math.random();
    let type = 'normal';
    
    // Check for drone first
    if (roll < droneChance) {
        const droneRoll = Math.random();
        let droneType = 'scout';
        if (droneRoll < 0.5) droneType = 'scout';
        else if (droneRoll < 0.8) droneType = 'tank';
        else droneType = 'swarm';
        
        const drone = new EnemyDrone(x, -30, droneType);
        droneEnemies.push(drone);
    } else if (roll < fastChance + droneChance) {
        type = 'fast';
        const enemy = new Enemy(x, -35, type);
        enemies.push(enemy);
    } else if (roll < fastChance + armoredChance + droneChance) {
        type = 'armored';
        const enemy = new Enemy(x, -35, type);
        enemies.push(enemy);
    } else {
        // normal
        const enemy = new Enemy(x, -35, type);
        enemies.push(enemy);
    }
    
    enemiesSpawnedThisWave++;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = 'Score: ' + score;
    document.getElementById('healthValue').textContent = health;
    document.getElementById('levelValue').textContent = level;
    document.getElementById('coinsValue').textContent = coins;
    // Save coins to localStorage
    localStorage.setItem('shootingGameCoins', coins);
    // Grenade UI
    const gUI = document.getElementById('grenadeUI');
    if (gUI) {
        if (grenadeReloading) {
            const rem = Math.max(0, GRENADE_RELOAD_TIME - (Date.now() - grenadeReloadStart));
            const secs = Math.ceil(rem / 1000);
            gUI.textContent = `Grenades: ${grenadeAmmo} (Reloading ${secs}s)`;
        } else {
            gUI.textContent = `Grenades: ${grenadeAmmo}`;
        }
    }
}

// Increase difficulty
function increaseDifficulty() {
    level++;
    enemySpeed = 2 + (level - 1) * 0.5;
    spawnRate = 1.5 - (level - 1) * 0.1;
    if (spawnRate < 0.3) spawnRate = 0.3;
}

// Game update loop
let spawnCounter = 0;
function update() {
    try {
        if (!gameRunning || gamePaused) return;

        // Player movement
        if (controlMode === 'arrows' || controlMode === 'mobile') {
            if (keys.ArrowLeft) player.moveLeft();
            if (keys.ArrowRight) player.moveRight();
            if (keys.ArrowUp) player.moveUp();
            if (keys.ArrowDown) player.moveDown();
            if (keys[' ']) {
                shootBullet();
            } else {
                minigunContinuousFireStart = null;
            }
        } else {
            // WASD + click controls
            if (keys.a) player.moveLeft();
            if (keys.d) player.moveRight();
            if (keys.w) player.moveUp();
            if (keys.s) player.moveDown();
            // Mouse click triggers shooting; keep allowing single-shot on mousedown
            if (mouseDown) {
                shootBullet();
            } else {
                minigunContinuousFireStart = null;
            }
        }

        player.update();

    // Auto flak cannon auto-fire
    if (autoFlakCannonOwned) {
        autoFlakCannon.fire();
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        
        if (bullets[i].isOffScreen()) {
            bullets[i].remove();
            bullets.splice(i, 1);
        }
    }

    // Update grenades (they explode after their fuse)
    for (let i = grenades.length - 1; i >= 0; i--) {
        if (!grenades[i]) continue;
        grenades[i].update();
        if (grenades[i].exploded || grenades[i].isOffScreen()) {
            // If off screen before exploding or has exploded, remove it
            grenades[i].remove();
            grenades.splice(i, 1);
        }
    }

    // Update nukes
    for (let i = nukes.length - 1; i >= 0; i--) {
        if (!nukes[i]) continue;
        nukes[i].update();
        if (nukes[i].exploded || nukes[i].isOffScreen()) {
            // If off screen before exploding or has exploded, remove it
            nukes[i].remove();
            nukes.splice(i, 1);
        }
    }

    // Update powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update();
        if (powerups[i].isOffScreen()) {
            powerups[i].remove();
            powerups.splice(i, 1);
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        
        if (enemies[i].isOffScreen()) {
            enemies[i].remove();
            enemies.splice(i, 1);
        }
    }

    // Update companion drones
    for (let i = companionDrones.length - 1; i >= 0; i--) {
        companionDrones[i].update();
        companionDrones[i].fire();
    }

    // Update defender drones
    for (let i = defenderDrones.length - 1; i >= 0; i--) {
        defenderDrones[i].update();
        defenderDrones[i].fire();
    }

    // Update drone enemies
    for (let i = droneEnemies.length - 1; i >= 0; i--) {
        droneEnemies[i].update();
        
        if (droneEnemies[i].isOffScreen()) {
            droneEnemies[i].remove();
            droneEnemies.splice(i, 1);
        }
    }

    // Spawn enemies continuously
    spawnCounter++;
    if (spawnCounter > 60 * spawnRate) {
        // Spawn enemies continuously, auto-advance waves
        if (!bossActive) {
            spawnEnemy();
            // Auto-advance to next wave if all enemies defeated
            if (enemiesSpawnedThisWave >= enemiesPerWave && enemies.length === 0 && droneEnemies.length === 0) {
                increaseDifficulty();
                enemiesSpawnedThisWave = 0;
                enemiesPerWave = 5 + (level * 2);
                
                // Every 5th level spawn a boss
                if (level % 5 === 0) {
                    const bx = getCanvasWidth() / 2 - 50;
                    const boss = new Enemy(bx, -120, 'boss');
                    enemies.push(boss);
                    bossActive = true;
                }
            }
        }
        spawnCounter = 0;
    }

    // Spawn powerups occasionally
    if (Math.random() < powerupChance) {
        const type = Math.random() < 0.5 ? 'health' : 'speed';
        const x = Math.random() * (getCanvasWidth() - 20);
        const powerup = new PowerUp(x, -20, type);
        powerups.push(powerup);
    }

    // Check collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            // Check if it's a rocket
            if (bullets[i] instanceof Rocket) {
                // Check proximity-based collision for rockets
                if (checkCollision(bullets[i].getProximityRect(), enemies[j].getRect())) {
                    createMediumExplosion(bullets[i].x, bullets[i].y);
                    playExplosionSound();

                    // Rockets destroy enemies immediately
                    score += 10 * level;
                    coins += 1;

                    bullets[i].remove();
                    bullets.splice(i, 1);

                    // If boss was killed, clear boss flag
                    if (enemies[j].type === 'boss') {
                        bossActive = false;
                        increaseDifficulty();
                        enemiesSpawnedThisWave = 0;
                        enemiesPerWave = 5 + (level * 2);
                    }

                    enemies[j].remove();
                    enemies.splice(j, 1);
                    break;
                }
            } else {
                // Regular bullet collision - subtract HP
                if (checkCollision(bullets[i].getRect(), enemies[j].getRect())) {
                    // Damage value per hit
                    const damage = 10;
                    enemies[j].hp -= damage;
                    bullets[i].remove();
                    bullets.splice(i, 1);

                    if (enemies[j].hp <= 0) {
                        createExplosion(enemies[j].x + enemies[j].width / 2, enemies[j].y + enemies[j].height / 2);
                        playExplosionSound();

                        score += 10 * level;
                        coins += 1;

                        // If boss died
                        if (enemies[j].type === 'boss') {
                            bossActive = false;
                            increaseDifficulty();
                            enemiesSpawnedThisWave = 0;
                            enemiesPerWave = 5 + (level * 2);
                        }

                        enemies[j].remove();
                        enemies.splice(j, 1);

                        // Auto-advance wave if all spawned enemies defeated
                        if (enemiesSpawnedThisWave >= enemiesPerWave && enemies.length === 0 && droneEnemies.length === 0 && !bossActive) {
                            increaseDifficulty();
                            enemiesSpawnedThisWave = 0;
                            enemiesPerWave = 5 + (level * 2);
                            
                            // Every 5th level spawn a boss
                            if (level % 5 === 0) {
                                const bx = getCanvasWidth() / 2 - 50;
                                const boss = new Enemy(bx, -120, 'boss');
                                enemies.push(boss);
                                bossActive = true;
                            }
                        }
                    }

                    break;
                }
            }
        }
    }

    // Check if enemies hit player
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (checkCollision(player.getRect(), enemies[i].getRect())) {
            health -= 20;
            createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2);
            playExplosionSound();
            
            enemies[i].remove();
            enemies.splice(i, 1);
            
            if (health <= 0) {
                health = 0;
                updateUI();
                endGame();
                return;
            }
            // Only process one enemy collision per frame to avoid rapid health loss
            break;
        }
    }

    // Check collisions with drone enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = droneEnemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i].getRect(), droneEnemies[j].getRect())) {
                // Damage drone
                droneEnemies[j].hp -= 10;
                bullets[i].remove();
                bullets.splice(i, 1);
                
                if (droneEnemies[j].hp <= 0) {
                    createExplosion(droneEnemies[j].x + droneEnemies[j].width / 2, droneEnemies[j].y + droneEnemies[j].width / 2);
                    playExplosionSound();
                    score += 15 * level; // Drones give more points
                    coins += 2;
                    droneEnemies[j].remove();
                    droneEnemies.splice(j, 1);
                }
                break;
            }
        }
    }

    // Check if drone enemies hit player
    for (let i = droneEnemies.length - 1; i >= 0; i--) {
        if (checkCollision(player.getRect(), droneEnemies[i].getRect())) {
            health -= 15;
            createExplosion(droneEnemies[i].x + droneEnemies[i].width / 2, droneEnemies[i].y + droneEnemies[i].width / 2);
            playExplosionSound();
            
            droneEnemies[i].remove();
            droneEnemies.splice(i, 1);
            
            if (health <= 0) {
                health = 0;
                updateUI();
                endGame();
                return;
            }
            break;
        }
    }

    // Check powerup collisions with player
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (checkCollision(player.getRect(), powerups[i].getRect())) {
            if (powerups[i].type === 'health') {
                health = Math.min(health + 30, 100); // Heal 30, max 100
            } else if (powerups[i].type === 'speed') {
                player.speed = Math.min(player.speed + 2, player.baseSpeed + 4); // Temp speed boost
                setTimeout(() => {
                    player.speed = player.baseSpeed; // Reset after 10 seconds
                }, 10000);
            }
            powerups[i].remove();
            powerups.splice(i, 1);
        }
    }

    updateUI();
    requestAnimationFrame(update);
    } catch (error) {
        console.error('Error in game update:', error);
        // Continue running even if there's an error
        requestAnimationFrame(update);
    }
}

// Show difficulty selection
function showDifficulties() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('difficultySelect').style.display = 'block';
}

// Start game
function startGame(difficulty = 'medium') {
    document.getElementById('startScreen').style.display = 'none';
    stopAdventureMusic();
    gameRunning = true;
    gameDifficulty = difficulty;
    
    // Set initial values based on difficulty
    if (difficulty === 'easy') {
        health = 150;
        enemySpeed = 1.5;
        spawnRate = 2.0;
        powerupChance = 0.01;
    } else if (difficulty === 'medium') {
        health = 100;
        enemySpeed = 2.0;
        spawnRate = 1.5;
        powerupChance = 0.005;
    } else if (difficulty === 'hard') {
        health = 75;
        enemySpeed = 2.5;
        spawnRate = 1.2;
        powerupChance = 0.003;
    } else if (difficulty === 'extreme') {
        health = 50;
        enemySpeed = 3.0;
        spawnRate = 1.0;
        powerupChance = 0.001;
    }
    
    // Ensure player is created with proper canvas dimensions
    setTimeout(() => {
        if (gameRunning) {
            player.create();
            // Initialize wave variables
            enemiesPerWave = 5 + (level * 2);
            enemiesSpawnedThisWave = 0;
            bossActive = false;

            if (autoFlakCannonOwned) {
                autoFlakCannon.create();
            }

            // Initialize companion drones if equipped
            if (companionDronesEquipped) {
                companionDrones = [];
                for (let i = 0; i < companionDroneCount; i++) {
                    companionDrones.push(new CompanionDrone(player, i));
                }
            }

            // Initialize defender drones if equipped
            if (defenderDronesEquipped) {
                defenderDrones = [];
                const spacing = getCanvasWidth() / (defenderDroneCount + 1);
                for (let i = 0; i < defenderDroneCount; i++) {
                    defenderDrones.push(new DefenderDrone(spacing * (i + 1), 100));
                }
            }

            update();
            updateMobileControlVisibility();
        }
    }, 50);
}

// End game
function endGame() {
    gameRunning = false;
    hideMobileControls();
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    
    // Remove all game objects
    bullets.forEach(b => b.remove());
    enemies.forEach(e => e.remove());
    companionDrones.forEach(d => d.remove());
    defenderDrones.forEach(d => d.remove());
    droneEnemies.forEach(d => d.remove());
    bullets = [];
    enemies = [];
    companionDrones = [];
    defenderDrones = [];
    droneEnemies = [];
    
    // Remove flak cannon if it exists
    if (autoFlakCannon.element) {
        autoFlakCannon.element.remove();
        autoFlakCannon.element = null;
    }
}

// Play again - reset game but keep coins
function playAgain() {
    // Reset game variables but keep coins
    gameRunning = false;
    gamePaused = false;
    score = 0;
    health = 100;
    level = 1;
    enemySpeed = 2;
    spawnRate = 1.5;
    fireRateMultiplier = 1;
    spawnCounter = 0;
    
    // Clear all game objects
    bullets.forEach(b => b.remove());
    enemies.forEach(e => e.remove());
    companionDrones.forEach(d => d.remove());
    defenderDrones.forEach(d => d.remove());
    droneEnemies.forEach(d => d.remove());
    bullets = [];
    enemies = [];
    companionDrones = [];
    defenderDrones = [];
    droneEnemies = [];
    
    // Remove player element if it exists
    if (player.element) {
        player.element.remove();
        player.element = null;
    }
    
    // Remove flak cannon if it exists
    if (autoFlakCannon.element) {
        autoFlakCannon.element.remove();
        autoFlakCannon.element = null;
    }
    
    // Hide game over screen and show start screen
    hideMobileControls();
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    
    // Update UI
    updateUI();

    // Reset wave variables for new game
    enemiesPerWave = 5 + (level * 2);
    enemiesSpawnedThisWave = 0;
    bossActive = false;
}

// Create background stars
function createStars() {
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * getCanvasWidth() + 'px';
        star.style.top = Math.random() * getCanvasHeight() + 'px';
        star.style.opacity = Math.random();
        gameCanvas.appendChild(star);
    }
}

// Initialize
let audioContext;
window.addEventListener('load', () => {
    createStars();
    // Load coins from localStorage
    const savedCoins = localStorage.getItem('shootingGameCoins');
    if (savedCoins !== null) {
        coins = parseInt(savedCoins);
    }
    // Load weapon ownership from localStorage
    const savedRifleOwned = localStorage.getItem('shootingGameRifleOwned');
    if (savedRifleOwned !== null) {
        rifleOwned = savedRifleOwned === 'true';
    }
    const savedShotgunOwned = localStorage.getItem('shootingGameShotgunOwned');
    if (savedShotgunOwned !== null) {
        shotgunOwned = savedShotgunOwned === 'true';
    }
    const savedRocketLauncherOwned = localStorage.getItem('shootingGameRocketLauncherOwned');
    if (savedRocketLauncherOwned !== null) {
        rocketLauncherOwned = savedRocketLauncherOwned === 'true';
    }
    const savedMinigunOwned = localStorage.getItem('shootingGameMinigunOwned');
    if (savedMinigunOwned !== null) {
        minigunOwned = savedMinigunOwned === 'true';
    }
    const savedAutoFlakCannonOwned = localStorage.getItem('shootingGameAutoFlakCannonOwned');
    if (savedAutoFlakCannonOwned !== null) {
        autoFlakCannonOwned = savedAutoFlakCannonOwned === 'true';
    }
    const savedSilencerOwned = localStorage.getItem('shootingGameSilencerOwned');
    if (savedSilencerOwned !== null) {
        silencerOwned = savedSilencerOwned === 'true';
    }
    const savedSilencerEquipped = localStorage.getItem('shootingGameSilencerEquipped');
    if (savedSilencerEquipped !== null) {
        silencerEquipped = savedSilencerEquipped === 'true';
    }
    const savedGrenadeLauncherOwned = localStorage.getItem('shootingGameGrenadeLauncherOwned');
    if (savedGrenadeLauncherOwned !== null) {
        grenadeLauncherOwned = savedGrenadeLauncherOwned === 'true';
    }
    const savedGrenadeLauncherEquipped = localStorage.getItem('shootingGameGrenadeLauncherEquipped');
    if (savedGrenadeLauncherEquipped !== null) {
        grenadeLauncherEquipped = savedGrenadeLauncherEquipped === 'true';
    }
    const savedNukeGunOwned = localStorage.getItem('shootingGameNukeGunOwned');
    if (savedNukeGunOwned !== null) {
        nukeGunOwned = savedNukeGunOwned === 'true';
    }
    const savedNukeGunEquipped = localStorage.getItem('shootingGameNukeGunEquipped');
    if (savedNukeGunEquipped !== null) {
        nukeGunEquipped = savedNukeGunEquipped === 'true';
    }
    const savedUltimateNukeGunOwned = localStorage.getItem('shootingGameUltimateNukeGunOwned');
    if (savedUltimateNukeGunOwned !== null) {
        ultimateNukeGunOwned = savedUltimateNukeGunOwned === 'true';
    }
    const savedUltimateNukeGunEquipped = localStorage.getItem('shootingGameUltimateNukeGunEquipped');
    if (savedUltimateNukeGunEquipped !== null) {
        ultimateNukeGunEquipped = savedUltimateNukeGunEquipped === 'true';
    }
    const savedShotgunMinigunOwned = localStorage.getItem('shootingGameShotgunMinigunOwned');
    if (savedShotgunMinigunOwned !== null) {
        shotgunMinigunOwned = savedShotgunMinigunOwned === 'true';
    }
    const savedShotgunMinigunEquipped = localStorage.getItem('shootingGameShotgunMinigunEquipped');
    if (savedShotgunMinigunEquipped !== null) {
        shotgunMinigunEquipped = savedShotgunMinigunEquipped === 'true';
    }
    // Load drone ownership from localStorage
    const savedCompanionDronesOwned = localStorage.getItem('shootingGameCompanionDronesOwned');
    if (savedCompanionDronesOwned !== null) {
        companionDronesOwned = savedCompanionDronesOwned === 'true';
    }
    const savedCompanionDronesEquipped = localStorage.getItem('shootingGameCompanionDronesEquipped');
    if (savedCompanionDronesEquipped !== null) {
        companionDronesEquipped = savedCompanionDronesEquipped === 'true';
    }
    const savedDefenderDronesOwned = localStorage.getItem('shootingGameDefenderDronesOwned');
    if (savedDefenderDronesOwned !== null) {
        defenderDronesOwned = savedDefenderDronesOwned === 'true';
    }
    const savedDefenderDronesEquipped = localStorage.getItem('shootingGameDefenderDronesEquipped');
    if (savedDefenderDronesEquipped !== null) {
        defenderDronesEquipped = savedDefenderDronesEquipped === 'true';
    }
    // Audio initialization disabled to prevent any Web Audio overload or freezes.
    // document.addEventListener('click', initAudioContext, { once: true });
    // Load saved control mode
    const savedControlMode = localStorage.getItem('shootingGameControlMode');
    if (savedControlMode) controlMode = savedControlMode;
    initializeMobileControls();
});

function initializeMobileControls() {
    addMobileButtonControl('mobileLeft', 'ArrowLeft');
    addMobileButtonControl('mobileRight', 'ArrowRight');
    addMobileButtonControl('mobileUp', 'ArrowUp');
    addMobileButtonControl('mobileDown', 'ArrowDown');
    addMobileButtonControl('mobileShoot', ' ');
}

// Settings toggle
function toggleSettings() {
    if (gameRunning) {
        gamePaused = true;
        document.getElementById('settingsModal').style.display = 'block';
    } else {
        document.getElementById('settingsModal').style.display = 'block';
    }
    // show default settings page
    try { showSettingsPage(1); } catch (e) {}
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
    if (gamePaused) {
        gamePaused = false;
        update();
    }
}

// Show a specific settings page (1 = arrows/space, 2 = WASD/click)
function showSettingsPage(pageNum) {
    const p1 = document.getElementById('settingsPage1');
    const p2 = document.getElementById('settingsPage2');
    const p3 = document.getElementById('settingsPage3');
    const t1 = document.getElementById('settingsTab1');
    const t2 = document.getElementById('settingsTab2');
    const t3 = document.getElementById('settingsTab3');
    if (!p1 || !p2 || !p3) return;
    p1.style.display = 'none';
    p2.style.display = 'none';
    p3.style.display = 'none';
    if (t1) t1.classList.remove('activeTab');
    if (t2) t2.classList.remove('activeTab');
    if (t3) t3.classList.remove('activeTab');

    if (pageNum === 1) {
        p1.style.display = '';
        if (t1) t1.classList.add('activeTab');
        hideMobileControls();
    } else if (pageNum === 2) {
        p2.style.display = '';
        if (t2) t2.classList.add('activeTab');
        hideMobileControls();
    } else {
        p3.style.display = '';
        if (t3) t3.classList.add('activeTab');
        if (controlMode === 'mobile' && mobileControlsActivated && gameRunning) {
            showMobileControls();
        } else {
            hideMobileControls();
        }
    }
}

function onPressArrowControls() {
    // Enable Arrow Keys control mode and persist selection
    controlMode = 'arrows';
    mobileControlsActivated = false;
    localStorage.setItem('shootingGameControlMode', controlMode);
    hideMobileControls();
    try { alert('Control mode set to Arrow Keys + Space'); } catch (e) { console.log('Control mode set to Arrow Keys + Space'); }
}

function onPressButton() {
    // Enable WASD + click control mode and persist selection
    controlMode = 'wasd';
    mobileControlsActivated = false;
    localStorage.setItem('shootingGameControlMode', controlMode);
    hideMobileControls();
    try { alert('Control mode set to WASD + Click'); } catch (e) { console.log('Control mode set to WASD + Click'); }
}

function onPressMobileControls() {
    // Enable mobile control mode and persist selection
    controlMode = 'mobile';
    mobileControlsActivated = true;
    localStorage.setItem('shootingGameControlMode', controlMode);
    updateMobileControlVisibility();
    try { alert('Control mode set to Mobile Controls'); } catch (e) { console.log('Control mode set to Mobile Controls'); }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    const icon = document.getElementById('soundIcon');
    
    if (soundEnabled) {
        btn.textContent = '🔊 Sound: ON';
        btn.classList.remove('off');
        playAdventureMusic();
    } else {
        btn.textContent = '🔇 Sound: OFF';
        btn.classList.add('off');
        stopAdventureMusic();
    }
}

let currentOscillators = [];
let currentGains = [];
let currentMusicInterval = null;
let lastAudioTime = 0; // Rate limit audio playback
let page8Unlocked = false;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playAdventureMusic() {
    // Background music is disabled to avoid audio-related freezes.
    // This keeps the game running smoothly even when multiple sound events would occur.
    return;
}


function stopAdventureMusic() {
    // stop interval
    if (currentMusicInterval) {
        clearInterval(currentMusicInterval);
        currentMusicInterval = null;
    }

    // stop and disconnect oscillators and gain nodes
    currentOscillators.forEach(node => {
        try {
            if (node.stop) node.stop();
        } catch (e) {}
        try { node.disconnect(); } catch (e) {}
    });
    currentGains.forEach(g => {
        try { g.disconnect(); } catch (e) {}
    });
    currentOscillators = [];
    currentGains = [];
}

// Generate adventure music (kept for compatibility, but simplified)
function generateAdventureMusic() {
    // Music is now generated on demand via playAdventureMusic()
}

function playBackgroundMusic() {
    if (soundEnabled && !gameRunning) {
        playAdventureMusic();
    }
}

function stopBackgroundMusic() {
    stopAdventureMusic();
}

// Laser sound effect (disabled to prevent freeze during rapid fire)
function playLaserSound() {
    // Audio disabled to prevent resource exhaustion and freezing
    // when firing rapidly or with multiple drones
    return;
}

// Explosion sound effect
function playExplosionSound() {
    // Explosion audio disabled to avoid audio overload and freezing.
    return;
}

// Shop functionality
function toggleShop() {
    if (gameRunning) {
        return; // Don't allow shop during gameplay
    }
    
    currentShopPage = 1;
    page8Unlocked = false;
    document.getElementById('shopCoins').textContent = coins;
    document.getElementById('shopModal').style.display = 'block';
    displayShopPage(currentShopPage);
}

function closeShop() {
    page8Unlocked = false;
    document.getElementById('shopModal').style.display = 'none';
}

function displayShopPage(pageNum) {
    const items = shopPages[pageNum - 1];
    const container = document.getElementById('shopItemsContainer');
    container.innerHTML = '';

    if (pageNum === 8 && !page8Unlocked) {
        const header = document.createElement('div');
        header.style.color = '#ffd700';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '18px';
        header.style.marginBottom = '10px';
        header.textContent = '✨ Page 8';
        container.appendChild(header);

        const passwordBox = document.createElement('div');
        passwordBox.style.display = 'flex';
        passwordBox.style.flexDirection = 'column';
        passwordBox.style.gap = '8px';
        passwordBox.style.marginTop = '8px';
        passwordBox.innerHTML = `
            <label for="page8PasswordInput" style="color:#ffffff; font-size:14px;">Enter the password:</label>
            <input id="page8PasswordInput" type="password" placeholder="Password" style="padding:8px; border-radius:6px; border:1px solid #ffd700; background:#111; color:#fff;" />
            <button id="page8UnlockBtn" type="button" style="padding:8px; border:none; border-radius:6px; background:#ffd700; color:#111; font-weight:bold; cursor:pointer;">Unlock</button>
            <div id="page8PasswordMessage" style="color:#ffffff; font-size:13px;">Enter the password to continue.</div>
        `;
        container.appendChild(passwordBox);

        document.getElementById('page8UnlockBtn').onclick = () => {
            const input = document.getElementById('page8PasswordInput');
            const message = document.getElementById('page8PasswordMessage');
            if (input.value === '676767') {
                page8Unlocked = true;
                displayShopPage(pageNum);
            } else {
                message.textContent = 'Incorrect password. Try again.';
                message.style.color = '#ff6b6b';
            }
        };

        document.getElementById('prevBtn').style.display = pageNum === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = pageNum === shopPages.length ? 'none' : 'block';
        document.getElementById('shopPageIndicator').textContent = `Page ${pageNum} of ${shopPages.length}`;
        return;
    }

    items.forEach(item => {
        const button = document.createElement('button');
        button.className = 'shopItem';
        button.id = 'item-' + item.id;
        button.onclick = () => buyUpgrade(item.id);
        
        let displayText = item.description;
        
        // Check if weapon is already owned and update display
        if (item.isWeapon) {
            if (item.id === 'rifle' && rifleOwned) {
                displayText = 'Equip';
            } else if (item.id === 'shotgun' && shotgunOwned) {
                displayText = 'Equip';
            } else if (item.id === 'rocketLauncher' && rocketLauncherOwned) {
                displayText = 'Equip';
            } else if (item.id === 'minigun' && minigunOwned) {
                displayText = 'Equip';
            } else if (item.id === 'autoFlakCannon' && autoFlakCannonOwned) {
                displayText = 'Equip';
            } else if (item.id === 'nukeGun' && nukeGunOwned) {
                displayText = 'Equip';
            } else if (item.id === 'ultimateNukeGun' && ultimateNukeGunOwned) {
                displayText = 'Equip';
            } else if (item.id === 'shotgunMinigun' && shotgunMinigunOwned) {
                displayText = 'Equip';
            }
        }
        // Attachments page: show Equip/Equipped for silencer
        if (item.id === 'silencer') {
            if (silencerEquipped) {
                displayText = 'Equipped';
            } else if (silencerOwned) {
                displayText = 'Equip';
            }
        }
        if (item.id === 'grenadeLauncher') {
            if (grenadeLauncherEquipped) {
                displayText = 'Equipped';
            } else if (grenadeLauncherOwned) {
                displayText = 'Equip';
            }
        }
        // Drones page: show Equip/Equipped for drones
        if (item.id === 'companionDrones') {
            if (companionDronesEquipped) {
                displayText = 'Equipped';
            } else if (companionDronesOwned) {
                displayText = 'Equip';
            }
        }
        if (item.id === 'defenderDrones') {
            if (defenderDronesEquipped) {
                displayText = 'Equipped';
            } else if (defenderDronesOwned) {
                displayText = 'Equip';
            }
        }
        
        button.innerHTML = `
            <div class="itemName">${item.name}</div>
            <div class="itemPrice">${displayText}</div>
        `;
        container.appendChild(button);
    });
    
    // Update page indicator
    document.getElementById('shopPageIndicator').textContent = `Page ${pageNum} of ${shopPages.length}`;

    // If this is the attachments page, show an attachments header above items
    if (pageNum === 5) {
        const header = document.createElement('div');
        header.style.color = '#ffd700';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '18px';
        header.style.marginBottom = '10px';
        header.textContent = 'Attachments';
        container.prepend(header);
    }

    // If this is the drones page, show a drones header above items
    if (pageNum === 7) {
        const header = document.createElement('div');
        header.style.color = '#00aaff';
        header.style.fontWeight = 'bold';
        header.style.fontSize = '18px';
        header.style.marginBottom = '10px';
        header.textContent = '🤖 Drones';
        container.prepend(header);
    }

    document.getElementById('prevBtn').style.display = pageNum === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = pageNum === shopPages.length ? 'none' : 'block';
}

function nextShopPage() {
    if (currentShopPage < shopPages.length) {
        if (currentShopPage === 8) {
            page8Unlocked = false;
        }
        currentShopPage++;
        displayShopPage(currentShopPage);
    }
}

function previousShopPage() {
    if (currentShopPage > 1) {
        if (currentShopPage === 8) {
            page8Unlocked = false;
        }
        currentShopPage--;
        displayShopPage(currentShopPage);
    }
}

function buyUpgrade(type) {
    let cost = 0;
    let success = false;
    
    if (type === 'speed' && coins >= 50) {
        player.baseSpeed += 2;
        player.speed = player.baseSpeed;
        cost = 50;
        success = true;
    } else if (type === 'health') {
        // Health upgrade costs 50 coins
        if (coins >= 50) {
            health += 50;
            cost = 50;
            success = true;
        } else {
            // Not enough coins
            alert('Not enough coins!');
            return;
        }
    } else if (type === 'pistol') {
        // Pistol is equipped (free)
        // Unequip rifle if it's equipped
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Cost: 50 coins</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equipped</div>
            `;
            pistolBtn.style.opacity = '0.6';
            pistolBtn.disabled = true;
        }
        shootDelay = 1000; // Pistol: 1 second delay
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        return;
    } else if (type === 'rifle') {
        // Check if rifle needs to be purchased or just equipped
        if (!rifleOwned && coins >= 50) {
            // First time buying - charge coins
            rifleOwned = true;
            cost = 50;
            success = true;
            // Save rifle ownership to localStorage
            localStorage.setItem('shootingGameRifleOwned', 'true');
        } else if (rifleOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip pistol if it's equipped
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        shootDelay = 100; // Rifle shoots very fast (0.1 second delay)
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equipped</div>
            `;
            rifleBtn.style.opacity = '0.6';
            rifleBtn.disabled = true;
        }
    } else if (type === 'shotgun') {
        // Check if shotgun needs to be purchased or just equipped
        if (!shotgunOwned && coins >= 75) {
            // First time buying - charge coins
            shotgunOwned = true;
            cost = 75;
            success = true;
            // Save shotgun ownership to localStorage
            localStorage.setItem('shootingGameShotgunOwned', 'true');
        } else if (shotgunOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip pistol and rifle
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        shootDelay = 300; // Shotgun: 0.3 second delay
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equipped</div>
            `;
            shotgunBtn.style.opacity = '0.6';
            shotgunBtn.disabled = true;
        }
    } else if (type === 'rocketLauncher') {
        // Check if rocket launcher needs to be purchased or just equipped
        if (!rocketLauncherOwned && coins >= 100) {
            // First time buying - charge coins
            rocketLauncherOwned = true;
            cost = 100;
            success = true;
            // Save rocket launcher ownership to localStorage
            localStorage.setItem('shootingGameRocketLauncherOwned', 'true');
        } else if (rocketLauncherOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip all other weapons
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }
        
        shootDelay = 500; // Rocket launcher: 0.5 second delay
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equipped</div>
            `;
            rocketBtn.style.opacity = '0.6';
            rocketBtn.disabled = true;
        }
    } else if (type === 'minigun') {
        // Check if minigun needs to be purchased or just equipped
        if (!minigunOwned && coins >= 150) {
            // First time buying - charge coins
            minigunOwned = true;
            cost = 150;
            success = true;
            // Save minigun ownership to localStorage
            localStorage.setItem('shootingGameMinigunOwned', 'true');
        } else if (minigunOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip all other weapons
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }
        
        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn && rocketBtn.disabled) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equip</div>
            `;
            rocketBtn.style.opacity = '1';
            rocketBtn.disabled = false;
        }
        
        shootDelay = 2; // Minigun: 2ms delay (500 rounds per second)
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const minigunBtn = document.getElementById('item-minigun');
        if (minigunBtn) {
            minigunBtn.innerHTML = `
                <div class="itemName">Minigun</div>
                <div class="itemPrice">Equipped</div>
            `;
            minigunBtn.style.opacity = '0.6';
            minigunBtn.disabled = true;
        }
    } else if (type === 'grenadeLauncher') {
        // Purchase or toggle equip for grenade launcher
        if (!grenadeLauncherOwned) {
            if (coins >= 80) {
                grenadeLauncherOwned = true;
                grenadeLauncherEquipped = true; // auto-equip on purchase
                cost = 80;
                success = true;
                localStorage.setItem('shootingGameGrenadeLauncherOwned', 'true');
                localStorage.setItem('shootingGameGrenadeLauncherEquipped', 'true');
            } else {
                alert('Not enough coins!');
                return;
            }
        } else {
            // Toggle equip state
            grenadeLauncherEquipped = !grenadeLauncherEquipped;
            success = true;
            localStorage.setItem('shootingGameGrenadeLauncherEquipped', grenadeLauncherEquipped ? 'true' : 'false');
        }

        // Update button display if present
        const gBtn = document.getElementById('item-grenadeLauncher');
        if (gBtn) {
            gBtn.innerHTML = `
                <div class="itemName">Grenade Launcher</div>
                <div class="itemPrice">${grenadeLauncherEquipped ? 'Equipped' : 'Equip'}</div>
            `;
            gBtn.style.opacity = grenadeLauncherEquipped ? '0.6' : '1';
            gBtn.disabled = false; // keep clickable to toggle
        }
        // reset ammo when bought
        if (grenadeLauncherOwned) grenadeAmmo = grenadeMaxAmmo;
    } else if (type === 'silencer') {
        // Purchase or toggle equip for silencer
        if (!silencerOwned) {
            if (coins >= 25) {
                silencerOwned = true;
                silencerEquipped = true; // auto-equip on purchase
                cost = 25;
                success = true;
                localStorage.setItem('shootingGameSilencerOwned', 'true');
                localStorage.setItem('shootingGameSilencerEquipped', 'true');
            } else {
                alert('Not enough coins!');
                return;
            }
        } else {
            // Toggle equip state
            silencerEquipped = !silencerEquipped;
            success = true;
            localStorage.setItem('shootingGameSilencerEquipped', silencerEquipped ? 'true' : 'false');
        }

        // Update button display if present
        const silBtn = document.getElementById('item-silencer');
        if (silBtn) {
            silBtn.innerHTML = `
                <div class="itemName">Silencer</div>
                <div class="itemPrice">${silencerEquipped ? 'Equipped' : 'Equip'}</div>
            `;
            silBtn.style.opacity = silencerEquipped ? '0.6' : '1';
            silBtn.disabled = false; // keep it clickable for toggling
        }
    } else if (type === 'autoFlakCannon') {
        // Check if auto flak cannon needs to be purchased or just equipped
        if (!autoFlakCannonOwned && coins >= 200) {
            // First time buying - charge coins
            autoFlakCannonOwned = true;
            cost = 200;
            success = true;
            // Save auto flak cannon ownership to localStorage
            localStorage.setItem('shootingGameAutoFlakCannonOwned', 'true');
        } else if (autoFlakCannonOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip all other weapons
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }
        
        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn && rocketBtn.disabled) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equip</div>
            `;
            rocketBtn.style.opacity = '1';
            rocketBtn.disabled = false;
        }
        
        const minigunBtn = document.getElementById('item-minigun');
        if (minigunBtn && minigunBtn.disabled) {
            minigunBtn.innerHTML = `
                <div class="itemName">Minigun</div>
                <div class="itemPrice">Equip</div>
            `;
            minigunBtn.style.opacity = '1';
            minigunBtn.disabled = false;
        }
        
        // Note: Auto flak cannon is passive and doesn't use shootDelay like other weapons
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const flakBtn = document.getElementById('item-autoFlakCannon');
        if (flakBtn) {
            flakBtn.innerHTML = `
                <div class="itemName">Auto Flak Cannon</div>
                <div class="itemPrice">Equipped</div>
            `;
            flakBtn.style.opacity = '0.6';
            flakBtn.disabled = true;
        }
    } else if (type === 'nukeGun') {
        // Check if nuke gun needs to be purchased or just equipped
        if (!nukeGunOwned && coins >= 1000) {
            // First time buying - charge coins
            nukeGunOwned = true;
            cost = 1000;
            success = true;
            // Save nuke gun ownership to localStorage
            localStorage.setItem('shootingGameNukeGunOwned', 'true');
        } else if (nukeGunOwned) {
            // Already owned - just equip it free
            success = true;
        } else {
            // Not owned and not enough coins
            alert('Not enough coins!');
            return;
        }
        
        // Unequip all other weapons
        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }
        
        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }
        
        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }
        
        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn && rocketBtn.disabled) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equip</div>
            `;
            rocketBtn.style.opacity = '1';
            rocketBtn.disabled = false;
        }
        
        const minigunBtn = document.getElementById('item-minigun');
        if (minigunBtn && minigunBtn.disabled) {
            minigunBtn.innerHTML = `
                <div class="itemName">Minigun</div>
                <div class="itemPrice">Equip</div>
            `;
            minigunBtn.style.opacity = '1';
            minigunBtn.disabled = false;
        }
        
        const flakBtn = document.getElementById('item-autoFlakCannon');
        if (flakBtn && flakBtn.disabled) {
            flakBtn.innerHTML = `
                <div class="itemName">Auto Flak Cannon</div>
                <div class="itemPrice">Equip</div>
            `;
            flakBtn.style.opacity = '1';
            flakBtn.disabled = false;
        }
        
        shootDelay = 1000; // Nuke gun: 1 second delay
        nukeGunEquipped = true;
        ultimateNukeGunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'true');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        const nukeBtn = document.getElementById('item-nukeGun');
        if (nukeBtn) {
            nukeBtn.innerHTML = `
                <div class="itemName">Nuke Gun</div>
                <div class="itemPrice">Equipped</div>
            `;
            nukeBtn.style.opacity = '0.6';
            nukeBtn.disabled = true;
        }
    } else if (type === 'ultimateNukeGun') {
        if (!ultimateNukeGunOwned && coins >= 10000) {
            ultimateNukeGunOwned = true;
            cost = 10000;
            success = true;
            localStorage.setItem('shootingGameUltimateNukeGunOwned', 'true');
        } else if (ultimateNukeGunOwned) {
            success = true;
        } else {
            alert('Not enough coins!');
            return;
        }

        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }

        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }

        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }

        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn && rocketBtn.disabled) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equip</div>
            `;
            rocketBtn.style.opacity = '1';
            rocketBtn.disabled = false;
        }

        const minigunBtn = document.getElementById('item-minigun');
        if (minigunBtn && minigunBtn.disabled) {
            minigunBtn.innerHTML = `
                <div class="itemName">Minigun</div>
                <div class="itemPrice">Equip</div>
            `;
            minigunBtn.style.opacity = '1';
            minigunBtn.disabled = false;
        }

        const flakBtn = document.getElementById('item-autoFlakCannon');
        if (flakBtn && flakBtn.disabled) {
            flakBtn.innerHTML = `
                <div class="itemName">Auto Flak Cannon</div>
                <div class="itemPrice">Equip</div>
            `;
            flakBtn.style.opacity = '1';
            flakBtn.disabled = false;
        }

        const nukeBtn = document.getElementById('item-nukeGun');
        if (nukeBtn && nukeBtn.disabled) {
            nukeBtn.innerHTML = `
                <div class="itemName">Nuke Gun</div>
                <div class="itemPrice">Equip</div>
            `;
            nukeBtn.style.opacity = '1';
            nukeBtn.disabled = false;
        }

        shootDelay = 1200;
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = true;
        shotgunMinigunEquipped = false;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'true');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'false');
        const ultimateBtn = document.getElementById('item-ultimateNukeGun');
        if (ultimateBtn) {
            ultimateBtn.innerHTML = `
                <div class="itemName">Ultimate Nuke Gun (UNG)</div>
                <div class="itemPrice">Equipped</div>
            `;
            ultimateBtn.style.opacity = '0.6';
            ultimateBtn.disabled = true;
        }
    } else if (type === 'shotgunMinigun') {
        if (!shotgunMinigunOwned && coins >= 15000) {
            shotgunMinigunOwned = true;
            cost = 15000;
            success = true;
            localStorage.setItem('shootingGameShotgunMinigunOwned', 'true');
        } else if (shotgunMinigunOwned) {
            success = true;
        } else {
            alert('Not enough coins!');
            return;
        }

        const pistolBtn = document.getElementById('item-pistol');
        if (pistolBtn && pistolBtn.disabled) {
            pistolBtn.innerHTML = `
                <div class="itemName">Pistol</div>
                <div class="itemPrice">Equip</div>
            `;
            pistolBtn.style.opacity = '1';
            pistolBtn.disabled = false;
        }

        const rifleBtn = document.getElementById('item-rifle');
        if (rifleBtn && rifleBtn.disabled) {
            rifleBtn.innerHTML = `
                <div class="itemName">Rifle</div>
                <div class="itemPrice">Equip</div>
            `;
            rifleBtn.style.opacity = '1';
            rifleBtn.disabled = false;
        }

        const shotgunBtn = document.getElementById('item-shotgun');
        if (shotgunBtn && shotgunBtn.disabled) {
            shotgunBtn.innerHTML = `
                <div class="itemName">Shotgun</div>
                <div class="itemPrice">Equip</div>
            `;
            shotgunBtn.style.opacity = '1';
            shotgunBtn.disabled = false;
        }

        const rocketBtn = document.getElementById('item-rocketLauncher');
        if (rocketBtn && rocketBtn.disabled) {
            rocketBtn.innerHTML = `
                <div class="itemName">Rocket Launcher</div>
                <div class="itemPrice">Equip</div>
            `;
            rocketBtn.style.opacity = '1';
            rocketBtn.disabled = false;
        }

        const minigunBtn = document.getElementById('item-minigun');
        if (minigunBtn && minigunBtn.disabled) {
            minigunBtn.innerHTML = `
                <div class="itemName">Minigun</div>
                <div class="itemPrice">Equip</div>
            `;
            minigunBtn.style.opacity = '1';
            minigunBtn.disabled = false;
        }

        const flakBtn = document.getElementById('item-autoFlakCannon');
        if (flakBtn && flakBtn.disabled) {
            flakBtn.innerHTML = `
                <div class="itemName">Auto Flak Cannon</div>
                <div class="itemPrice">Equip</div>
            `;
            flakBtn.style.opacity = '1';
            flakBtn.disabled = false;
        }

        const nukeBtn = document.getElementById('item-nukeGun');
        if (nukeBtn && nukeBtn.disabled) {
            nukeBtn.innerHTML = `
                <div class="itemName">Nuke Gun</div>
                <div class="itemPrice">Equip</div>
            `;
            nukeBtn.style.opacity = '1';
            nukeBtn.disabled = false;
        }

        shootDelay = 2;
        nukeGunEquipped = false;
        ultimateNukeGunEquipped = false;
        shotgunMinigunEquipped = true;
        localStorage.setItem('shootingGameNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameUltimateNukeGunEquipped', 'false');
        localStorage.setItem('shootingGameShotgunMinigunEquipped', 'true');
        const smBtn = document.getElementById('item-shotgunMinigun');
        if (smBtn) {
            smBtn.innerHTML = `
                <div class="itemName">Shotgun Minigun (SM)</div>
                <div class="itemPrice">Equipped</div>
            `;
            smBtn.style.opacity = '0.6';
            smBtn.disabled = true;
        }
    } else if (type === 'companionDrones') {
        // Purchase companion drones
        if (!companionDronesOwned && coins >= 300) {
            companionDronesOwned = true;
            companionDronesEquipped = true;
            companionDroneCount = 2;
            cost = 300;
            success = true;
            localStorage.setItem('shootingGameCompanionDronesOwned', 'true');
            localStorage.setItem('shootingGameCompanionDronesEquipped', 'true');
        } else if (companionDronesOwned) {
            // Toggle equip
            companionDronesEquipped = !companionDronesEquipped;
            success = true;
            localStorage.setItem('shootingGameCompanionDronesEquipped', companionDronesEquipped ? 'true' : 'false');
        } else {
            alert('Not enough coins!');
            return;
        }
        
        // Update button display
        const cBtn = document.getElementById('item-companionDrones');
        if (cBtn) {
            cBtn.innerHTML = `
                <div class="itemName">Companion Drones (2x)</div>
                <div class="itemPrice">${companionDronesEquipped ? 'Equipped' : 'Equip'}</div>
            `;
            cBtn.style.opacity = companionDronesEquipped ? '0.6' : '1';
        }
    } else if (type === 'defenderDrones') {
        // Purchase defender drones
        if (!defenderDronesOwned && coins >= 400) {
            defenderDronesOwned = true;
            defenderDronesEquipped = true;
            defenderDroneCount = 2;
            cost = 400;
            success = true;
            localStorage.setItem('shootingGameDefenderDronesOwned', 'true');
            localStorage.setItem('shootingGameDefenderDronesEquipped', 'true');
        } else if (defenderDronesOwned) {
            // Toggle equip
            defenderDronesEquipped = !defenderDronesEquipped;
            success = true;
            localStorage.setItem('shootingGameDefenderDronesEquipped', defenderDronesEquipped ? 'true' : 'false');
        } else {
            alert('Not enough coins!');
            return;
        }
        
        // Update button display
        const dBtn = document.getElementById('item-defenderDrones');
        if (dBtn) {
            dBtn.innerHTML = `
                <div class="itemName">Defender Turrets (2x)</div>
                <div class="itemPrice">${defenderDronesEquipped ? 'Equipped' : 'Equip'}</div>
            `;
            dBtn.style.opacity = defenderDronesEquipped ? '0.6' : '1';
        }
    }
    
    if (success) {
        if (cost > 0) {
            coins -= cost;
        }
        document.getElementById('shopCoins').textContent = coins;
        updateUI();
        alert('Upgrade purchased!');
    } else {
        alert('Not enough coins!');
    }
}