const glob = require('glob');
const fs = require('fs');
module.exports = {
  // 收集所有文件
  getFiles({ path, exclude=[] }) {
    let pathes = (typeof path === 'string' ? [path] : path);
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return pathes.map(path => glob.sync(`${path}/**/*.{js,jsx,ts,tsx}`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })).flat(2)
  },
    getHTMLFiles({ path, exclude=[] }) {
        let pathes = (typeof path === 'string' ? [path] : path);
        if(typeof exclude === 'string') exclude = exclude.split(',')
        return pathes.map(path => glob.sync(`${path}/**/*.html`, {
            ignore: (exclude || []).map(e => `${path}/${e}`)
        })).flat(2)
    },
  getALayerFiles({ path, exclude=[] }) {
    if(typeof exclude === 'string') exclude = exclude.split(',')
    return glob.sync(`${path}/*.js`, {
      ignore: (exclude || []).map(e => `${path}/${e}`)
    })
  },

  writeIndexFile:  function(output, option) {
    let localeStr = `const ${option.mainLocal} =  require('./${option.mainLocal}.js');\n`;
    option.otherLocales.forEach(localName => {
      localeStr += (`const ${localName} =  require('./${localName}.js');\n`)
    });
    const exportStr = `
export default {
${option.mainLocal},
${option.otherLocales.join(',\n  ')}
}
    `
    const path  = `${output}/index.js`;
    const content = `${localeStr}\n${exportStr}
    `
    
    
    fs.writeFileSync(path, content, { encoding: "utf-8" });
  },
}