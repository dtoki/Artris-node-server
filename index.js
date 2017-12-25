// Import the following modules and service key
const admin = require('firebase-admin');
const { engine } = require('./engine');

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

// Look up table for the game sessions
const gameSessions = {};
// Listen for game start when a node is added to the game-session
rootDbRef.ref('game-session/').once('child_added', snapshot => {
  // Initialize a new game and add it to the look up table
  const newGameSessionn = createNewGameSession(snapshot);
  gameSessions[snapshot.key] = newGameSessionn;
});

function createNewGameSession(snapshot) {
  // creates and initializes a new game session and then returns it
  const gameSession = engine();
  gameSession.run(gameSession.util);
  gameSession.util.on('newEngineState', newGameState => {
    const cells = transformCellCoordinates(newGameState);
    updateTetrisGrid(snapshot.key, Object.keys(newGameState)[0], cells);
  });
  return gameSession;
}

function transformCellCoordinates(state) {
  // transform the position of each cell from the blocks coordiante system to the grids coordinate system
  const cells = [];
  Object.values(state).forEach(block => {
    const pos = block.position;
    block.shape.forEach(cell => {
      cells.push({
        x: pos.x + cell.x,
        y: pos.y + cell.y,
        z: pos.z + cell.z,
        col: block.blockType
      });
    });
  });
  return cells;
}

function updateTetrisGrid(gameId, blockId, data) {
  // Add passed in block to the render node
  rootDbRef.ref(`game-session/${gameId}/grid-render/${blockId}`).set(data);
}
