
/** 
* Created by Dolapo Toki
* This module  holds the initilization parameters for the 3d scene.
*/
Tetris = {};

// information about the playground scene 
var boundingBoxConfig = {
  width:800,
  height:800,
  depth:1200,
  splitX:10,
  splitY:10,
  splitZ:20
};

Tetris.boundingBoxConfig = boundingBoxConfig;
// derive block size by dividing the width of the play ground by the x splits
Tetris.blockSize = boundingBoxConfig.width / boundingBoxConfig.splitX;
// export the object
module.exports = Tetris;