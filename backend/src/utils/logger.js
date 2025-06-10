const winston = require('winston');
const { format } = winston;
const path = require('path');

// Definir los niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir los colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Agregar colores a winston
winston.addColors(colors);

// Definir el formato de los logs
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Definir las opciones de transporte
const transports = [
  // Consola
  new winston.transports.Console(),
  
  // Archivo para todos los logs
  new winston.transports.File({
    filename: path.join('logs', 'all.log'),
  }),
  
  // Archivo para errores
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),
  
  // Archivo para HTTP
  new winston.transports.File({
    filename: path.join('logs', 'http.log'),
    level: 'http',
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: logFormat,
  transports,
});

// Middleware para logging de HTTP
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

// Función para logging de errores
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user.id : 'anonymous',
  });
  
  next(err);
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
}; 