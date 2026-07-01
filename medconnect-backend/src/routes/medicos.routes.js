// src/routes/medicos.routes.js
// MedConnect — Rutas de Médicos | SRS RF-04, RF-05, RF-08
const express       = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { getMe, getById, getDisponibilidad, getAgendaSemanal } = require('../controllers/medicosController');

const router = express.Router();

// GET /api/medicos/me — Perfil del médico autenticado (RF-08)
router.get('/me', authMiddleware, roleMiddleware(['MEDICO']), getMe);

// GET /api/medicos/:id — RF-04 (requiere autenticación)
router.get('/:id', authMiddleware, getById);

// GET /api/medicos/:id/disponibilidad?fecha=YYYY-MM-DD — RF-05
router.get('/:id/disponibilidad', authMiddleware, getDisponibilidad);

// GET /api/medicos/:id/agenda?semana=YYYY-MM-DD — RF-08 (solo MEDICO o ADMIN)
router.get('/:id/agenda', authMiddleware, roleMiddleware(['MEDICO', 'ADMIN']), getAgendaSemanal);

module.exports = router;
