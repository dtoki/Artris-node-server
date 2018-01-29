const THREE = require('three');

/**
 * Blocks
 * The block factory takes an object with the following 
 * properties as a parameter and destructors it. this object
 * returns a move rotate and generate function for each object.
 */
const blockFactory = function({
  config,
  utils,
  board,
  scene,
  gameState,
  addStaticBlock
}) {
  const { blockSize, boundingBoxConfig, shapes } = config;
  let position, mesh, shape, blockType;
  
  /**
   * Generate function makes a new block using the bounding box
   * config passed in. For refirence see config.js
   */
  function generate() {
    const { splitX, splitY, splitZ } = boundingBoxConfig;

    blockType = Math.floor(Math.random() * shapes.length);
    shape = shapes[blockType].map(cell => utils.cloneVector(cell));

    const geometry = new THREE.CubeGeometry(blockSize, blockSize, blockSize);
    for (let cell of shape) {
      const tmpMesh = new THREE.Mesh(
        new THREE.CubeGeometry(blockSize, blockSize, blockSize)
      );
      tmpMesh.position.x = blockSize * cell.x;
      tmpMesh.position.y = blockSize * cell.y;
      geometry.mergeMesh(tmpMesh);
    }
    //  Generate mesh for object, usesful for collision detection
    mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        flatShading: THREE.FlatShading,
        wireframe: true,
        transparent: true
      }),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    ]);

    // initial position
    position = {
      x: Math.floor(splitX / 2) - 1,
      y: Math.floor(splitY / 2) - 1,
      z: 15
    };

    // End of game if a block collides with the top
    if (
      board.testCollision({ ground_check: true, shape, pos: position }) ===
      config.COLLISION.GROUND
    ) {
      gameState.gameOver = true;
    }

    // Set the block position and roatation
    mesh.position.x = (position.x - splitX / 2) * blockSize / 2;
    mesh.position.y = (position.y - splitY / 2) * blockSize / 2;
    mesh.position.z = (position.z - splitZ / 2) * blockSize + blockSize / 2;
    mesh.rotation = { x: 0, y: 0, z: 0 };
    mesh.overdraw = true;

    // add object to the scence
    scene.add(mesh);
  }

  // Rotate the block in any of the following axis.
  function rotate({ x, y, z }) {
    mesh.rotation.x += x * Math.PI / 180;
    mesh.rotation.y += y * Math.PI / 180;
    mesh.rotation.z += z * Math.PI / 180;

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.setRotationFromEuler(mesh.rotation);

    for (let i = 0; i < shape.length; i++) {
      shape[i] = rotationMatrix.multiplyVector3(
        utils.cloneVector(shapes[blockType][i])
      );
      shape[i] = utils.roundVector(shape[i]);
    }

    if (
      board.testCollision({ ground_check: false, pos: position, shape }) ===
      config.COLLISION.WALL
    ) {
      rotate(-x, -y, -z);
    }
  }
  
  // Move block from current location to {+x, +y, +z} location
  function move({ pos: { x, y, z }, callback }) {
    mesh.position.x += x * blockSize;
    position.x += x;
    mesh.position.y += y * blockSize;
    position.y += y;
    mesh.position.z += z * blockSize;
    position.z += z;

    // Test if move is going to cause a collision
    const collision = board.testCollision({
      ground_check: z != 0,
      pos: position,
      shape
    });
    
    // Update {x, y} position by -1, ensures block does not go outside bounds.
    if (collision === config.COLLISION.WALL) {
      move({
        pos: { x: -x, y: -y, z: 0 },
        callback
      });
    }
    if (collision === config.COLLISION.GROUND) {
      hitBottom();
      board.checkCompleted();
    }

    callback({
      [mesh.uuid]: {
        shape,
        position,
        blockType
      }
    });
  }

  function petrify() {
    for (let cell of shape) {
      addStaticBlock({
        pos: {
          x: position.x + cell.x,
          y: position.y + cell.y,
          z: position.z + cell.z
        }
      });
      board.fields[position.x + cell.x][position.y + cell.y][
        position.z + cell.z
      ] =
        config.FIELD.PETRIFIED;
    }
  }

  function hitBottom() {
    petrify();
    generate();
  }
  return {
    move,
    rotate,
    generate
  };
};

module.exports.blockFactory = blockFactory;
