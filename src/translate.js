const fs = require('fs');
const prettier = require("prettier");
const babel = require("@babel/core");
const generator = require('@babel/generator')
const parser = require('@babel/parser');

// randomStr 是config文件传进来的方法
function translate ({filePath, option, allTranslateWords,additionalTranslateWords, randomStr}) {
  const arg = {
    translateWordsNum: 0,
    hasImportModule: false,
  }
  // 这里引入i18n-jsx 然后执行，柯里化 返回plugin，（并且保存3个传参）
  const plugin = require('./plugin/plugin-i18n-jsx')(allTranslateWords,additionalTranslateWords, randomStr, arg);

  const transformOptions = {
    sourceType: "module",
    // code: false,
    babelrc: false,
    ast: true,
    presets:[
      
    ],
    plugins: [
      "@babel/plugin-syntax-jsx", 
      ["@babel/plugin-syntax-typescript", {isTSX: true}],
      
      "@babel/plugin-syntax-object-rest-spread",
      ["@babel/plugin-syntax-decorators", {version: "2021-12",decoratorsBeforeExport: true}],
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
    code = generator.default(ast, {
      decoratorsBeforeExport: true, // 生成code的时候 配置项，允许 装饰器在export 前面
      
    }).code
    // 如果没有导入过则拼接 导入code
    if(!hasImportModule) {
      code = 'import intl from \'react-intl-universal\';\n' + code;
    }
  }

  return {
    isRewriting: translateWordsNum !== 0,
    code:  code
    // prettier.format(code, { 
    //     parser: 'babel-ts',
    //     printWidth: 120,
    //     semi: false,
    //     singleQuote: true,
    //     trailingComma: 'all',
    //     bracketSpacing: true, // 对象空格
    //     jsxBracketSameLine: true,
    //     arrowParens: 'avoid',
    //     tabWidth: 2,
    //     useTabs: true,
    //     quoteProps: 'as-needed',
    //     jsxSingleQuote: true
    //  })
  };
}

module.exports = translate;