const chalk = require('chalk')

const error = chalk.bold.red;
const warning = chalk.keyword('orange')

console.log(error('error!'))
console.log(warning('warning!'))

const Logger = {
    error: function() {
        console.log(error(...arguments))
    },
    warning: function() {
        console.log(warning(...arguments))
    }
}
Logger.error("dww")
Logger.warning("dww")
// export default Logger = Logger;