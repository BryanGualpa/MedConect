// src/config/prismaClient.js
// MedConnect — Cliente Prisma ORM
// Ref: Arquitectura de Software — Sección 2.2.3

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
});

module.exports = prisma;
