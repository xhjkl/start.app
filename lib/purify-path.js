//
// Turn unsafe URI or path substring into one safe for concatenation
//
const path = require('path');

module.exports = function purifyPath(unsafePath) {
  const root = '/';
  return path.relative(root, path.resolve(root, unsafePath));
}
