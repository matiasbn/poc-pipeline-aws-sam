const pino = require('pino');

const logger = pino({
  prettyPrint: {
    // translateTime: 'dd/mm HH:MM:ss',
    translateTime: 'dd/mm HH:MM:ss',
    colorize: true,
    ignore: 'pid,hostname',
  },
});

module.exports = { logger };
