// if (process.env.NODE_ENV === 'development') {
if (true) {
    const winston = require('winston')
    require('winston-daily-rotate-file')

    const transport = new (winston.transports.DailyRotateFile)({
        filename: './logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d'
    })

    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console({
                colorize: true
            }),
            transport
        ]
    })

    module.exports = {
        Log (text) {
            logger.info(text)
        },
        Err (text) {
            logger.error(text)
        }
    }
} else {
    module.exports = {
        Log (text) {
            console.log(text)
        },
        Err (text) {
            console.error(text)
        }
    }
}
