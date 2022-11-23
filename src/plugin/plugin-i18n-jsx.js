const t = require('@babel/types');

const replaceLineBreak = function (value) {
  if(typeof value !== 'string') return value
  return value.replace(/\n/g, ' ')
}

const baseType = function(v) {
  return Object.prototype.toString.call(v)
}

const judgeChinese = function(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}
/**
 * 
 * @param {*} allTranslateWord 已经翻译过的文件 {val: key}
 * @param {*} randomStr 生成随机str方法
 * @param {*} arg 外面传进来的参数
 初始化参数 arg = {
  translateWordsNum: 0, 翻译的计数
  hasImportModule: false, 是/否 头上导入过import intl from 'react-intl-universal';
}
 * @returns  翻译文件的value （可能带变量）
 */
function reactPlugin (allTranslateWord,additionalTranslateWords, randomStr,filePath, arg, option) {
  // variableObj 翻译的字符串里有变量的情况
  function makeReplace({value, variableObj}) {
    arg.translateWordsNum++; // 
    let key = randomStr(filePath, value, option);
    // allTranslateWord[key] = value

    console.log("replace", key, value)
    additionalTranslateWords[key] = value
    // const val = value;
    // if(allTranslateWord[val]) { // 如果已经翻译过 直接拿出来key
    //   key = allTranslateWord[val];
    // } else {
    //   allTranslateWord[val] = key // 如果没有翻译过， 生成新的key 
    // }
    
    // 用于防止中文转码为 unicode
    const v = Object.assign(t.StringLiteral(value), {
      extra: {
        raw: `\'${value}\'`,
        rawValue: value,
      }
    })
    return t.CallExpression(
      t.MemberExpression(
        t.Identifier("intl"),
        t.Identifier("get")
      ),
      setObjectExpression(variableObj) ? [t.StringLiteral(key), setObjectExpression(variableObj)] : [t.StringLiteral(key)]
    )
  }

  function setObjectExpression(obj) {
    if(baseType(obj) === '[object Object]') {
      const ObjectPropertyArr = [];
      for(const o in obj) {
        ObjectPropertyArr.push(
          t.ObjectProperty(t.Identifier(o), t.Identifier(obj[o]))
        )
      }
      return t.ObjectExpression(ObjectPropertyArr)
    }
    return null;
  }
  // 最终返回的是plugin
  const plugin = function ({ types: t }) {
    // return {
    //   visitor:{}
    // }
    return {
      visitor: {
        // 只处理import节点
        ImportDeclaration(path) {
          try{
            const { node } = path;
            // 判断该文件有 是否导入过react-intl-universal ，则把 arg.hasImportModule标记true
            if (node.source.value === 'react-intl-universal') {
              arg.hasImportModule = true;
            }
            path.skip(); // 当前这条路径节点跳过
          } catch(e){
            console.error('ImportDeclaration', e)
          }
          
        },
        JSXText(path) {
          try{
            const { node } = path;
            if (judgeChinese(node.value)) {
              path.replaceWith(
                t.JSXExpressionContainer(makeReplace({
                  value: node.value.trim().replace(/[\n\r]/gi, "\\n") // 临时办法把 换行符直接 替换 ‘’
                }))
              );
            }
            path.skip();
          } catch(e) {
            console.error('JSXText', e)
          }
          
        },
        // 匹配函数执行的node
        CallExpression(path) {
          try{
            if (path.node.callee.type === "MemberExpression") {
              try{
                // 判断是intl.get(xxxx)方法的调用
                if(path.node.callee.object.callee.object.name === 'intl' && path.node.callee.object.callee.property.name === 'get') {
                  // key = 拿到 intl.get(key).d(val) 格式 中的 key
                  const key = path.node.callee.object.arguments[0].value;
                  // if(path.node.callee.property.name === "d") {
                  //   //value = 拿到 intl.get(key).d(val) 格式 中的 val
                  //   const value = path.node.arguments[0].value
                  //   console.log(`"${key}": "${value}"`)
                  // }
                }
              } catch(e) {
                // console.log(e)
              }
              path.skip()
              return;
            }
          }catch(e){
            console.error('CallExpression', e)
          }
          
        },
        StringLiteral(path) { // string
          try{
            const { node } = path;
            const { value } = node;
            if (judgeChinese(value)) {
              if (path.parent.type === 'JSXAttribute') {
                path.replaceWith(t.JSXExpressionContainer(makeReplace({
                  value: value.trim().replace(/[\n\r]/gi, "\\n")
                })));
              } else if(path.parent.type === 'ObjectProperty') {
                path.replaceWith(makeReplace({
                  value: value.trim().replace(/[\n\r]/gi, "\\n")
                }));
              } else if(path.parent.type === 'AssignmentExpression') {
                path.replaceWith(makeReplace({
                  value: value.trim().replace(/[\n\r]/gi, "\\n")
                }));
              } else {
                path.replaceWith(makeReplace({
                  value: value.trim().replace(/[\n\r]/gi, "\\n")
                }));
              }
              path.skip();
            }
          }catch(e) {
            console.error('StringLiteral', e)
          }
          
        },
        TemplateLiteral(path) { // 模板字符串
          try{
            if(!path.node.quasis.every(word => !judgeChinese(word))) { // 跳过都不是中文的情况
              path.skip();
              return
            }
            // 如果检测到中文， 将 模板字符串 按start顺序 重新拼接，
            // `我要${name}测试`  path.node.quasis -》 [{我要}, {测试}]  path.node.expressions -> [{${name}}]
            const tempArr = [].concat(path.node.quasis, path.node.expressions).sort(function(a,b){
              return a.start - b.start;
            })
            let isreplace = false;
            // 最终转换出来的string
            let v = '';
            const variable = {}
            tempArr.forEach(function(t) {
              if(t.type === 'TemplateElement') { // `我要${name}测试` 里中的TemplateElement 类型是 [{我要,。...},{测试,...}]
                v += `${replaceLineBreak(t.value.cooked)}`;
                if(judgeChinese(t.value.cooked)) {
                  isreplace = true;
                }
              } else if(t.type === 'Identifier') { // `我要${name}测试` 里中的Identifier 类型是 ${name}
                variable[t.name] = t.name;
                v += `{${t.name}}`
              } else if(t.type === 'CallExpression') {
                // TODO
                /**
                  var aa = () => "dwww"
                  var test = (name) => `我要${name}测试${aa()}`
                  ${aa()} 是 CallExpression，未处理
                 */
                isreplace = false;
              } else {
                // ...TODO
                isreplace = false;
              }
            })
            if(!isreplace) { // 如果没有替换 则跳过该文件
              path.skip();
              return
            }
            if(v.trim() === '') {
              path.skip();
              return
            }
            path.replaceWith(makeReplace({
              value: v,
              variableObj: variable,
            }));
            path.skip();
          }catch(e) {
            console.error('TemplateLiteral', e)
          }
          
        },
      }
    };
  }

  return plugin
}

module.exports = reactPlugin