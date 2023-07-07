const fs = require("fs");
const mkdirp = require("mkdirp");
const file = require("./file");
const translate = require("./translate");
const chalk = require("./util/chalk");
const util = require("./util");
const { shortId } = require("./generateKey");

const path = require("path");
module.exports = function (option) {
  const collectAndWrite = {
    option: option,

    _randomStr: shortId,

    _existsSync: (path) => fs.existsSync(path),
    // 得到需要翻译的路径
    _getTranslateFiles: function () {
      return file.getFiles({
        path: this.option.entry,
        exclude: this.option.exclude,
      });
    },
    // 通过output的路径 得到翻译过的文字
    getExistWords: function (existWordsPath) {
      let defaultWords = {};
      let requireWords = {};
      try {
        requireWords = require(`${process.cwd()}/${existWordsPath}`);
        // 将key 和value 倒置 =》 {[value]: key}
        defaultWords = util.invert(requireWords);
      } catch (e) {
        // chalk.error(`${output}/zh_CN.js is not a module`)
      }
      // 同一条数据 返回2种形式的 1. key->val 2. val -> key
      return {
        valueKey: defaultWords,
        keyValue: requireWords,
      };
    },

    /**
     *
     * @param {*} allTranslateWords 读取已经翻译过的文件 把 key-val 倒序 即 {中文val： 英文key}
     * @param {*} filePath 每个需要翻译文件的路径
     */
    collect: function (allTranslateWords, additionalTranslateWords, filePath) {
      // 得到要写入的code 字符串
      const { isRewriting, code } = translate({
        filePath,
        option: this.option,
        allTranslateWords,
        additionalTranslateWords,
        randomStr: this.option.randomFuc || this._randomStr,
      });
      // 有新翻译的文案，则重新写入文件
      if (isRewriting) {
        this.write(`${filePath}`, code, { encoding: "utf-8" });
        chalk.success(`${filePath} is success`);
      }
    },
    // 生成要写文件的 code str内容， 把key-val str 包一层 module.exports = {xx}
    reorganize: function (allTranslateWords) {
      let outputString = "module.exports = {\n";
      const wordList = allTranslateWords;

      // 互换KEY VALUE
      // Object.keys(allTranslateWords)
      //   .forEach(word => {
      //     wordList[allTranslateWords[word]] = word;
      //   })

      /**
       * 针对key值进行排序
       * 为了方便比较（其实是公司不再返回excel而是返回json了，而返回的json是经过排序的）
       * 我觉得挺好，也就学习了
       * */
      Object.keys(wordList)
        .sort()
        .forEach((key) => {
          const newWord = wordList[key].replace(/'/g, "\\'");
          outputString += `'${key}': '${newWord}',\n`;
        });

      outputString += "}\n";
      return outputString;
    },

    write: function (path, content, option) {
      fs.writeFileSync(path, content, option);
    },

    // async autoTranslate(additionalTranslateWords, option, localName, callback) {
    //   const translateConfig = option?.autoTranslate;
    //   if (translateConfig?.name === "BaiduTranslate") {
    //     console.log("------翻译", additionalTranslateWords, localName);
    //     const targetLang = translateConfig?.i18nMapping?.[localName];

    //     var q='';
    //     var old = []; // 指的是原来结构中的key，都存到一个数组
    //     for(var attr in additionalTranslateWords) {
    //       old.push(attr)
    //       q=q+additionalTranslateWords[attr]+"\n" //把value拼成一个q
    //     }
    //     const translatedWords = {}
    //     await bdt
    //       .translate(q, targetLang, "zh")
    //       .then(async function (res) {
    //         console.log(res);
    //         old.forEach((key, index) => {
    //           translatedWords[key] = res?.trans_result?.[index]?.dst
    //         })
    //         console.log(translatedWords);
    //         await callback(translatedWords);
    //       })
    //       .catch(async function (err) {
    //         console.log(err, "----translate error");
    //         await callback(null);
    //       });
    //     // const keys = Object.keys(allTranslateWords)
    //     // await keys.forEach(async (key) => {
    //     //   const val = await bdt.translate(allTranslateWords[key], 'en', 'zh').then(await option?.autoTranslate?.translateCallback)
    //     //   allWords[key] = val;
    //     // })
    //     // return allWords;
    //   }
    // },

    execOtherLocales: async function (
      additionalTranslateWords,
      option,
      localName,
      callback
    ) {
      console.log(additionalTranslateWords, option);
      callback(null);
      // if (
      //   this.option.autoTranslate?.enable &&
      //   Object.keys(additionalTranslateWords).length > 0 && 
      //   Object.keys(additionalTranslateWords).length < (this.option.autoTranslate?.maxLimit || 100)
      // ) {
      //   await this.autoTranslate(
      //     additionalTranslateWords,
      //     option,
      //     localName,
      //     callback
      //   );
      // } else {
      //   callback(null);
      // }
    },

    start: async function () {
      let allTranslateWords = {};
      let additionalTranslateWords = {};
      // 主翻译文件
      const outputMainLocalPath = (localName) =>
        `${this.option.output}/${localName}.js`;

      if (!this._existsSync(this.option.output)) {
        mkdirp(this.option.output);
      }
      //! 如果存在之前翻译过的主翻译文件 将key-val 颠倒， 则拿出来放到allTranslateWords ： {val ->key} 格式
      //* allTranslateWords ： {val ->key} 格式
      if (this._existsSync(outputMainLocalPath(this.option.mainLocal))) {
        Object.assign(
          allTranslateWords,
          this.getExistWords(outputMainLocalPath(this.option.mainLocal))
            .keyValue
        );
      }
      // 得到需要翻译文件 的 路径
      const translateFiles = this._getTranslateFiles();

      translateFiles.forEach((filePath) => {
        this.collect(allTranslateWords, additionalTranslateWords, filePath); //! 每一个需要翻译的文件 通过babel 都进行 文字收集和替换

        // this.collect(allTranslateWords, additionalTranslateWords, path.resolve(path.join(process.cwd(), filePath)));  //! 每一个需要翻译的文件 通过babel 都进行 文字收集和替换
      });
      Object.assign(allTranslateWords, additionalTranslateWords);
      // 写入其他翻译的文件
      if (this.option.otherLocales) {
        // 生成其他语言文件
        const buffer = this.option.otherLocales.map(
          (localName) =>
            new Promise(async (resolve, reject) => {
              setTimeout(async () => {
                // 得到要输出文件的 路径
              const path = outputMainLocalPath(localName);
              
              // 处理其他的翻译文件，增量判断 要翻译的，回调函数把最后的数据 写文件
              await this.execOtherLocales(
                additionalTranslateWords,
                option,
                localName,
                async (additionalWords) => {
                  if (
                    additionalWords === null &&
                    Object.keys(additionalTranslateWords).length
                  ) {
                    const additionalEmptyVal = new Proxy(
                      additionalTranslateWords,
                      { get: () => "" }
                    );
                    additionalWords = JSON.parse(
                      JSON.stringify(additionalEmptyVal)
                    );
                  }
                  // 新的翻译key-val， allTranslateWords {翻译的val -> key} 格式 转换成 allWords {key, 翻译的val}
                  // const allWords = util.invert(JSON.parse(JSON.stringify(allTranslateWords)))
                  // 将其他语言文件 已翻译过的 读取出来 key-val
                  const existWords = this.getExistWords(path).keyValue;
                  // 合并 所有 翻译的单词 key -> val
                  const allWords = Object.assign(
                    {},
                    existWords,
                    additionalWords
                  );
                  // 将要写入其他 语言的 key-val str 包裹一层 module.exports = {xxx}
                  const content = this.reorganize(allWords);
                  // 写入其他语言 的翻译文件
                  await this.write(path, content, { encoding: "utf-8" });
                  resolve("done");
                }
              );
              }, 2000)
              
            })
        );
        await Promise.all(buffer);
      }

      // 将要写入的 主语言 key-val str 包裹一层 module.exports = {xxx}
      const reorganizeContent = this.reorganize(allTranslateWords);
      // 写入主语言 文件
      await this.write(
        outputMainLocalPath(this.option.mainLocal),
        reorganizeContent,
        { encoding: "utf-8" }
      );
// 写入index文件
      file.writeIndexFile(option.output, option)
    },
  };
  return collectAndWrite;
};
