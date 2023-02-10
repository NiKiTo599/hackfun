const cvs = document.querySelector('#canvas');
const ctx = cvs.getContext('2d');
const jumpButton = document.querySelector('.jump-btn');
const highScoreSpan = document.querySelector('#high-score');
const scoreSpan = document.querySelector('#score');
const highScore = localStorage.getItem('highScore');

let SCORE = 0;

const BGImage = new Image();
BGImage.src = '/static/bg.png';

const HEROImage = new Image();
HEROImage.src = '/static/hero.png';

const ENTITYImage = new Image();
ENTITYImage.src = '/static/entity.png';

const BAD_ENTITYImage = new Image();
BAD_ENTITYImage.src = '/static/bad-entity.png';

let IS_START = true;

const SPEED = 1;

const WORLD_WIDTH = 300;
const WORLD_HEIGHT = 350;
ctx.canvas.width = WORLD_WIDTH;
ctx.canvas.height = WORLD_HEIGHT;

const GAP_VERTICAL = WORLD_HEIGHT / 10;

const HERO_SIZE = 30;
let HERO_POS_X = 25;
let HERO_POS_Y = (WORLD_HEIGHT - HERO_SIZE) / 2;

const ENTITY_SIZE = 20;

const BOTTOM_BORDER = WORLD_HEIGHT - HERO_SIZE;
const TOP_BORDER = 0;

let JUMP_POWER = 10;
const BASE_GRAVITY = 1.5;
const MIN_GRAVITY = BASE_GRAVITY - JUMP_POWER;
let GRAVITY = BASE_GRAVITY;

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let d = ENTITY_SIZE * 2;
const startY = ENTITY_SIZE + GAP_VERTICAL;
const endY = WORLD_HEIGHT - ENTITY_SIZE - GAP_VERTICAL;
let currentY = startY;

function getEntityY(value = 1) {
  if (Math.random() >= 0.5) {
    d = -d;
  }
  if (currentY < startY) {
    currentY = startY;
    d = Math.abs(d);
  }
  if (currentY > endY) {
    currentY = endY;
    d = -Math.abs(d);
  }
  currentY += d * value;

  return currentY;
}

function randomEntityX() {
  return randomIntFromInterval(0, ENTITY_SIZE);
}

function randomBadEntity() {
  const random = randomIntFromInterval(0, 10);
  return random === 3;
}

let ENTITIES = [];

let pass = false;

function createEntity({ x = WORLD_WIDTH, y = 0, size = 1 }) {
  const _size = size * 30;

  ENTITIES.push({
    x: x - ENTITY_SIZE,
    y,
    width: _size,
    height: _size,
    isBad: randomBadEntity(),
    size: _size,
  });
}

function frame() {
  if (GRAVITY < BASE_GRAVITY) GRAVITY += 0.5;
  HERO_POS_Y += GRAVITY;

  checkWorldCollision();
  drawBg();
  drawHero();
  drawAndMoveEntities();

  IS_START && requestAnimationFrame(frame);
}

function drawAndMoveEntities() {
  // console.log(ENTITIES);
  ENTITIES = [...ENTITIES]
    .reduce((acc, entity) => {
      const lastIndex = acc.length - 1;

      if (lastIndex >= 0) {
        const prevEntity = acc[lastIndex];

        const rightX = Math.abs(entity.x - prevEntity.x) > ENTITY_SIZE / 2;
        const rightY = Math.abs(entity.y - prevEntity.y) > ENTITY_SIZE / 2;

        if (rightX && rightY) {
          acc.push(entity);
        }
      } else {
        acc.push(entity);
      }

      return acc;
    }, [])
    .map((entity) => {
      // console.log(ENTITIES);
      const path = WORLD_WIDTH - ENTITY_SIZE - entity.x;
      const size =
        entity.x > WORLD_WIDTH - ENTITY_SIZE * 2 ? (entity.size * ENTITY_SIZE) / path : entity.size;
      ctx.drawImage(entity.isBad ? BAD_ENTITYImage : ENTITYImage, entity.x, entity.y, size, size);

      return { ...entity, x: entity.x - SPEED, width: size, height: size };
    })
    .filter((entity) => {
      const isCollect = checkCollisionWithHero(entity);

      if (isCollect) {
        if (entity.isBad) {
          decreaseScore();
        } else {
          increaseScore();
        }

        return false;
      }

      if (entity.x < 0) {
        return false;
      }

      return true;
    });
}

function increaseScore() {
  SCORE += 1;

  if (SCORE > highScore) {
    localStorage.setItem('highScore', SCORE);
    highScoreSpan.textContent = SCORE;
  }

  scoreSpan.textContent = SCORE;
}

function decreaseScore() {
  SCORE -= 3;

  if (SCORE > highScore) {
    localStorage.setItem('highScore', SCORE);
    highScoreSpan.textContent = SCORE;
  }

  scoreSpan.textContent = SCORE;
}

function drawHero() {
  ctx.drawImage(HEROImage, HERO_POS_X, HERO_POS_Y, HERO_SIZE, HERO_SIZE);
}

function checkCollisionWithHero({ x, y, width, height }) {
  if (
    HERO_POS_X < x + width &&
    HERO_POS_X + HERO_SIZE > x &&
    HERO_POS_Y < y + height &&
    HERO_SIZE + HERO_POS_Y > y
  ) {
    console.log('Collision!');
    return true;
  }
}

function drawBg() {
  ctx.drawImage(BGImage, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

function checkWorldCollision() {
  if (HERO_POS_Y > BOTTOM_BORDER) {
    HERO_POS_Y = BOTTOM_BORDER;
  }

  if (HERO_POS_Y < TOP_BORDER) {
    HERO_POS_Y = TOP_BORDER;
    GRAVITY = BASE_GRAVITY;
  }
}

function jump() {
  !IS_START && location.reload();

  GRAVITY = MIN_GRAVITY;
}

function main() {
  highScoreSpan.textContent = highScore || 0;
  jumpButton.innerHTML = 'jump';

  frame();

  const heroSelectValue = document.querySelector('#hero');
  const backgroundSelectValue = document.querySelector('#bg');

  heroSelectValue.addEventListener('change', (data) => {
    HEROImage.src = `/static/${data.target.value.toLowerCase()}.png`;
  });

  backgroundSelectValue.addEventListener('change', (data) => {
    BGImage.src = `/static/${data.target.value.toLowerCase()}.png`;
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
  });
  jumpButton.addEventListener('click', jump);

  window.addEventListener('CREATE', (data) => {
    const value = data.detail.value;

    createEntity({ y: getEntityY(value), size: value });
  });
}

main();
