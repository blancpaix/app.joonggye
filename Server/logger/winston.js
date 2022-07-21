const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize } = winston.format;

const logDir = 'logs';
const logFormat = printf(info => {
  return `${info.timestamp} ${info.level} : ${info.message}`;
});

/* Log Sample

info: {
  message: '::ffff:192.168.29.179 - - [08/Oct/2021:01:56:44 +0000] "GET / HTTP/1.1" 200 3 "-" "Mozilla/5.0 (Linux; Android 9; KFMAWI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 EdgA/93.0.961.69"\n',
  level: 'info',
  timestamp: '2021-10-08 10:56',
  [Symbol(level)]: 'info'
}*/

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    logFormat,
  ),
  transports: [
    // info Level
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 32,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/warn',
      filename: `%DATE%.warn.log`,
      maxFiles: 32,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/err',
      filename: `%DATE%.error.log`,
      maxFiles: 32,
      zippedArchive: true,
    }),
  ],
});

logger.stream = {
  write: message => {
    logger.info(message);
  }
};

if (process.env.NODE_ENV === 'dev') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      logFormat,
    )
  }))
};

module.exports = logger;