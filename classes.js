class Sprite {
    constructor({ position, image, frames = {max: 1} }) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.moving = false
        this.movingDirection = 0
        this.movedCheck = 0

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height / 1
        }
    }

    draw() {
        c.drawImage(
            this.image,
            this.frames.val * (this.width),
            0,
            this.image.width / this.frames.max,
            this.image.height / 1,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height / 1
        )

        if(!this.moving){ return }

        this.frames.elapsed++

        if(this.movedCheck != this.movingDirection) {
            this.frames.val = this.movingDirection
            this.movedCheck = this.movingDirection
        }

        if(this.frames.elapsed % 25 == 0){
            if(this.frames.val < this.movingDirection + 3) {
                this.frames.val++
            } else {
                this.frames.val = this.movingDirection;
            }
        }
    }
}

class Enemy {
    constructor({ position, image, frames = {max: 1}, indexInList}) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.movingDirection = 0
        this.movedCheck = 0
        this.width = this.image.width / this.frames.max
        this.height = this.image.height / 1
        this.indexInList = indexInList
        this.isDead = false
        this.diedViaPlayer = false
    }

    draw() {
        c.drawImage(
            this.image,
            this.frames.val * (this.width),
            0,
            this.image.width / this.frames.max,
            this.image.height / 1,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height / 1
        )

        this.frames.elapsed++

        if(this.movedCheck != this.movingDirection) {
            this.frames.val = this.movingDirection
            this.movedCheck = this.movingDirection
        }

        if(this.frames.elapsed % 25 == 0){
            if(this.frames.val < this.movingDirection + 3) {
                this.frames.val++
            } else {
                this.frames.val = this.movingDirection;
            }
        }
    }
    goto(targetX, targetY, speed) {
        var dx = targetX - this.position.x;
        var dy = targetY - this.position.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
    
        var velocityX = (dx / distance) * speed;
        var velocityY = (dy / distance) * speed;
    
        this.position.x += velocityX;
        this.position.y += velocityY;
        
        if (Math.floor(Math.abs(dx) / 50) <= Math.floor(Math.abs(velocityX) / 50) && Math.floor(Math.abs(dy) / 50) <= Math.floor(Math.abs(velocityY) / 50)) {
            this.isDead = true
            this.diedViaPlayer = true
        }
    }
}

class Weapon {
    constructor({ position, image, frames = {max: 1} }) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0}
        this.rotation = 0
        this.anchor = { x: -10, y: -10}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height / 1
        }
    }

    draw() {
        const centerX = this.position.x + this.anchor.x;
        const centerY = this.position.y + this.anchor.y;
        c.save();
        c.translate(centerX, centerY);
        c.rotate(this.rotation);
        c.translate(-centerX, -centerY);

        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height / 1,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height / 1
        )
        c.restore();
    }
}

class Bullet {
    constructor({ position, image, frames = {max: 1}, indexInList}) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.width = this.image.width / this.frames.max
        this.height = this.image.height / 1
        this.indexInList = indexInList
        this.isDead = false
        this.cursorX = 0
        this.cursorY = 0
    }

    draw() {
        c.drawImage(
            this.image,
            this.frames.val * (this.width),
            0,
            this.image.width / this.frames.max,
            this.image.height / 1,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height / 1
        )
    }
    goto(targetX, targetY, speed) {
        var dx = 3*(targetX - this.position.x);
        var dy = 3*(targetY - this.position.y);
        var distance = Math.sqrt(dx * dx + dy * dy);
    
        var velocityX = (dx / distance) * speed;
        var velocityY = (dy / distance) * speed;
    
        this.position.x += velocityX;
        this.position.y += velocityY;
        
        if (Math.floor(Math.abs(dx) / 50) <= Math.floor(Math.abs(velocityX) / 50) && Math.floor(Math.abs(dy) / 50) <= Math.floor(Math.abs(velocityY) / 50)) {
            this.isDead = true
        }
    }
}

class Text {
    constructor({ position, input, font, color, alignment }) {
        this.position = position;
        this.input = input;
        this.font = font;
        this.color = color;
        this.alignment = alignment;
    }

    draw() {
        c.font = this.font
        c.fillStyle = this.color
        c.textAlign = this.alignment
        c.fillText(this.input, this.position.x, this.position.y)
    }
}
class Sound {
    constructor({ replay }) {
        this.sound = document.createElement("audio")
        this.sound.setAttribute("preload", "auto")
        this.sound.setAttribute("controls", "none")
        this.sound.style.display = "none"
        document.body.appendChild(this.sound)
        this.isPlaying = false
        this.replay = replay
        this.isMuted = false
    }

    update(){
        if(this.isMuted){this.sound.volume = 0} else {this.sound.volume = 1}
    }

    play() {
        if(this.isMuted){this.sound.volume = 0} else {this.sound.volume = 1}
        this.sound.play()
        this.isPlaying = true
    }
    pause() {
        this.sound.pause()
        this.isPlaying = false
    }

    overPlay() {
        //overwrite any current this.sound playing
        this.sound.currentTime = 0
        this.sound.play()
        this.isPlaying = true
    }
}

class Boundary {
    static width = 64;
    static height = 64;
    constructor({position}) {
        this.position = position;
        this.width = 64;
        this.height = 64;
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0.2)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
