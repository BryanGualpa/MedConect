// tests/unit/citas.test.js
// MedConnect — Pruebas Unitarias: Citas Médicas (Agendamiento)
// SCRUM-40 | HU-04 | Subtarea: Completar tests/unit/citas.test.js agendamiento
// Cubre: RF-06 (agendar cita) — TC-B-10, TC-B-11
// Autor: Cristian Bayas | Sprint 2

const { create } = require('../../src/controllers/citasController');
const prisma = require('../../src/config/prismaClient');

jest.mock('../../src/config/prismaClient');
jest.mock('../../src/services/nodemailerService', () => ({
  sendConfirmacion: jest.fn().mockResolvedValue({}),
  sendCancelacion:  jest.fn().mockResolvedValue({})
}));
jest.mock('../../src/services/reminderService', () => ({
  scheduleReminder: jest.fn(),
  cancelReminder:   jest.fn()
}));

describe('CitasController — Agendamiento (RF-06)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B10: Agendar cita en horario disponible → 201
  test('TC-B-10: Agendar cita en horario disponible devuelve 201 y número único', async () => {
    const mockReq = {
      body: { medicoId: 1, fecha: '2026-07-15', hora: '09:00' },
      user: { id: 1, rol: 'PACIENTE' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.cita.findFirst.mockResolvedValue(null);
    prisma.cita.create.mockResolvedValue({
      id:         10,
      numeroCita: 'CIT-2026-123456',
      medicoId:   1,
      pacienteId: 1,
      fecha:      new Date('2026-07-15'),
      hora:       '09:00',
      estado:     'CONFIRMADA',
      paciente:   { nombre: 'María López',   correo: 'maria@ejemplo.com' },
      medico: {
        usuario:      { nombre: 'Dr. Carlos Mendoza' },
        especialidad: { nombre: 'Cardiología' }
      }
    });

    await create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta.cita).toHaveProperty('numeroCita');
  });

  // TC-B11: Agendar cita en horario ya reservado → 409
  test('TC-B-11: Horario ya reservado devuelve 409 Conflict', async () => {
    const mockReq = {
      body: { medicoId: 1, fecha: '2026-07-15', hora: '09:00' },
      user: { id: 2, rol: 'PACIENTE' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.cita.findFirst.mockResolvedValue({ id: 5, estado: 'CONFIRMADA' });

    await create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.cita.create).not.toHaveBeenCalled();
  });
});
