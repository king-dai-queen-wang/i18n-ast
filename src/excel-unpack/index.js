const fs = require('fs');
const file = require('../file');
const xlsx = require('xlsx');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function (option) {
  
  const excelUnpack = {

    option: option,
    output: {},  
    readXlsFiles: function(){
      const xlsPath = path.resolve(path.join(
        (option?.unpack?.entry || option?.output),
        ( option?.unpack?.excelName || option?.excelName))
      );
      const workbook = xlsx.readFile(xlsPath)

      let sheetNames = workbook.SheetNames; //获取表明

      let sheet = workbook.Sheets[sheetNames[0]]; //通过表明得到表对象

      var source =xlsx.utils.sheet_to_json(sheet, {
        defval: ''
      }); //通过工具将表对象的数据读出来并转成json


      if(source.length === 0) {
          throw new  Error("Sheets must have at least one sheet");
      }
      
      return source
  },

   transToOutputObj: function(data) {
      data.forEach((item) => {
          const [key, ...fileNames] = Object.keys(item)
          console.log(key, fileNames);
          fileNames.forEach(fileName => {
              this.output[fileName][item[key]] = item[fileName]
          })
      })
  },


 reorganize: function(allTranslateWords) {
      let outputString = 'module.exports = {\n';
      /**
       * 针对key值进行排序
       * 为了方便比较（其实是公司不再返回excel而是返回json了，而返回的json是经过排序的）
       * 我觉得挺好，也就学习了
       * */ 
      Object.keys(allTranslateWords)
        .sort()
        .forEach(key => {
          const newWord = allTranslateWords[key].replace(/'/g, '\\\'');
          outputString += `'${key}': '${newWord}',\n`;
        })
      
      outputString += '}\n'
      return outputString
  },

 writeResFiles: function(fileNames) {
      const outputDirPath = path.join(process.cwd(), option.unpack.output || option.output)
      if(!fs.existsSync(outputDirPath)) {
          mkdirp(outputDirPath)
        }
      fileNames.forEach(fileName => {
          fs.writeFileSync(
              path.resolve(path.join(outputDirPath, fileName)),
              this.reorganize(this.output[fileName]),
          )}
      )
  },

    start: function() {
              

        const data  = this.readXlsFiles()
        if(data.length === 0) {
          throw new  Error("Parsed data from excel must have at least one sheet");
        }
        const {keys, ...locales} = data[0];

        const fileNames = Object.keys(locales);

        fileNames.forEach((fileName) => {
            this.output[fileName] = {}
        });
        this.transToOutputObj(data)

        this.writeResFiles(fileNames)
    }
  }
  return excelUnpack
}