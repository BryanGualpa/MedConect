// src/config/__mocks__/prismaClient.js
// Mock manual de Prisma para pruebas unitarias — evita conexión real a BD
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.1

const prisma = {
  usuario: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    deleteMany: jest.fn()
  },
  medico: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn()
  },
  cita: {
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn()
  },
  especialidad: {
    findMany:   jest.fn(),
    findUnique: jest.fn()
  },
  $disconnect: jest.fn()
};

module.exports = prisma;
