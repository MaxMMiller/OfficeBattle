const canvas = document.getElementById('gameWindow')
const c = canvas.getContext('2d')

//setting canvas size
canvas.width = 1024
canvas.height = 576

//force of gravity
const gravity = 0.98;

// Object for Player 1
const p1 = new Fighter({
    position: {
        x: 50,
        y: 0
    },
    velocity: {
        x: 0,
        y: 5
    },
    offset: {
        x: 50,
        y: 0
    },
    healthBar: new healthBar({
        hp: 200,
        direction: 'left',
        canvasWidth: canvas.width
    })
})

// Object for Player 2
const p2 = new Fighter({
    position: {
        x: canvas.width - 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 5
    },
    color: 'blue',
    offset: { //
        x: -75,
        y: 0
    },
    healthBar: new healthBar({
        hp: 200,
        direction: 'right',
        canvasWidth: canvas.width
    })
})


//Track keys that correspond to left and right movement for both players
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}






//Recursive function that is called every frame
function animate(){
    window.requestAnimationFrame(animate)//calls this function for each frame
    c.clearRect(0,0,canvas.width,canvas.height) //Clear all contents on canvas
    p1.update() //draw player 1
    p2.update() //draw player 2

    /* -------------------
    |
    |     MOVEMENT DETECTION
    |
    */ //-------------------
    //p1 left right movement
    p1.velocity.x = 0
    if(keys.a.pressed && p1.LastKey == 'a'){
        p1.velocity.x = -p1.speed
    }else if(keys.d.pressed && p1.LastKey == 'd'){
        p1.velocity.x = p1.speed
    }

    //p2 left right movement
    p2.velocity.x = 0
    if(keys.ArrowLeft.pressed && p2.LastKey == 'ArrowLeft'){
        p2.velocity.x = -p2.speed
    }else if(keys.ArrowRight.pressed && p2.LastKey == 'ArrowRight'){
        p2.velocity.x = p2.speed
    }

    /* -------------------
    |
    |     COLLISION DETECTION
    |
    */ //-------------------

    //test for collision between p1 attack and other player
    if(!p1.canAttack){
        let punchBox = p1.getPunchBox()
        if(collision(punchBox, p2)){
            p2.hitByPunch()
        }
    }
    //test for collision between p2 attack and other player
    if(!p2.canAttack){
        let punchBox = p2.getPunchBox()
        if(collision(punchBox, p1)){
            p1.hitByPunch()
        }
    }

    //Collision between Players (stops moving them through eachother)
    let p1X = p1.getPosition().x;
    let p2X = p2.getPosition().x;

    console.log(p2X + " " + p1.getWidth + " " + p1.getVelocity.x + " " + p2X )
    console.log(p1X + p1.getWidth + p1.getVelocity.x >= p2X )
    //console.log(p2X > p1X)
    //console.log((p1.getPosition.y+p1.getHeight)==p2.getPosition.y)

    if(p1X + p1.getWidth + p1.getVelocity.x >= p2X && p2X > p1X && (p1.getPosition.y+p1.getHeight)>p2.getPosition.y){
        console.log("empty1")
        p1.setXVelocity(0)
        p2.setXVelocity(0)
    }

    if(p2X + p2.getWidth + p2.getVelocity.x >= p1X && p1X > p2X && (p2.getPosition.y+p2.getHeight)>p1.getPosition.y){
        console.log("empty2")
        p1.setXVelocity(0)
        p2.setXVelocity(0)
    }
 
}

function playerCollision(p1, p2){}

animate()//the initial call of the animate function that begins the recursive loop

//Function that checks for collision between 2 objects
//returns a boolean value of if the collision is occuring or not
function collision(object1, object2){
    if(
        //If the objects are intersecting horizontally
        (object1.position.x + object1.width >= object2.position.x && object1.position.x <= object2.position.x + object2.width)
        && //AND
        //The objects are intersecting vertically
        (object1.position.y + object1.height >= object2.position.y && object1.position.y <= object2.position.y + object2.height)
    ){
        console.log("hit")
        return true
    }
}













//On key Down Event
window.addEventListener('keydown', (e) => {
    //P1 Controls
    switch (e.key){
        case 'd': //p1 move right
            keys.d.pressed = true
            p1.LastKey = 'd'
            break
        case 'a': //p1 move left
            keys.a.pressed = true
            p1.LastKey = 'a'
            break
        case 'w': //p1 jump
            p1.jumpCount++
            if(p1.jumpCount <= p1.jumpLimit){ //allows for double jump
               p1.velocity.y = p1.jumpPower
            }
            break
    }

    //P2 Controls
    switch (e.key){
        case 'ArrowRight': //p2 move right
            keys.ArrowRight.pressed = true
            p2.LastKey = 'ArrowRight'
            break
        case 'ArrowLeft': //p2 move left
            keys.ArrowLeft.pressed = true
            p2.LastKey = 'ArrowLeft'
            break
        case 'ArrowUp': //p2 jump
            p2.jumpCount++
            if(p2.jumpCount <= p2.jumpLimit){ //Allows for double jump
                p2.velocity.y = p2.jumpPower
             }
            break
    }
})

//On key Up Event
window.addEventListener('keyup', (e) => {
    //P1 Controls
    switch (e.key){
        case 'd': //p1 end move right
            keys.d.pressed = false
            break
        case 'a': //p1 end move left
            keys.a.pressed = false
            break
        case 'x': //p1 punch
            if(p1.canAttack){
                p1.punchBox.active = true;
            }
            break
    }

    //P2 Controls
    switch (e.key){
        case 'ArrowRight': //p2 end move right
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft': //p2 end move left
            keys.ArrowLeft.pressed = false
            break
        case '.': //p2 punch
            if(p2.canAttack){
                p2.punchBox.active = true
            }
            break
    }
})