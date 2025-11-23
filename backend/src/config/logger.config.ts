import winston from 'winston';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { appConfig } from './app.config';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(LOG_COLORS);

const getLogLevel = (): string => {
  return process.env.LOG_LEVEL || (appConfig.env === 'development' ? 'debug' : 'info');
};

const createConsoleFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
  );
};

const createFileFormat = (): winston.Logform.Format => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );
};

const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: createConsoleFormat(),
    }),
  ];

  if (appConfig.env !== 'test') {
    const logsDir = path.join(__dirname, '../../logs');

    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: createFileFormat(),
        maxsize: 10485760,
        maxFiles: 14,
      })
    );

    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: createFileFormat(),
        maxsize: 10485760,
        maxFiles: 14,
      })
    );
  }

  return transports;
};

export const logger = winston.createLogger({
  level: getLogLevel(),
  levels: LOG_LEVELS,
  transports: createTransports(),
  exitOnError: false,
});

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  logger.info('📱 Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    origin: req.get('origin'),
    hasAuth: !!req.get('authorization'),
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('✅ Response Sent', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
