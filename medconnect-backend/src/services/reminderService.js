// src/services/reminderService.js
// MedConnect — Servicio de Recordatorios Automáticos
// SCRUM-44 | HU-05 | Subtarea: Configurar zona America/Guayaquil (UTC-5)
// Ref: Arquitectura de Software — Sección 5.2 | SRS RF-07
// Zona horaria: America/Guayaquil (UTC-5) — Ecuador
// Autor: Cristian Bayas | Sprint 2 — EP-03 Agendamiento de Citas

const dayjs  = require('dayjs');
const utc    = require('dayjs/plugin/utc');
const tz     = require('dayjs/plugin/timezone');
const { enviarRecordatorio } = require('./nodemailerService');

dayjs.extend(utc);
dayjs.extend(tz);

// Mapa en memoria de jobs pendientes: citaId -> timeoutId
const pendingReminders = new Map();

/**
 * Programa el envío de un recordatorio 24 horas antes de la cita.
 * RF-07 — Calcula dayjs(cita.fecha).subtract(24,'hour') en America/Guayaquil
 * @param {{ id: number, pacienteCorreo: string, pacienteNombre: string, medicoNombre: string, especialidad: string, fecha: Date, hora: string }} cita
 */
function scheduleReminder(cita) {
  const fechaHoraCita = dayjs.tz(
    `${dayjs(cita.fecha).format('YYYY-MM-DD')} ${cita.hora}`,
    'America/Guayaquil'
  );

  const tiempoRecordatorio = fechaHoraCita.subtract(24, 'hour');
  const ahora = dayjs().tz('America/Guayaquil');
  const msHastaRecordatorio = tiempoRecordatorio.diff(ahora);

  if (msHastaRecordatorio <= 0) {
    console.log(`⚠️  Cita ${cita.id}: recordatorio omitido (cita en menos de 24h)`);
    return;
  }

  const timeoutId = setTimeout(async () => {
    try {
      await enviarRecordatorio(cita);
      console.log(`📧 Recordatorio enviado para cita ${cita.id}`);
      pendingReminders.delete(cita.id);
    } catch (err) {
      console.error(`❌ Error enviando recordatorio cita ${cita.id}:`, err.message);
    }
  }, msHastaRecordatorio);

  pendingReminders.set(cita.id, timeoutId);
  console.log(`⏰ Recordatorio programado para cita ${cita.id} — ${tiempoRecordatorio.format()}`);
}

/**
 * Cancela el recordatorio pendiente si la cita es cancelada antes de que se envíe.
 * RF-07 — Cancela el job pendiente para no enviar un recordatorio de una cita cancelada.
 * @param {number} citaId
 */
function cancelReminder(citaId) {
  if (pendingReminders.has(citaId)) {
    clearTimeout(pendingReminders.get(citaId));
    pendingReminders.delete(citaId);
    console.log(`🚫 Recordatorio cancelado para cita ${citaId}`);
  }
}

module.exports = { scheduleReminder, cancelReminder };
