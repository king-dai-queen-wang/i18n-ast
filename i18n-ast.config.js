module.exports = {
  entry: [
    // '/Users/david/Desktop/test_projects/my-app/src/'
    // "example/"
    // "/Users/david/Desktop/projects/mfe-user-fund/shared/"
    "/Users/david/Desktop/projects/mfe-user-account/shared/"
  ], 
  output: "./u",
  exclude: ['**/node_modules/**/*', 'resources/**/*'],
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