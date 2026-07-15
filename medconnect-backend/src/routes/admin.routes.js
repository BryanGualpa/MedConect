// src/routes/admin.routes.js
// MedConnect — Rutas del Panel Administrativo | SRS RF-09 | SCRUM-55
// Acceso restringido: solo rol ADMIN (RBAC)
/**
 * Definición de endpoints administrativos para el registro de médicos,
 * actualización de perfiles y mantenimiento del catálogo de especialidades.
 */
const express       = require('express');
const { body }       = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getMedicos, createMedico, updateMedico, setHorario, deactivate
} = require('../controllers/adminController');

const router = express.Router();

// Aplicar autenticación y RBAC a todas las rutas del panel admin
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// GET /api/admin/medicos — Listar médicos
router.get('/medicos', getMedicos);

// POST /api/admin/medicos — Crear médico
router.post(
  '/medicos',
  [
    body('nombre').notEmpty(),
    body('cedula').isLength({ min: 10, max: 10 }),
    body('correo').isEmail(),
    body('contrasena').isLength({ min: 8 }),
    body('telefono').notEmpty(),
    body('titulo').notEmpty(),
    body('especialidadId').isInt({ min: 1 })
  ],
  createMedico
);

// PUT /api/admin/medicos/:id — Actualizar médico
router.put('/medicos/:id', updateMedico);

// POST /api/admin/medicos/:id/horarios — Asignar horarios
router.post('/medicos/:id/horarios', setHorario);

// PATCH /api/admin/medicos/:id/desactivar — Desactivar médico
router.patch('/medicos/:id/desactivar', deactivate);

module.exports = router;
