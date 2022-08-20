// module.exports = {
//   entry: "t",
//   output: "u",
//   exclude: ['*-*.jsx'],
//   randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
// }

module.exports = {
  entry: "./example/js/", 
  // entry: "/Users/david/Desktop/projects/mfe-user-fund/shared/Dashboard/DashboardHome", // ! PC
  // !APP:
  // entry: [
  //   "/Users/david/Desktop/projects/atta-app/src/navigations/Register/",
  //   "/Users/david/Desktop/projects/atta-app/src/navigations/User/"
  // ],
  output: "./u",
  exclude: [
    "**/node_modules/**/*",
    // ! pc 未解决下面3个报错
    "components/Header/LogoWithPlatformExchange/index.tsx",
    "containers/App/Activities/NewCustomer/constants/award.ts",
    "containers/App/Campaign/NewPartner/Details/index.tsx",
  //  "my-app/src/components/MultiLanguage.jsx",
  //  "jsx/ButtonBasics.jsx"
  ],
  randomFuc: (filePath) => `${Math.random().toString(36).substr(2)}`,
  locales: 'zh_CN,en_US',

  unpack: {
    output: "./m",
    entry: "/Users/david/Desktop/test_i18n_project/i18n-ast/u/collect.xlsx",
  },
  autoTranslate: {
    enable: true,
    name: "BaiduTranslate",
    appId: "20220816001309546",
    secretKey: "6qjHdX4wDxW06Q_efK6q",
    i18nMapping: {
      'zh_CN': 'zh',
      // 'pt_PT': 'pt',
      'en_US': 'en',
    },
    translateCallback: function(transRes) {
      return JSON.parse(transRes?.trans_result?.[0]?.dst);
    }
  }
}