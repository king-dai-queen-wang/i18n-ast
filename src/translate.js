const fs = require('fs');
const prettier = require("prettier");
const babel = require("@babel/core");
const generator = require('@babel/generator')
const parser = require('@babel/parser');

const middleRandomStr = (function(randomStr, ...argu) {
  return () => randomStr(...argu)
})

function translate ({filePath, option, allTranslateWords, randomStr}) {
  const arg = {
    translateWordsNum: 0,
    hasImportModule: false,
  }
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
      "@babel/plugin-syntax-class-properties",
      "@babel/plugin-syntax-object-rest-spread",
      // // ['@babel/plugin-proposal-decorators', {version: "2021-12",decoratorsBeforeExport: false}],
      ["@babel/plugin-syntax-decorators",{version: "2021-12", decoratorsBeforeExport: true}], 
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
  const { translateWordsNum, hasImportModule } = arg;

  if(translateWordsNum !== 0) {
    code = generator.default(ast).code
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