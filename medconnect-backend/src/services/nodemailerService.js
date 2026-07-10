// src/services/nodemailerService.js
// MedConnect — Servicio de Correo Electrónico (Nodemailer)
// SCRUM-43 | HU-05 | Subtarea: Verificar nodemailerService.js y envío SMTP
// Ref: Arquitectura de Software — Sección 5.2 | SRS RF-07, RNF-08
// Autor: Cristian Bayas | Sprint 2 — EP-03 Agendamiento de Citas
// Protocolo: SMTP sobre TLS — puerto 587

const nodemailer = require('nodemailer');

/**
 * Crea el transporte SMTP configurado con las variables de entorno.
 * Proveedor: Gmail SMTP / SendGrid (a definir en implementación — SRS sección 4.1)
 */
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Envía correo de confirmación al paciente y al médico al registrar una cita.
 * RF-07 — Se ejecuta inmediatamente después de confirmar la cita.
 * @param {{ pacienteCorreo: string, pacienteNombre: string, medicoNombre: string, especialidad: string, fecha: string, hora: string, numeroCita: string }} cita
 */
async function sendConfirmacion(cita) {
  const transporter = createTransport();

  const mailOptions = {
    from: `"MedConnect" <${process.env.SMTP_USER}>`,
    to: cita.pacienteCorreo,
    subject: `Confirmación de cita — ${cita.numeroCita}`,
    html: `
      <h2>✅ Tu cita médica ha sido confirmada</h2>
      <p>Hola <strong>${cita.pacienteNombre}</strong>,</p>
      <p>Tu cita ha sido registrada exitosamente:</p>
      <table>
        <tr><td><strong>Número de cita:</strong></td><td>${cita.numeroCita}</td></tr>
        <tr><td><strong>Médico:</strong></td><td>${cita.medicoNombre}</td></tr>
        <tr><td><strong>Especialidad:</strong></td><td>${cita.especialidad}</td></tr>
        <tr><td><strong>Fecha:</strong></td><td>${cita.fecha}</td></tr>
        <tr><td><strong>Hora:</strong></td><td>${cita.hora}</td></tr>
      </table>
      <p>Recuerda que puedes reagendar o cancelar con al menos 2 horas de anticipación desde la plataforma.</p>
      <p><em>MedConnect — Conectando pacientes con su salud, de manera fácil y segura</em></p>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Envía recordatorio automático 24 horas antes de la cita.
 * RF-07 — Ejecutado por ReminderService usando Day.js (America/Guayaquil UTC-5)
 * @param {{ pacienteCorreo: string, pacienteNombre: string, medicoNombre: string, especialidad: string, fecha: string, hora: string }} cita
 */
async function enviarRecordatorio(cita) {
  const transporter = createTransport();

  const mailOptions = {
    from: `"MedConnect" <${process.env.SMTP_USER}>`,
    to: cita.pacienteCorreo,
    subject: `Recordatorio — Tu cita es mañana con ${cita.medicoNombre}`,
    html: `
      <h2>⏰ Recordatorio de cita médica</h2>
      <p>Hola <strong>${cita.pacienteNombre}</strong>,</p>
      <p>Te recordamos que tienes una cita programada para <strong>mañana</strong>:</p>
      <table>
        <tr><td><strong>Médico:</strong></td><td>${cita.medicoNombre}</td></tr>
        <tr><td><strong>Especialidad:</strong></td><td>${cita.especialidad}</td></tr>
        <tr><td><strong>Fecha:</strong></td><td>${cita.fecha}</td></tr>
        <tr><td><strong>Hora:</strong></td><td>${cita.hora}</td></tr>
      </table>
      <p>Si necesitas cancelar, hazlo con al menos 2 horas de anticipación para evitar un registro de inasistencia.</p>
      <p><em>MedConnect — Conectando pacientes con su salud, de manera fácil y segura</em></p>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Envía confirmación de cancelación al paciente.
 * RF-06 — Ejecutado al cancelar una cita.
 * @param {{ pacienteCorreo: string, pacienteNombre: string, medicoNombre: string, numeroCita: string }} cita
 */
async function sendCancelacion(cita) {
  const transporter = createTransport();

  const mailOptions = {
    from: `"MedConnect" <${process.env.SMTP_USER}>`,
    to: cita.pacienteCorreo,
    subject: `Cita cancelada — ${cita.numeroCita}`,
    html: `
      <h2>❌ Tu cita ha sido cancelada</h2>
      <p>Hola <strong>${cita.pacienteNombre}</strong>,</p>
      <p>Tu cita con <strong>${cita.medicoNombre}</strong> (N° ${cita.numeroCita}) ha sido cancelada.</p>
      <p>Puedes agendar una nueva cita en cualquier momento desde la plataforma MedConnect.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmacion, enviarRecordatorio, sendCancelacion };
