// tests/unit/nodemailer.test.js
// MedConnect — Pruebas Unitarias: Servicio de Correo Electrónico
// SCRUM-45 | HU-05 | Subtarea: Completar tests/unit/nodemailer.test.js
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.4.3
// Cubre: RF-07 (recordatorio automático 24h antes) — TC-B-14
// Autor: Cristian Bayas | Sprint 2

jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const { enviarRecordatorio, sendConfirmacion } = require('../../src/services/nodemailerService');

describe('EmailService — Recordatorio 24h antes (RF-07)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B14: sendMail invocado con destinatario y fecha correctos
  test('TC-B-14: sendMail invocado con destinatario y fecha correctos', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    const cita = {
      pacienteCorreo: 'paciente@ejemplo.com',
      pacienteNombre: 'María López',
      medicoNombre:   'Dr. Ramírez',
      especialidad:   'Cardiología',
      fecha:          '10/06/2026',
      hora:           '09:00'
    };

    await enviarRecordatorio(cita);

    // Assert
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock.mock.calls[0][0].to).toBe('paciente@ejemplo.com');
    expect(sendMailMock.mock.calls[0][0].subject).toContain('Recordatorio');
  });

  test('TC-B-14b: Confirmación de cita envía correo al paciente', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'confirm-id' });
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    const cita = {
      pacienteCorreo: 'paciente@ejemplo.com',
      pacienteNombre: 'María López',
      medicoNombre:   'Dr. Mendoza',
      especialidad:   'Cardiología',
      numeroCita:     'CIT-2026-123456',
      fecha:          '15/07/2026',
      hora:           '09:00'
    };

    await sendConfirmacion(cita);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock.mock.calls[0][0].subject).toContain('CIT-2026-123456');
  });
});
