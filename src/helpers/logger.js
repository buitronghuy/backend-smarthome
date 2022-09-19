const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const { combine, printf, timestamp, ms } = format;
const transport = new transports.DailyRotateFile({
  filename: './logs/git-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '10d',
});

const customFormat = printf((info) => {
  let message = `${info.timestamp} (${info.ms}) [${info.level}]: ${info.message}`;
  message += JSON.stringify(info);
  return message;
});

const logger = createLogger({
  format: combine(timestamp(), ms(), customFormat),
  transports: [transport],
});

module.exports = { logger };
