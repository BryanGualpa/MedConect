// src/routes/especialidades.routes.js
// MedConnect — Rutas de Especialidades | SRS RF-03
const express = require('express');
const { getAll, getById } = require('../controllers/especialidadesController');

const router = express.Router();

// GET /api/especialidades?q=cardio — RF-03 (búsqueda en tiempo real)
router.get('/', getAll);

// GET /api/especialidades/:id
router.get('/:id', getById);

module.exports = router;
