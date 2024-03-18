const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const paused = "paused"
const running = "running"
const stopped = "stopped"
const inMenu = "inMenu"
const inGame = "inGame"

var gameState = paused
var userCurrentState = inMenu

var stopWaveNum;
var stopFinalWave;

var randOneToTen;

function changeGameState(input) {
    if(input == paused){gameState = paused}
    if(input == running && gameState != running){gameState = running; tick()}
    if(input == stopped){gameState = stopped}
}

canvas.width = 1376;
canvas.height = 768;
canvas.addEventListener("contextmenu", (e) => {e.preventDefault()});

const collisionsMap = []
for (var i = 0; i < collisions.length; i += 100) {
    collisionsMap.push(collisions.slice(i, i + 100))
}

const offset = {
    x: -3266,
    y: -700
}
var boundaries = []

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol == 1610612777) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const playerHitSFX = new Sound(false)
playerHitSFX.sound.src = './sfx/player-hit.mp3'
const backgroundMusicGeneral = new Sound(true)
backgroundMusicGeneral.sound.src = './sfx/background-music-general.mp3'
const backgroundMusicGame = new Sound(true)
backgroundMusicGame.sound.src = './sfx/background-music-game.mp3'
const buttonPlaySFX = new Sound(false)
buttonPlaySFX.sound.src = './sfx/button-play.mp3'
const buttonHoverSFX = new Sound(false)
buttonHoverSFX.sound.src = './sfx/button-hover.mp3'
const gunShootSFX = new Sound(false)
gunShootSFX.sound.src = './sfx/gun-shoot.mp3'
const ghostDeathSFX = new Sound(false)
ghostDeathSFX.sound.src = './sfx/ghost-death.mp3'

playerHitSFX.sound.addEventListener('ended', () =>{
    playerHitSFX.isPlaying = false
})
backgroundMusicGeneral.sound.addEventListener('ended', () =>{
    backgroundMusicGeneral.isPlaying = false
})
backgroundMusicGame.sound.addEventListener('ended', () =>{
    backgroundMusicGame.isPlaying = false
})
buttonPlaySFX.sound.addEventListener('ended', () =>{
    buttonPlaySFX.isPlaying = false
})
buttonHoverSFX.sound.addEventListener('ended', () =>{
    buttonHoverSFX.isPlaying = false
})
gunShootSFX.sound.addEventListener('ended', () =>{
    gunShootSFX.isPlaying = false
})
ghostDeathSFX.sound.addEventListener('ended', () =>{
    ghostDeathSFX.isPlaying = false
})

function backgroundMusicPlay(type) {
    if(type == 'new'){
        backgroundMusicGame.sound.currentTime = 0
        backgroundMusicGeneral.sound.currentTime = 0
    }
    if(userCurrentState == inMenu){
        backgroundMusicGame.isMuted = true
        backgroundMusicGeneral.isMuted = false
        backgroundMusicGame.update()
        backgroundMusicGeneral.update()
    }
    if(userCurrentState == inGame) {
        backgroundMusicGame.isMuted = false
        backgroundMusicGeneral.isMuted = true
        backgroundMusicGame.update()
        backgroundMusicGeneral.update()
    }
    if(backgroundMusicGame.isPlaying == false && backgroundMusicGeneral.isPlaying == false){
        backgroundMusicGame.play()
        backgroundMusicGeneral.play()
    }
}

function buttonHoverSFXFunc() {
    buttonHoverSFX.sound.volume = 0.2
    buttonHoverSFX.overPlay()
}
function buttonClickSFXFunc() {
    buttonPlaySFX.sound.volume = 0.2
    buttonPlaySFX.overPlay()
}

const image = new Image();
image.src = './assets/map.png';

const mapBackgroundImage = new Image();
mapBackgroundImage.src = './assets/mapBG.png'

const playerImage = new Image();
playerImage.src = './assets/charachter.png';

const weaponImage = new Image();
weaponImage.src = './assets/shuttle.png'

const bulletImage = new Image();
bulletImage.src = './assets/bullet.png'

const ghostImage = new Image();
ghostImage.src = './assets/ghost.png';

const player = new Sprite ({
    position: {
        x: canvas.width / 2 - 248 / 5,
        y: canvas.height / 2 - 512 / 7
    },
    image: playerImage,
    frames : {
        max: 32
    }
})

const weapon = new Weapon ({
    position: {
        x: canvas.width / 2 - 248 / 5 + 40,
        y: canvas.height / 2 - 512 / 7 + 40 
    },
    image: weaponImage,
})

var playerHealthCurrent = 3
const playerHealthMax = 3

var playerHealth = new Text ({
    position: {
        x: (canvas.width)/100  ,
        y: (canvas.height)/20
    },
    input: "Player Health: " + playerHealthCurrent + "/" + playerHealthMax,
    font: "48px VT323",
    color: "#777",
    alignment: "left"
})
var waveNumber = new Text ({
    position: {
        x: (canvas.width)/2  ,
        y: (canvas.height)/20
    },
    input: " ",
    font: "48px VT323",
    color: "#777",
    alignment: "left"
})
var magCapacity = new Text ({
    position: {
        x: (canvas.width)/100  ,
        y: (canvas.height)/10
    },
    input: "Magazine: " + currentAmmo + "/" + totalAmmo,
    font: "48px VT323",
    color: "#777",
    alignment: "left"
})

const background = new Sprite(
    {
        position: {
            x: offset.x,
            y: offset.y
        },
        image: image
    }
)

const mapBackground = new Sprite(
    {
        position: {
            x: offset.x,
            y: offset.y
        },
        image: mapBackgroundImage,
        frames: {
            max: 1
        },
        scaleFactor: 5
    }
)

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
    q: {
        pressed: false
    }
}

var blockInput = false
var speed = 4;
var playerSpeed = speed;
var ghostSpeed = Math.sqrt(2*(speed-2)*(speed-2)) / 1.5;
var bulletSpeed = speed + 10
var ghostList = []
var bulletList = []
var particles = []

var movables = [background, ...boundaries, ...ghostList, ...particles]

function rectangularCollision({rectangle1, rectangle2}) {
    return(
        rectangle1.position.x + (rectangle1.width * 0.9) >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + (rectangle1.height * 0.9) >= rectangle2.position.y
    )
}

var dontSpamRC=0;
var totalAmmo=10;
var currentAmmo=totalAmmo;
var sig=0;
var bulletInterval=1400;
var reloadSpeed=3500;
var bgAnimation;
var invincibility;
var waveGhost=0;
var counterStart=0;
var spawnGhostTime=3000;
var killCounter=0;
var altCurrentAmmo;

function invinc(){
    playerHealthCurrent=playerHealthMax*11;
    informationChecker();
}

function popupBackround(eventBg){
    if(eventBg=="start"){
        bgAnimation=setInterval(createNewGhost,750);
        invincibility=setInterval(invinc,1);
        
    }
    if(eventBg=="stop"){
        clearInterval(bgAnimation);
        clearInterval(invincibility);
    }

}

function shootBullet(){
    if(blockInput == true){ return }
    if(currentAmmo>0){
        if (sig==0&&currentAmmo!=0){
            if(userCurrentState == inGame){ gunShootSFX.overPlay() }
            spawnBullet();
            sig++;
            setTimeout(sigChange,bulletInterval);
            currentAmmo--;
            magCapacity = new Text ({
                position: {
                    x: (canvas.width)/100  ,
                    y: (canvas.height)/10
                },
                input: "Magazine: " + currentAmmo + "/" + totalAmmo,
                font: "48px VT323",
                color: "#777",
                alignment: "left"
            })
        }
    }
    else if (currentAmmo==0){
        currentAmmo="Reloading...";
        magCapacity = new Text ({
            position: {
                x: (canvas.width)/100  ,
                y: (canvas.height)/10
            },
            input: "Magazine: " + currentAmmo,
            font: "48px VT323",
            color: "#777",
            alignment: "left"
        })
        setTimeout(reload,reloadSpeed);
    }
}

var reach100 = new Text ({
    position: {
        x: (canvas.width)/2.2  ,
        y: (canvas.height)/10
    },
    input: " ",
    font: "57px VT323",
    color: "#777",
    alignment: "left"
})
var displayRandomUpgrade = new Text ({
    position: {
        x: (canvas.width)/2.2  ,
        y: (canvas.height)/10
    },
    input: " ",
    font: "57px VT323",
    color: "#777",
    alignment: "left"
})

function displayWeaponIsUpgraded(){
    if(randOneToTen<=6){
        displayRandomUpgrade = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "BULLET INTERVAL UPGRADED",
            font: "57px VT323",
            color: "green",
            alignment: "left"
        })
        bulletInterval-=100;
    }
    if(randOneToTen>6&&randOneToTen<=8){
        displayRandomUpgrade = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "RELOAD SPEED REDUCED",
            font: "57px VT323",
            color: "green",
            alignment: "left"
        })
        reloadSpeed-=250;
    }
    if(randOneToTen>8&&randOneToTen<=9){
        displayRandomUpgrade = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "MAGAZINE CAPACITY UPGRADED",
            font: "57px VT323",
            color: "green",
            alignment: "left"
    })
    totalAmmo++;
    }
    if(randOneToTen>9&&randOneToTen<=9.9){
        displayRandomUpgrade = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "PLAYER SPEED BOOSTED",
            font: "57px VT323",
            color: "green",
            alignment: "left"
    })
    playerSpeed=playerSpeed*1.15;
    }
    if(randOneToTen>9.9){
        displayRandomUpgrade = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "+1 LIFE",
            font: "57px VT323",
            color: "red",
            alignment: "left"
    })
    playerSpeed=playerSpeed*1.08;
    }
}
function stopDisplayWeaponIsUpgraded(){
    displayRandomUpgrade = new Text ({
        position: {
            x: (canvas.width)/2.2  ,
            y: (canvas.height)/10
        },
        input: " ",
        font: "57px VT323",
        color: "green",
        alignment: "left"
    })
}

function sigChange(){
    sig--;
}

function reload(){
    currentAmmo=totalAmmo;
    dontSpamRC--;
    magCapacity = new Text ({
        position: {
            x: (canvas.width)/100  ,
            y: (canvas.height)/10
        },
        input: "Magazine: " + currentAmmo + "/" + totalAmmo,
        font: "48px VT323",
        color: "#777",
        alignment: "left"
    })
}

function fastReload(){
    if(dontSpamRC==0){
        dontSpamRC++;
        if(currentAmmo!=totalAmmo){
            altCurrentAmmo=currentAmmo;
            currentAmmo="Reloading...";
            magCapacity = new Text ({
                position: {
                    x: (canvas.width)/100  ,
                    y: (canvas.height)/10
                },
                input: "Magazine: " + currentAmmo,
                font: "48px VT323",
                color: "#777",
                alignment: "left"
            })
            setTimeout(reload,reloadSpeed+(altCurrentAmmo*40));
        }
    }
}

var displayKill = new Text ({
    position: {
        x: (canvas.width)/100  ,
        y: (canvas.height)/10
    },
    input: "Kills: " + killCounter,
    font: "48px VT323",
    color: "#777",
    alignment: "left"
})


function createNewGhost() {
    var x = Math.floor((Math.random() * (player.position.x )) + (player.position.x - 1));
    var y = Math.floor((Math.random() * (player.position.y )) + (player.position.y - 1));
    if(Math.floor((Math.random() * 10) + 1) > 5) {
        x -= x*2
    }
    if(Math.floor((Math.random() * 10) + 1) < 5) {
        y -= y*2
    }
    var newGhost = new Enemy({
        position: {
            x: x,
            y: y
        },
        image: ghostImage,
        frames: {
            max: 32
        },
        indexInList: ghostList.length
    });

    ghostList.push(newGhost);

    movables = [background, ...boundaries, ...ghostList, ...particles]
}

var cursor = { x: 0, y: 0 };

function updateWeaponRotation() {
    var dx = cursor.x - (player.position.x + player.width / 2);
    var dy = cursor.y - (player.position.y + player.height / 2);
    var angle = Math.atan2(dy, dx);

    weapon.rotation = angle;
}

function spawnBullet() {
    var newBullet = new Bullet ({
        position: {
            x: canvas.width / 2 - 248 / 5,
            y: canvas.height / 2 - 512 / 7
        },
        image: bulletImage,
        indexInList: bulletList.length
    });

    bulletList.push(newBullet);
    bulletList[bulletList.length - 1].cursorX = cursor.x
    bulletList[bulletList.length - 1].cursorY = cursor.y

    movables = [background, ...boundaries, ...ghostList, ...particles]
}

function checkBulletCollision(bulletSpeed, bullet, ghost) {
    if(ghost.isSpawning){ return }
    var dx = ghost.position.x - bullet.position.x;
    var dy = ghost.position.y - bullet.position.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    var velocityX = (dx / distance) * bulletSpeed;
    var velocityY = (dy / distance) * bulletSpeed;
        
    if (Math.floor(Math.abs(dx) / 50) <= Math.floor(Math.abs(velocityX) / 50) && Math.floor(Math.abs(dy) / 50) <= Math.floor(Math.abs(velocityY) / 50)) {
        bullet.isDead = true
        ghost.isDead = true
        killCounter++;
        ghostDeathSFX.sound.volume = 0.7
        ghostDeathSFX.overPlay()
    }
}
var stopWaveNum;
var stopFinalWave;
var stopWaveStack;
var stopWaveStackToo;
var autoSpawnGhost;
var autoWave;
var onceOnly=1;
var onlyOnceVictor=0;

function startGame(){
    userCurrentState = inGame
    resetPlayerPos()
    backgroundMusicPlay('new')
    changeGameState(running)
    blockInput = false
    counterStart=1;
    resetValues();
    stopWaveStack=setTimeout(waveStart,4000);
    stopWaveStackToo=setTimeout(gameGame,4000);
    closePopup("popupGameStart");
}
function resetPlayerPos() {
    boundaries = []
    particles = []
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    movables.forEach(element => {
        element.position.x = offset.x
        element.position.y = offset.y
    });
    collisionsMap.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol == 1610612777) {
                boundaries.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y
                        }
                    })
                )
            }
        })
    })
    movables = [background, ...boundaries, ...ghostList, ...particles]
    player.frames.val = 0
    player.movedCheck = this.movingDirection
}
function resetGame(popupId){
    unPause();
    counterStart=0;
    informationChecker();
    closePopup(popupId);
    startGame();
}
function resetValues(){
    stopWaveNumberDisplay();
    stopAutoSpawnGhost();
    stopWeaponUpgradeDisplay();
    clearTimeout(stopFinalWave);
    clearTimeout(stopWaveNum);
    clearTimeout(stopWaveStack);
    clearTimeout(stopWaveStackToo);
    clearInterval(autoWave);
    clearInterval(autoSpawnGhost);
    bulletSpeed = speed + 20;
    onceOnly=1;
    killCounter=0;
    onlyOnceVictor=0;
    spawnGhostTime=3000;
    playerHealthCurrent = playerHealthMax;
    ghostList=[];
    waveGhost=0;
    dontSpamRC=0;
    totalAmmo=10;
    currentAmmo=totalAmmo;
    sig=0;
    bulletInterval=1400;
    reloadSpeed=3500
    playerSpeed=speed;
}
function gameGame(){
    if(counterStart==1){
        autoWave=setInterval(waveStart, 30000);
    }
}
function waveNumberDisplay(){
        if (waveGhost<10){
            waveNumber = new Text ({
                position: {
                    x: (canvas.width)/2.2  ,
                    y: (canvas.height)/20
                },
                input: "WAVE " + waveGhost,
                font: "57px VT323",
                color: "#777",
                alignment: "left"
            })
        }
        if (waveGhost==10){
            waveNumber = new Text ({
                position: {
                    x: (canvas.width)/2.2  ,
                    y: (canvas.height)/20
                },
                input: "FINAL WAVE",
                font: "57px VT323",
                color: "#777",
                alignment: "left"
            })
        }
            }
function stopWaveNumberDisplay(){
        waveNumber = new Text ({
            position: {
                x: (canvas.width)/2  ,
                y: (canvas.height)/20
            },
            input: " ",
            font: "57px VT323",
            color: "#777",
            alignment: "left"
        })
    }
    function weaponUpgradeDisplay(){
        if(killCounter==100){
            reach100 = new Text ({
                position: {
                    x: (canvas.width)/2.2  ,
                    y: (canvas.height)/10
                },
                input: "100 KILLS ACQUIRED, WEAPON AND MOVEMENT UPGRADED",
                font: "57px VT323",
                color: "aquamarine",
                alignment: "left"
            })
        }
    }
    function stopWeaponUpgradeDisplay(){
        reach100 = new Text ({
            position: {
                x: (canvas.width)/2.2  ,
                y: (canvas.height)/10
            },
            input: "",
            font: "57px VT323",
            color: "#777",
            alignment: "left"
        })
    }

function waveStart(){
    if(waveGhost<9){
        waveGhost++;
        spawnGhostTime-=250;
        clearInterval(autoSpawnGhost);
        autoSpawnGhost=setInterval(createNewGhost, spawnGhostTime);
        ghostSpeed = (speed) / 2.5 + (waveGhost)/4;
        waveNumberDisplay();
        stopWaveNum=setTimeout(stopWaveNumberDisplay,3000);
        if(waveGhost!=1){
            randOneToTen=Math.random()*10;
            displayWeaponIsUpgraded();
            setTimeout(stopDisplayWeaponIsUpgraded, 3000)
        }
    }
    if(waveGhost==9){
        waveGhost++;
        spawnGhostTime=spawnGhostTime/1.6; 
        clearInterval(autoSpawnGhost)
        autoSpawnGhost=setInterval(createNewGhost, spawnGhostTime);
        ghostSpeed=ghostSpeed*1.1;
        waveNumberDisplay(); 
        stopWaveNum=setTimeout(stopWaveNumberDisplay,3000);  
        randOneToTen=Math.random()*10;
        displayWeaponIsUpgraded();
        setTimeout(stopDisplayWeaponIsUpgraded, 3000)    
    }
    if(waveGhost==10){
        waveGhost++;
        stopFinalWave=setTimeout(stopAutoSpawnGhost,30000)
        randOneToTen=Math.random()*10;
        displayWeaponIsUpgraded();
        setTimeout(stopDisplayWeaponIsUpgraded, 3000)
    }
}
function stopAutoSpawnGhost(){
    clearInterval(autoSpawnGhost);
}
setInterval(checker, 10);
function checker(){
    if (waveGhost==10||playerHealthCurrent==0){
        counterStart=0;
        clearInterval(autoWave);
        closingHUD('popupGameOver');
    }
    if(waveGhost>10&&ghostList.length===0&&onlyOnceVictor==0){
        counterStart=0;
        closingHUD('popupGameOver');
        onlyOnceVictor++;
    }
    informationChecker();
}
function informationChecker(){
    playerHealth = new Text ({
        position: {
            x: (canvas.width)/100  ,
            y: (canvas.height)/20
        },
        input: "Player Health: " + playerHealthCurrent + "/" + playerHealthMax,
        font: "48px VT323",
        color: "#777",
        alignment: "left"
    })
    if(currentAmmo>0){
        if (sig==0&&currentAmmo!=0){
            magCapacity = new Text ({
                position: {
                    x: (canvas.width)/100  ,
                    y: (canvas.height)/10
                },
                input: "Magazine: " + currentAmmo + "/" + totalAmmo,
                font: "48px VT323",
                color: "#777",
                alignment: "left"
            })
        }
    }
    else if (currentAmmo==0){
        magCapacity = new Text ({
            position: {
                x: (canvas.width)/100  ,
                y: (canvas.height)/10
            },
            input: "Magazine: " + currentAmmo,
            font: "48px VT323",
            color: "#777",
            alignment: "left"
        })
    }
     displayKill = new Text ({
        position: {
            x: (canvas.width)/100  ,
            y: (canvas.height)/6.5
        },
        input: "Kills: " + killCounter,
        font: "48px VT323",
        color: "#777",
        alignment: "left"
    })
    if(killCounter==100&&onceOnly==1){
        weaponUpgrades();
        onceOnly++;
    }

}
var oneTimeUseBlock = false

function startingHUD(popupId, runAmount){
    if(oneTimeUseBlock && runAmount == 'once') { return }
    if(runAmount == 'once'){
        oneTimeUseBlock = true
    }
    userCurrentState = inMenu
    changeGameState(paused)
    document.getElementById('canvas').style.opacity = 1
    document.getElementById('canvas').style.transform = 'scale(0)';
    window.setTimeout(function(){
        document.getElementById('canvas').style.display = 'none';
    },700);
    counterStart=0;
    backgroundMusicPlay('new')
    document.getElementById('pleaseClick').style.display = 'none'
    var overlay = document.getElementById(popupId);
    overlay.style.display = 'block';
    setTimeout(function() {
        overlay.style.opacity = '1';
        overlay.querySelector('.popup').style.opacity = '1';
        overlay.querySelector('.popup').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    popupBackround("start");
}
function closingHUD(popupId){
    userCurrentState = inMenu
    blockInput = true
    backgroundMusicPlay()
    ghostDeathSFX.pause()
    var overlay = document.getElementById(popupId);
    overlay.style.display = 'block';
    setTimeout(function() {
        overlay.style.opacity = '1';
        overlay.querySelector('.popup').style.opacity = '1';
        overlay.querySelector('.popup').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}
function pauseHUD(popupId){
    userCurrentState = inMenu
    backgroundMusicPlay()
    changeGameState('paused');
    ghostDeathSFX.pause();
    var overlay = document.getElementById(popupId);
    overlay.style.display = 'block';
    setTimeout(function() {
        overlay.style.opacity = '1';
        overlay.querySelector('.popup').style.opacity = '1';
        overlay.querySelector('.popup').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}
function closePopup(popupId) {
    var overlay = document.getElementById(popupId);
    overlay.style.opacity = '0';
    overlay.querySelector('.popup').style.opacity = '0';
    overlay.querySelector('.popup').style.transform = 'translate(-50%, -50%) scale(0.7)';
    setTimeout(function() {
        overlay.style.display = 'none';
    }, 300);
    popupBackround("stop");
}
function mainMenu(){
    userCurrentState = inMenu
    blockInput = true
    counterStart=0;
    resetValues();
    closePopup('popupGameOver');
    closePopup('popupGamePause');
    unPause();
    backToStart();
}
function backToStart(){
    startingHUD('popupGameStart', 'multiple');
}
function weaponUpgrades(){
    bulletInterval=bulletInterval/1.4;
    bulletSpeed=bulletSpeed*1.3;
    reloadSpeed/=2.2;
    playerSpeed+=1;
    weaponUpgradeDisplay();
    setTimeout(stopWeaponUpgradeDisplay,3000)
}
function unPause(){
    changeGameState('running')
}
function resumeGame(){
    userCurrentState = inGame
    backgroundMusicPlay()
    blockInput = false
    closePopup('popupGamePause');
    setTimeout(unPause, 500)
}

function ghostDied(ghost) {
    if(ghost.diedViaPlayer && playerHealthCurrent > 0){
        playerHitSFX.overPlay()
        playerHealthCurrent -= 1
        playerHealth = new Text ({
            position: {
                x: (canvas.width)/100  ,
                y: (canvas.height)/20
            },
            input: "Player Health: " + playerHealthCurrent + "/" + playerHealthMax,
            font: "48px VT323",
            color: "#777",
            alignment: "left"
        })
    }
    ghostList.splice(ghost.indexInList, 1)
    ghost.particles()
    ghostList.forEach(ghost1 => {
        if(ghost1.indexInList >= ghost.indexInList){ghost1.indexInList -= 1}
    })
}

var movingW = true
var movingA = true
var movingS = true
var movingD = true

function moveMovables() {
    if (keys.w.pressed && blockInput != true) {
        player.moving = true
        for(var i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + playerSpeed 
                }}
            })) {
                movingW = false
                break
            }
        }

        if(movingW)movables.forEach((movable) => {movable.position.y += playerSpeed})
    }
    if (keys.a.pressed && blockInput != true) {
        player.moving = true
        for(var i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + playerSpeed,
                    y: boundary.position.y
                }}
            })) {
                movingA = false
                break
            }
        }
        if(movingA)movables.forEach((movable) => {movable.position.x += playerSpeed})
        
    }
    if (keys.s.pressed && blockInput != true) {
        player.moving = true
        for(var i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - playerSpeed 
                }}
            })) {
                movingS = false
                break
            }
        }
        if(movingS)movables.forEach((movable) => {movable.position.y -= playerSpeed})
    }
    if (keys.d.pressed && blockInput != true) {
        player.moving = true
        for(var i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if(rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x - playerSpeed,
                    y: boundary.position.y
                }}
            })) {
                movingD = false
                break
            }
        }
        if(movingD)movables.forEach((movable) => {movable.position.x -= playerSpeed})
    }
}

function tick() {
    if(gameState == paused){return}
    if(document.getElementById('canvas').style.display == 'none') {
        document.getElementById('canvas').style.display = 'block'
        window.setTimeout(() => {
            document.getElementById('canvas').style.opacity = 1
            document.getElementById('canvas').style.transform = 'scale(1)'
        }, 0);
    }
    backgroundMusicPlay()
    window.requestAnimationFrame(tick);
    mapBackground.draw()
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    player.draw()
    updateWeaponRotation()
    weapon.draw()

    ghostList.forEach(ghost => {
        ghost.draw()
    });
    bulletList.forEach(bullet => {
        bullet.draw()
    })

    playerHealth.draw()
    magCapacity.draw()
    waveNumber.draw()
    displayKill.draw()
    reach100.draw()
    displayRandomUpgrade.draw()
    
    movingW = true
    movingA = true
    movingS = true
    movingD = true
    player.moving = false
    player.movingDirection = 0
    ghostList.forEach(element => {
        element.movingDirection = 0
    });
    //south: 0, southEast: 28, east: 24, northEast: 20, north: 16, northWest: 12, west: 8, southWest: 4

    if(keys.w.pressed && keys.a.pressed && blockInput != true) {
        playerSpeed = Math.sqrt(2*speed*speed) / 2;
        player.movingDirection = 12;
    }
    else if(keys.w.pressed && keys.d.pressed && blockInput != true) {
        playerSpeed = Math.sqrt(2*speed*speed) / 2;
        player.movingDirection = 20;
    }
    else if(keys.s.pressed && keys.a.pressed && blockInput != true) {
        playerSpeed = Math.sqrt(2*speed*speed) / 2;
        player.movingDirection = 4;
    }
    else if(keys.s.pressed && keys.d.pressed && blockInput != true) {
        playerSpeed = Math.sqrt(2*speed*speed) / 2;
        player.movingDirection = 28;
    }
    else if(blockInput != true) {
        playerSpeed = speed;
    }

    if(keys.w.pressed && !keys.a.pressed && !keys.s.pressed && !keys.d.pressed && blockInput != true){player.movingDirection = 16}
    
    if(keys.a.pressed && !keys.w.pressed && !keys.s.pressed && !keys.d.pressed && blockInput != true){player.movingDirection = 8}

    if(keys.s.pressed && !keys.a.pressed && !keys.w.pressed && !keys.d.pressed && blockInput != true){player.movingDirection = 0}

    if(keys.d.pressed && !keys.a.pressed && !keys.s.pressed && !keys.w.pressed && blockInput != true){player.movingDirection = 24}

    if(keys.q.pressed) {
        pauseHUD('popupGamePause')
    }

    moveMovables()

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
    
        if (particle.isDead()) {
            particles.splice(index, 1);
        }
    });

    //south: 0, southEast: 28, east: 24, northEast: 20, north: 16, northWest: 12, west: 8, southWest: 4
    ghostList.forEach(ghost => {
        if(ghost.isDead){
            ghostDied(ghost)
        }
        else if (player.position.x < ghost.position.x && player.position.y > ghost.position.y) {
            //console.log('south west')
            ghost.movingDirection = 4;
        }
        else if(player.position.x > ghost.position.x && player.position.y < ghost.position.y) {
            //console.log('north east')
            ghost.movingDirection = 20;
        }
        else if(player.position.x > ghost.position.x && player.position.y > ghost.position.y) {
            //console.log('south east')
            ghost.movingDirection = 28;
        }
        else if(player.position.x < ghost.position.x && player.position.y < ghost.position.y) {
            //console.log('north west')
            ghost.movingDirection = 12
        }
        ghost.goto(player.position.x, player.position.y, ghostSpeed)
    })

    ghostList.forEach(ghost => {
        bulletList.forEach(bullet => {
            checkBulletCollision(bulletSpeed, bullet, ghost)
        });
    });

    bulletList.forEach(bullet => {
        if(bullet.isDead){
            bulletList.splice(bullet.indexInList, 1)
            bulletList.forEach(bullet1 => {
                if(bullet1.indexInList >= bullet.indexInList){bullet1.indexInList -= 1}
            })
        }

        bullet.goto(bullet.cursorX, bullet.cursorY, bulletSpeed)
    })
}
tick();

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX - document.getElementById('canvas').getBoundingClientRect().left;
    cursor.y = event.clientY - document.getElementById('canvas').getBoundingClientRect().top;
    
});

window.addEventListener('keydown', (keeb) => {
    switch (keeb.key) {
        case 'w':
            keys.w.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case 'q':
            keys.q.pressed = true
            break
    }
})

window.addEventListener('keyup', (keeb) => {
    switch (keeb.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 'q':
            keys.q.pressed = false
            break
    }
})

//non game related stuff
function switchToTutPage() {
    window.location.href = "tutorial.html"
}
function switchToAboutPage() {
    window.location.href = "about.html"
}
