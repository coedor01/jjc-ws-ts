import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, label, colorize, printf } = format;

// 自定义日志格式
//@ts-ignore
const myFormat = printf(({ level, message, timestamp, label }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// 创建 logger 实例
const logger: Logger = createLogger({
  format: combine(
    label({ label: 'JJC-WS' }),
    colorize(),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// 导出 logger
export default logger;
