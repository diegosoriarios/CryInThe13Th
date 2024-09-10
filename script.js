var canvas = null;
var ctx = null;
const worldWidth = 16;
const worldHeight = 16;

var spritesheet = null;
var spritesheetLoaded = false;

var world = [[]];
var tileWidth = 32;
var tileHeight = 32;
var interval;

var pathStart = [worldWidth / 2, worldHeight / 2];
var pathEnd = [0, 0];
var currentPath = [];
var playerHiddenLocation = -1;

var enemyImg = new Image();
var friendsImg;
var charactersImg;
var bloodImg;
var nameImg

let timeouts = [];

let isMoving = false;

let enemy = {
  pathStart: [],
  currentPath: [],
  pathEnd: [],
  isMoving: false,
  color: "#3a4c64",
  isReturning: false,
  spot: -1,
};

let friends = []

const defaultFriends = [
  {
    pathStart: [],
    currentPath: [],
    pathEnd: [],
    isMoving: false,
    color: "#3a4c64",
  },
  {
    pathStart: [],
    currentPath: [],
    pathEnd: [],
    isMoving: false,
    color: "#909e8d",
  },
  {
    pathStart: [],
    currentPath: [],
    pathEnd: [],
    isMoving: false,
    color: "#c19e7e",
  },
  {
    pathStart: [],
    currentPath: [],
    pathEnd: [],
    isMoving: false,
    color: "#393124",
  },
];

let hiddingSpots = []

const defaultHiddingSpots = [
  {
    pos: [5, 5],
    occupied: false,
    taken: false,
    w: 43,
    h: 32,
    off: [-5, 0],
    hidden: -1,
    image: 1,
  },
  {
    pos: [2, 11],
    occupied: false,
    taken: false,
    hidden: -1,
    image: 2,
    w: 32,
    h: 32,
  },
  {
    pos: [4, 7],
    occupied: false,
    taken: false,
    hidden: -1,
    image: 3,
    w: 32,
    h: 32,
  },
  {
    pos: [2, 4],
    occupied: false,
    taken: false,
    hidden: -1,
    image: 4,
    w: 32,
    h: 32,
  },
  {
    pos: [10, 10],
    occupied: false,
    taken: false,
    hidden: -1,
    image: 5,
    off: [-8, 0],
    w: 48,
    h: 30,
  },
];

var ac = new AudioContext(),
  // get the current Web Audio timestamp (this is when playback should begin)
  when = ac.currentTime,
  // set the tempo
  tempo = 132,
  // initialize some vars
  sequence1,
  sequence2,
  sequence3,
  // create an array of "note strings" that can be passed to a sequence
  //   'w' is a whole note
  // 'h' is a half note
  // 'q' is a quarter note
  // 'e' is an eighth note
  // 's' is a sixteenth note
  lead = [
    "G4  e",
    "-   e",
    "G3  e",
    "-   e",
    "F4  e",
    "-   e",
    "G#4  e",
    "-   e",
    "G4  e",
    "-   e",

    "G3  e",
    "-   e",
    "F4  e",
    "-   e",
    "G#4  e",
    "-   e",
    "G4  e",
    "-   e",

    "G3  e",
    "-   e",
    "F4  e",
    "-   e",
    "G#4  e",
    "-   e",
    "G4  e",
    "-   e",

    "G4  e",
    "-   e",
    "F4  e",
    "-   e",
    "G#4  e",
    "-   e",
  ],
  harmony = [
    "D4  e",
    "D3  e",
    "D4  e",
    "D3  e",
    "F4  e",
    "D3  e",
    "F4  e",
    "D3  e",
    "D4  e",
    "D3  e",
    "D4  e",
    "D3  e",
    "F4  e",
    "D3  e",
    "F4  e",
    "D3  e",
  ],
  // harmony = [
  //   'B3  s',
  //   'B2  s',
  //   'F#3 s',
  //   'B2  s',
  //   'B3  s',
  //   'B2  s',
  //   'F#3 s',
  //   'B2  s',

  //   'G2  e',
  //   'A2  e',
  //   'Bb2 e',
  //   'A2  e',

  //   'B3  s',
  //   'B2  s',
  //   'F#3 s',
  //   'B2  s',
  //   'B3  s',
  //   'B2  s',
  //   'F#3 s',
  //   'B2  s',

  //   'G2  e',
  //   'A2  e',
  //   'Bb2 e',
  //   'A2  e',
  // ],
  bass = [
    "D3  q",
    "-   h",
    "D3  q",

    "A2  q",
    "-   h",
    "A2  q",

    "Bb2 q",
    "-   h",
    "Bb2 q",

    "F2  h",
    "A2  h",
  ];

// create 3 new sequences (one for lead, one for harmony, one for bass)
sequence1 = new TinyMusic.Sequence(ac, tempo, lead);
sequence2 = new TinyMusic.Sequence(ac, tempo, harmony);
sequence3 = new TinyMusic.Sequence(ac, tempo, bass);

// set staccato and smoothing values for maximum coolness
sequence1.staccato = 0.55;
sequence2.staccato = 0.55;
sequence3.staccato = 0.05;
sequence3.smoothing = 0.4;

// adjust the levels so the bass and harmony aren't too loud
sequence1.gain.gain.value = 0.3;
sequence2.gain.gain.value = 0.2;
sequence3.gain.gain.value = 0.1;

// apply EQ settings
sequence1.mid.frequency.value = 800;
sequence1.mid.gain.value = 3;
sequence2.mid.frequency.value = 1200;
sequence3.mid.gain.value = 3;
sequence3.bass.gain.value = 6;
sequence3.bass.frequency.value = 80;
sequence3.mid.gain.value = -6;
sequence3.mid.frequency.value = 500;
sequence3.treble.gain.value = -2;
sequence3.treble.frequency.value = 1400;

if (typeof console == "undefined") var console = { log: function () {} };

function generateHiddingSpots() {
  hiddingSpots.forEach((hs, i) => {
    let hiddingSpotPos = [-1, -1];
    while (hiddingSpotPos[0] == -1 && hiddingSpotPos[1] == -1) {
      const hiddingSpotX = getRandomInt(2, 13);
      const hiddingSpotY = getRandomInt(2, 13);
      if (world[hiddingSpotX][hiddingSpotY] === 0) {
        hiddingSpotPos = [hiddingSpotX, hiddingSpotY];
        world[hiddingSpotX][hiddingSpotY] = -1;
      }
    }
    hs.pos = hiddingSpotPos;
  });
  return true;
}

var image1;
var image2;
var image3;
var image4;
var image5;

function loadImages() {
  image1 = new Image();
  image1.src =
    "data:image/png;base64,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";

  image2 = new Image();
  image2.src = `data:image/png;base64,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`;

  image3 = new Image();
  image3.src = `data:image/png;base64,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`;

  image4 = new Image();
  image4.src = `data:image/png;base64,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`;

  image5 = new Image();
  image5.src = `data:image/png;base64,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`;

  bloodImg = new Image();
  bloodImg.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAArBJREFUWEeNV1d2w0AIXHz/K8ebR++S/ZFY0ooyDAOGQx84cO65cM65dMn/7QvfsNvyjhwarswim2dz93MOkNnwQZv9kz3Z8xbX+LLf1PNfifTDef4QQHeZXxLLaBgYJgMLM5VLwAdfgvYcGJzra895BDTQuDqMjiLMGgmeu4I4cHGXUsWSD6FERzWAmJWeiyaw5ogARpJYEZKaOcCUazaVn4lEcOASyPMHEHxltpiMFFtJOBmdAmj3CoG1ZH47d1QJwI9NkLYiLt1S2ox8xPLtbZjZ/WOThWOEdq4Gk9E7ozahI1DYHtRoDMSgH1EQ4C0W/mItG2OerK/wh8NI7KYqxVjlR+eDikgRHhKQqLNFhN3PGwkUYEEAW8Ky4wTwb3KlhHkhADfWk//yDM+jLlS7QwAErMWZYJSWJmVJw6qYrYHJtcu2k9XYEpBpiCTzbSIVWVsliVmITeJIUP4hvFtr3wuRyNeCEa5HYVzKxI65APyRg7UDcgk6X0auvHBTk8AIRim+cO7nAnyrqqxt9tYN/CInk0QZRiKrbCY0fvPRAIkIPgiRrGRbOci5zVX+jj28qGCc/1s766uOyKgHLBvTFHzSiS1TLUGc3iMHVIxYuMp0KShVEm+aHwOOeBsLa/sq4r/MBScY9zjJuPbZw6qizTeiaQHIUjlIqKCTa6et9cf7I8URT6TT9aHrAXl9ip1KF9HRw1HvaWuGcz6q3CGLTsLW43knnNqpLhp6jfu/h8+uti5edcDjMQMUUURtX83L8mHppiHUhMmiRMNTxi0Ltie/Ffipl4W4HmaNLMdlgZ6luMxDX63T2IgjJA+UJ5Gw8WNrWj4tPySIvcidN1UTkVx+1Pbe8angycgk9LGsOyx2wqRq8wTsG7ExoTVUGkhl/61xqFo8LRpvZ9YWOOcfhFpMN2J5W/kAAAAASUVORK5CYII=`;

  nameImg = new Image()
  nameImg.src = "data:image/png;base64,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"
}

function onload() {
  console.log("Page loaded.");
  canvas = document.getElementById("gameCanvas");
  canvas.width = worldWidth * tileWidth;
  canvas.height = worldHeight * tileHeight;
  canvas.addEventListener("click", canvasClick, false);
  if (!canvas) alert("Blah!");
  ctx = canvas.getContext("2d");
  if (!ctx) alert("Hmm!");
  ctx.imageSmoothingEnabled = false;
  loadImages();
  hiddingSpots = JSON.parse(JSON.stringify(defaultHiddingSpots))
  friends = JSON.parse(JSON.stringify(defaultFriends))
  spritesheet = new Image();
  spritesheet.src =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAgCAYAAACVf3P1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAIN0lEQVR42mJMWaLzn4FEoCrxC86+/YINRQzER2aj68GmnhDgOx6EV/6T5Tqy7S9zvsnIMAoGDAAEEGPnHrX/6IkAFDm4EgZy4kNPhMSaQUgdTAyW8Oz1pMC0sAw7irq3T36C6YOXnqEkRlLsnx19eTQBDiAACCAWWImBHFnEJD7kkgYbICbykc1Btx+U+NATnqKhBpruG2AySEYRniAPAvWBEiGx9sNzYiQj3prg//L/jLQ0b72zN171gXu3kmQ/qebZiEv9/8fwn+E/UNdfIPEXyPsHpMEYKH/53RuS7CfWPIAA7JXhCoBACIPn9Crq/d83VncghEf0O0GQ4eafD2T1qmbgjf0xVyDOAK1glSfDN+oJ361lXaDKJ7/67f2/gCMadg+s7licaCRoBlN/zLsyI7Apkw63npn2TgHEQqhahEUivioNW7uL2CoQHbxcH4GS+NCrXWRw//wNDDGQelCJCC4NgWbxoVXNhACpJR2p5hAqGUkt6Ug1B1fJyM3KyvDn3z+GTY/uUcX+nU8fYjXHWETs/z8kPkAAsWBrvBPqfOBLiKRWwej2v8SS8LCVftgSH6q6GxhVMykJcaQBHmBJ9evfP5rbAyoF//7/C+cDBBALsaUeMYmP0o4HrPTD1eZDTnTIcjDxM5svgvUiV80gOZRSEZgQxQNXkFU6D2cAShgMDPRIgKhVMEAAseArydBLNPQSktjOC6HqnRgAS2S42oIweVAie/vkIrwURU+I9gxS4KqZAWnoZhQwMPz4+weI/9J+2AWc+hBJECCAmEjtscISDjmRh6wH21giPoDe4cCWOLG1F9ETLkzNaOJDBT+B1S8oEdIaMKF1aQACiAm5tMOVQEgZiiGlR4zRo75/H2V8j1gAS5wgbOKrj7NdiJ6AR6thBPj+5w/DdzokQHQAEEAsuEo4QpGDa/CZmMRHbFsRVHrhKvVwqYVVtbiqa1zup1bvl9zeMbV6v+T2jrc/eUAX+4+8fIZiD0AAMWFLIPgSB7ocKe05UmZXYKUgKEFh6/EiJzyYPHJ1S2zCHQUDCwACiAm5x0ssIGYYBlcbD1vvF109qARDb8+hJ0JsCZNQwsOXkEfBwACAAGIhp2ok1HNGb0sit/UIlbD4hmCQq2RSSzjkxAdqa4pb4lTqAMT5QCwAxI1ArADE8UjyF4C4EMpeD8QTgfgAlL8fSh+A6k3Ao5dYUADE/kD8AaoXRPdD3QWyewNUHcgufSTzDaB4wWBOgAABxIStQ0CNXiJyQiTGrCN95gyqiop4OxrklmIk6qkH4kQgdgTiB9AIdITKOSJFcAA0QcWj6XeEJg4HPHqJBf1IehOREt9CqFg8NJExQBOpANRuBihbnqapJ9T5PxhTAAACiAk94SGXWsTOjBDSi88sZPvR538pBeilJnLb8uHG3/i0wkrAB3jU+ENLIAMkMQFowlMgoJdYADJ7AlJpBhODlbgToe6A2XcQmjFoD5ATHgWJECCAmHAlKmJLQFxjgrg6K5QAUjoX+AauCQBQyfIQiOdDqzVsAFbSfIAmhgAk8Xyo2AMqRrcBtGQ2gNqJLcNshFbH8UOpDQgQQEy4SjRsJSOpHRRizSBQGmEkKljJhq1qRRbHVW2DqnqOr2b47F0ArfJwRWYANLHthyYKf6g4KNEFIslTK/EtQCr1GJDM9oeWeg7QBLoerRqmHVi9lxErm0QAEEAs+Hqx2PjI4qTM/xIDQAtLYQsI0KtO9KEWQu07CoZh9iOxG/FUv4FIpdx5NPmJ0FKpkcIgKYSWxLBSbyNUDJbQDkDlLkAzDKwzAmufJkATJwNSW5Q2iZBMABBAjLiW5GNLgPiqVGwJlFjwcpkhvAOCvBiB2GoZW2LEVfqBFyRAV1CDesObti4aXRE9gAAggJiwtf3IGRskpB5XhwVWDSJ3QPBNxcHk8LUH8SU+WnR2RgH5ACCAmHD1VPENNhMq4YiZH8Ymhi9hQFa5/ERZ4ULFoZdRMEAAIICY8HUkiF0LiCyPa6YDVzUO6gzgG/9DBrCqGV/iQl+aRUypCm6LRDL+J7RamRoAlz2glcqE9nFQA+CyR19I5L8uENPafnR7AAKIhZg1faQuTCCmDYisBrndhy2hYBPDNcwCEsemHt18kJ2w1TejgAG8V+P///90twcggFiQOxCkdh4IdThw7R9GZr9ESmTY5oBJqWrREx6ubZywHvcoQE0Y/wbAHoAAYsG3rIrYxIUvYRKzegaUGLC1/0hdF4gr8WEzB1T6sYueGE15UIC+V4Ne9gAEEAs1Eh+uZfbEVN3iUecZbi+DClzC3ylBTkj4SjdCiQ9W+gm4so+mPHjCIG/7JaX2AAQQyathCPVwYb1pUk5XQE6EyOOB6AkG21ANriob26kJmKXfaAKEAdBe4L//mWhuD/qeEIAAYsHXeSB2TR+lnRZYIgSNCd6+j0gkyAkSX1WNXvXiSnwwM39wn2IQx1H64eoJU/tkBHy9VGzi1D4ZAR1wMbOCaUsxyf/UOBkhSEHlPzsTEwMHMwvYrC9//jB8/f0bY08IQACxkNrGo8a0G67SUd4fFAiQhMjP9Q+aaJD0ETFcg574kHu6oIQHAjCzRwECcLKwgA7SACaPvwx/gAnmDzCIfv8DHa4BzExk9I4hpyEwMbAwARPcPyac1TtAAOGdikOuUolJfLgSFq5pPWLamXtmMsITzM/XFvCEiH56AmyKDX1oBZToQPo/fkNULy7p/+H2jx5ONLAAIIBwno6Fq0rGt3EJ37Fo6ImZmKofmzgoQYIGr3EBUNsOObHBEq9pLCNW+0ePZxtYABBgAEdytom0/RTgAAAAAElFTkSuQmCC";
  spritesheet.onload = loaded;
}

function loaded() {
  console.log("Spritesheet loaded.");
  spritesheetLoaded = true;
  enemyImg.src = "./assets/enemy.png";
  createWorld();
}

function createWorld() {
  console.log("Creating world...");

  for (var x = 0; x < worldWidth; x++) {
    world[x] = [];

    for (var y = 0; y < worldHeight; y++) {
      world[x][y] = 0;
    }
  }

  generateHiddingSpots();

  currentPath = [];
  generateFriends();
  startMovingFriends();

  interval = setInterval(() => {
    update();
  }, 500);
}

function drawBlood(x, y) {
  ctx.globalAlpha = 0.4;
  ctx.drawImage(bloodImg, x, y, tileWidth, tileHeight);
  ctx.globalAlpha = 1;
}

function redraw() {
  if (!spritesheetLoaded) return;

  console.log("redrawing...");

  var spriteNum = 0;

  //ctx.fillStyle = "#000000";
  ctx.fillStyle = "rgba(165,193,80, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < worldWidth; x++) {
    for (var y = 0; y < worldHeight; y++) {
      if (world[x][y] === -11) {
        ctx.drawImage(image1, x * tileWidth - 5, y * tileHeight, 43, 32);
        drawBlood(x * tileWidth, y * tileHeight);
      } else if (world[x][y] === -12) {
        ctx.drawImage(
          image2,
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight
        );
        drawBlood(x * tileWidth, y * tileHeight);
      } else if (world[x][y] === -13) {
        ctx.drawImage(
          image3,
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight
        );
        drawBlood(x * tileWidth, y * tileHeight);
      } else if (world[x][y] === -14) {
        ctx.drawImage(
          image4,
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight
        );
        drawBlood(x * tileWidth, y * tileHeight);
      }
      if (world[x][y] === -15) {
        ctx.drawImage(image5, x * tileWidth - 8, y * tileHeight, 48, 30);
        drawBlood(x * tileWidth, y * tileHeight);
      }
    }
  }

  const getImage = (index) => {
    switch (index) {
      case 1:
        return image1;
      case 2:
        return image2;
      case 3:
        return image3;
      case 4:
        return image4;
      case 5:
        return image5;
    }
  };

  hiddingSpots.forEach((hs) => {
    ctx.fillStyle = hs.taken ? "white" : "grey";
    const xOffset = hs.off ? hs.off[0] : 0;
    const yOffset = hs.off ? hs.off[1] : 0;
    ctx.drawImage(
      getImage(hs.image),
      hs.pos[0] * tileWidth + xOffset,
      hs.pos[1] * tileHeight + yOffset,
      hs.w,
      hs.h
    );
  });

  drawPlayer();

  if (state === STATES.HIDDING) {
    drawFriends();
  } else {
    drawEnemy();
  }
}

function canvasClick(e) {
  if (state === STATES.GAME_START) {
    //start the lead part immediately
    sequence1.play(when);
    // delay the harmony by 16 beats
    sequence2.play(when); //+ ( 60 / tempo ) * 16 );
    // start the bass part immediately
    //sequence3.play( when );
    state = STATES.HIDDING;
  } else if (state === STATES.HIDDING) {
    if (isMoving) return;

    var x;
    var y;

    if (e.pageX != undefined && e.pageY != undefined) {
      x = e.pageX;
      y = e.pageY;
    } else {
      x =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      y =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    var cell = [Math.floor(x / tileWidth), Math.floor(y / tileHeight)];

    console.log("we clicked tile " + cell[0] + "," + cell[1]);

    //pathStart = pathEnd;
    pathEnd = cell;

    currentPath = findPath(world, pathStart, pathEnd);
    isMoving = true;
    // move()
    // redraw();
  }
}

function findPath(world, pathStart, pathEnd) {
  var abs = Math.abs;
  var max = Math.max;
  var pow = Math.pow;
  var sqrt = Math.sqrt;

  var maxWalkableTileNum = 0;

  var worldSize = worldWidth * worldHeight;

  var distanceFunction = DiagonalDistance;
  var findNeighbours = DiagonalNeighboursFree;

  //var distanceFunction = ManhattanDistance;
  //var findNeighbours = function(){}; // empty
  /*

	// alternate heuristics, depending on your game:

	// diagonals allowed but no sqeezing through cracks:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighbours;

	// diagonals and squeezing through cracks allowed:
	var distanceFunction = DiagonalDistance;
	var findNeighbours = DiagonalNeighboursFree;

	// euclidean but no squeezing through cracks:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighbours;

	// euclidean and squeezing through cracks allowed:
	var distanceFunction = EuclideanDistance;
	var findNeighbours = DiagonalNeighboursFree;

	*/

  function ManhattanDistance(Point, Goal) {
    return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
  }

  function DiagonalDistance(Point, Goal) {
    return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
  }

  function EuclideanDistance(Point, Goal) {
    return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
  }

  function Neighbours(x, y) {
    var N = y - 1,
      S = y + 1,
      E = x + 1,
      W = x - 1,
      myN = N > -1 && canWalkHere(x, N),
      myS = S < worldHeight && canWalkHere(x, S),
      myE = E < worldWidth && canWalkHere(E, y),
      myW = W > -1 && canWalkHere(W, y),
      result = [];
    if (myN) result.push({ x: x, y: N });
    if (myE) result.push({ x: E, y: y });
    if (myS) result.push({ x: x, y: S });
    if (myW) result.push({ x: W, y: y });
    findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
    return result;
  }

  function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result) {
    if (myN) {
      if (myE && canWalkHere(E, N)) result.push({ x: E, y: N });
      if (myW && canWalkHere(W, N)) result.push({ x: W, y: N });
    }
    if (myS) {
      if (myE && canWalkHere(E, S)) result.push({ x: E, y: S });
      if (myW && canWalkHere(W, S)) result.push({ x: W, y: S });
    }
  }

  function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result) {
    myN = N > -1;
    myS = S < worldHeight;
    myE = E < worldWidth;
    myW = W > -1;
    if (myE) {
      if (myN && canWalkHere(E, N)) result.push({ x: E, y: N });
      if (myS && canWalkHere(E, S)) result.push({ x: E, y: S });
    }
    if (myW) {
      if (myN && canWalkHere(W, N)) result.push({ x: W, y: N });
      if (myS && canWalkHere(W, S)) result.push({ x: W, y: S });
    }
  }

  function canWalkHere(x, y) {
    return (
      world[x] != null &&
      world[x][y] != null &&
      world[x][y] <= maxWalkableTileNum
    );
  }

  function Node(Parent, Point) {
    var newNode = {
      Parent: Parent,
      value: Point.x + Point.y * worldWidth,
      x: Point.x,
      y: Point.y,
      f: 0,
      g: 0,
    };

    return newNode;
  }

  function calculatePath() {
    var mypathStart = Node(null, { x: pathStart[0], y: pathStart[1] });
    var mypathEnd = Node(null, { x: pathEnd[0], y: pathEnd[1] });
    var AStar = new Array(worldSize);
    var Open = [mypathStart];
    var Closed = [];
    var result = [];
    var myNeighbours;
    var myNode;
    var myPath;
    var length, max, min, i, j;
    while ((length = Open.length)) {
      max = worldSize;
      min = -1;
      for (i = 0; i < length; i++) {
        if (Open[i].f < max) {
          max = Open[i].f;
          min = i;
        }
      }
      myNode = Open.splice(min, 1)[0];
      if (myNode.value === mypathEnd.value) {
        myPath = Closed[Closed.push(myNode) - 1];
        do {
          result.push([myPath.x, myPath.y]);
        } while ((myPath = myPath.Parent));
        AStar = Closed = Open = [];
        result.reverse();
      } else {
        myNeighbours = Neighbours(myNode.x, myNode.y);
        for (i = 0, j = myNeighbours.length; i < j; i++) {
          myPath = Node(myNode, myNeighbours[i]);
          if (!AStar[myPath.value]) {
            myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
            myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
            Open.push(myPath);
            AStar[myPath.value] = true;
          }
        }
        Closed.push(myNode);
      }
    }
    return result;
  }

  return calculatePath();
}

function generateFriend(i) {
  let hiddingSpot = null;
  let friendCurrentPath = [];
  while (hiddingSpot == null) {
    const hiddingSpotIndex = getRandomInt(0, hiddingSpots.length - 1);
    hiddingSpot = hiddingSpots[hiddingSpotIndex];
    if (!hiddingSpot || hiddingSpot.occupied) [(hiddingSpot = null)];
  }

  hiddingSpot.occupied = true;

  let friendPathStartX;
  let friendPathStartY;
  let friendPathStart;

  friendPathStartX = i + 5;
  friendPathStartY = 0;
  friendPathStart = [friendPathStartX, friendPathStartY];
  world[(friendPathStartX, friendPathStartY)] = 0;
  friendCurrentPath = findPath(world, friendPathStart, hiddingSpot.pos);

  return { friendPathStart, friendCurrentPath, hiddingSpot };
}

function generateFriends() {
  friends.forEach((friend, i) => {
    const { friendPathStart, friendCurrentPath, hiddingSpot } =
      generateFriend(i);

    friend.pathStart = friendPathStart;
    friend.currentPath = friendCurrentPath;
    friend.pathEnd = hiddingSpot.pos;
  });
}

function startMovingFriends() {
  friends.forEach((friend) => (friend.isMoving = true));
}

function generateEnemy(isEntering = true) {
  if (isEntering) {
    const hiddingSpotIndex = getRandomInt(0, hiddingSpots.length - 1);
    const hiddingSpot = hiddingSpots[hiddingSpotIndex];
    const hiddingSpotPos = [hiddingSpot.pos[0] - 1, hiddingSpot.pos[1]];

    const enemyPathStart = [7, 1];

    const enemyCurrentPath = findPath(world, enemyPathStart, hiddingSpotPos);
    console.log(enemyCurrentPath);
    enemy.spot = hiddingSpotIndex;
    enemy.currentPath = enemyCurrentPath;
    enemy.pathEnd = hiddingSpotPos;
    enemy.pathStart = enemyPathStart;
    enemy.isMoving = true;
    enemy.isReturning = !isEntering;
  } else {
    const enemyPathEnd = [7, 0];

    const enemyCurrentPath = findPath(world, enemy.pathStart, enemyPathEnd);
    enemy.currentPath = enemyCurrentPath;
    enemy.pathEnd = enemyPathEnd;
    enemy.isMoving = true;
    enemy.isReturning = !isEntering;
  }
}

function cleanHiddingSpots() {
  hiddingSpots.forEach((hs) => {
    world[hs.pos[0]][hs.pos[1]] = 0;
    hs.hidden = -1;
  });
}

function move() {
  if (isMoving) {
    const hiddenSpot = hiddingSpots.filter(
      (hs) => hs.pos[0] === currentPath[0][0] && hs.pos[1] === currentPath[0][1]
    );
    if (hiddenSpot.length) {
      console.log(hiddenSpot[0].hidden);
      if (hiddenSpot[0].hidden != -1) {
        pathStart = pathStart;
        currentPath = pathStart;
        pathEnd = pathStart;
        isMoving = false;
        return;
      }
    }
    if (currentPath.length == 1) {
      isMoving = false;
      pathStart = currentPath[0];
    } else {
      pathStart = currentPath.shift();
    }
    playerHiddenLocation = isHidden();
    if (playerHiddenLocation !== -1) {
      hiddingSpots[playerHiddenLocation].occupied = true;
    }
  }
}

function isHidden() {
  return hiddingSpots.findIndex((hs) => {
    const x = pathStart[0];
    const y = pathStart[1];

    return hs.pos[0] === x && hs.pos[1] === y;
  });
}

function moveEnemy() {
  if (enemy.isMoving) {
    if (enemy.currentPath.length == 1) {
      enemy.isMoving = false;
      enemy.pathStart = enemy.currentPath[0];
      if (enemy.isReturning) {
        state = STATES.HIDDING;
        sequence1.play(when);
        sequence2.play(when); //+ ( 60 / tempo ) * 16 );
        tick = TICK_START;
        pathStart = [worldWidth / 2, worldHeight / 2];
        startMovingFriends();
      }
    } else {
      enemy.pathStart = enemy.currentPath.shift();
    }
  }
}

function drawEnemy() {
  drawPerson(
    enemy.pathStart[0] * tileWidth,
    enemy.pathStart[1] * tileHeight,
    "white"
  );
  const x = enemy.pathStart[0] * tileWidth;
  const y = enemy.pathStart[1] * tileHeight;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x + 26, y + 17);
  ctx.lineTo(x + 30, y);
  ctx.lineTo(x + 28, y + 17);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function moveFriends() {
  friends.forEach((friend, i) => {
    if (friend.isMoving) {
      if (friend.currentPath.length == 1) {
        friend.isMoving = false;
        friendPathStartX = i + 5;
        friendPathStartY = 0;
        friend.pathStart = [friendPathStartX, friendPathStartY];
        const hiddenSpot = hiddingSpots.filter(
          (hs) =>
            hs.pos[0] === friend.currentPath[0][0] &&
            hs.pos[1] === friend.currentPath[0][1]
        );
        if (hiddenSpot && hiddenSpot.length) {
          if (!hiddenSpot[0].taken) {
            hiddenSpot[0].hidden = i;
          } else {
            const { friendPathStart, friendCurrentPath, hiddingSpot } =
              generateFriend(friend);

            friend.pathStart = friendPathStart;
            friend.currentPath = friendCurrentPath;
            friend.pathEnd = hiddingSpot.pos;
            friend.isMoving = true;
          }
        }
        return;
      }

      let path = friend.currentPath.shift();
      friend.pathStart = path;

      if (playerHiddenLocation !== -1) {
        const hsPos = hiddingSpots[playerHiddenLocation].pos;
        if (friend.pathEnd[0] === hsPos[0] && friend.pathEnd[1] === hsPos[1]) {
          console.log(hiddingSpots);
          const hiddingSpot = hiddingSpots.filter(
            (hs) => hs.occupied === false
          )[0];
          friendCurrentPath = findPath(world, path, hiddingSpot.pos);
          friend.currentPath = friendCurrentPath;
          playerHiddenLocation = -1;
          //generateFriend(friend)
        }
      }
    }
  });
}

function drawFriends() {
  friends.forEach((friend) => {
    if (!friend.isMoving) return;
    if (!friend.pathStart) return;
    drawPerson(
      friend.pathStart[0] * tileWidth,
      friend.pathStart[1] * tileHeight,
      friend.color
    );
  });
}

var TICK_START = 20;
var tick = TICK_START;
var enemyTick = 5;
var gameOverTick = 0;
var canMoveFriends = false;
var STATES = {
  HIDDING: "HIDDING",
  TRANSITION: "TRANSITION",
  ATTACK: "ATTACK",
  GAME_OVER: "GAME_OVER",
  YOU_WIN: "YOU_WIN",
  GAME_START: "GAME_START",
};
var state = STATES.GAME_START;

function updateDebug() {
  const debugDiv = document.getElementById("debug");
  debugDiv.innerHTML = `TICK: ${tick}`;
  debugDiv.innerHTML += `\nENEMY CPATH: ${enemy.currentPath.length}`;
  debugDiv.innerHTML += `\nENEMY TICK: ${enemyTick}`;
}

function update() {
  //updateDebug();
  if (state === STATES.GAME_OVER) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(enemyImg, 25, 75, canvas.width - 50, canvas.height - 75);

    if (gameOverTick > 6) {
      state = STATES.GAME_START;
      gameOverTick = 0;
    } else if (gameOverTick > 3) {
      ctx.font = "bold 32px serif";
      ctx.fillStyle = "white";
      const TEXT = "No one survived that night";
      const textSize = ctx.measureText(TEXT).width;
      ctx.fillText(TEXT, canvas.width / 2 - textSize / 2, 100);
      hiddingSpots = []
      hiddingSpots = JSON.parse(JSON.stringify(defaultHiddingSpots))
      friends = JSON.parse(JSON.stringify(defaultFriends))

      generateHiddingSpots();
      currentPath = [];
      generateFriends();
    }
    gameOverTick++;
  } else if (state === STATES.GAME_START) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(nameImg, tileWidth * 2, 64, tileWidth * 12, 4 * tileHeight)

    ctx.font = "bold 32px serif";
    ctx.fillStyle = "white";
    const TEXT = "This is what happened that night";
    const textSize = ctx.measureText(TEXT).width;
    ctx.fillText(TEXT, canvas.width / 2 - textSize / 2, 300);
    ctx.font = "bold 24px serif";
    const TEXT2 = "Use the mouse to hide before he gets you";
    const textSize2 = ctx.measureText(TEXT2).width;
    ctx.fillText(TEXT2, canvas.width / 2 - textSize2 / 2, 350);
  } else if (state === STATES.YOU_WIN) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 32px serif";
    ctx.fillStyle = "white";
    const TEXT = "You were the only survivor.";
    const textSize = ctx.measureText(TEXT).width;
    ctx.fillText(TEXT, canvas.width / 2 - textSize / 2, 100);
    if (gameOverTick > 6) {
      state = STATES.GAME_START;
      gameOverTick = 0;
    }
    gameOverTick++;
  } else if (state === STATES.HIDDING) {
    if (!friends.length) {
      state = STATES.YOU_WIN;
      return;
    }
    move();

    if (tick <= TICK_START - 1) {
      moveFriends();
    }

    tick--;
    if (tick === 10) {
      generateEnemy();
      enemyTick = 5;
    }
    if (tick === 0) {
      tick = TICK_START;
      zzfx(
        ...[, , 432, 0.01, , 0.42, , 4, , , , , , , 80, 0.1, , 0.65, 0.01, 0.32]
      ); // Random 33
      sequence1.stop();
      sequence2.stop();
      state = STATES.ATTACK;
    }
    redraw();
  } else if (state === STATES.ATTACK) {
    playerHiddenLocation = isHidden();
    if (playerHiddenLocation === -1) {
      if (pathStart[1] < 15)
        enemy.currentPath = [
          enemy.currentPath[0],
          [pathStart[0], pathStart[1] + 1],
        ];
      else
        enemy.currentPath = [
          enemy.currentPath[0],
          [pathStart[0], pathStart[1] - 1],
        ];
      enemyTick--;
      if (enemyTick == 3) {
        handleAttack();
      }
    }
    if (!enemy.isMoving) {
      enemyTick--;
      if (enemyTick == 3) {
        handleAttack();
      }
      if (enemyTick == 1) {
        cleanHiddingSpots();
        generateFriends();
        console.log(friends);
      }
      if (enemyTick == 0) {
        generateEnemy(false);

        enemyTick = 5;
      }
    }
    moveEnemy();
    redraw();
  }
}

// TODO: GET MICROFONE

onload();

function handleAttack() {
  zzfx(
    ...[
      1.3,
      ,
      129,
      0.02,
      0.03,
      0.04,
      4,
      2.6,
      4,
      ,
      ,
      ,
      ,
      0.5,
      ,
      0.5,
      ,
      0.51,
      0.01,
    ]
  ); // Hit 22
  playerHiddenLocation = isHidden();
  if (playerHiddenLocation === -1) {
    state = STATES.GAME_OVER;
    return;
  }
  if (hiddingSpots[enemy.spot].hidden == -1) {
    zzfx(
      ...[
        1.1,
        ,
        403,
        ,
        0.35,
        0.18,
        4,
        3.8,
        4,
        ,
        -40,
        0.01,
        ,
        ,
        20,
        0.7,
        ,
        0.78,
        ,
        0.1,
        185,
      ]
    );
    zzfx(
      ...[
        2,
        ,
        403,
        ,
        0.35,
        0.18,
        4,
        3.8,
        4,
        ,
        -40,
        0.01,
        ,
        ,
        20,
        0.7,
        ,
        0.78,
        ,
        0.1,
        185,
      ]
    );
    gameOverTick = 0;
    state = STATES.GAME_OVER;
  } else {
    friends.splice(hiddingSpots[enemy.spot].hidden, 1);
    const x = hiddingSpots[enemy.spot].pos[0];
    const y = hiddingSpots[enemy.spot].pos[1];
    world[x][y] = -10 - hiddingSpots[enemy.spot].image;
    hiddingSpots.splice(enemy.spot, 1);
    hiddingSpots.forEach((hs) => {
      hs.occupied = false;
      hs.taken = false;
    });
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPlayer() {
  const x = pathStart[0] * tileWidth;
  const y = pathStart[1] * tileHeight;
  drawPerson(x, y, "black");
}

function drawPerson(x, y, color) {
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.beginPath();
  //HEAD
  ctx.fillStyle = color;
  ctx.arc(x + tileWidth / 2 - 1, y, 3, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  //BODY
  ctx.moveTo(x + 12, y + 4);
  ctx.lineTo(x + 8, y + 6);
  ctx.lineTo(x + 4, y + 18);
  ctx.lineTo(x + 10, y + 10);
  ctx.lineTo(x + 10, y + 18);
  ctx.lineTo(x + 19, y + 18);
  ctx.lineTo(x + 19, y + 12);
  ctx.lineTo(x + 24, y + 18);
  ctx.lineTo(x + 20, y + 6);
  ctx.lineTo(x + 16, y + 4);

  //LEGS
  ctx.fillStyle = "black";
  ctx.moveTo(x + 10, y + 18);
  ctx.lineTo(x + 11, y + tileHeight);
  ctx.lineTo(x + 14, y + 18);
  ctx.moveTo(x + 15, y + 18);
  ctx.lineTo(x + 18, y + tileHeight);
  ctx.lineTo(x + 19, y + 18);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
