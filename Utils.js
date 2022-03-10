var log = require('terminal-kit').terminal;
const _moment = require('moment');

function getConfig() {
    let isDevelopment = true
    if (isDevelopment) {
        return require("./Settings/development.json")
    } else {
        return require("./Settings/production.json")
    }
}

function logger(level, message) {
    let currentDate = `${_moment(Date.now())}`
    switch (level) {
        case "info":
            log.bold.blue(`[${currentDate}] - [INFO] ${message}\n`)
            break;
        case "warn":
            log.bold.yellow(`[${currentDate}] - [WARN] ${message}\n`)
            break;
        case "error":
            log.bold.red(`[${currentDate}] - [ERROR] ${message}\n`)
            break;
        case "debug":
            log.bold.magenta(`[${currentDate}] - [DEBUG] ${message}\n`)
            break;
        default:
            log.bold.white(`[${currentDate}] - [INFO] ${message}\n`)
            break;
    }
}


module.exports = {
    getConfig: getConfig(),
    logger: logger

}