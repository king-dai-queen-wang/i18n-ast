const fs = require('fs');
const prettier = require("prettier");
const babel = require("@babel/core");
const generator = require('@babel/generator')
const parser = require('@babel/parser');

const middleRandomStr = (function(randomStr, ...argu) {
  return () => randomStr(...argu)
})
// randomStr 是config文件传进来的方法
function translate ({filePath, option, allTranslateWords, randomStr}) {
  const arg = {
    translateWordsNum: 0,
    hasImportModule: false,
  }
  // 这里引入i18n-jsx 然后执行，柯力话 返回plugin，（并且保存3个传参）
  const plugin = require('./plugin/plugin-i18n-jsx')(allTranslateWords, middleRandomStr(randomStr, filePath), arg);

  const transformOptions = {
    sourceType: "module",
    // code: false,
    ast: true,
    presets:[
      // "@babel/preset-flow",
      // "@babel/preset-env",
      // "@babel/preset-react",
      
    ],
    plugins: [
      "@babel/plugin-syntax-jsx", 
      ["@babel/plugin-syntax-typescript", {isTSX: true}],
      
      "@babel/plugin-syntax-object-rest-spread",
      // // ['@babel/plugin-proposal-decorators', {version: "2021-12",decoratorsBeforeExport: false}],
      ["@babel/plugin-syntax-decorators", { "legacy": true }],
      "@babel/plugin-syntax-class-properties",
      "@babel/plugin-syntax-async-generators",
      "@babel/plugin-syntax-do-expressions",
      "@babel/plugin-syntax-optional-chaining",
      "@babel/plugin-syntax-dynamic-import", 
      "@babel/plugin-syntax-export-namespace-from",
      "@babel/plugin-syntax-export-default-from",
      "@babel/plugin-syntax-flow", 
      "@babel/plugin-syntax-function-bind",
      "@babel/plugin-syntax-function-sent",
      plugin
    ]
  }
  const bableObj = babel.transformFileSync(filePath, option || transformOptions)
  let { code, ast } = bableObj;
  // 通过plugin （判断文件头上是否引入过import intl from 'react-intl-universal';）设置arg.hasImportModule 属性
  const { translateWordsNum, hasImportModule } = arg;
// 有新翻译的 计数>0  的话
  if(translateWordsNum !== 0) {
    code = generator.default(ast).code
    // 如果没有导入过则拼接 导入code
    if(!hasImportModule) {
      code = 'import intl from \'react-intl-universal\';\n' + code;
    }
  }

  return {
    isRewriting: translateWordsNum !== 0,
    code: code //prettier.format(code, { parser: "babylon", singleQuote: true })
  };
}

module.exports = translate;