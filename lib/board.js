const THREE = require('three');

/**
 * Board
 */
const boardFactory = function({
  config,
  utils,
  scene,
  staticBlocks,
  addStaticBlock
}) {
  const { blockSize, boundingBoxConfig, shapes } = config;
  let fields = [];

  function init(_x, _y, _z) {
    for (let x = 0; x < _x; x++) {
      fields[x] = [];
      for (let y = 0; y < _y; y++) {
        fields[x][y] = [];
        for (let z = 0; z < _z; z++) {
          fields[x][y][z] = config.FIELD.EMPTY;
        }
      }
    }
  }

  function testCollision({ pos, shape, ground_check }) {
    for (let cell of shape) {
      if (
        cell.x + pos.x < 0 ||
        cell.y + pos.y < 0 ||
        cell.x + pos.x >= fields.length ||
        cell.y + pos.y >= fields[0].length
      ) {
        return config.COLLISION.WALL;
      }

      if (
        fields[cell.x + pos.x][cell.y + pos.y][cell.z + pos.z - 1] ===
        config.FIELD.PETRIFIED
      ) {
        return ground_check ? config.COLLISION.GROUND : config.COLLISION.WALL;
      }

      if (cell.z + pos.z <= 0) {
        return config.COLLISION.GROUND;
      }
    }
  }

  function checkCompleted() {
    const expected = fields[0].length * fields.length;

    let rebuild = false;
    let bonus = 0;
    for (let z = 0; z < fields[0][0].length; z++) {
      let sum = 0;
      for (let y = 0; y < fields[0].length; y++) {
        for (let x = 0; x < fields.length; x++) {
          if (fields[x][y][z] === config.FIELD.PETRIFIED) sum++;
        }
      }

      if (sum == expected) {
        bonus += 1 + bonus; // 1, 3, 7, 15...

        for (let y = 0; y < fields[0].length; y++) {
          for (let x = 0; x < fields.length; x++) {
            for (let _z = z; _z < fields[0][0].length - 1; _z++) {
              fields[x][y][_z] = fields[x][y][_z + 1];
            }
            fields[x][y][fields[0][0].length - 1] = config.FIELD.EMPTY;
          }
        }
        rebuild = true;
        z--;
      }
    }

    if (rebuild) {
      for (let z = 0; z < fields[0][0].length - 1; z++) {
        for (let y = 0; y < fields[0].length; y++) {
          for (let x = 0; x < fields.length; x++) {
            if (
              fields[x][y][z] === config.FIELD.PETRIFIED &&
              !staticBlocks[x][y][z]
            ) {
              addStaticBlock({ pos: { x, y, z } });
            }
            if (
              fields[x][y][z] == config.FIELD.EMPTY &&
              staticBlocks[x][y][z]
            ) {
              // FIXME: this will cause an error removing those objects are not working
              scene.removeObject(staticBlocks[x][y][z]);
              staticBlocks[x][y][z] = undefined;
            }
          }
        }
      }
    }
    return { bonus };
  }

  return {
    fields,
    checkCompleted,
    testCollision,
    init
  };
};

module.exports.boardFactory = boardFactory;
