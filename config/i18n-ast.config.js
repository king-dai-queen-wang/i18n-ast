module.exports = {
  entry: "./example",
  output: "u",
  exclude: ["**/node_modules/**/*"],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
}