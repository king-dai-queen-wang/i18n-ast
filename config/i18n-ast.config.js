module.exports = {
  entry: "./example",
  output: "./example/my-app/src/locales/",
  exclude: ["**/node_modules/**/*"],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
}