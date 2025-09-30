import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // levels: error, warn, info, verbose, debug, silly
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // ✅ Log to console
    new transports.Console(),
    // ✅ Log to file (all logs)
    new transports.File({ filename: "logs/combined.log" }),
    // ✅ Log only errors
    new transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

export default logger;
