// src/middleware/authMiddleware.js
// MedConnect — Middleware de Autenticación JWT
// Ref: Arquitectura de Software — Sección 5.3 | SRS RF-02, RNF-08

const { verifyToken } = require('../services/authService');

/**
 * Middleware para la autenticación de usuarios mediante tokens JWT.
 * Intercepta las rutas protegidas, valida el token provisto en la cabecera 'Authorization'
 * y asigna el payload decodificado a `req.user`.
 * 
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función callback para continuar al siguiente middleware o ruta.
 * @returns {void|import('express').Response} Retorna respuesta con código 401 si falla, de lo contrario invoca a next().
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
