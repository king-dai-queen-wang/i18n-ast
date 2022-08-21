const shortid = require('shortid');
const {pinyin} = require('pinyin-pro');
// use $ and @ instead of - and _
// shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
// console.log(pinyin("你好的 的嗯嗯饿ww的我呃呃呃", { toneType: 'none', type: 'string' }).replace(/\W/g, '').substring(0, 16))
const shortId = function(text) {
    return `${Math.random().toString(36).substr(2)}${pinyin(text, { toneType: 'none', type: 'string' }).replace(/\W/g, '').substring(0, 16)}`
}

module.exports = {
    shortId
}

// const BaiduTranslate = require('node-baidu-translate');

// const bdt = new BaiduTranslate('20220816001309546', '6qjHdX4wDxW06Q_efK6q')

// const jsonObj = {"lt89fgu5ah":"测试","c70icaalb6b":"测试","04la9rxuz9n7":"我要{name}测试"}
// // var jsonObj = JSON.parse(transformOrigin);

// var q='';
// var old = []; // 指的是原来结构中的key，都存到一个数组
// for(var attr in jsonObj) {
//     old.push(attr)
//     q=q+jsonObj[attr]+"\n" //把value拼成一个q
// }

// bdt.translate(q,
//  'jp', 'zh').then(function(res) {
//   console.log(res)
// }).catch(function(err){ console.log(err); })

// const translate = require('google-translate-api');
 
// translate('Ik spreek Engels', {to: 'en'}).then(res => {
//     console.log(res.text);
//     //=> I speak English
//     console.log(res.from.language.iso);
//     //=> nl
// }).catch(err => {
//     console.error(err);
// });