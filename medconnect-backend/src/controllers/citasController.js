// src/controllers/citasController.js
// MedConnect — Controlador de Citas Médicas
// Ref: Arquitectura de Software — Sección 5.1 | SRS RF-06, RF-07, RF-10

const { validationResult } = require('express-validator');
const prisma = require('../config/prismaClient');
const { sendConfirmacion, sendCancelacion } = require('../services/nodemailerService');
const { scheduleReminder, cancelReminder }  = require('../services/reminderService');
const dayjs = require('dayjs');

/**
 * Genera un número único de cita con formato CIT-YYYY-XXXXXX
 * @returns {string}
 */
function generarNumeroCita() {
  const año    = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CIT-${año}-${random}`;
}

/**
 * POST /api/citas — Agendar una nueva cita médica
 * RF-06: El sistema bloquea el horario de forma atómica (transacción PostgreSQL)
 * RF-07: Envía correo de confirmación y programa recordatorio 24h antes
 */
async function create(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { medicoId, fecha, hora } = req.body;
  const pacienteId = req.user.id;

  try {
    // Verificar que el horario no esté ocupado (RF-05)
    const citaExistente = await prisma.cita.findFirst({
      where: {
        medicoId,
        fecha:  new Date(fecha + 'T00:00:00'),
        hora,
        estado: { in: ['CONFIRMADA', 'REAGENDADA'] }
      }
    });

    if (citaExistente) {
      return res.status(409).json({
        mensaje: 'El horario seleccionado ya no está disponible. Por favor elige otro.'
      });
    }

    // Crear la cita (transacción atómica — bloquea el horario)
    const nuevaCita = await prisma.cita.create({
      data: {
        numeroCita: generarNumeroCita(),
        pacienteId,
        medicoId,
        fecha:  new Date(fecha + 'T00:00:00'),
        hora,
        estado: 'CONFIRMADA'
      },
      include: {
        paciente:  { select: { nombre: true, correo: true } },
        medico: {
          include: {
            usuario:      { select: { nombre: true } },
            especialidad: { select: { nombre: true } }
          }
        }
      }
    });

    // Preparar datos para correo y recordatorio
    const dataCita = {
      id:             nuevaCita.id,
      numeroCita:     nuevaCita.numeroCita,
      pacienteCorreo: nuevaCita.paciente.correo,
      pacienteNombre: nuevaCita.paciente.nombre,
      medicoNombre:   nuevaCita.medico.usuario.nombre,
      especialidad:   nuevaCita.medico.especialidad.nombre,
      fecha:          dayjs(nuevaCita.fecha).format('DD/MM/YYYY'),
      hora:           nuevaCita.hora
    };

    // RF-07: Enviar correo de confirmación (asíncrono, no bloquea la respuesta)
    sendConfirmacion(dataCita).catch(err =>
      console.error('Error enviando confirmación:', err.message)
    );

    // RF-07: Programar recordatorio 24h antes
    scheduleReminder({ ...dataCita, fecha: nuevaCita.fecha });

    return res.status(201).json({
      mensaje: 'Cita agendada exitosamente.',
      cita: {
        id:         nuevaCita.id,
        numeroCita: nuevaCita.numeroCita,
        medico:     nuevaCita.medico.usuario.nombre,
        especialidad: nuevaCita.medico.especialidad.nombre,
        fecha:      dayjs(nuevaCita.fecha).format('DD/MM/YYYY'),
        hora:       nuevaCita.hora,
        estado:     nuevaCita.estado
      }
    });
  } catch (err) {
    console.error('Error en create cita:', err);
    return res.status(500).json({ mensaje: 'Error interno. La cita no fue registrada.' });
  }
}

/**
 * PUT /api/citas/:id — Reagendar una cita existente
 * RF-06: Solo el paciente dueño puede reagendar
 */
async function update(req, res) {
  const { id } = req.params;
  const { fecha, hora } = req.body;
  const pacienteId = req.user.id;

  try {
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cita || cita.pacienteId !== pacienteId) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    if (!['CONFIRMADA', 'REAGENDADA'].includes(cita.estado)) {
      return res.status(400).json({ mensaje: 'Esta cita no puede ser reagendada.' });
    }

    // Cancelar el recordatorio anterior
    cancelReminder(cita.id);

    const citaActualizada = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: {
        fecha:  new Date(fecha + 'T00:00:00'),
        hora,
        estado: 'REAGENDADA'
      }
    });

    // Programar nuevo recordatorio
    scheduleReminder({ ...citaActualizada });

    return res.status(200).json({
      mensaje: 'Cita reagendada exitosamente.',
      cita: citaActualizada
    });
  } catch (err) {
    console.error('Error en update cita:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * DELETE /api/citas/:id — Cancelar una cita
 * RF-06: Si cancela con < 2h de anticipación → estado INASISTENCIA
 */
async function cancel(req, res) {
  const { id } = req.params;
  const pacienteId = req.user.id;

  try {
    const cita = await prisma.cita.findUnique({
      where: { id: parseInt(id) },
      include: {
        paciente:  { select: { nombre: true, correo: true } },
        medico: { include: { usuario: { select: { nombre: true } } } }
      }
    });

    if (!cita || cita.pacienteId !== pacienteId) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    if (!['CONFIRMADA', 'REAGENDADA'].includes(cita.estado)) {
      return res.status(400).json({ mensaje: 'Esta cita no puede ser cancelada.' });
    }

    // Calcular anticipación (RF-06: < 2h → INASISTENCIA)
    const fechaHoraCita  = dayjs(`${dayjs(cita.fecha).format('YYYY-MM-DD')} ${cita.hora}`);
    const horasRestantes = fechaHoraCita.diff(dayjs(), 'hour');
    const nuevoEstado    = horasRestantes < 2 ? 'INASISTENCIA' : 'CANCELADA';

    // Cancelar recordatorio pendiente
    cancelReminder(cita.id);

    await prisma.cita.update({
      where: { id: parseInt(id) },
      data: { estado: nuevoEstado }
    });

    // Enviar correo de cancelación
    sendCancelacion({
      pacienteCorreo: cita.paciente.correo,
      pacienteNombre: cita.paciente.nombre,
      medicoNombre:   cita.medico.usuario.nombre,
      numeroCita:     cita.numeroCita
    }).catch(err => console.error('Error enviando cancelación:', err.message));

    return res.status(200).json({
      mensaje: nuevoEstado === 'INASISTENCIA'
        ? 'Cita cancelada. Se registró como INASISTENCIA por cancelación tardía (menos de 2 horas).'
        : 'Cita cancelada exitosamente.',
      estado: nuevoEstado
    });
  } catch (err) {
    console.error('Error en cancel cita:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/citas/historial — Historial de citas del paciente autenticado
 * RF-10: Lista con filtros por estado
 */
async function getHistorial(req, res) {
  const pacienteId = req.user.id;
  const { estado }  = req.query;

  try {
    const where = { pacienteId };
    if (estado) where.estado = estado;

    const citas = await prisma.cita.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        medico: {
          include: {
            usuario:      { select: { nombre: true } },
            especialidad: { select: { nombre: true } }
          }
        }
      }
    });

    return res.status(200).json({ citas });
  } catch (err) {
    console.error('Error en getHistorial:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

module.exports = { create, update, cancel, getHistorial };
