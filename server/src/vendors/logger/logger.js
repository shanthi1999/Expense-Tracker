import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
