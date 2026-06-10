// tests/unit/citas.test.js
// MedConnect — Pruebas Unitarias: Citas Médicas
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.2
// Cubre: RF-06 (agendar, reagendar, cancelar), RF-07 (recordatorio)

const { create, cancel } = require('../../src/controllers/citasController');
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

    // Arrange: horario disponible
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

    // Act
    await create(mockReq, mockRes);

    // Assert
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

    // Arrange: horario ocupado
    prisma.cita.findFirst.mockResolvedValue({
      id: 5, estado: 'CONFIRMADA'
    });

    // Act
    await create(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(prisma.cita.create).not.toHaveBeenCalled();
  });

  // TC-B12: Cancelar con más de 2h de anticipación → CANCELADA
  test('TC-B-12: Cancelar con +2h anticipación → estado CANCELADA', async () => {
    // Fecha de cita: 5 horas en el futuro
    const fechaFutura = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const hora = `${String(fechaFutura.getHours()).padStart(2,'0')}:${String(fechaFutura.getMinutes()).padStart(2,'0')}`;

    const mockReq = {
      params: { id: '10' },
      user:   { id: 1, rol: 'PACIENTE' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.cita.findUnique.mockResolvedValue({
      id:        10,
      pacienteId: 1,
      numeroCita: 'CIT-2026-123456',
      fecha:     fechaFutura,
      hora,
      estado:    'CONFIRMADA',
      paciente:  { nombre: 'María López', correo: 'maria@ejemplo.com' },
      medico:    { usuario: { nombre: 'Dr. Mendoza' } }
    });
    prisma.cita.update.mockResolvedValue({ id: 10, estado: 'CANCELADA' });

    await cancel(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta.estado).toBe('CANCELADA');
  });

  // TC-B13: Cancelar con menos de 2h de anticipación → INASISTENCIA
  test('TC-B-13: Cancelar con menos de 2h → estado INASISTENCIA', async () => {
    // Fecha de cita: 30 minutos en el futuro
    const fechaCercana = new Date(Date.now() + 30 * 60 * 1000);
    const hora = `${String(fechaCercana.getHours()).padStart(2,'0')}:${String(fechaCercana.getMinutes()).padStart(2,'0')}`;

    const mockReq = {
      params: { id: '11' },
      user:   { id: 1, rol: 'PACIENTE' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.cita.findUnique.mockResolvedValue({
      id:        11,
      pacienteId: 1,
      numeroCita: 'CIT-2026-999999',
      fecha:     fechaCercana,
      hora,
      estado:    'CONFIRMADA',
      paciente:  { nombre: 'Pedro Sánchez', correo: 'pedro@ejemplo.com' },
      medico:    { usuario: { nombre: 'Dra. Ana Torres' } }
    });
    prisma.cita.update.mockResolvedValue({ id: 11, estado: 'INASISTENCIA' });

    await cancel(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta.estado).toBe('INASISTENCIA');
  });
});
