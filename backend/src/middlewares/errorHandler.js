// Middleware centralizado para manejo de errores en Express
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    mensaje: err.message || 'Error interno del servidor',
    codigo: err.code || 'ERROR_INTERNO',
    detalles: err.details || undefined
  });
}; 