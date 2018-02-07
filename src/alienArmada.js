(function(){

//The canvas
let canvas = document.querySelector("canvas");

//Create the drawingSurface
let drawingSurface = canvas.getContext("2d");

//Arrays to store the game objects and assets to load
let sprites = [];
let assetsToLoad = [];

//Set the speed of the cannon movement
let cannonSpeed = 4;

//Array to store the missiles
let missiles = [];

//Variables to control missile shooting
let shoot = false;
let spaceKeyIsDown = false;

//Array to store the aliens
let aliens = [];

//Variables to control alien creation
let alienFrequency = 120;
let alienTimer = 0;

//Variables to record the score
let score = 0;
let scoreNeededToWin = 60;

//Array to store game messages
let messages = [];

//Create the background
let background = Object.create(spriteObject);
background.x = 0,
background.y = 0,
background.sourceY = 32;
background.sourceWidth = 480;
background.sourceHeight = 320;
background.width = 480;
background.height = 320;
sprites.push(background);

//Create the cannon and center it
let cannon = Object.create(spriteObject);
cannon.x = canvas.width / 2 - cannon.width / 2;
cannon.y = 280;
sprites.push(cannon);

//Load the tile sheet image
let image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "../images/alienArmada.png";
assetsToLoad.push(image);

//Load the music and sound effects
let music = document.querySelector("#music");
music.addEventListener("canplaythrough", loadHandler, false);
music.load();
assetsToLoad.push(music);

let shootSound = document.querySelector("#shootSound");
shootSound.addEventListener("canplaythrough", loadHandler, false)
shootSound.load();
assetsToLoad.push(shootSound);

let explosionSound = document.querySelector("#explosionSound");
explosionSound.addEventListener("canplaythrough", loadHandler, false);
explosionSound.load();
assetsToLoad.push(explosionSound);

//Create the score display
let scoreDisplay = Object.create(messageObject);
scoreDisplay.font = "normal bold 30px emulogic";
scoreDisplay.fillStyle = "#00FF00";
scoreDisplay.x = 400;
scoreDisplay.y = 10;
messages.push(scoreDisplay);

//Create the game over messages
let gameOverMessage = Object.create(messageObject);
gameOverMessage.font = "normal bold 20px emulogic";
gameOverMessage.fillStyle = "#00FF00";
gameOverMessage.x = 70;
gameOverMessage.y = 120;
gameOverMessage.visible = false;
messages.push(gameOverMessage);

//Variable to count the number of assets the game needs to load
let assetsLoaded = 0;

//Game states
const LOADING = 0;
const PLAYING = 1;
const OVER = 2;
let gameState = LOADING;

//Arrow key codes
const RIGHT = 39;
const LEFT = 37;
const SPACE = 32;

//Directions
let moveRight = false;
let moveLeft = false;

//Add keyboard event listeners
window.addEventListener("keydown", function(event)
{
  switch(event.keyCode)
  {
    case LEFT:
      moveLeft = true;
      break;

    case RIGHT:
      moveRight = true;
      break;

    case SPACE:
    if(!spaceKeyIsDown)
    {
      shoot = true;
      spaceKeyIsDown = true;
    }
  }
}, false);

window.addEventListener("keyup", function(event)
{
  switch(event.keyCode)
  {
    case LEFT:
      moveLeft = false;
      break;

    case RIGHT:
      moveRight = false;
      break;

      case SPACE:
      spaceKeyIsDown = false;
      break;
  }
}, false);

//Start the game animation loop
update();

function update()
{
  //The animation loop
  requestAnimationFrame(update, canvas);

  //Change what the game is doing based on the game state
  switch(gameState)
  {
    case LOADING:
      console.log("loading...");
      break;

    case PLAYING:
      playGame();
      break;

    case OVER:
      endGame();
      break;
  }

  //Render the game
  render();
}

function loadHandler()
{
  assetsLoaded++;
  if(assetsLoaded === assetsToLoad.length)
  {
    //Remove the load event listeners
    image.removeEventListener("load", loadHandler, false);
    music.removeEventListener("canplaythrough", loadHandler, false);
    shootSound.removeEventListener("canplaythrough", loadHandler, false);
    explosionSound.removeEventListener("canplaythrough", loadHandler, false);

    //Play the music
    music.play();
    music.volume = 0.3;

    //Start the game
    gameState = PLAYING;
  }
}

function fireMissile()
{
  //Create a missile sprite
  let missile = Object.create(spriteObject);
  missile.sourceX = 96;
  missile.sourceWidth = 16;
  missile.sourceHeight = 16;
  missile.width = 16;
  missile.height =16;

  //Center it over the cannon
  missile.x = cannon.centerX() - missile.halfWidth();
  missile.y = cannon.y - missile.height;

  //Set its speed
  missile.vy = -8;

  //Push the missile into both the sprites and missiles arrays
  sprites.push(missile);
  missiles.push(missile);

  //Play the firing sound
  shootSound.currentTime = 0;
  shootSound.play();
}

function makeAlien()
{
  //Create the alien
  let alien = Object.create(alienObject);
  alien.sourceX = 32;

  //Set its Y position above the top screen boundary
  alien.y = 0 - alien.height;

  //Assign the alien a random X position
  let randomPosition = Math.floor(Math.random() * (canvas.width / alien.width));
  alien.x = randomPosition * alien.width;

  //Set iys speed
  alien.vy = 1;

  //Push the alien into both the sprites and aliens arrays
  sprites.push(alien);
  aliens.push(alien);
}

function destroyAlien(alien)
{
  //Change the alien's state and update the object
  alien.state = alien.EXPLODED;
  alien.update();

  //Remove the alien after one second
  setTimeout(removeAlien, 1000);

  function removeAlien()
  {
    removeObject(alien, aliens);
    removeObject(alien, sprites);
  }

  //Play the explosion sound
  explosionSound.currentTime = 0;
  explosionSound.play();
}

function playGame()
{
  //LEFT
  if(moveLeft && !moveRight)
  {
    cannon.vx = -cannonSpeed;
  }
  //RIGHT
  if(!moveLeft && moveRight)
  {
    cannon.vx = cannonSpeed;
  }

  //Set the cannon's velocity to zero if none of the keys are being pressed
  if(!moveLeft && !moveRight)
  {
    cannon.vx = 0;
  }

  //shoot the missile
  if(shoot)
  {
    fireMissile();
    shoot = false;
  }

  //Move the cannon and keep it within the screen boundaries
  cannon.x = Math.max(0, Math.min(cannon.x + cannon.vx, canvas.width - cannon.width));

  //Move the missiles
  for(var i = 0; i < missiles.length; i++)
  {
    let missile = missiles[i];

    //Move it up the screen
    missile.y += missile.vy;

    //remove the missile if it crosses the top of the screen
    if(missile.y < 0 - missile.height)
    {
      //Remove the missile from the missiles array
      removeObject(missile, missiles);

      //Remove the missile from the sprites array
      removeObject(missile, sprites);

      //Reduce the loop counter by 1 to compensate for the removed element
      i--;
    }
  }

  //Add one to the alienTimer
  alienTimer++;

  //Make a new alien if the alienTimer equals the alienFrequency
  if(alienTimer === alienFrequency)
  {
    makeAlien();
    alienTimer = 0;

    //Reduce alienFrequency by one to gradually increase the freqency that the aliens are created
    if(alienFrequency > 2)
    {
      alienFrequency--;
    }
  }

  //Loop through the aliens
  for(let i = 0; i < aliens.length; i++)
  {
    let alien = aliens[i];

    if(alien.state === alien.NORMAL)
    {
      //Move the alien if its state is NORMAL
      alien.y += alien.vy;
    }

    //Check if the alien has crossed the bottom of the screen
    if(alien.y >canvas.height + alien.height)
    {
      //End the game if an alien has reached earth
      gameState = OVER;
    }
  }

  //Check to see if any aliens have been hit by any missiles
  for(let i = 0; i < aliens.length; i++)
  {
    let alien = aliens[i];

    for(let j = 0; j < missiles.length; j++)
    {
      let missile = missiles[j];

      if(hitTestRectangle(missile, alien) && alien.state === alien.NORMAL)
      {
        //Destroy the alien
        destroyAlien(alien);

        //Update the score
        score++;

        //Remove the missile
        removeObject(missile, missiles);
        removeObject(missile, sprites);

        //Subtract 1 from the loop counter to compensate for the removed missile
        j--;
      }
    }
  }

  scoreDisplay.text = score;

  if(score === scoreNeededToWin)
  {
    gameState = OVER;
  }

}

function removeObject(objectToRemove, array)
{
  let i = array.indexOf(objectToRemove);
  if (i !== -1)
  {
    array.splice(i, 1);
  }
}

function endGame()
{
  //EndGame
  console.log("Game Over!");

  gameOverMessage.visible = true;

  if(score < scoreNeededToWin)
  {
    gameOverMessage.text = "EARTH DESTROYED!";
  }
  else
  {
      gameOverMessage.x = 120;
      gameOverMessage.text = "EARTH SAVED!";
  }
}

function render()
{
  drawingSurface.clearRect(0, 0, canvas.width, canvas.height);

  //Display the sprites
  if(sprites.length !== 0)
  {
    for(var i = 0; i < sprites.length; i++)
    {
      let sprite = sprites[i];
      drawingSurface.drawImage
      (
        image,
        sprite.sourceX, sprite.sourceY,
        sprite.sourceWidth, sprite.sourceHeight,
        Math.floor(sprite.x), Math.floor(sprite.y),
        sprite.width, sprite.height
      );
    }
  }

  //Display the game messages
  if(messages.length !== 0)
  {
    for(let i = 0; i < messages.length; i++)
    {
      let message = messages[i];
      if(message.visible)
      {
        drawingSurface.font = message.font;
        drawingSurface.fillStyle = message.fillStyle;
        drawingSurface.textBaseline = message.textBaseline;
        drawingSurface.fillText(message.text, message.x, message.y);
      }
    }
  }

}

}());
