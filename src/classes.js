class Sprite {
    constructor({position, imageSrc, scale = 1, framesMax = 1}) {
        this.position = position
        this.width = 50
        this.height = 150
        this.image = new Image()
        this.image.src = imageSrc
        this.scale = scale
        this.framesMax = framesMax
        this.framesCurrent = 0 //current frame since last animation change
        this.framesElapsed = 0 // how many frames have occured
        this.framesHold = 10
    }
    
    draw() {
        c.drawImage(
            this.image, //image to be displayed
            this.framesCurrent * (this.image.width / this.framesMax), //x coordinate to start clipping (crop for each frame of animation)
            0, //y coordinate to start clipping
            this.image.width / this.framesMax, //Width of clipped image
            this.image.height, //height of clipped image
            this.position.x, //x posiiton on canvas
            this.position.y, //y position on canvas
            (this.image.width / this.framesMax) * this.scale, //width of image (for strething or reducing)
            this.image.height * this.scale //height of image (for stretching or reducing)
        )
    }

    update() {
        this.draw()//draw image
        this.framesElasped++ 

        //Slow animations by waiting for a number of frames (frameHold) to elaspe
        if (this.framesElapsed % this.framesHold === 0){
            if(this.framesCurrent < this.framesMax -1) {
                this.framesCurrent++
            } else {
                this.framesCurrent =0
            }
        }
    }
}

class Fighter {
    constructor({position, velocity,color ='yellow', offset, healthBar}) {
        this.position = position
        this.velocity = velocity
        this.height = 150
        this.width = 50
        this.lastKey // last key pressed for left and right
        this.jumpPower = -15 //How powerful characters jump is
        this.speed = 5 //Character Speed
        this.jumpLimit = 1 //Maximum number of jumps
        this.jumpCount =0 //Number of times sprite has jumped since last touching the ground
        this.hp = 200;
        this.color = color;
        this.punchBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            offset,
            width: 75,
            height: 50,
            active: false,
            framesCurrent: 0,
            framesTotal: {
                startup: 5,    // frames before hit becomes active
                active: 3,     // frames where hit is active
                recovery: 7    // frames after hit before next action
            },
            phase: 'none'      // 'startup', 'active', 'recovery', or 'none'
        }
        this.canAttack = true
        this.healthBar = healthBar
    }

    hitByPunch(){
        this.hp -= 1
        if(this.hp < 0){ //if hp goes under 0, set to 0
            this.hp = 0
        }
    }
    getPosition(){
        return this.position
    }
    getVelocity(){
        return this.velocity
    }
    setXVelocity(v){
        this.velocity.x = v
    }
    getHeight(){
        return this.height
    }
    getWidth(){
        return parseInt(this.width)
    }

    getPunchBox(){
        //console.log(this.punchBox)
        return this.punchBox
    }

    draw() {
        //Fill border
        c.fillStyle = 'black'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        //fill inside color
        c.fillStyle = this.color
        c.fillRect(this.position.x+1, this.position.y+1, this.width-2, this.height-2)

        //if punch is active, show hitbox
        if(this.punchBox.active){
            //punch hit box
            c.fillStyle = 'green'
            c.fillRect(this.punchBox.position.x, this.punchBox.position.y, this.punchBox.width, this.punchBox.height)
        }
    }   
    update() {
        this.healthBar.setHp(this.hp)
        //Draw Sprite
        this.draw() 

        //If Sprite is touching the ground
        if(this.position.y + this.height + this.velocity.y >= canvas.height){
            //set velocity to 0 so it cant go past the ground
            this.position.y = canvas.height - this.height
            this.velocity.y = 0
            this.jumpCount = 0
        }else{ //if sprite is not touching the ground
            //Increase velocity by gravity if sprite is in the air
            this.velocity.y += gravity;
        }

        //Change fighter position by its velocity
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        //update punchbox position with player position
        this.punchBox.position.x = this.position.x + this.punchBox.offset.x;
        this.punchBox.position.y = this.position.y + this.punchBox.offset.y;

        //Stop player at Left boundary
        if(this.position.x + this.velocity.x <= 0){
            this.velocity.x = 0
            this.position.x = 0
        }
        //Stop player at Right boundary
        if(this.position.x + this.width + this.velocity.x >= canvas.width){
            this.velocity.x = 0
            this.position.x = canvas.width - this.width
        }

         // Updated punch attack logic
         if (this.punchBox.phase !== 'none') {
            this.canAttack = false
            this.punchBox.framesCurrent++

            // Handle different phases of the attack
            switch (this.punchBox.phase) {
                case 'startup':
                    if (this.punchBox.framesCurrent >= this.punchBox.framesTotal.startup) {
                        this.punchBox.phase = 'active'
                        this.punchBox.framesCurrent = 0
                        this.punchBox.active = true
                    }
                    break
                    
                case 'active':
                    if (this.punchBox.framesCurrent >= this.punchBox.framesTotal.active) {
                        this.punchBox.phase = 'recovery'
                        this.punchBox.framesCurrent = 0
                        this.punchBox.active = false
                    }
                    break
                    
                case 'recovery':
                    if (this.punchBox.framesCurrent >= this.punchBox.framesTotal.recovery) {
                        this.punchBox.phase = 'none'
                        this.punchBox.framesCurrent = 0
                        this.canAttack = true
                    }
                    break
            }
        }
        
        //update healthbar
        this.healthBar.update();
    }
    // New method to initiate punch
    startPunch() {
        console.log(this.canAttack)
        if (this.canAttack) {
            this.punchBox.phase = 'startup'
            this.punchBox.framesCurrent = 0
        }
    }
}

class healthBar {
    constructor({hp, direction = 'left', canvasWidth}){
        this.width= hp; //starting health points
        this.height = 50;
        this.hp = hp //amount of health points that remain
        this.healthBarOffset = 10;//how much bigger the background of the healthbar is
        this.positionOffset = 50;
        this.positionY = 50;
        this.direction = direction;
        this.canvasWidth = canvasWidth;
        this.finalX;
    }

    draw() {
        if(this.direction == 'left'){ //if on left side
            this.finalX = this.positionOffset;
        }else{ //if on right side
            this.finalX = this.canvasWidth - this.positionOffset - this.width -this.healthBarOffset;
        }
        
        //background behind health
        c.fillStyle = 'red'
        c.fillRect(this.finalX, this.positionY, (this.width+this.healthBarOffset), (this.height+this.healthBarOffset))
        

        //health marker
        c.fillStyle = 'green'
        c.fillRect(this.finalX+(this.healthBarOffset/2), this.positionY+(this.healthBarOffset/2), this.hp, this.height)
    }

    update() {
        this.draw()
    }

    getHp() {
        return this.hp;
    }
    setHp(hp){
        this.hp = hp;
    }
}

