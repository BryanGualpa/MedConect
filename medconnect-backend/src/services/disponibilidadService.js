// src/services/disponibilidadService.js
// MedConnect — Servicio de Disponibilidad Horaria en Tiempo Real
// SCRUM-33 | HU-03 | Subtarea: Verificar disponibilidadService.js (slots en tiempo real)
// Ref: Arquitectura de Software — Sección 5.2 | SRS RF-05
// Autor: Cristian Bayas | Sprint 2 — EP-02 Especialidades y Médicos

const prisma = require('../config/prismaClient');
const dayjs  = require('dayjs');

/**
 * Obtiene los horarios libres de un médico para una fecha específica.
 * Cruza los horarios semanales definidos con las citas ya reservadas.
 * RF-05 — Las consultas de disponibilidad deben reflejarse con latencia ≤ 1 segundo.
 *
 * @param {number} medicoId
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Array<{ hora: string, disponible: boolean }>>}
 */
async function getHorariosLibres(medicoId, fecha) {
  const diaSemanaMap = {
    0: 'DOMINGO',
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIERCOLES',
    4: 'JUEVES',
    5: 'VIERNES',
    6: 'SABADO'
  };

  const fechaDate = new Date(fecha + 'T12:00:00');
  const diaSemana = diaSemanaMap[fechaDate.getDay()];

  // Obtener horarios semanales del médico para ese día
  const horarios = await prisma.horarioMedico.findMany({
    where: { medicoId, diaSemana, estado: true }
  });

  if (!horarios.length) return [];

  // Obtener citas ya reservadas en esa fecha (excluir canceladas e inasistencias)
  const citasOcupadas = await prisma.cita.findMany({
    where: {
      medicoId,
      fecha: new Date(fecha + 'T00:00:00'),
      estado: { in: ['CONFIRMADA', 'REAGENDADA'] }
    },
    select: { hora: true }
  });

  const horasOcupadas = new Set(citasOcupadas.map(c => c.hora));

  // Generar slots de 30 minutos dentro de cada franja horaria
  const slots = [];
  for (const horario of horarios) {
    let current = dayjs(`${fecha} ${horario.horaInicio}`, 'YYYY-MM-DD HH:mm');
    const fin   = dayjs(`${fecha} ${horario.horaFin}`,   'YYYY-MM-DD HH:mm');

    while (current.isBefore(fin)) {
      const horaStr = current.format('HH:mm');
      slots.push({
        hora: horaStr,
        disponible: !horasOcupadas.has(horaStr)
      });
      current = current.add(30, 'minute');
    }
  }

  return slots;
}

module.exports = { getHorariosLibres };
