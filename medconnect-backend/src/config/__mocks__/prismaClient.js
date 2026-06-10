// src/config/__mocks__/prismaClient.js
// Mock manual de Prisma para pruebas unitarias

const prismaMock = {
  usuario: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    delete:      jest.fn(),
  },
  medico: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    delete:      jest.fn(),
  },
  especialidad: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
  },
  cita: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    delete:      jest.fn(),
    count:       jest.fn(),
  },
  disponibilidad: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    delete:      jest.fn(),
  },
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

module.exports = prismaMock;
