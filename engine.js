const TetrisBoard = require('./lib/tetris.board.js');
const TetrisBlock = require('./lib/tetris.block.js');
const THREE = require('three');
const Tetris = require('./lib/tetris.js');
const events = require('events');

//Engine config
Tetris.gameStepTime = 1000;
Tetris.frameTime = 0; // ms
Tetris.cumulatedFrameTime = 0; // ms
Tetris._lastFrameTime = Date.now(); // timestamp assume it's 1 starting
Tetris.gameOver = false;
Tetris.staticBlocks = [];
Tetris.frameRate = 1000 / 60 // 60fps 
Tetris.zColors = [
    0x6666ff, 0x66ffff, 0xcc68EE, 0x666633, 0x66ff66, 0x9966ff, 0x00ff66, 0x66EE33, 0x003399, 0x330099, 0xFFA500, 0x99ff00, 0xee1289, 0x71C671, 0x00BFFF, 0x666633, 0x669966, 0x9966ff
];

let run = function() {

  var time = Date.now();
  Tetris.frameTime = time - Tetris._lastFrameTime; //  1 in the frame time (2-1)
  Tetris._lastFrameTime = time; // last frame time is now 2
  Tetris.cumulatedFrameTime += Tetris.frameTime; // 1 is the cummilated frameTime
  
  while (Tetris.cumulatedFrameTime > Tetris.gameStepTime) { //while 1 > 1000 
      Tetris.cumulatedFrameTime -= Tetris.gameStepTime; // 
      Tetris.Block.move(0, 0, -1, (data)=> {
      this.util.emit('newEngineState', data);        
      });//default move by 1 steop down
  }
  
  if (Tetris.gameOver){
    console.log("Game is over");
  }

  if (!Tetris.gameOver) requestAnimationFrame.call(this);
};

var init = function init(){
  this.run = run;
  // Make a copy of the boxconfig
  var boundingBoxConfig = Tetris.boundingBoxConfig;
  Object.freeze(boundingBoxConfig);
  // Init the default board
  Tetris.Board.init(boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ);
  // Create the 3d mesh and parse the bounding box to the user, 
  var boundingBox = new THREE.Mesh(
    new THREE.CubeGeometry(boundingBoxConfig.width, boundingBoxConfig.height, boundingBoxConfig.depth, boundingBoxConfig.splitX, boundingBoxConfig.splitY, boundingBoxConfig.splitZ));
  //Create scene 
  Tetris.scene = new THREE.Scene();
  // Generate block
  Tetris.Block.generate();
  this.util = new events.EventEmitter();
  return this
}

//  Static function 
let requestAnimationFrame = function() {
  this.updateTimeout = setTimeout(this.run.bind(this), Tetris.frameRate);
}

// Testing the engine internally
// init();
// Tetris.animate();
// nice test:
// var i = 0, j = 0, k = 0, interval = setInterval(function() {if(i==6) {i=0;j++;} if(j==6) {j=0;k++;} if(k==6) {clearInterval(interval); return;} Tetris.addStaticBlock(i,j,k); i++;},30)

// Add the block to the static mesh 
Tetris.addStaticBlock = function (x, y, z) {
    if (Tetris.staticBlocks[x] === undefined) Tetris.staticBlocks[x] = [];
    if (Tetris.staticBlocks[x][y] === undefined) Tetris.staticBlocks[x][y] = [];

    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize), [
        new THREE.MeshBasicMaterial({color:0x000000, flatShading:THREE.FlatShading, wireframe:true, transparent:true})]);

    mesh.position.x = (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    mesh.position.y = (y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    mesh.position.z = (z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;

    Tetris.scene.add(mesh);
    Tetris.staticBlocks[x][y][z] = mesh;
};



// Export the following modules
module.exports.init = init;