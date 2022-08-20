const chalk = require('./chalk');
// 将 key-val 反转
const invert = function(obj) {
  var result = {};
  var keys = Object.keys(obj);
  for (var i = 0, length = keys.length; i < length; i++) {
    result[obj[keys[i]]] = keys[i];
  }

  return result;
};


module.exports = {
  invert
}