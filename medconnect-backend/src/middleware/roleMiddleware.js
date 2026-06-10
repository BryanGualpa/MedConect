// src/middleware/roleMiddleware.js
// MedConnect — Middleware de Autorización RBAC
// Ref: Arquitectura de Software — Sección 5.3 | SRS RNF-08
// Roles: PACIENTE | MEDICO | ADMIN

/**
 * Middleware de control de acceso basado en roles (RBAC).
 * Recibe el array de roles permitidos para la ruta.
 * Rechaza con HTTP 403 si el rol del usuario no coincide.
 *
 * @param {string[]} rolesPermitidos - Ej: ['ADMIN'] o ['MEDICO', 'ADMIN']
 * @returns {Function} Middleware de Express
 */
function roleMiddleware(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        mensaje: 'Usuario no autenticado.'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        mensaje: 'Acceso denegado. No tienes permisos para realizar esta acción.'
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
