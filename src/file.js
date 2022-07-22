const glob = require('glob');

module.exports = {
  // 收集所有文件
  getFiles({ path, exclude=[] }) {
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return glob.sync(`${path}/**/*.{js,jsx,ts,tsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  },

  getALayerFiles({ path, exclude=[] }) {
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return glob.sync(`${path}/*.js`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  }
}