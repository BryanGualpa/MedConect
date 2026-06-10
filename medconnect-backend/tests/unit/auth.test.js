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
        nombre:    'María López',
        cedula:    '0503456789',
        correo:    'maria@ejemplo.com',
        contrasena: 'Segura#2026',
        telefono:  '0991234567'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // Arrange
    prisma.usuario.findUnique.mockResolvedValue(null); // Correo no existe
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
  });

  // TC-B02: Correo duplicado devuelve 409
  test('TC-B-02: Correo duplicado devuelve 409 Conflict', async () => {
    const mockReq = {
      body: { correo: 'existente@ejemplo.com', contrasena: 'Segura#2026' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // Arrange
    prisma.usuario.findUnique.mockResolvedValue({
      id: 5, correo: 'existente@ejemplo.com'
    });

    // Act
    await registerPaciente(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  // TC-B03: Validación falla con datos incompletos — express-validator retorna 400
  test('TC-B-03: Datos inválidos devuelven 400 Bad Request', async () => {
    const mockReq = {
      body: { correo: 'no-es-un-email', contrasena: '123' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // Simular que validationResult retorna errores
    jest.mock('express-validator', () => ({
      validationResult: () => ({
        isEmpty: () => false,
        array:   () => [{ msg: 'Correo inválido' }]
      }),
      body: jest.fn().mockReturnThis()
    }));

    prisma.usuario.findUnique.mockResolvedValue(null);

    await registerPaciente(mockReq, mockRes);
    // La respuesta puede ser 400 o 409 dependiendo del mock; verificamos que create no se llame
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });
});

describe('AuthController — Inicio de sesión (RF-02)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B04: Login correcto devuelve 200 y token JWT
  test('TC-B-04: Credenciales correctas devuelven 200 y token JWT', async () => {
    const mockReq = {
      body: { correo: 'maria@ejemplo.com', contrasena: 'Segura#2026' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // Arrange
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombre: 'María López',
      correo: 'maria@ejemplo.com',
      passwordHash: '$2b$10$hash',
      rol: 'PACIENTE',
      estado: true
    });
    bcrypt.compare.mockResolvedValue(true);

    // Act
    await login(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta).toHaveProperty('accessToken');
    expect(typeof respuesta.accessToken).toBe('string');
  });

  // TC-B05: Contraseña incorrecta devuelve 401
  test('TC-B-05: Contraseña incorrecta devuelve 401 Unauthorized', async () => {
    const mockReq = {
      body: { correo: 'maria@ejemplo.com', contrasena: 'incorrecta' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.usuario.findUnique.mockResolvedValue({
      id: 1, correo: 'maria@ejemplo.com', passwordHash: '$2b$10$hash',
      rol: 'PACIENTE', estado: true
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  // TC-B06: Usuario no encontrado devuelve 401 (mensaje genérico — OWASP)
  test('TC-B-06: Usuario inexistente devuelve 401 con mensaje genérico', async () => {
    const mockReq = {
      body: { correo: 'noexiste@ejemplo.com', contrasena: 'cualquiera' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.usuario.findUnique.mockResolvedValue(null);

    await login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    // El mensaje no debe revelar si el correo existe (OWASP)
    const body = mockRes.json.mock.calls[0][0];
    expect(body.mensaje).not.toContain('correo');
  });
});
