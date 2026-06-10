// tests/helpers/mockData.js
// MedConnect — Datos de prueba reutilizables
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.1

const mockPaciente = {
  id:           1,
  nombre:       'María López',
  cedula:       '0503456789',
  correo:       'maria@ejemplo.com',
  passwordHash: '$2b$10$hashSeguro',
  telefono:     '0991234567',
  rol:          'PACIENTE',
  estado:       true
};

const mockMedico = {
  id:            1,
  usuarioId:     2,
  especialidadId: 1,
  titulo:        'Médico Cardiólogo — PUCE',
  descripcion:   'Especialista en cardiología',
  estado:        true,
  usuario:       { nombre: 'Dr. Carlos Mendoza', correo: 'cmendoza@medconnect.ec' },
  especialidad:  { nombre: 'Cardiología' }
};

const mockEspecialidades = [
  { id: 1, nombre: 'Medicina General', descripcion: 'Atención médica general', imagenUrl: '/img/general.png', estado: true },
  { id: 2, nombre: 'Cardiología',      descripcion: 'Enfermedades del corazón', imagenUrl: '/img/cardio.png', estado: true },
  { id: 3, nombre: 'Pediatría',        descripcion: 'Atención a niños',         imagenUrl: '/img/pediatria.png', estado: true },
  { id: 4, nombre: 'Ortopedia',        descripcion: 'Sistema musculoesquelético', imagenUrl: '/img/ortopedia.png', estado: true },
  { id: 5, nombre: 'Neurología',       descripcion: 'Sistema nervioso',          imagenUrl: '/img/neurologia.png', estado: true },
  { id: 6, nombre: 'Dermatología',     descripcion: 'Enfermedades de la piel',   imagenUrl: '/img/derma.png', estado: true },
  { id: 7, nombre: 'Ginecología',      descripcion: 'Salud femenina',            imagenUrl: '/img/gineco.png', estado: true },
  { id: 8, nombre: 'Oftalmología',     descripcion: 'Salud visual',              imagenUrl: '/img/oftalmo.png', estado: true }
];

const mockCita = {
  id:         1,
  numeroCita: 'CIT-2026-123456',
  pacienteId: 1,
  medicoId:   1,
  fecha:      new Date('2026-07-15'),
  hora:       '09:00',
  estado:     'CONFIRMADA',
  reminderSent: false
};

module.exports = { mockPaciente, mockMedico, mockEspecialidades, mockCita };
