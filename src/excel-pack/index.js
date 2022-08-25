const fs = require('fs');
const file = require('../file');
const xlsx = require('xlsx');

EN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

module.exports = function (option) {
  
  const excelPack = {

    option: option,

    getExistWords: function(existWordsPath) {
      let requireWords = {};
      try {
        const path = `${process.cwd()}/${existWordsPath}`
        delete require.cache[require.resolve(path)]; 
        requireWords = require(path);
      } catch(e) {
        // console.log(e)
        // chalk.error(`${output}/zh_CN.js is not a module`)
      }
      return requireWords;
    },

    start: async function() {
      let allKeys = [];
      const sheet = {};
      const everLanguageWords = {};
      // 将翻译文件收集起来
      const filesPath = file.getALayerFiles({ path: this.option.output, exclude: 'index.js' });

      filesPath.forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const keyValues = this.getExistWords(filePath);
        everLanguageWords[fileName] = keyValues;
        if(fileName === `${this.option.mainLocal}.js`) {
          allKeys = Object.keys(keyValues)
        }
      })

      const filesName = filesPath.map(filePath => filePath.split('/').pop() )

      var _headers = [].concat(['keys'], filesName)
      
      _headers.forEach((k, index) => sheet[`${EN[index]}1`] = { v: k })

      allKeys.forEach((eveyKey, rowIndex) => {
        sheet[`${EN[0]}${rowIndex + 2}`] = { v: eveyKey };
        filesName.forEach((fileName, colIndex) => {
          if(everLanguageWords[fileName] && everLanguageWords[fileName][eveyKey]) {
            sheet[`${EN[colIndex + 1]}${rowIndex + 2}`] = { v: everLanguageWords[fileName][eveyKey] || '' }
          }
        })
      })

      // 计算出范围
      const ref = `A1:${EN[_headers.length - 1]}${[allKeys.length + 1]}`;

      const workbook = {
        SheetNames: ['i18n-ast'],
        Sheets: {
          'i18n-ast': {
            '!ref': ref,
            ...sheet
          }
        }
      }

      xlsx.writeFile(workbook, `${this.option.output}/${this.option.excelName || 'collect.xlsx'}`);
    }
  }
  return excelPack
}