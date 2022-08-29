module.exports = {
  entry: ["./example/tsx/"], 
  output: "./u",
  exclude: [
    "**/node_modules/**/*",
  ],
  locales: 'zh_CN,en_US,zh_HK',
  excelName: 'collect.xlsx',
  autoTranslate: {
    enable: true,
    name: "BaiduTranslate",
    maxLimit: 100, // 新的词条 如果超出该值就不翻译了
    i18nMapping: {
      'zh_CN': 'zh',
      'zh_HK': 'cht',
      'en_US': 'en',
    },
  }
}