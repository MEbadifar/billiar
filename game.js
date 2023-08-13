const BALL_ORIGIN = new Vector(25, 25);
const STICK_ORIGIN = new Vector(970, 11);
const SHOOT_ORIGIN = new Vector(950, 11);
const DELTA = 0.01;

/**
 * ! Load Assets
 */
let sprites = {};
let asseteStillLoading = 0;

function loadSprite(fileName) {
  asseteStillLoading++;
  let spriteImage = new Image();
  spriteImage.src = "./assets/sprites/" + fileName;
  spriteImage.addEventListener("load", function () {
    asseteStillLoading--;
  });
  return spriteImage;
}

function loadAssets(callback) {
  sprites.background = loadSprite("background.png");
  sprites.stick = loadSprite("stick.png");
  sprites.whiteBall = loadSprite("ball.png");
  assetsLoadingLoop(callback);
}
function assetsLoadingLoop(callback) {
  if (asseteStillLoading) {
    requestAnimationFrame(assetsLoadingLoop.bind(this, callback));
  } else {
    callback();
  }
}

/**
 * ! Vector
 */
function Vector(x = 0, y = 0) {
  this.x = x;
  this.y = y;
}
/**
 *
 * create Copy a Vector (object) with new Reference address
 * and change in new copy has no Efect to reference
 * v3=v1 object will not copy becouse object is reference type and v3 ,v1 reffer to the same address
 * but with copy function can create an copy of v1 with new adddress and assign to v3
 * v3=v1.copy() so the chang in v3 has not effect to v1
 */
Vector.prototype.copy = function () {
  return new Vector(this.x, this.y);
};

/**
 * adding to Vector , v3.addTo(v1)
 */
Vector.prototype.addTo = function (Vector) {
  this.x += Vector.x;
  this.y += Vector.y;
};

/**
 *
 * @param {*} value
 * @returns the new Vector (or line) along the old vector(or line) by,
 * for exsample the ball moveing for faster or slower moving
 */

Vector.prototype.mult = function (value) {
  return new Vector(this.x * value, this.y * value);
};
/**
 *
 * @param {*} value
 * @returns the lenght of the Vector
 */
Vector.prototype.lenght = function () {
  return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

//////////////////////////////////////////////////////////////////////
/**
 * !Mouse handler
 */
function ButtonState() {
  this.down = false;
  this.pressed = false;
}
function MouseHandler() {
  this.left = new ButtonState();
  this.middle = new ButtonState();
  this.right = new ButtonState();
  this.position = new Vector();
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);
}

MouseHandler.prototype.reset = function () {
  Mouse.left.pressed = false;
  Mouse.middle.pressed = false;
  Mouse.right.pressed = false;
};
function handleMouseMove(e) {
  Mouse.position.x = e.pageX;
  Mouse.position.y = e.pageY;
}
function handleMouseDown(e) {
  handleMouseMove(e);
  if (e.which == 1) {
    Mouse.left.pressed = true;
    Mouse.left.down = true;
  } else if (e.which == 2) {
    Mouse.middle.pressed = true;
    Mouse.middle.down = true;
  } else if (e.which == 3) {
    Mouse.right.pressed = true;
    Mouse.right.down = true;
  }
}
function handleMouseUp(e) {
  handleMouseMove(e);
  if (e.which == 1) {
    Mouse.left.down = false;
  } else if (e.which == 2) {
    Mouse.middle.down = false;
  } else if (e.which == 3) {
    Mouse.right.down = false;
  }
}
let Mouse = new MouseHandler();

/**
 * ! create White Ball
 */
function Ball(position) {
  this.position = position;
  this.velocity = new Vector();
  this.moving = false;
}
Ball.prototype.update = function (delta) {
  this.position.addTo(this.velocity.mult(delta));
  this.velocity = this.velocity.mult(0.98);
  if (this.velocity.lenght() < 5) {
    this.velocity = new Vector();
    this.moving = false;
  }
};

Ball.prototype.draw = function () {
  Canvas.drawImage(sprites.whiteBall, this.position, BALL_ORIGIN);
};
Ball.prototype.shoot = function (power, rotation) {
  this.velocity = new Vector(
    power * Math.cos(rotation),
    power * Math.sin(rotation)
  );
  this.moving = true;
};

/**
 * !create Stick
 */
function Stick(position, onShoot) {
  this.position = position;
  this.rotation = 0;
  this.origin = STICK_ORIGIN.copy();
  this.power = 0;
  this.onShoot = onShoot;
  this.shot = false;
}
Stick.prototype.draw = function () {
  Canvas.drawImage(sprites.stick, this.position, this.origin, this.rotation);
};
Stick.prototype.update = function () {
  this.updateRotation();
  if (Mouse.left.down) {
    this.increasePower();
  } else if (this.power > 0) {
    this.shoot();
  }
};
Stick.prototype.shoot = function () {
  this.onShoot(this.power, this.rotation);
  this.power = 0;
  this.origin = SHOOT_ORIGIN.copy();
  this.shot = true;
};

Stick.prototype.updateRotation = function () {
  let opposite = Mouse.position.y - this.position.y;
  let adjacent = Mouse.position.x - this.position.x;

  this.rotation = Math.atan2(opposite, adjacent);
};
Stick.prototype.increasePower = function () {
  this.power += 100;
  this.origin.x += 5;
};
Stick.prototype.reposition = function (position) {
    this.position = position.copy();
    this.origin=STICK_ORIGIN.copy()
};

/**
 * ! canvas
 */

function Canvas2D() {
  this._canvas = document.getElementById("screen");
  this.ctx = this._canvas.getContext("2d");
}
Canvas2D.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this._canvas.clientWidth, this._canvas.height);
};
Canvas2D.prototype.drawImage = function (
  image,
  position = new Vector(),
  origin = new Vector(),
  rotation = 0
) {
  this.ctx.save();
  this.ctx.translate(position.x, position.y);
  this.ctx.rotate(rotation);
  this.ctx.drawImage(image, -origin.x, -origin.y);
  this.ctx.restore();
};
let Canvas = new Canvas2D();
//////////////////////////////////////////
/**
 * ! Game World
 */
function GameWorld() {
  this.whiteBall = new Ball(new Vector(413, 413));
  this.stick = new Stick(
    new Vector(413, 413),
    this.whiteBall.shoot.bind(this.whiteBall)
  );
}
/**
 * ! Update function
 */
GameWorld.prototype.update = function () {
  this.stick.update();
  this.whiteBall.update(DELTA);
  if (!this.whiteBall.moving && this.stick.shot) {
    this.stick.reposition(this.whiteBall.position);
  }
};
/**
 * ! Draw function
 */
GameWorld.prototype.draw = function () {
  Canvas.drawImage(sprites.background);
  this.whiteBall.draw();
  this.stick.draw();
};

let gameworld = new GameWorld();

function animate() {
  Canvas.clear();
  gameworld.update();
  gameworld.draw();
  requestAnimationFrame(animate);
}
loadAssets(animate);
