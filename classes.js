class Sprite {
    constructor({ position, image, frames = {max: 1}, scaleFactor = 1 }) {
        this.position = position;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0};
        this.moving = false
        this.movingDirection = 0
        this.movedCheck = 0
        this.scaleFactor = scaleFactor

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
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max * this.scaleFactor,
            this.image.height * this.scaleFactor
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
        this.frames = {...frames, val: 28, elapsed: 0};
        this.movingDirection = 0
        this.movedCheck = 0
        this.width = this.image.width / this.frames.max
        this.height = this.image.height / 1
        this.indexInList = indexInList
        this.isDead = false
        this.diedViaPlayer = false
        this.isSpawning = true
        this.spawnPeriod = 0
    }

    draw() {
        c.globalAlpha = this.spawnPeriod / 150


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

        c.globalAlpha = 1

        if(this.spawnPeriod == 150) {
            this.isSpawning = false
        }
        if(this.spawnPeriod == 130) {
            for (var i = 0; i < 20; i++) {
                var particle
                particle = new Particle(
                    { x: this.position.x + (this.width / 2), y: this.position.y + (this.height / 2) },
                    { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
                    "rgba(207, 174, 207, 0.8)",
                    Math.random() * 3
                );
                particles.push(particle);
                movables = [background, ...boundaries, ...ghostList, ...particles]
            }
        }
        this.spawnPeriod++

        if(this.movedCheck != this.movingDirection && this.isSpawning == false) {
            this.frames.val = this.movingDirection
            this.movedCheck = this.movingDirection
        }
    }
    goto(targetX, targetY, speed) {
        if(this.isSpawning){return}
        var dx = targetX - this.position.x;
        var dy = targetY - this.position.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
    
        var velocityX = (dx / distance) * speed;
        var velocityY = (dy / distance) * speed;
    
        this.position.x += velocityX;
        this.position.y += velocityY;
        
        if (Math.floor(Math.abs(dx) / 50) <= Math.floor(Math.abs(velocityX) / 50) && Math.floor(Math.abs(dy) / 50) <= Math.floor(Math.abs(velocityY) / 50) && this.isSpawning == false) {
            this.isDead = true
            this.diedViaPlayer = true
        }
    }
    particles() {
        for (var i = 0; i < 20; i++) {
            var particle
            if(this.diedViaPlayer){
                particle = new Particle(
                    { x: this.position.x, y: this.position.y },
                    { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
                    "rgba(255, 0, 0, 0.8)",
                    Math.random() * 3
                );
            } else {
                particle = new Particle(
                    { x: this.position.x, y: this.position.y },
                    { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
                    "rgba(207, 174, 207, 0.8)",
                    Math.random() * 3
                );
            }
            particles.push(particle);
            movables = [background, ...boundaries, ...ghostList, ...particles]
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
class Particle {
    constructor(position, velocity, color, size) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        this.alpha = 1; // Initial alpha value for fading effect
    }

    draw() {
        c.save(); // Save the current drawing state
        c.globalAlpha = this.alpha; // Set the alpha value for transparency
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore(); // Restore the previous drawing state
    }

    update() {
        // Update particle position based on velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Decrease alpha value to simulate fading effect
        this.alpha -= 0.01;
    }

    // Method to check if particle should be removed from the list
    isDead() {
        return this.alpha <= 0;
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
        c.fillStyle = 'rgba(255, 0, 0, 0)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
