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

const pickupChinese = function(text = '', length = 4) {
  return [...text]?.filter((i) => /[\u4e00-\u9fa5]/.test(i)).slice(0, length).join('') || '';
}

module.exports = {
  invert,
  pickupChinese
}