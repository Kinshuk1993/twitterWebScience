var logDir = 'Twitter-Crawler-Final-Output-Log';
var path = require('path');
var logFile = path.resolve(__dirname + "/" + logDir);

const {
    createLogger,
    format,
    transports
} = require('winston');
require('winston-daily-rotate-file');
const env = process.env.NODE_ENV || 'development';

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%.log`,
    datePattern: 'DD-MM-YYYY'
});

const logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' ? 'verbose' : 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        /**
         * Commenting this part so as to avoid the
         * duplicate output on the console window during the
         * execution of the program
         */
        // new transports.Console({
        //     level: 'info',
        //     format: format.combine(
        //         format.colorize(),
        //         // format.printf(
        //         //     info => `${info.timestamp} ${info.level}: ${info.message}`
        //         // )
        //     )
        // }),
        dailyRotateFileTransport
    ]
});

module.exports = logger;