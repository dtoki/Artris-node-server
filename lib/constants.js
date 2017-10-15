/**
 * This module contains the constants which are
 * used by the program
 */
ROTATE_GESTURES = {
  ROTATE_BLOCK_LEFT:"left-leftswipe",
  ROTATE_BLOCK_RIGHT:"left-rightswipe",
  ROTATE_BLOCK_UP:"left-upswipe",
  ROTATE_BLOCK_DOWN:"left-downswipe",
}

MOVE_GESTURES = {
  MOVE_LEFT:"right-leftswipe",
  MOVE_RIGHT:"right-rightswipe",
  MOVE_DOWN:"right-downswipe"
}

Object.freeze(ROTATE_GESTURES);
Object.freeze(MOVE_GESTURES);