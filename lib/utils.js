/**
 * Unitls
 */
function cloneVector({ x, y, z }) {
  return { x, y, z };
}
function roundVector({ x, y, z }) {
  return {
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z)
  };
}
const utils = {
  roundVector,
  cloneVector
};

module.exports.utils = utils;
