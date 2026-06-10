// tests/unit/especialidades.test.js
// MedConnect — Pruebas Unitarias: Especialidades
// Cubre: RF-03 (listado y búsqueda de especialidades)

const { getAll } = require('../../src/controllers/especialidadesController');
const prisma = require('../../src/config/prismaClient');

jest.mock('../../src/config/prismaClient');

describe('EspecialidadesController — Catálogo (RF-03)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-B07: Listar especialidades disponibles → 200 con array
  test('TC-B-07: Listar especialidades devuelve 200 con 8 especialidades', async () => {
    const mockReq = { query: {} };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    // Las 8 especialidades del catálogo (SRS sección 3.1)
    prisma.especialidad.findMany.mockResolvedValue([
      { id: 1, nombre: 'Medicina General', descripcion: '', imagenUrl: '', _count: { medicos: 2 } },
      { id: 2, nombre: 'Cardiología',       descripcion: '', imagenUrl: '', _count: { medicos: 3 } },
      { id: 3, nombre: 'Pediatría',         descripcion: '', imagenUrl: '', _count: { medicos: 2 } },
      { id: 4, nombre: 'Ortopedia',         descripcion: '', imagenUrl: '', _count: { medicos: 1 } },
      { id: 5, nombre: 'Neurología',        descripcion: '', imagenUrl: '', _count: { medicos: 2 } },
      { id: 6, nombre: 'Dermatología',      descripcion: '', imagenUrl: '', _count: { medicos: 1 } },
      { id: 7, nombre: 'Ginecología',       descripcion: '', imagenUrl: '', _count: { medicos: 2 } },
      { id: 8, nombre: 'Oftalmología',      descripcion: '', imagenUrl: '', _count: { medicos: 1 } }
    ]);

    await getAll(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const respuesta = mockRes.json.mock.calls[0][0];
    expect(respuesta.especialidades).toHaveLength(8);
  });

  test('TC-B-07b: Búsqueda por nombre filtra correctamente', async () => {
    const mockReq = { query: { q: 'cardio' } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };

    prisma.especialidad.findMany.mockResolvedValue([
      { id: 2, nombre: 'Cardiología', descripcion: '', imagenUrl: '', _count: { medicos: 3 } }
    ]);

    await getAll(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json.mock.calls[0][0].especialidades).toHaveLength(1);
  });
});
