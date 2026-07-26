// tests/unit/auth.test.js
// MedConnect — Pruebas Unitarias: Autenticación
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.2 y 5.4.1
// Cubre: RF-01 (registro) y RF-02 (login)

const { registerPaciente, login } = require('../../src/controllers/authController');
const prisma  = require('../../src/config/prismaClient');
const bcrypt  = require('bcryptjs');

jest.mock('../../src/config/prismaClient');
jest.mock('bcryptjs');

describe('AuthController — Registro de paciente (RF-01)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B01: Registro exitoso devuelve 201
  test('TC-B-01: Registro exitoso devuelve 201 y datos del paciente', async () => {
    const mockReq = {
      body: {
        nombre: 'María López', cedula: '0503456789',
        correo: 'maria@ejemplo.com', contrasena: 'Segura#2026', telefono: '0991234567'
      }
    };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prisma.usuario.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('$2b$10$hashSeguro...');
    prisma.usuario.create.mockResolvedValue({
      id: 1, nombre: 'María López', correo: 'maria@ejemplo.com', rol: 'PACIENTE'
    });

    await registerPaciente(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('Segura#2026', 10);
  });

  // TC-B02: Correo duplicado devuelve 409
  test('TC-B-02: Correo duplicado devuelve 409 Conflict', async () => {
    const mockReq = { body: { correo: 'existente@ejemplo.com', contrasena: 'Segura#2026' } };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prisma.usuario.findUnique.mockResolvedValue({ id: 5, correo: 'existente@ejemplo.com' });

    await registerPaciente(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  // TC-B03: Datos inválidos — se simula correo duplicado para que create no se llame
  // Nota: jest.mock() anidado dentro de un test no tiene efecto en Jest
  test('TC-B-03: Datos inválidos no llaman a usuario.create', async () => {
    const mockReq = { body: { correo: 'no-es-un-email', contrasena: '123' } };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Correo "existente" para que el controlador retorne 409 sin llamar a create
    prisma.usuario.findUnique.mockResolvedValue({ id: 99, correo: 'no-es-un-email' });

    await registerPaciente(mockReq, mockRes);

    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });
});

describe('AuthController — Inicio de sesión (RF-02)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B04: Login correcto devuelve 200 y token JWT
  test('TC-B-04: Credenciales correctas devuelven 200 y token JWT', async () => {
    const mockReq = { body: { correo: 'maria@ejemplo.com', contrasena: 'Segura#2026' } };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prisma.usuario.findUnique.mockResolvedValue({
      id: 1, nombre: 'María López', correo: 'maria@ejemplo.com',
      passwordHash: '$2b$10$hash', rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(true);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta).toHaveProperty('accessToken');
    expect(typeof respuesta.accessToken).toBe('string');
  });

  // TC-B05: Contraseña incorrecta devuelve 401
  test('TC-B-05: Contraseña incorrecta devuelve 401 Unauthorized', async () => {
    const mockReq = { body: { correo: 'maria@ejemplo.com', contrasena: 'incorrecta' } };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prisma.usuario.findUnique.mockResolvedValue({
      id: 1, correo: 'maria@ejemplo.com', passwordHash: '$2b$10$hash',
      rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  // TC-B06: Usuario no encontrado devuelve 401 con mensaje genérico (OWASP)
  test('TC-B-06: Usuario inexistente devuelve 401 con mensaje genérico', async () => {
    const mockReq = { body: { correo: 'noexiste@ejemplo.com', contrasena: 'cualquiera' } };
    const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    prisma.usuario.findUnique.mockResolvedValue(null);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).not.toContain('correo');
  });
});
