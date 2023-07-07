const file = require("./file");
const { Parser } = require('htmlparser2');
const fs = require('fs');
const {pinyin} = require("pinyin-pro");
const zhJson = require("../test/zh.json");

module.exports =  function(option) {
    const obj = {};
    let currentFile = {
        path: '',
        html: ''
    };
    const pickChinese = (text, attribs) => {
        if (!/[\u4E00-\u9FA5]/.test(text)) {
            return;
        }
        const chinese = text.trim();
        console.info('text', chinese, attribs);
        const key = pinyin(text, { toneType: 'none', type: 'string' }).replace(/\s+/g, '').replace(/ü/g, 'v');

        obj[key] = chinese
        const reg = new RegExp( text, 'gi')
        currentFile.html  = currentFile.html.replace(reg, `{{ '${key}' | translate }}`)
    }


    return {
        option: option,
        _getTranslateFiles: function () {
            // return ['C:/projects/web-front/src/app/component/biz/bind-city-selector/bind-city-selector.component.html']
            return file.getHTMLFiles({
                path: this.option.entry,
                exclude: this.option.exclude,
            });
        },

        start() {
            const filePaths = this._getTranslateFiles()
            this.collect(filePaths)
        },

        write: function (path, content, option) {
            fs.writeFileSync(path, content, option);
        },


        collect(filePaths) {
            const parser = new Parser({
                onattribute(name, attribs) {
                    pickChinese(attribs, name)
                },
                onopentag(name, attribs) {
                    pickChinese(name, attribs)
                },
                ontext(text) {
                    pickChinese(text)
                },
                onclosetag(tagname) {
                },
                onopentagname(name) {
                },
                onend() {
                },
                oncomment(val) {
                },
                oncommentend() {
                },
                oncdatastart() {
                },
                oncdataend() {
                },
                onprocessinginstruction(name, data) {
                }
            }, {
                recognizeCDATA: true
            })
            filePaths.forEach(path => {
                currentFile.path = path;
                const html = fs.readFileSync(path, 'utf8')
                currentFile.html = html
                parser.parseComplete(html);
                this.write(path, currentFile.html, 'utf8')
            })

            const zhJsonRes = Object.assign({}, obj, zhJson)

            this.write('./zh.json', JSON.stringify(zhJsonRes, null , 2) )
        }
    }
}