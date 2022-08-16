module.exports = {
  // entry: "./example/jsx/", 
  entry: "/Users/david/Desktop/projects/mfe-user-fund/shared/Dashboard/DashboardHome", // ! PC
  // !APP:
  // entry: [
  //   "/Users/david/Desktop/projects/atta-app/src/navigations/Register/",
  //   "/Users/david/Desktop/projects/atta-app/src/navigations/User/"
  // ],
  output: "/Users/david/Desktop/projects/mfe-user-fund/locales",
  exclude: [
    "**/node_modules/**/*",
    // ! pc 未解决下面3个报错
    "components/Header/LogoWithPlatformExchange/index.tsx",
    "containers/App/Activities/NewCustomer/constants/award.ts",
    "containers/App/Campaign/NewPartner/Details/index.tsx",
  //  "my-app/src/components/MultiLanguage.jsx",
  //  "jsx/ButtonBasics.jsx"
  ],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
  locales: 'zh_CN,pt_PT,en_US'
}