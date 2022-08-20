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

// bdt.translate(`{ '49OQPOS0ip_ceshi': '测试', 'Msd1Jfi8F_ceshi': '测试', 'PyfjXc632e_woyaonameceshi': '我要{name}测试','VtC02wko7_haha': '哈哈',}`,
//  'pt', 'zh').then(function(res) {
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