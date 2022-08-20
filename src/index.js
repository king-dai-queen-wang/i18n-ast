const parseArgv = require("./options");
const collectAndWrite = require("./collectAndWrite");
const excelPack = require("./excel-pack");
const excelUnpack = require("./excel-unpack");
const option = parseArgv(process.argv);

console.log("option", option);

// 先收集再打包
const queue = [
  {
    type: "collectAndWrite",
    params: ["entry", "output", "scan"],
    do: async () => await collectAndWrite(option).start(),
  },
  {
    type: "excelPack",
    params: ["packExcel"],
    do: async () => await excelPack(option).start(),
  },
  {
    type: "excelUnPack",
    params: ["unpackExcel"],
    do: () => excelUnpack(option).start(),
  },
];

(async () => {
  for (let i = 0; i < queue.length; i++) {
    const isDoIt = queue[i].params.every((param) => option[param]);
    if (isDoIt) await queue[i].do();
  }
})();
