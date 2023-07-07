const {pinyin} = require("pinyin-pro");
module.exports = {
  entry: [
    // '/Users/david/Desktop/test_projects/my-app/src/'
    // "example/angular"
    // "/Users/david/Desktop/projects/mfe-user-fund/shared/"
    "C:\\projects\\web-front/src/"
  ], 
  output: "./u",
  exclude: [
    '**/node_modules/**/*',
    'resources/**/*',
    'coverages/**/*',
    '.scannerwork/**/*',
      'dist/**/*',
      'e2e/**/*',
    '**/*.spec.*'
  ],
  renderFunc: (filePath, value, option) => {
    return pinyin(value, { toneType: 'none', type: 'string' }).replace(/\s+/g, '').replace(/ü/g, 'v');
  },
  locales: 'zh_CN,en_US,zh_HK',
  excelName: 'collect.xlsx',
  autoTranslate: {
    enable: false,
    name: "BaiduTranslate",
    maxLimit: 100, // 新的词条 如果超出该值就不翻译了
    i18nMapping: {
      'zh_CN': 'zh',
      'zh_HK': 'cht',
      'en_US': 'en',
    },
  }
}