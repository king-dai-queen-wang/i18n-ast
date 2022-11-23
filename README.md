# xt-i18n

## Install
使用 npm:

```sh
npm install --save-dev xt-i18n
```

or using yarn:

```sh
yarn add xt-i18n --dev
```

## Use

需要转换的文件路径
输出的文件路径是必填的

1. 在根目录下新建配置文件 i18n-ast.config.js
```js
module.exports = () => ({
  entry: "需要转换的文件路径", // 必填
  output: "输出的文件路径", // 必填
   //排除的文件（类型是数组） 
  exclude: [], // 必填
  
  locales: 'zh_CN,pt_PT,en_US',// 必填
  // 输出和解析的excel 名称
  excelName: 'collect.xlsx',// 必填
  
  // 是否要开启自动翻译  // 可选
  // autoTranslate: {
  //   enable: true,
  //   name: "BaiduTranslate",
  //   i18nMapping: {
  //     'zh_CN': 'zh',
  //     'zh_HK': 'cht',
  //     'en_US': 'en',
  //   },
  // }

  //可以自定义随机字符串，第一个参数是翻译的文字， 不写的话默认是 hashId_pingying
  // randomFuc: (text) => `${filePath.split('/').pop()}-${Math.random()}`,
  
  // 解析excel的配置项（可选）
  // unpack: {
  //   excelName: 'collect.xlsx', // 如果这里指定了名字 则用这里的，否则用外面的excelName
  //   entry: "./u", // 解析的excel 的入口， 不写默认是外面配置项的output
  //   output: "./u", // 可选， 不写的话默认外面配置项的output,会覆盖原来的翻译文件
  // },
})
```

2. 在package.json 中添加命令
- 执行翻译命令
```sh
  xt-i18n --scan (简写-s)编译+写文件
  xt-i18n --packExcel (简写 -p)将翻译文件 转excel
  xt-i18n --unpackExcel (简写 -u)将最新的excel 反编译成 翻译文件
```

## Todo List
- [ ] 替换情况
  - js
    - [x] 对象中的中文字符串
    - [x] 方法中的中文传参
    - [x] 模板字符串（包含简单变量）
  - react
    - [x] react中的中文属性
    - [x] react中的中文内容
- [x] excel
  - [x] 翻译词条文件转换为 excel
  - [x] excel 转换为翻译文件
- [ ] 需替换情况收集
- [ ] 判断是否引入模块，没有则自动引入
- [ ] 替换方法可自定义
- [x] 引入自动翻译，翻译简单词条（baidu翻译）
- [ ] 替换后文件格式化（babel-generator还原的代码格式有很大的问题，由此引入 prettier 对生成的代码进行格式化）