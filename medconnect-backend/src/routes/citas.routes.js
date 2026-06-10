// src/routes/citas.routes.js
// MedConnect — Rutas de Citas Médicas | SRS RF-06, RF-07, RF-10
const express       = require('express');
const { body }       = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { create, update, cancel, getHistorial } = require('../controllers/citasController');

const router = express.Router();

// POST /api/citas — RF-06 Agendar cita (solo PACIENTE)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['PACIENTE']),
  [
    body('medicoId').isInt({ min: 1 }).withMessage('medicoId inválido'),
    body('fecha').isDate().withMessage('Fecha inválida (YYYY-MM-DD)'),
    body('hora').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida (HH:mm)')
  ],
  create
);

// PUT /api/citas/:id — RF-06 Reagendar cita (solo PACIENTE)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['PACIENTE']),
  [
    body('fecha').isDate().withMessage('Fecha inválida'),
    body('hora').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida')
  ],
  update
);

// DELETE /api/citas/:id — RF-06 Cancelar cita (solo PACIENTE)
router.delete('/:id', authMiddleware, roleMiddleware(['PACIENTE']), cancel);

// GET /api/citas/historial — RF-10 Historial del paciente autenticado
router.get('/historial', authMiddleware, roleMiddleware(['PACIENTE']), getHistorial);

module.exports = router;
