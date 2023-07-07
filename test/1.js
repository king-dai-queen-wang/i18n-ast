const { Parser } = require('htmlparser2');
const fs = require('fs');
const {pinyin} = require("pinyin-pro");
const zhJson  = require('./zh.json');
const tranvserJson = {};
Object.keys(zhJson).forEach(key => {
    tranvserJson[zhJson[key]] = key
})

const obj = {};
const path = './test.html'
let html = fs.readFileSync(path, 'utf8');
let htmlRes = html;

const pickChinese = (text, attribs) => {
    if (!/[\u4E00-\u9FA5]/.test(text)) {
        return;
    }
    const chinese = text.trim();
    console.info('text', chinese, attribs);
    const key = tranvserJson.hasOwnProperty(chinese) ? tranvserJson[chinese] :
        pinyin(text, { toneType: 'none', type: 'string' }).replace(/\s+/g, '').replace(/ü/ig, 'v');
    obj[key] = chinese
    const reg = new RegExp( text, 'gi')
    htmlRes  = htmlRes.replace(reg, `{{ '${key}' | translate }}`)
}


const parser = new Parser({
    onattribute(name, attribs) {
        console.log(11, name, attribs)
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

parser.parseComplete(html);

const zhJsonRes = Object.assign({}, obj, zhJson)

fs.writeFile('./zh.json', JSON.stringify(zhJsonRes, null , 2), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("zh JOSN saved successfully!");
} )

fs.writeFile('./11.html', htmlRes, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("File saved successfully!");
} )