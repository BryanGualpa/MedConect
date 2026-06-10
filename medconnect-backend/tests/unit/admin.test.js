// tests/unit/admin.test.js
// MedConnect — Pruebas Unitarias: Panel Administrativo
// Cubre: RF-09 (gestión de médicos), RNF-08 (RBAC)

const { createMedico } = require('../../src/controllers/adminController');
const prisma = require('../../src/config/prismaClient');

jest.mock('../../src/config/prismaClient');
jest.mock('../../src/services/authService', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword')
}));

describe('AdminController — Gestión de Médicos (RF-09)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B15: Crear médico con rol admin → 201
  test('TC-B-15: Crear médico desde panel admin devuelve 201', async () => {
    const mockReq = {
      body: {
        nombre:        'Dr. Carlos Mendoza',
        cedula:        '1712345678',
        correo:        'cmendoza@medconnect.ec',
        contrasena:    'Segura#2026',
        telefono:      '0987654321',
        titulo:        'Médico Cardiólogo — PUCE',
        descripcion:   'Especialista en cardiología con 10 años de experiencia',
        especialidadId: 2
      },
      user: { id: 10, rol: 'ADMIN' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.usuario.create.mockResolvedValue({
      id: 5, nombre: 'Dr. Carlos Mendoza', correo: 'cmendoza@medconnect.ec', rol: 'MEDICO'
    });
    prisma.medico.create.mockResolvedValue({ id: 3, usuarioId: 5, especialidadId: 2 });

    await createMedico(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(prisma.medico.create).toHaveBeenCalledTimes(1);
  });

  // TC-B16: RBAC — rol PACIENTE no puede acceder al panel admin
  test('TC-B-16: roleMiddleware bloquea acceso con rol PACIENTE → 403', () => {
    const roleMiddleware = require('../../src/middleware/roleMiddleware');
    const middleware = roleMiddleware(['ADMIN']);

    const mockReq  = { user: { id: 1, rol: 'PACIENTE' } };
    const mockRes  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const mockNext = jest.fn();

    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
