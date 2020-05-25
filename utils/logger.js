const winston = require('winston');


const logConfiguration = {
    'transports' : [
        new winston.transports.Console({
            level: 'debug'
        }),
        new winston.transports.File({
            filename: 'logs/localfarmserver.log',
            level: 'info',
            handleExceptions: false
        })
    ],
    levels: {
        'error': 0,
        'warn': 1,
        'info': 2,
        'debug': 3,
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(data => `${data.timestamp} - [${data.level}]: ${data.message}`)
    )
};


module.exports = winston.createLogger(logConfiguration);