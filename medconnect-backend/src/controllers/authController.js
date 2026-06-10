// src/controllers/authController.js
// MedConnect — Controlador de Autenticación
// Ref: Arquitectura de Software — Sección 5.1 | SRS RF-01, RF-02, RNF-08

const { validationResult } = require('express-validator');
const prisma = require('../config/prismaClient');
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken
} = require('../services/authService');

// Mapa en memoria para bloqueo por intentos fallidos (HU-02)
const loginAttempts = new Map();
const MAX_INTENTOS  = 3;
const BLOQUEO_MS    = 15 * 60 * 1000; // 15 minutos

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de nuevo paciente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, cedula, correo, contrasena, telefono]
 *             properties:
 *               nombre:    { type: string, example: "María López" }
 *               cedula:    { type: string, example: "0503456789" }
 *               correo:    { type: string, example: "maria@ejemplo.com" }
 *               contrasena:{ type: string, example: "Segura#2026" }
 *               telefono:  { type: string, example: "0991234567" }
 *     responses:
 *       201: { description: Paciente registrado exitosamente }
 *       400: { description: Datos inválidos }
 *       409: { description: Correo ya registrado }
 */
async function registerPaciente(req, res) {
  // Validar entradas (express-validator — SRS RNF-08)
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombre, cedula, correo, contrasena, telefono } = req.body;

  try {
    // Verificar si el correo ya existe (HU-01 criterio de aceptación)
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado. Por favor inicia sesión.'
      });
    }

    // Hash de la contraseña (bcrypt 10 salt rounds — SRS RNF-03)
    const passwordHash = await hashPassword(contrasena);

    // Crear usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        cedula,
        correo,
        passwordHash,
        telefono,
        rol: 'PACIENTE'
      }
    });

    return res.status(201).json({
      mensaje: 'Registro exitoso. ¡Bienvenido a MedConnect!',
      usuario: {
        id:     nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol:    nuevoUsuario.rol
      }
    });
  } catch (err) {
    console.error('Error en registerPaciente:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión y generación de token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo:     { type: string }
 *               contrasena: { type: string }
 *     responses:
 *       200: { description: Login exitoso — retorna token JWT }
 *       401: { description: Credenciales inválidas }
 *       429: { description: Cuenta bloqueada temporalmente }
 */
async function login(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { correo, contrasena } = req.body;

  // Verificar bloqueo por intentos fallidos (HU-02: 3 intentos → 15 min)
  const intentos = loginAttempts.get(correo);
  if (intentos && intentos.count >= MAX_INTENTOS) {
    const tiempoRestante = Math.ceil((intentos.timestamp + BLOQUEO_MS - Date.now()) / 60000);
    if (tiempoRestante > 0) {
      return res.status(429).json({
        mensaje: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${tiempoRestante} minuto(s).`
      });
    }
    loginAttempts.delete(correo);
  }

  try {
    // Buscar usuario por correo
    const usuario = await prisma.usuario.findUnique({ where: { correo } });

    // Mensaje genérico — no expone si el correo existe (OWASP / RF-02)
    if (!usuario || !usuario.estado) {
      registrarIntentoFallido(correo);
      return res.status(401).json({ mensaje: 'Credenciales inválidas. Intente nuevamente.' });
    }

    // Comparar contraseña con hash almacenado
    const passwordValida = await comparePassword(contrasena, usuario.passwordHash);
    if (!passwordValida) {
      registrarIntentoFallido(correo);
      return res.status(401).json({ mensaje: 'Credenciales inválidas. Intente nuevamente.' });
    }

    // Limpiar intentos fallidos al iniciar sesión correctamente
    loginAttempts.delete(correo);

    // Generar tokens JWT (accessToken 24h + refreshToken 30d — SRS RNF-08)
    const accessToken  = generateToken({ id: usuario.id, rol: usuario.rol, correo: usuario.correo });
    const refreshToken = generateRefreshToken({ id: usuario.id });

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      accessToken,
      refreshToken,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol:    usuario.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * Registra un intento fallido de inicio de sesión.
 * @param {string} correo
 */
function registrarIntentoFallido(correo) {
  const actual = loginAttempts.get(correo) || { count: 0, timestamp: Date.now() };
  loginAttempts.set(correo, {
    count:     actual.count + 1,
    timestamp: Date.now()
  });
}

module.exports = { registerPaciente, login };
