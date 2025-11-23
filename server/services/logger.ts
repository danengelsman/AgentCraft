import winston from 'winston';
import { config } from '../config/production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'agentcraft', env: config.NODE_ENV },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: config.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    // File transport for errors
    ...(config.NODE_ENV === 'production' 
      ? [
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
          })
        ]
      : []
    ),
  ],
});

// Create child loggers for specific modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request
  logger.info('Request received', { 
    method, 
    url, 
    ip,
    userId: req.session?.userId,
  });
  
  // Log response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    logger.info('Response sent', {
      method,
      url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.session?.userId,
    });
    originalSend.call(this, data);
  };
  
  next();
};

// Error logging
export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

// Audit logging for critical operations
export const auditLog = (action: string, userId: string, details: any) => {
  logger.info(`AUDIT: ${action}`, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

export default logger;