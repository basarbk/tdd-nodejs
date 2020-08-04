const { createLogger, transports, format } = require('winston');

const customFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase().padEnd(7)}] : ${info.message}`;
  })
);

const destinations = [new transports.Console()];
if (process.env.NODE_ENV === 'production') {
  destinations.push(new transports.File({ filename: 'app.log' }));
}

const logger = createLogger({
  transports: destinations,
  level: 'debug',
  format: customFormat,
  silent: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'staging',
});

module.exports = logger;
