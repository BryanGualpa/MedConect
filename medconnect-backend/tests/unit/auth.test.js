// tests/unit/auth.test.js
// MedConnect — Pruebas Unitarias: Autenticación
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.2 y 5.4.1
// Cubre: RF-01 (registro) y RF-02 (login) | TC-B01 a TC-B06

// ── Mocks ANTES de cualquier require ────────────────────────────────────────
jest.mock('../../src/config/prismaClient');
jest.mock('bcryptjs');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  body: jest.fn(() => ({ notEmpty: jest.fn().mockReturnThis(), isLength: jest.fn().mockReturnThis(), matches: jest.fn().mockReturnThis(), isEmail: jest.fn().mockReturnThis(), withMessage: jest.fn().mockReturnThis() }))
}));

const { registerPaciente, login } = require('../../src/controllers/authController');
const prisma   = require('../../src/config/prismaClient');
const bcrypt   = require('bcryptjs');
const { validationResult } = require('express-validator');

// ── Helper: simular validationResult sin errores ─────────────────────────────
function sinErrores() {
  validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
}

// ── Helper: simular validationResult CON errores ─────────────────────────────
function conErrores(msgs = ['Error de validación']) {
  validationResult.mockReturnValue({
    isEmpty: () => false,
    array:   () => msgs.map(m => ({ msg: m }))
  });
}

// ── Helper: crear mockRes estándar ───────────────────────────────────────────
function crearMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn()
  };
}

// ────────────────────────────────────────────────────────────────────────────
// SUITE 1 — Registro de paciente (RF-01)
// ────────────────────────────────────────────────────────────────────────────
describe('AuthController — Registro de paciente (RF-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sinErrores(); // por defecto: validaciones pasan
  });

  // TC-B01: Registro exitoso → 201 + datos del paciente
  test('TC-B-01: Registro exitoso devuelve 201 y datos del paciente', async () => {
    const mockReq = {
      body: {
        nombre:     'María López',
        cedula:     '0503456789',
        correo:     'maria@ejemplo.com',
        contrasena: 'Segura#2026',
        telefono:   '0991234567'
      }
    };
    const mockRes = crearMockRes();

    // Arrange
    prisma.usuario.findUnique.mockResolvedValue(null);          // correo libre
    bcrypt.hash.mockResolvedValue('$2b$10$hashSeguro...');
    prisma.usuario.create.mockResolvedValue({
      id: 1, nombre: 'María López', correo: 'maria@ejemplo.com', rol: 'PACIENTE'
    });

    // Act
    await registerPaciente(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('Segura#2026', 10);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty('usuario');
    expect(body.usuario.rol).toBe('PACIENTE');
  });

  // TC-B-02: Correo ya registrado → 409 Conflict
  test('TC-B-02: Correo duplicado devuelve 409 Conflict', async () => {
    const mockReq = {
      body: { nombre: 'Test', cedula: '1234567890', correo: 'existente@ejemplo.com', contrasena: 'Segura#2026', telefono: '099' }
    };
    const mockRes = crearMockRes();

    // Arrange: el correo ya existe en la BD
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5, correo: 'existente@ejemplo.com'
    });

    // Act
    await registerPaciente(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).toContain('registrado');
  });

  // TC-B-02b: Cédula ya registrada → 409 Conflict
  test('TC-B-02b: Cédula duplicada devuelve 409 Conflict', async () => {
    const mockReq = {
      body: { nombre: 'Test', cedula: '0503456789', correo: 'libre@ejemplo.com', contrasena: 'Segura#2026', telefono: '099' }
    };
    const mockRes = crearMockRes();

    // Arrange: el correo no existe en la BD, la cédula sí
    prisma.usuario.findUnique.mockResolvedValueOnce(null);
    prisma.usuario.findUnique.mockResolvedValueOnce({
      id: 5, cedula: '0503456789'
    });

    // Act
    await registerPaciente(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).toContain('Esta cédula ya está registrada.');
  });

  // TC-B03: Validación falla (express-validator) → 400 Bad Request
  test('TC-B-03: Datos inválidos devuelven 400 Bad Request', async () => {
    const mockReq = {
      body: { correo: 'no-es-email', contrasena: '123' }
    };
    const mockRes = crearMockRes();

    // Arrange: simular que las validaciones fallaron
    conErrores(['Correo electrónico inválido', 'Contraseña muy corta']);

    // Act
    await registerPaciente(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty('errores');
    expect(body.errores.length).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 2 — Inicio de sesión (RF-02)
// ────────────────────────────────────────────────────────────────────────────
describe('AuthController — Inicio de sesión (RF-02)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sinErrores(); // validaciones pasan por defecto
  });

  // TC-B04: Credenciales correctas → 200 + accessToken + refreshToken
  test('TC-B-04: Credenciales correctas devuelven 200 y token JWT', async () => {
    const mockReq = {
      body: { correo: 'maria@ejemplo.com', contrasena: 'Segura#2026' }
    };
    const mockRes = crearMockRes();

    // Arrange
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1, nombre: 'María López', correo: 'maria@ejemplo.com',
      passwordHash: '$2b$10$hash', rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(true);

    // Act
    await login(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.usuario.rol).toBe('PACIENTE');
  });

  // TC-B05: Contraseña incorrecta → 401 Unauthorized
  test('TC-B-05: Contraseña incorrecta devuelve 401 Unauthorized', async () => {
    const mockReq = {
      body: { correo: 'maria@ejemplo.com', contrasena: 'incorrecta' }
    };
    const mockRes = crearMockRes();

    prisma.usuario.findUnique.mockResolvedValue({
      id: 1, correo: 'maria@ejemplo.com', passwordHash: '$2b$10$hash',
      rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(false); // contraseña no coincide

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).toBe('Credenciales inválidas. Intente nuevamente.');
  });

  // TC-B06: Bloqueo tras 3 intentos fallidos → 429 Too Many Requests
  test('TC-B-06: Bloqueo tras 3 intentos fallidos devuelve 429', async () => {
    const correo  = `bloqueo_${Date.now()}@test.com`; // correo único para no colisionar
    const mockRes = crearMockRes();

    // Arrange: usuario existe pero contraseña siempre incorrecta
    prisma.usuario.findUnique.mockResolvedValue({
      id: 99, correo, passwordHash: '$2b$10$hash', rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(false);

    const mockReq = { body: { correo, contrasena: 'incorrecta' } };

    // 3 intentos fallidos consecutivos
    await login(mockReq, crearMockRes());
    await login(mockReq, crearMockRes());
    await login(mockReq, crearMockRes());

    // 4.º intento → debe retornar 429
    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(429);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).toContain('bloqueada');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 3 — Middleware de autenticación JWT (RNF-08)
// ────────────────────────────────────────────────────────────────────────────
describe('authMiddleware — Verificación de token JWT', () => {
  const authMiddleware = require('../../src/middleware/authMiddleware');

  function crearReq(authHeader) {
    return { headers: { authorization: authHeader } };
  }

  test('Sin header Authorization → 401', () => {
    const req  = crearReq(undefined);
    const res  = crearMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Token malformado → 401', () => {
    const req  = crearReq('Bearer token.invalido.aqui');
    const res  = crearMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Token válido → llama next() y asigna req.user', () => {
    const { generateToken } = require('../../src/services/authService');
    const token = generateToken({ id: 1, rol: 'PACIENTE', correo: 'test@test.com' });

    const req  = crearReq(`Bearer ${token}`);
    const res  = crearMockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toHaveProperty('id', 1);
    expect(req.user).toHaveProperty('rol', 'PACIENTE');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 4 — Middleware de roles RBAC (RNF-08)
// ────────────────────────────────────────────────────────────────────────────
describe('roleMiddleware — Control de acceso RBAC', () => {
  const roleMiddleware = require('../../src/middleware/roleMiddleware');

  test('Rol no permitido → 403 Forbidden', () => {
    const req  = { user: { id: 1, rol: 'PACIENTE' } };
    const res  = crearMockRes();
    const next = jest.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('Rol permitido → llama next()', () => {
    const req  = { user: { id: 1, rol: 'ADMIN' } };
    const res  = crearMockRes();
    const next = jest.fn();

    roleMiddleware(['ADMIN', 'MEDICO'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('Sin req.user → 401', () => {
    const req  = {};
    const res  = crearMockRes();
    const next = jest.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
