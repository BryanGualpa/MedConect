// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la siembra de la base de datos (Seed)...');

  // 1. Limpiar datos existentes por seguridad (orden inverso de dependencias)
  await prisma.cita.deleteMany();
  await prisma.horarioMedico.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.especialidad.deleteMany();

  console.log('Base de datos limpiada.');

  // 2. Crear Especialidades
  const especialidadesData = [
    { nombre: 'Medicina General', descripcion: 'Atención primaria y cuidado preventivo.', imagenUrl: '/img/general.png' },
    { nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón.', imagenUrl: '/img/cardio.png' },
    { nombre: 'Pediatría', descripcion: 'Cuidado de la salud de bebés, niños y adolescentes.', imagenUrl: '/img/pediatria.png' },
    { nombre: 'Ortopedia', descripcion: 'Tratamiento del sistema músculo-esquelético.', imagenUrl: '/img/ortopedia.png' },
    { nombre: 'Neurología', descripcion: 'Diagnóstico de trastornos del sistema nervioso.', imagenUrl: '/img/neuro.png' },
    { nombre: 'Dermatología', descripcion: 'Enfermedades y cuidado preventivo de la piel.', imagenUrl: '/img/dermato.png' },
    { nombre: 'Ginecología', descripcion: 'Salud del sistema reproductor femenino y obstetricia.', imagenUrl: '/img/gineco.png' },
    { nombre: 'Oftalmología', descripcion: 'Cuidado de la salud visual y tratamiento ocular.', imagenUrl: '/img/oftalmo.png' }
  ];

  const especialidadesCreadas = [];
  for (const esp of especialidadesData) {
    const e = await prisma.especialidad.create({ data: esp });
    especialidadesCreadas.push(e);
  }
  console.log(`Se crearon ${especialidadesCreadas.length} especialidades.`);

  // 3. Crear Administrador
  const adminPasswordHash = await bcrypt.hash('Admin#2026', 10);
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador MedConnect',
      cedula: '1799999999',
      correo: 'admin@medconnect.com',
      passwordHash: adminPasswordHash,
      telefono: '0999999999',
      rol: 'ADMIN'
    }
  });
  console.log(`Administrador creado: ${admin.correo} (Clave: Admin#2026)`);

  // 4. Crear Médico
  const medicoPasswordHash = await bcrypt.hash('Medico#2026', 10);
  const usuarioMedico = await prisma.usuario.create({
    data: {
      nombre: 'Dr. Carlos Mendoza',
      cedula: '1788888888',
      correo: 'medico@medconnect.com',
      passwordHash: medicoPasswordHash,
      telefono: '0988888888',
      rol: 'MEDICO'
    }
  });

  const especialidadCardio = especialidadesCreadas.find(e => e.nombre === 'Cardiología');

  const medicoProfile = await prisma.medico.create({
    data: {
      usuarioId: usuarioMedico.id,
      especialidadId: especialidadCardio.id,
      titulo: 'Cardiólogo - PUCE',
      descripcion: 'Especialista en cardiología clínica y ecocardiografía con más de 10 años de experiencia.'
    }
  });
  console.log(`Médico creado: ${usuarioMedico.correo} (Clave: Medico#2026)`);

  // 5. Crear horarios de disponibilidad del médico
  await prisma.horarioMedico.createMany({
    data: [
      { medicoId: medicoProfile.id, diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' },
      { medicoId: medicoProfile.id, diaSemana: 'MARTES', horaInicio: '09:00', horaFin: '13:00' },
      { medicoId: medicoProfile.id, diaSemana: 'MIERCOLES', horaInicio: '08:00', horaFin: '12:00' },
      { medicoId: medicoProfile.id, diaSemana: 'JUEVES', horaInicio: '09:00', horaFin: '13:00' },
      { medicoId: medicoProfile.id, diaSemana: 'VIERNES', horaInicio: '08:00', horaFin: '12:00' }
    ]
  });
  console.log('Horarios de disponibilidad semanales creados para el médico.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
