import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston about the colors
winston.addColors(colors)

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Define which logs to show based on environment
const showDebugLogs = process.env.NODE_ENV !== 'production'

// Define the transports
const transports: winston.transport[] = [
  // Console transport for all environments
  new winston.transports.Console({
    level: showDebugLogs ? 'debug' : 'info',
    format,
  }),
]

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  )
}

// Create the logger
export const logger = winston.createLogger({
  level: showDebugLogs ? 'debug' : 'info',
  levels,
  format,
  transports,
})

// Helper functions for different log types
export const logAPIRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userAgent?: string,
  ip?: string
) => {
  logger.http(`API ${method} ${url} - ${statusCode} - ${duration}ms`, {
    method,
    url,
    statusCode,
    duration,
    userAgent,
    ip,
  })
}

export const logSessionOperation = (
  operation: 'create' | 'read' | 'update' | 'delete',
  sessionId: string,
  userId?: string,
  success: boolean = true,
  error?: string
) => {
  const level = success ? 'info' : 'error'
  const message = `Session ${operation} - ID: ${sessionId}${userId ? ` - User: ${userId}` : ''}`

  logger.log(level, message, {
    operation,
    sessionId,
    userId,
    success,
    error,
  })
}

export const logValidationError = (
  type: 'sessionId' | 'receiptData',
  value: any,
  error: string
) => {
  logger.warn(`Validation failed for ${type}: ${error}`, {
    type,
    value: typeof value === 'string' ? value : JSON.stringify(value),
    error,
  })
}

export const logRateLimitExceeded = (
  identifier: string,
  endpoint: string,
  retryAfter: number
) => {
  logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`, {
    identifier,
    endpoint,
    retryAfter,
  })
}

export const logDatabaseError = (
  operation: string,
  table: string,
  error: string,
  params?: any
) => {
  logger.error(`Database ${operation} failed on ${table}: ${error}`, {
    operation,
    table,
    error,
    params: params ? JSON.stringify(params) : undefined,
  })
}

// Export for testing
export { levels, colors }
