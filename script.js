var canvas = null;
var ctx = null;
const worldWidth = 16;
const worldHeight = 16;

var spritesheet = null;
var spritesheetLoaded = false;

var world = [[]];

var tileWidth = 32;
var tileHeight = 32;

var pathStart = [worldWidth / 2, worldHeight / 2];
var pathEnd = [0, 0];
var currentPath = [];
var playerHiddenLocation = -1;

var enemyImg = new Image();

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

let friends = [
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
  // {
  //   pathStart: [],
  //   currentPath: [],
  //   pathEnd: [],
  //   isMoving: false,
  //   color: "#d8bed8",
  // },
];

let hiddingSpots = [
  {
    pos: [5, 5],
    occupied: false,
    taken: false,
    hidden: -1,
  },
  {
    pos: [2, 11],
    occupied: false,
    taken: false,
    hidden: -1,
  },
  {
    pos: [4, 7],
    occupied: false,
    taken: false,
    hidden: -1,
  },
  {
    pos: [2, 4],
    occupied: false,
    taken: false,
    hidden: -1,
  },
  {
    pos: [10, 10],
    occupied: false,
    taken: false,
    hidden: -1,
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
  spritesheet = new Image();
  spritesheet.src =
    "data:image/png;base64,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";
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

  // for (var x = 0; x < worldWidth; x++) {
  //   for (var y = 0; y < worldHeight; y++) {
  //     if (Math.random() > 0.75) world[x][y] = 1;
  //   }
  // }

  currentPath = [];
  //while (currentPath.length == 0)
  // {
  // 	pathStart = [Math.floor(Math.random()*worldWidth),Math.floor(Math.random()*worldHeight)];
  // 	pathEnd = [Math.floor(Math.random()*worldWidth),Math.floor(Math.random()*worldHeight)];
  // 	if (world[pathStart[0]][pathStart[1]] == 0)
  // 	currentPath = findPath(world,pathStart,pathEnd);
  // }

  generateFriends();
  startMovingFriends();

  setInterval(() => {
    update();
  }, 500);
}

function redraw() {
  if (!spritesheetLoaded) return;

  console.log("redrawing...");

  var spriteNum = 0;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < worldWidth; x++) {
    for (var y = 0; y < worldHeight; y++) {
      switch (world[x][y]) {
        case 1:
          spriteNum = 1;
          break;
        default:
          spriteNum = 0;
          break;
      }

      ctx.drawImage(
        spritesheet,
        spriteNum * tileWidth,
        0,
        tileWidth,
        tileHeight,
        x * tileWidth,
        y * tileHeight,
        tileWidth,
        tileHeight
      );
    }
  }

  hiddingSpots.forEach((hs) => {
    ctx.fillStyle = hs.taken ? "white" : "grey";
    ctx.fillRect(
      hs.pos[0] * tileWidth,
      hs.pos[1] * tileHeight,
      tileWidth,
      tileHeight
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
    state = STATES.HIDDING
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
        e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
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

  //do {
  friendPathStartX = i + 5;
  friendPathStartY = 0;
  friendPathStart = [friendPathStartX, friendPathStartY];
  world[(friendPathStartX, friendPathStartY)] = 0;
  friendCurrentPath = findPath(world, friendPathStart, hiddingSpot.pos);
  //} while (friendCurrentPath.length === 0)

  return { friendPathStart, friendCurrentPath, hiddingSpot };
}

function generateFriends() {
  friends.forEach((friend, i) => {
    const { friendPathStart, friendCurrentPath, hiddingSpot } =
      generateFriend(i);

    console.log("AQUI", friendPathStart);

    friend.pathStart = friendPathStart;
    friend.currentPath = friendCurrentPath;
    friend.pathEnd = hiddingSpot.pos;
  });
  return true;
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
  hiddingSpots.forEach((hs) => (hs.hidden = -1));
}

function move() {
  if (isMoving) {
    const hiddenSpot = hiddingSpots.filter(
      (hs) =>
        hs.pos[0] === currentPath[0][0] &&
        hs.pos[1] === currentPath[0][1]
    )
    console.log(hiddenSpot)
    if (hiddenSpot.length) {
      console.log(hiddenSpot[0].hidden)
      if (hiddenSpot[0].hidden != -1) {
        pathStart = pathStart;
        currentPath = pathStart;
        pathEnd = pathStart;
        isMoving = false;
        return
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
        tick = 20;
        pathStart = [8, 0]
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
}

function moveFriends() {
  friends.forEach((friend, i) => {
    if (friend.isMoving) {
      if (friend.currentPath.length == 1) {
        friend.isMoving = false;
        //friend.pathStart = friend.currentPath[0];
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

var tick = 20;
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
  updateDebug();
  if (state === STATES.GAME_OVER) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(enemyImg, 25, 75, canvas.width - 50, canvas.height - 75);

    if (gameOverTick > 3) {
      ctx.font = "bold 32px serif";
      ctx.fillStyle = "white";
      const TEXT = "No one survived that night";
      const textSize = ctx.measureText(TEXT).width;
      ctx.fillText(TEXT, canvas.width / 2 - textSize / 2, 100);
    } else if (gameOverTick > 6) {
      state = STATES.GAME_START
      gameOverTick = 0
    }
    gameOverTick++;
  } else if (state === STATES.GAME_START) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 32px serif";
    ctx.fillStyle = "white";
    const TEXT = "This is what happened that night";
    const textSize = ctx.measureText(TEXT).width;
    ctx.fillText(TEXT, canvas.width / 2 - textSize / 2, 100);
  } else if (state === STATES.YOU_WIN) {
    alert("You win");
  } else if (state === STATES.HIDDING) {
    if (!friends.length) {
      state = STATES.YOU_WIN;
      return;
    }
    move();
    moveFriends();

    tick--;
    if (tick === 10) {
      generateEnemy();
      enemyTick = 5;
    }
    if (tick === 0) {
      tick = 20;
      zzfx(
        ...[, , 432, 0.01, , 0.42, , 4, , , , , , , 80, 0.1, , 0.65, 0.01, 0.32]
      ); // Random 33
      sequence1.stop();
      sequence2.stop();
      state = STATES.ATTACK;
    }
    redraw();
  } else if (state === STATES.ATTACK) {
    //playerHiddenLocation = isHidden()
    if (playerHiddenLocation === -1) {
      console.log("ON OPEN")
      enemy.currentPath = [enemy.currentPath[0], [pathStart[0], pathStart[1] + 1]]
      enemyTick--
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
  //friends[hiddingSpots[enemy.spot].hidden] = null
  //hiddingSpots[enemy.spot] = null
  //delete friends[hiddingSpots[enemy.spot].hidden]
  //delete hiddingSpots[enemy.spot]
  //hiddingSpots = hiddingSpots.filter((_, i) => i != enemy.spot)
  //friends = friends.filter((_, i) => i != enemy.spot)
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
  if (playerHiddenLocation === -1) {
    state = STATES.GAME_OVER
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
  // ctx.strokeStyle = "red";
  // ctx.rect(
  //   pathStart[0] * tileWidth,
  //   pathStart[1] * tileHeight,
  //   tileWidth,
  //   tileHeight
  // );
  // ctx.stroke()
  // ctx.fillStyle = "brown";
  // ctx.fillRect(
  //   pathEnd[0] * tileWidth,
  //   pathEnd[1] * tileHeight,
  //   tileWidth,
  //   tileHeight
  // );
  return;
  if (currentPath.length) {
    console.log("Current path length: " + currentPath.length);
    for (rp = 0; rp < currentPath.length; rp++) {
      switch (rp) {
        case 0:
          spriteNum = 2; // start
          break;
        case currentPath.length - 1:
          spriteNum = 3; // end
          break;
        default:
          spriteNum = 4; // path node
          break;
      }

      ctx.drawImage(
        spritesheet,
        spriteNum * tileWidth,
        0,
        tileWidth,
        tileHeight,
        currentPath[rp][0] * tileWidth,
        currentPath[rp][1] * tileHeight,
        tileWidth,
        tileHeight
      );
    }
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(
      pathStart[0] * tileWidth,
      pathStart[1] * tileHeight,
      tileWidth,
      tileHeight
    );
    ctx.drawImage(
      spritesheet,
      2 * tileWidth,
      0,
      tileWidth,
      tileHeight,
      2 * tileWidth,
      2 * tileHeight,
      tileWidth,
      tileHeight
    );
  }
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
