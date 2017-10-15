 // Import the following modules and service key
var admin = require('firebase-admin');
var gameEngine = require('./engine');
// TODO: you need to create a firebase project and download the service key into a folder in the root and name it cred 
var serviceAccount = require('./cred/serviceAccountKey.json');

// Init the firebase app using following credentails
const fireDatabaseUrl = "https://production-artris.firebaseio.com/" //TODO: insert your firebase database url here
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: fireDatabaseUrl //
});
// Get firebase database refrence
var rootDbRef = admin.database();
// Global que that manages the state
var queue = {};
// Lock bit to know when not to read data from the queue
var lock = 0;
// Keep track of dirty values
var dirtyValues = {};
// Look up table for the game sessions 
var gamesSessions = {};


//Listen for all changes to get when the gesture changes
rootDbRef.ref('game-session/').on('child_changed', snapshot => {
  extractDataFromObject(snapshot.val(), (playerId, playerAction) => {
      // console.log(playerId);
      // console.log(playerAction);
    });
  },
  error => {
    console.error(`Some error has occured :${error}`);
  }
);

//Listen for game start when a node is added to the game-session/
rootDbRef.ref('game-session/').once('child_added',snapshot => {
  // init the game and add it to a look up table and run it
  gamesSessions[snapshot.key] = new gameEngine.init();
  // console.log(gamesSessions[snapshot.key]);
  gamesSessions[snapshot.key].run();
  // console.log( gamesSessions[snapshot.key].util);
  gamesSessions[snapshot.key].util.on("newEngineState",(newGameState)=>{
    jsonPreprocessor(newGameState, (cells) =>{
      updateTetrisGrid(snapshot.key,Object.keys(newGameState)[0], cells);
    });
  })
}) 



/**
 * Copied form hack for handeling gestures
 * @param {Post process the data recived from firebase} data 
 * @param {Callback with the players id and the action they have made} callback 
 */
function extractDataFromObject(data, callback) {
  // process all the players in the game
  // Object.keys(data).forEach(key => {
  //   // Get the id of the last item that was added
  //   var latestDetailId = Object.keys(data[key]).pop();
  //   var tempObj = {};
  //   // if the key is not dirty
  //   if (!(latestDetailId in dirtyValues)) {
  //     // Get the core detils from the added object
  //     var detail = data[key][latestDetailId];
  //     tempObj[key] = detail;
  //   }
  //   //add the key to a dictionary of dirty values
  //   dirtyValues[latestDetailId] = true;
  //   // return the object to the master queue if it's not empty
  //   if (Object.keys(tempObj).length > 0) {
  //     // send the player and the details of the move back
  //     callback(key, tempObj[key]);
  //   }
  //   // return tempObj;
  // });
}


let jsonPreprocessor = function(data, callback) {
  cells = [];

  Object.values(data).map(block => {
    pos = block.position;
    block.shape.map(cell => {
      cells.push({
        x: pos.x + cell.x,
        y: pos.y + cell.y,
        z: pos.z + cell.z,
        col: block.blockType
      });
    });
  });

  callback(cells);
}

let updateTetrisGrid = function (gameId, blockId, data) {
  // add passed in block ot the render node
  rootDbRef.ref(`game-session/${gameId}/grid-render/${blockId}`).set(data)
}
