const events = require("events");
const THREE = require("three");
const { blockFactory } = require("./lib/block");
const { boardFactory } = require("./lib/board");
const { configFactory } = require("./lib/config");
const { utils } = require("./lib/utils");
const { CONSTANTS } = require("./lib/constants");

/**
 * Engine configuration
 */
function engineFactory() {
  function gameStateFactory(timeStep = 1000, frameRate = 60) {
    // time is in ms
    return {
      gameStepTime: timeStep,
      frameTime: 0,
      cumulatedFrameTime: 0,
      _lastFrameTime: Date.now(), // timestamp assume it's 1 starting
      gameOver: false,
      staticBlocks: [],
      frameRate: timeStep / frameRate
    };
  }

  const gameState = gameStateFactory();
  const config = configFactory();
  const scene = new THREE.Scene();
  const staticBlocks = gameState.staticBlocks;
  const gestureQueue = [];
  function addStaticBlock({ pos: { x, y, z } }) {
    const { blockSize, boundingBoxConfig: { splitX, splitY, splitZ } } = config;
    if (staticBlocks[x] === undefined) staticBlocks[x] = [];
    if (staticBlocks[x][y] === undefined) staticBlocks[x][y] = [];

    const mesh = THREE.SceneUtils.createMultiMaterialObject(
      new THREE.CubeGeometry(blockSize, blockSize, blockSize),
      [
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          flatShading: THREE.FlatShading,
          wireframe: true,
          transparent: true
        })
      ]
    );

    mesh.position.x = (x - splitX / 2) * blockSize + blockSize / 2;
    mesh.position.y = (y - splitY / 2) * blockSize + blockSize / 2;
    mesh.position.z = (z - splitZ / 2) * blockSize + blockSize / 2;

    scene.add(mesh);
    staticBlocks[x][y][z] = mesh;
  }

  const board = boardFactory({
    config,
    utils,
    scene,
    staticBlocks,
    addStaticBlock
  });
  const block = blockFactory({
    config,
    utils,
    board,
    gameState,
    scene,
    addStaticBlock
  });

  const { boundingBoxConfig: { splitX, splitY, splitZ } } = config;
  board.init(splitX, splitY, splitZ);
  block.generate();

  function run(util) {
    const time = Date.now();
    gameState.frameTime = time - gameState._lastFrameTime; //  1 in the frame time (2-1)
    gameState._lastFrameTime = time; // Last frame time is now 2
    gameState.cumulatedFrameTime += gameState.frameTime; // 1 is the cummilated frameTime

    while (gameState.cumulatedFrameTime > gameState.gameStepTime) {
      processQueue({block, util});
      clearQueue(gestureQueue);
      gameState.cumulatedFrameTime -= gameState.gameStepTime;
      block.move({
        pos: { x: 0, y: 0, z: -1 },
        callback: data => {
          util.emit("newEngineState", data);
        }
      }); // Default move by 1 step down
    }

    if (gameState.gameOver) {
      console.log("Game is over");
    }

    if (!gameState.gameOver) requestAnimationFrame(util);
  }

  function requestAnimationFrame(util) {
    setTimeout(() => {
      run(util);
    }, gameState.frameRate);
  }

  /**
   * Firebase helpers
   */
  function processGestureObject(snapshot) {
    // Processes the deep tree and turns it into a flat object
    const result = [];
    const objectToInsert = {};
    objectToInsert["key"] = Object.keys(snapshot.val())[0];
    // << in or of?
    for (const gesture in snapshot.val()[objectToInsert.key].gestures) {
      objectToInsert["gesture"] = gesture;
      objectToInsert["action"] = snapshot.val()[objectToInsert.key].gestures[
        objectToInsert.gesture
      ];
      // Push copy of object into array
      result.push(JSON.parse(JSON.stringify(objectToInsert)));
    }
    return result;
  }

  function registerGestureListner(session, gameSessionGesturePath) {
    const gestureRef = firebase_admin.database().ref(gameSessionGesturePath);
    gestureRef.on("value", snapshot => {
      if (snapshot.val() != null) {
        onGestureChange(session, snapshot);
      }
    });
    session.gestureRef = gestureRef;
  }

  function onGestureChange(session, snapshot) {
    const result = processGestureObject(snapshot);
    result.forEach(element => {
      session.gesture_queue.push(element);
    });
    console.log(JSON.stringify(session.gesture_queue));
  }

  function processQueue(obj) {
    const { block, util } = obj;
    gestureQueue.forEach(value => {
      switch (value) {
        case CONSTANTS().GESTURES.MOVE_LEFT:
          block.move({
            pos: { x: -1, y: 0, z: 0 },
            callback: data => {
              util.emit("newEngineState", data);
            }
          });
          break;
        case CONSTANTS().GESTURES.MOVE_RIGHT:
          block.move({
            pos: { x: 1, y: 0, z: 0 },
            callback: data => {
              util.emit("newEngineState", data);
            }
          });
          break;
        case CONSTANTS().GESTURES.MOVE_UP:
          block.move({
            pos: { x: 0, y: 1, z: 0 },
            callback: data => {
              util.emit("newEngineState", data);
            }
          });
          break;
        case CONSTANTS().GESTURES.MOVE_DOWN:
          block.move({
            pos: { x: 0, y: -1, z: 0 },
            callback: data => {
              util.emit("newEngineState", data);
            }
          });
          break;
        default:
          break;
      }
    });
  }

  function clearQueue() {
    while (gestureQueue.shift() !== undefined) {}
  }
  return {
    run,
    registerGestureListner,
    gestureQueue,
    onGestureChange,
    util: new events.EventEmitter()
  };
}

module.exports.engine = engineFactory;
