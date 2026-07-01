// src/controllers/medicosController.js
// MedConnect — Controlador de Médicos
// SCRUM-32 | HU-03 | Subtarea: Verificar medicosController.js (perfil y disponibilidad)
// Ref: Arquitectura de Software — Sección 5.1 | SRS RF-04, RF-05, RF-08
// Autor: Cristian Bayas | Sprint 2 — EP-02 Especialidades y Médicos

const prisma = require('../config/prismaClient');
const { getHorariosLibres } = require('../services/disponibilidadService');

/**
 * GET /api/medicos/:id — Perfil del médico con especialidad y disponibilidad
 * RF-04: Incluye nombre, título, especialidad y horarios disponibles
 */
async function getById(req, res) {
  const { id } = req.params;

  try {
    const medico = await prisma.medico.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario:      { select: { nombre: true, correo: true } },
        especialidad: { select: { nombre: true, descripcion: true, imagenUrl: true } },
        horarios:     { where: { estado: true }, orderBy: { diaSemana: 'asc' } }
      }
    });

    if (!medico || !medico.estado) {
      return res.status(404).json({ mensaje: 'Médico no encontrado.' });
    }

    return res.status(200).json({
      medico: {
        id:          medico.id,
        nombre:      medico.usuario.nombre,
        titulo:      medico.titulo,
        descripcion: medico.descripcion,
        especialidad: medico.especialidad,
        horarios:    medico.horarios
      }
    });
  } catch (err) {
    console.error('Error en getById medico:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/medicos/:id/disponibilidad?fecha=YYYY-MM-DD
 * RF-05: Slots disponibles y bloqueados del médico para una fecha
 * Latencia máxima: 1 segundo (SRS RNF-01)
 */
async function getDisponibilidad(req, res) {
  const { id }   = req.params;
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({ mensaje: 'El parámetro fecha es requerido (YYYY-MM-DD).' });
  }

  try {
    const slots = await getHorariosLibres(parseInt(id), fecha);
    return res.status(200).json({ fecha, medicoId: parseInt(id), slots });
  } catch (err) {
    console.error('Error en getDisponibilidad:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/medicos/:id/agenda?semana=YYYY-MM-DD
 * RF-08: Vista semanal de citas confirmadas del médico
 */
async function getAgendaSemanal(req, res) {
  const { id }    = req.params;
  const { semana } = req.query;

  const inicioSemana = semana ? new Date(semana + 'T00:00:00') : new Date();

  try {
    const citas = await prisma.cita.findMany({
      where: {
        medicoId: parseInt(id),
        fecha: {
          gte: inicioSemana,
          lte: new Date(inicioSemana.getTime() + 6 * 24 * 60 * 60 * 1000)
        },
        estado: { in: ['CONFIRMADA', 'REAGENDADA'] }
      },
      include: {
        paciente: { select: { nombre: true } }
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }]
    });

    return res.status(200).json({ citas });
  } catch (err) {
    console.error('Error en getAgendaSemanal:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

module.exports = { getById, getDisponibilidad, getAgendaSemanal };
