module.exports = {
  entry: "./example",
  output: "./example/my-app/src/locales/",
  exclude: [
    "**/node_modules/**/*",
   "my-app/src/components/MultiLanguage.jsx",
  //  "jsx/ButtonBasics.jsx"
  ],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
  locales: 'zh_CN,pt_PT,en_US'
}
