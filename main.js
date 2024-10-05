import "./style.css";

let GAME_VELOCITY = 5;

const BOARD_WIDTH = 100;
const BOARD_HEIGHT = 100;

const maxBlockHeight = document.querySelector("#container").clientHeight*0.7/BOARD_HEIGHT;
const maxBlockWidth = document.querySelector("#container").clientWidth*0.8/BOARD_WIDTH;

const BLOCK_SIZE = Math.floor(maxBlockHeight > maxBlockWidth? maxBlockWidth : maxBlockHeight);

let isRunning = false;

const startButton = document.querySelector("#start");
const resetButton = document.querySelector("#reset");
const stopButton = document.querySelector("#stop");
const clearButton = document.querySelector("#clear");
const velocityButton = document.querySelector("#velocity");


const patternButtons = [];

patternButtons.push(document.querySelector("#pattern1"));
patternButtons.push(document.querySelector("#pattern2"));
patternButtons.push(document.querySelector("#pattern3"));
patternButtons.push(document.querySelector("#pattern4"));

const patternsCtx = [];

patternsCtx.push(document.querySelector("#pattern1").children[0].getContext("2d"));
patternsCtx.push(document.querySelector("#pattern2").children[0].getContext("2d"));
patternsCtx.push(document.querySelector("#pattern3").children[0].getContext("2d"));
patternsCtx.push(document.querySelector("#pattern4").children[0].getContext("2d"));

const patterns = [
    [
        [false, false, false, false, false],
        [false, false, true , false, false],
        [false, false, true , false, false],
        [false, false, true , false, false],
        [false, false, false, false, false]
    ],
    [
        [false, false, false, false, false],
        [false, true , true , false, false],
        [false, false, true , true , false],
        [false, false, true , false, false],
        [false, false, false, false, false]
    ],
    [
        [false, false, false, false, false, false],
        [false, false, false, true , false, false],
        [false, true , false, false, true , false],
        [false, true , false, false, true , false],
        [false, false, true , false, false, false],
        [false, false, false, false, false, false]
    ],
    [
        [false, false, false, false, false],
        [false, false, false, true , false],
        [false, true , false, true , false],
        [false, false, true , true , false],
        [false, false, false, false, false]
    ]
];

for (let i=0; i < patterns.length; i++){
    patternsCtx[i].scale(patternButtons[i].children[0].width/patterns[i][0].length, patternButtons[i].children[0].height/patterns[i].length);
    for (let y = 0; y < patterns[i].length; y++) {
        for (let x = 0; x < patterns[i][0].length; x++) {
            if (patterns[i][y][x]) {
                patternsCtx[i].fillStyle = "rgba(200,200,200,0.9)";
            } else {
                patternsCtx[i].fillStyle = "rgba(0,0,0,0.9)";
            }
            patternsCtx[i].fillRect(x, y, 1, 1);
        }
    }

    patternButtons[i].onclick = () => {
        const pattern = structuredClone(patterns[i]);
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[0].length; x++) {
                board[Math.floor(y + BOARD_HEIGHT/2 - pattern.length/2)][Math.floor(x + BOARD_WIDTH/2 - pattern[0].length/2)] = pattern[y][x];
            }
        }
        draw();
    };
}



const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = new Array(BOARD_HEIGHT)
  .fill(false)
  .map(() => new Array(BOARD_WIDTH).fill(false));

let savedBoard = structuredClone(board);

let lastTime = 0;

function gameLoop(time) {
  const deltaTime = time - lastTime;
  if (isRunning) {
    if (deltaTime >= 1000 / GAME_VELOCITY) {
      lastTime = time;
      gameLogic();
    }
    window.requestAnimationFrame(gameLoop);
  }
}

function draw() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x]) {
        ctx.fillStyle = "rgb(255,255,255)";
      } else {
        ctx.fillStyle = "rgb(0,0,0)";
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

startButton.onclick = () => {
  isRunning = true;
  startButton.disabled = true;
  savedBoard = structuredClone(board);
  gameLoop();
};

stopButton.onclick = () => {
  isRunning = false;
  startButton.disabled = false;
  GAME_VELOCITY = 5;
};

resetButton.onclick = () => {
  isRunning = false;
  startButton.disabled = false;
  board = structuredClone(savedBoard);
  GAME_VELOCITY = 5;
  draw();
};

clearButton.onclick = () => {
  isRunning = false;
  startButton.disabled = false;
  board = new Array(BOARD_HEIGHT)
    .fill(false)
    .map(() => new Array(BOARD_WIDTH).fill(false));
  savedBoard = structuredClone(board);
  GAME_VELOCITY = 5;
  draw();
};

velocityButton.onclick = () => {
  GAME_VELOCITY *= 2;
};

canvas.addEventListener("mousedown", (event) => {
  if (isRunning) {
    return;
  }
  const position = getMousePosition(event);
  console.log(position);
  const x = position.x;
  const y = position.y;
  board[y][x] = !board[y][x];

  if (board[y][x]) {
    ctx.fillStyle = "rgb(255,255,255)";
  } else {
    ctx.fillStyle = "rgb(0,0,0)";
  }
  ctx.fillRect(x, y, 1, 1);
});

function getMousePosition(event) {
  let rect = canvas.getBoundingClientRect();
  let x = Math.floor((event.clientX - rect.left) / BLOCK_SIZE);
  let y = Math.floor((event.clientY - rect.top) / BLOCK_SIZE);
  return { x, y };
}

function gameLogic() {
  const oldBoard = structuredClone(board);
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let liveCells = 0;
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        for (let xOffset = -1; xOffset <= 1; xOffset++) {
          try {
            if (!(xOffset === 0 && yOffset === 0)) {
              if (oldBoard[y + yOffset][x + xOffset]) {
                liveCells++;
              }
            }
          } catch (error) {
          }
        }
      }

      if (!oldBoard[y][x] && liveCells === 3) {
        board[y][x] = true;
      } else if (oldBoard[y][x] && (liveCells > 3 || liveCells <= 1)) {
        board[y][x] = false;
      } else if (oldBoard[y][x] && (liveCells === 2 || liveCells === 3)) {
        board[y][x] = true;
      }

      if (board[y][x]) {
        ctx.fillStyle = "rgb(255,255,255)";
      } else {
        ctx.fillStyle = "rgb(0,0,0)";
      }
      ctx.fillRect(x, y, 1, 1);

      //ctx.font = "0.5px Arial";
      //ctx.fillStyle = "Red"
      //ctx.fillText(`${liveCells}`,x,y+1);
    }
  }
}


