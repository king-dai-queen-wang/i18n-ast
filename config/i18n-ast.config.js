module.exports = {
  // entry: "./example", 
  // entry: "./example/tsx/", 
  entry: [
    "/Users/david/Desktop/projects/atta-app/src/navigations/Register/",
    "/Users/david/Desktop/projects/atta-app/src/navigations/User/"
  ],
  output: "/Users/david/Desktop/projects/atta-app/src/locales",
  exclude: [
    "**/node_modules/**/*",
   "my-app/src/components/MultiLanguage.jsx",
  //  "jsx/ButtonBasics.jsx"
  ],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
  locales: 'zh_CN,pt_PT,en_US'
}
