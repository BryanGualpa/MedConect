// src/config/prismaClient.js
// MedConnect — Cliente Prisma ORM con soporte para test

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'test') {
  // En tests: exportar mock manual compatible con jest.fn()
  prisma = {
    usuario:        { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    medico:         { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    especialidad:   { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    cita:           { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
    disponibilidad: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $disconnect:    jest.fn(),
    $transaction:   jest.fn(),
  };
} else {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });
}

module.exports = prisma;
