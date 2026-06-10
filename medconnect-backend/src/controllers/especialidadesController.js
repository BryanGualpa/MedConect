// src/controllers/especialidadesController.js
// MedConnect — Controlador de Especialidades Médicas
// Ref: Arquitectura de Software — Sección 5.1 | SRS RF-03

const prisma = require('../config/prismaClient');

/**
 * GET /api/especialidades — Listado de especialidades con búsqueda en tiempo real
 * RF-03: Muestra el catálogo de especialidades con número de médicos disponibles
 * Catálogo: Medicina General, Cardiología, Pediatría, Ortopedia,
 *           Neurología, Dermatología, Ginecología y Oftalmología
 */
async function getAll(req, res) {
  const { q } = req.query; // Búsqueda por nombre en tiempo real (HU-03)

  try {
    const where = { estado: true };
    if (q) {
      where.nombre = { contains: q, mode: 'insensitive' };
    }

    const especialidades = await prisma.especialidad.findMany({
      where,
      include: {
        _count: { select: { medicos: { where: { estado: true } } } }
      },
      orderBy: { nombre: 'asc' }
    });

    return res.status(200).json({
      especialidades: especialidades.map(e => ({
        id:             e.id,
        nombre:         e.nombre,
        descripcion:    e.descripcion,
        imagenUrl:      e.imagenUrl,
        totalMedicos:   e._count.medicos
      }))
    });
  } catch (err) {
    console.error('Error en getAll especialidades:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

/**
 * GET /api/especialidades/:id — Detalle de una especialidad
 */
async function getById(req, res) {
  const { id } = req.params;

  try {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id: parseInt(id) },
      include: {
        medicos: {
          where: { estado: true },
          include: { usuario: { select: { nombre: true } } }
        }
      }
    });

    if (!especialidad) {
      return res.status(404).json({ mensaje: 'Especialidad no encontrada.' });
    }

    return res.status(200).json({ especialidad });
  } catch (err) {
    console.error('Error en getById especialidad:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
}

module.exports = { getAll, getById };
