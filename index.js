// Import the following modules and service key
const admin = require('firebase-admin');
const gameEngine = require('./engine');

// TODO: you need to create a firebase project and
//       download the service key into a folder in the root and name it cred
const serviceAccount = require('./cred/serviceAccountKey.json');
// TODO: insert your firebase database url here
const fireDatabaseUrl = 'https://production-artris.firebaseio.com/';

// Init the firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: fireDatabaseUrl
});

// Get firebase database refrence
const rootDbRef = admin.database();
// Global que that manages the state
let queue = {};
// Lock bit to know when to read data from the queue
let lock = 0;
// Keep track of dirty values
let dirtyValues = {};
// Look up table for the game sessions
let gamesSessions = {};

// Listen for all changes to get when the gesture changes
rootDbRef.ref('game-session/').on(
  'child_changed',
  snapshot => {},
  error => {
    console.error(`Some error has occured :${error}`);
  }
);

// Listen for game start when a node is added to the game-session/
rootDbRef.ref('game-session/').once('child_added', snapshot => {
  // Init the game and add it to a look up table and run it
  gamesSessions[snapshot.key] = new gameEngine.init();
  gamesSessions[snapshot.key].run();
  gamesSessions[snapshot.key].util.on('newEngineState', newGameState => {
    jsonPreprocessor(newGameState, cells => {
      updateTetrisGrid(snapshot.key, Object.keys(newGameState)[0], cells);
    });
  });
});

let jsonPreprocessor = function(data, callback) {
  let cells = [];

  Object.values(data).forEach(block => {
    pos = block.position;
    block.shape.forEach(cell => {
      cells.push({
        x: pos.x + cell.x,
        y: pos.y + cell.y,
        z: pos.z + cell.z,
        col: block.blockType
      });
    });
  });
  callback(cells);
};

let updateTetrisGrid = function(gameId, blockId, data) {
  // Add passed in block ot the render node
  rootDbRef.ref(`game-session/${gameId}/grid-render/${blockId}`).set(data);
};
