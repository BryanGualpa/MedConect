// src/services/authService.js
// MedConnect — Servicio de Autenticación (JWT + bcrypt)
// Ref: Arquitectura de Software — Sección 5.2 | SRS RF-01, RF-02, RNF-08

const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const JWT_SECRET          = process.env.JWT_SECRET || 'test-secret-medconnect-2026';
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const SALT_ROUNDS         = 10;

/**
 * Genera un token JWT con el payload indicado.
 * @param {{ id: number, rol: string, correo: string }} payload
 * @returns {string} Token JWT firmado (expira en 24h — SRS RNF-08)
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Genera un refresh token de larga duración (30 días).
 * @param {{ id: number }} payload
 * @returns {string} Refresh token JWT
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
}

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token
 * @returns {{ id: number, rol: string, correo: string, iat: number, exp: number }}
 * @throws {Error} Si el token es inválido o ha expirado
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Hashea una contraseña en texto plano usando bcrypt (10 salt rounds).
 * Ninguna contraseña se persiste en texto plano (SRS RNF-08).
 * @param {string} plainPassword
 * @returns {Promise<string>} Hash bcrypt
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * @param {string} plain  - Contraseña ingresada por el usuario
 * @param {string} hash   - Hash almacenado en la base de datos
 * @returns {Promise<boolean>}
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword
};
