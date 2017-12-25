/**
 * configurations and constants
 */

function configFactory() {
  /**
   * Information about the playground scene
   */
  const blockSize = 80;
  const splitX = 10;
  const width = splitX * blockSize;
  const splitY = 10;
  const height = splitY * blockSize;
  const splitZ = 10;
  const depth = splitZ * blockSize;
  const boundingBoxConfig = {
    splitX,
    splitY,
    splitZ,
    width,
    height,
    depth
  };
  /**
   * Block shapes
   */
  const shapes = [
    [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 2, z: 0 }
    ],
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 },
      { x: 0, y: 3, z: 0 }
    ],
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 }
    ],
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 },
      { x: 1, y: 1, z: 0 }
    ],
    [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 1, y: 2, z: 0 }
    ]
  ];
  /**
   * Enums
   */
  const COLLISION = { NONE: 0, WALL: 1, GROUND: 2 };
  const FIELD = { EMPTY: 0, ACTIVE: 1, PETRIFIED: 2 };

  const config = {
    blockSize,
    boundingBoxConfig,
    shapes,
    COLLISION,
    FIELD
  };
  Object.freeze(config);
  return config;
}

module.exports.configFactory = configFactory;
