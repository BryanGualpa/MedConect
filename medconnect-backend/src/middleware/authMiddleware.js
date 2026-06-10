// src/middleware/authMiddleware.js
// MedConnect — Middleware de Autenticación JWT
// Ref: Arquitectura de Software — Sección 5.3 | SRS RF-02, RNF-08

const { verifyToken } = require('../services/authService');

/**
 * Intercepta todas las rutas protegidas.
 * Extrae el token JWT del encabezado Authorization: Bearer <token>
 * Rechaza con HTTP 401 si el token es inválido o expirado.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Acceso no autorizado. Se requiere token de autenticación.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, rol, correo, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado. Por favor inicia sesión nuevamente.'
    });
  }
}

module.exports = authMiddleware;
