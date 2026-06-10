// src/controllers/adminController.js
// MedConnect — Controlador del Panel Administrativo
// Ref: Arquitectura de Software — Sección 5.1 | SRS RF-09
// Acceso restringido: solo rol ADMIN (RBAC — RNF-08)

const { validationResult } = require('express-validator');
const prisma = require('../config/prismaClient');
const { hashPassword } = require('../services/authService');

/**
 * GET /api/admin/medicos — Listar todos los médicos
 * RF-09: Panel administrativo para gestión de médicos y horarios
 */
async function getMedicos(req, res) {
  try {
    const medicos = await prisma.medico.findMany({
      include: {
        usuario:      { select: { nombre: true, correo: true, cedula: true, telefono: true } },
        especialidad: { select: { nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ medicos });
  } catch (err) {
    console.error('Error en getMedicos admin:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/admin/medicos — Registrar nuevo médico
 * RF-09: Alta de médico desde el panel administrativo
 */
async function createMedico(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  const { nombre, cedula, correo, contrasena, telefono, titulo, descripcion, especialidadId } = req.body;

  try {
    const passwordHash = await hashPassword(contrasena);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        cedula,
        correo,
        passwordHash,
        telefono,
        rol: 'MEDICO'
      }
    });

    const medico = await prisma.medico.create({
      data: {
        usuarioId:     usuario.id,
        especialidadId: parseInt(especialidadId),
        titulo,
        descripcion
      }
    });

    return res.status(201).json({
      mensaje: 'Médico registrado exitosamente.',
      medico: { id: medico.id, nombre: usuario.nombre }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ mensaje: 'El correo o cédula ya están registrados.' });
    }
    console.error('Error en createMedico:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * PUT /api/admin/medicos/:id — Actualizar datos de un médico
 * RF-09: Edición de médico desde el panel administrativo
 */
async function updateMedico(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, especialidadId, estado } = req.body;

  try {
    const medico = await prisma.medico.update({
      where: { id: parseInt(id) },
      data: {
        titulo,
        descripcion,
        especialidadId: especialidadId ? parseInt(especialidadId) : undefined,
        estado:         estado !== undefined ? estado : undefined
      }
    });

    return res.status(200).json({ mensaje: 'Médico actualizado.', medico });
  } catch (err) {
    console.error('Error en updateMedico:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * POST /api/admin/medicos/:id/horarios — Asignar horarios de disponibilidad
 * RF-09: Gestión de horarios desde el panel administrativo
 */
async function setHorario(req, res) {
  const { id } = req.params;
  const { horarios } = req.body;
  // horarios: [{ diaSemana, horaInicio, horaFin }]

  try {
    // Reemplazar todos los horarios actuales del médico
    await prisma.horarioMedico.deleteMany({ where: { medicoId: parseInt(id) } });

    const nuevosHorarios = await prisma.horarioMedico.createMany({
      data: horarios.map(h => ({
        medicoId:   parseInt(id),
        diaSemana:  h.diaSemana,
        horaInicio: h.horaInicio,
        horaFin:    h.horaFin
      }))
    });

    return res.status(201).json({
      mensaje: 'Horarios actualizados exitosamente.',
      count: nuevosHorarios.count
    });
  } catch (err) {
    console.error('Error en setHorario:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * PATCH /api/admin/medicos/:id/desactivar — Desactivar un médico
 * RF-09: Desactivación de médico desde el panel administrativo
 */
async function deactivate(req, res) {
  const { id } = req.params;

  try {
    await prisma.medico.update({
      where: { id: parseInt(id) },
      data: { estado: false }
    });

    return res.status(200).json({ mensaje: 'Médico desactivado exitosamente.' });
  } catch (err) {
    console.error('Error en deactivate:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

module.exports = { getMedicos, createMedico, updateMedico, setHorario, deactivate };
