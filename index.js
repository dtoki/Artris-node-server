// Import the following modules and service key
const admin = require('firebase-admin');
const { engine } = require('./engine');
const { gestureListner } = require('./lib/gesture');
const { CONSTANTS } = require('./lib/constants'); 
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
  const {setup} = snapshot.val();
  const p1Id = setup.player_1_id;
  const listnerUrl = String( "game-session/" + snapshot.key + `/${p1Id}/gestures`);
  
  // creates and initializes a new game session and then returns it
  const gameSession = engine();
  const gameGestureListner = gestureListner(listnerUrl);
  gameSession.run(gameSession.util);
  gameSession.util.on('newEngineState', newGameState => {
    const cells = transformCellCoordinates(newGameState);
    updateTetrisGrid(snapshot.key, Object.keys(newGameState)[0], cells);
  });
  
  // Subscribe for event changes the gesture listner
  gameGestureListner.subscribe(CONSTANTS().GESTURES.MOVE_LEFT, () => {
    gameSession.gestureQueue.push(CONSTANTS().GESTURES.MOVE_LEFT);
  });
  gameGestureListner.subscribe(CONSTANTS().GESTURES.MOVE_UP, () => {
    gameSession.gestureQueue.push(CONSTANTS().GESTURES.MOVE_UP);
  });
  gameGestureListner.subscribe(CONSTANTS().GESTURES.MOVE_RIGHT, () => {
    gameSession.gestureQueue.push(CONSTANTS().GESTURES.MOVE_RIGHT);
  });
  gameGestureListner.subscribe(CONSTANTS().GESTURES.MOVE_DOWN, () => {
    gameSession.gestureQueue.push(CONSTANTS().GESTURES.MOVE_DOWN);
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
