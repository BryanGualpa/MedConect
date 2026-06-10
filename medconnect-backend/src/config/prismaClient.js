// src/config/prismaClient.js
// MedConnect — Cliente Prisma ORM con soporte para entorno de pruebas

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'test') {
  // En pruebas: exportar objeto con jest.fn() para todos los modelos
  prisma = {
    usuario: {
      findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(),
    },
    medico: {
      findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(),
    },
    especialidad: {
      findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(),
    },
    cita: {
      findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn(),
    },
    disponibilidad: {
      findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
      create: jest.fn(), update: jest.fn(), delete: jest.fn(),
    },
    $disconnect:  jest.fn(),
    $transaction: jest.fn(),
  };
} else {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
}

module.exports = prisma;
