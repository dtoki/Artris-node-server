//@ts-check
const constantFactory = function() {
  const GESTURES = {
    MOVE_LEFT: "mvLeft",
    MOVE_RIGHT: "mvRight",
    MOVE_UP: "mvUp",
    MOVE_DOWN: "mvDown",
    ROTATE_LEFT: "roLeft",
    ROTATE_RIGHT: "roRight",
    ROTATE_UP: "roUp",
    ROTATE_DOWN: "roDown"
  }
  Object.freeze(GESTURES);
  return {
    GESTURES
  }
};
//@ts-ignore
module.exports.CONSTANTS = constantFactory;