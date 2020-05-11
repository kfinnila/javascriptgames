export const CONSTANTS = {
  VIEWPORT_HEIGHT: 700,
  VIEWPORT_WIDTH: 1000,
  REFRESH_FREQ: 30,
  MIN_SPEED_LAT: 1,
  MIN_SPEED_DIR: 5,
  MAX_ASTEROIDS: 40,
  SPEED_FACTOR: 3,
  MIN_SIZE: 5,
  MAX_SIZE: 50,
  NEW_ASTEROID_FREQ: 30,
  COLLISON_TIMEOUT: 20,
}

export class Game {
  CONFIG;
  score = 0;
  highScore = 0;
  asteroids = [];
  canvas;
  context;
  newAsteroidCounter = CONSTANTS.NEW_ASTEROID_FREQ;
  mousePos = { x: 0, y: 0 };
  prevMousePos = { x: 0, y: 0 };
  collisionCounter = 0;
  distCalculator;
  gameOver = false;
  gameStarted = false;
  interval;
  //maxAsteroids = CONSTANTS.MAX_ASTEROIDS;

  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;

    canvas.addEventListener('mousemove', evt => {
      this.prevMousePos = this.mousePos;
      this.mousePos = this.getMousePos(evt);
      this.checkMouseMoveCollisions();
      //console.log('Mouse position: ' + this.mousePos.x + ',' + this.mousePos.y);
    }, false);

    canvas.addEventListener('mouseout', evt => {
      if (this.gameStarted) this.gameOver = true;
    }, false);

    this.distCalculator = new PointToLineDistance();
    let t = this.distCalculator.distToSegment({ x: 100, y: 100 }, { x: 0, y: 0 }, { x: 1000, y: 700 });
    console.log('dist: ', t);
  }

  start() {
    clearInterval(this.interval);
    this.asteroids = [];
    this.gameStarted = true;
    this.gameOver = false;
    this.collisionCounter = 0;
    this.score = 0;
    this.interval = setInterval(() => this.gameCycle(), CONSTANTS.REFRESH_FREQ);
  }

  gameCycle() {
    this.refresh();
  }
  

  refresh() {
    if (this.gameOver) {
      //console.log(this.context.font);
      if (!this.gameStarted) return;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.context.font = "30px Arial";
      this.context.fillText('GAME OVER', CONSTANTS.VIEWPORT_WIDTH / 2 - 70, CONSTANTS.VIEWPORT_HEIGHT / 2 - 15 );
      this.context.fillText('SCORE: ' + this.score, CONSTANTS.VIEWPORT_WIDTH / 2 - 60, CONSTANTS.VIEWPORT_HEIGHT / 2 + 15 );
      this.gameStarted = false;
      return;
    }
    this.newAsteroidCounter++;
    if (this.newAsteroidCounter >= CONSTANTS.NEW_ASTEROID_FREQ && this.asteroids.length < CONSTANTS.MAX_ASTEROIDS) {
      this.addAsteroid();
      this.newAsteroidCounter = 0;
    }
    //console.log(this.asteroids.length);
    this.clearCanvas();
    this.asteroids.forEach((asteroid, index) => {
      if (this.asteroidCollision(asteroid)) {
        this.gameOver = true;
        return;
      }
      asteroid.move();
      if (this.asteroidCollision(asteroid)) {
        this.gameOver = true;
      }
      //console.log(index, asteroid.x, asteroid.y, asteroid.speedX, asteroid.speedY)
      this.context.beginPath();
      this.context.fillStyle = asteroid.color;
      this.context.arc(asteroid.x, asteroid.y, asteroid.size, 0, 2 * Math.PI);
      //this.context.closePath();
      this.context.fill();
      this.context.stroke();
      this.context.fillStyle = '#000000';
      //this.context.font = "10px sans-serif";
      //this.context.fillText('Collisions: ' + this.collisionCounter, 10, 10);
    });
    this.context.font = "10px sans-serif";
    this.score++;
    this.context.fillText('SCORE: ' + this.score, 10, 10);
    this.context.fillText('HIGH SCORE: ' + this.highScore, 10, 25);
    this.context.fillText('Asteroids: ' + this.asteroids.length, 10, 40);
  }

  asteroidCollision(asteroid) {
    let collision = false;
    if (asteroid.excludeFromCollisionCount <= 0) {
      collision = this.checkCollision(this.mousePos.x, this.mousePos.y, asteroid.x, asteroid.y, asteroid.size);
      if (collision) {
        this.collisionCounter++;
        asteroid.excludeFromCollisionCount = CONSTANTS.COLLISON_TIMEOUT;
      }
    }
    return collision;
  }



  addAsteroid() {
    let asteroid = new Asteroid();
    this.asteroids.push(asteroid);
  }

  getMousePos(evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  checkMouseMoveCollisions() {
    this.asteroids.forEach(asteroid => {
      let collision = this.checkCollision(this.mousePos.x, this.mousePos.y, asteroid.x, asteroid.y, asteroid.size);
      if (collision && asteroid.excludeFromCollisionCount <= 0) {
        console.log('collision mousemove: ', collision);
        this.collisionCounter++;
        asteroid.excludeFromCollisionCount = 10;
        this.gameOver = true;
      }

      collision = false;
      let distFromLine = this.distCalculator.distToSegment({ x: asteroid.x, y: asteroid.y }, this.mousePos, this.prevMousePos);
      if (distFromLine <= asteroid.size / 2) collision = true;
      if (collision && asteroid.excludeFromCollisionCount <= 0) {
        console.log('collision line: ', collision);
        this.collisionCounter++;
        asteroid.excludeFromCollisionCount = 10;
        this.gameOver = true;
      }
    });
  }

  mouseCollision() {
    
  }

  checkCollision(a, b, x, y, r) {
    var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
    r *= r;
    if (dist_points <= r) {
      return true;
    }
    return false;
  }



  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export class Asteroid {
  x = 0;
  y = 0;
  speedX = 0;
  speedY = 0;
  size;
  color;
  excludeFromCollisionCount = 0;

  constructor() {
    let start = Math.floor(Math.random() * 4);
    this.size = CONSTANTS.MIN_SIZE + Math.floor(Math.random() * (CONSTANTS.MAX_SIZE - CONSTANTS.MIN_SIZE));
    this.color = this.random_rgba();
    const td = Math.floor(Math.random() * 2);
    let direction = -1;
    if (td === 1) {
      direction = 1;
    }
    //start = 2;
    //console.log(CONSTANTS);
    switch (start) {
      case 0:
        this.x = Math.floor(Math.random() * CONSTANTS.VIEWPORT_WIDTH);
        this.y = 0;
        this.speedX = (CONSTANTS.MIN_SPEED_LAT + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR)) * direction;
        this.speedY = CONSTANTS.MIN_SPEED_DIR + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR);
        break;

      case 1:
        this.x = CONSTANTS.VIEWPORT_WIDTH;
        this.y = Math.floor(Math.random() * CONSTANTS.VIEWPORT_HEIGHT);
        this.speedX = -CONSTANTS.MIN_SPEED_DIR - Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR);
        this.speedY = (CONSTANTS.MIN_SPEED_LAT + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR)) * direction;
        break;

      case 2:
        this.x = Math.floor(Math.random() * CONSTANTS.VIEWPORT_WIDTH);
        this.y = CONSTANTS.VIEWPORT_HEIGHT;
        this.speedX = (CONSTANTS.MIN_SPEED_LAT + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR)) * direction;
        this.speedY = -CONSTANTS.MIN_SPEED_DIR - Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR);
        break;

      case 3:
        this.x = 0;
        this.y = Math.floor(Math.random() * CONSTANTS.VIEWPORT_HEIGHT);
        this.speedX = CONSTANTS.MIN_SPEED_DIR + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR);
        this.speedY = (CONSTANTS.MIN_SPEED_LAT + Math.floor(Math.random() * CONSTANTS.SPEED_FACTOR)) * direction;
        break;



      default:
        break;
    }
  }

  move() {
    this.x += this.speedX;
    this.x < 0 ? this.x = CONSTANTS.VIEWPORT_WIDTH : null;
    this.x > CONSTANTS.VIEWPORT_WIDTH ? this.x = 0 : null;
    this.y += this.speedY;
    this.y < 0 ? this.y = CONSTANTS.VIEWPORT_HEIGHT : null;
    this.y > CONSTANTS.VIEWPORT_HEIGHT ? this.y = 0 : null;
    this.excludeFromCollisionCount--;
  }

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
  }

}


class PointToLineDistance {
  sqr(x) { return x * x }

  dist2(v, w) { return this.sqr(v.x - w.x) + this.sqr(v.y - w.y) }

  distToSegmentSquared(p, v, w) {
    var l2 = this.dist2(v, w);
    if (l2 == 0) return this.dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return this.dist2(p, {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y)
    });
  }

  distToSegment(p, v, w) { return Math.sqrt(this.distToSegmentSquared(p, v, w)); }
}
