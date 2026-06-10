// src/routes/auth.routes.js
// MedConnect — Rutas de Autenticación | SRS RF-01, RF-02
const express = require('express');
const { body }  = require('express-validator');
const { registerPaciente, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Registro e inicio de sesión de usuarios
 */

// POST /api/auth/register — RF-01
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('cedula').isLength({ min: 10, max: 10 }).withMessage('Cédula debe tener 10 dígitos'),
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
      .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
      .matches(/[0-9]/).withMessage('Debe contener al menos un número'),
    body('telefono').notEmpty().withMessage('El teléfono es requerido')
  ],
  registerPaciente
);

// POST /api/auth/login — RF-02
router.post(
  '/login',
  [
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').notEmpty().withMessage('La contraseña es requerida')
  ],
  login
);

module.exports = router;
