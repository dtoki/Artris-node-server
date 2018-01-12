// @ts-check
/**
 * This module creates a gesture listner for on the passed in url.
 */
const firebaseAdmin = require("firebase-admin");
const eventEmitter = require("events");
const { CONSTANTS } = require("./constants");

const gestureListnerFactory = function(gameGestureUrl) {
  const emitter = new eventEmitter.EventEmitter();
  const gameUrl = gameGestureUrl;
  const moveRefListner = firebaseAdmin.database().ref(gameUrl + "/Move");
  const rotateRefListner = firebaseAdmin
    .database()
    .ref(gameGestureUrl + "/Rotate");
  moveRefListner.on("child_added", snapshot => {
    switch (snapshot.val()) {
      case "left":
        onMoveLeftChange();
        break;
      case "up":
        onMoveUpChange();
        break;
      case "right":
        onMoveRightChange();
        break;
      case "down":
        onMoveDownChange();
        break;
      default:
        break;
    }
  });
  rotateRefListner.on("child_added", snapshot => {
    switch (snapshot.val()) {
      case "left":
        onRotateRightChange();
        break;
      case "up":
        onRotateUpChange();
        break;
      case "right":
        onRotateRightChange();
        break;
      case "down":
        onRotateDownChange();
        break;
      default:
        break;
    }
  });
  rotateRefListner.on("child_added", snapshot => {});
 
  function onMoveLeftChange() {
    emitter.emit(CONSTANTS().GESTURES.MOVE_LEFT, 1);
  }
  function onMoveUpChange() {
    emitter.emit(CONSTANTS().GESTURES.MOVE_UP, 1);
  }
  function onMoveRightChange() {
    emitter.emit(CONSTANTS().GESTURES.MOVE_RIGHT, 1);
  }
  function onMoveDownChange() {
    emitter.emit(CONSTANTS().GESTURES.MOVE_DOWN, 1);
  }
  function onRotateLeftChange() {
    emitter.emit(CONSTANTS().GESTURES.ROTATE_LEFT, 1);
  }
  function onRotateUpChange() {
    emitter.emit(CONSTANTS().GESTURES.ROTATE_UP, 1);
  }
  function onRotateRightChange() {
    emitter.emit(CONSTANTS().GESTURES.ROTATE_RIGHT, 1);
  }
  function onRotateDownChange() {
    emitter.emit(CONSTANTS().GESTURES.ROTATE_DOWN, 1);
  }
  // Following the pub/sub pattern
  function subscribe(eventName, eventFunction) {
    emitter.on(String(eventName), eventFunction);
  }
  function unsubscribe(eventName, eventFunction) {
    emitter.removeListener(String(eventName), eventFunction);
  }
  return {
    subscribe,
    unsubscribe
  };
};

module.exports.gestureListner = gestureListnerFactory;
