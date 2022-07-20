module.exports = {
  entry: "./example",
  output: "u",
  exclude: [],
  randomFuc: (filePath) => `${filePath.split('/').pop()}-${Math.random().toString(36).substr(2)}`,
}