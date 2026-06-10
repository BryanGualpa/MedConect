// src/config/swagger.js
// MedConnect — Configuración Swagger / OpenAPI
// Ref: Arquitectura de Software — Sección 2.2.5 y 8.4

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedConnect API',
      version: '1.0.0',
      description: `
**MedConnect** — Sistema Web de Agendamiento de Citas Médicas

"Conectando pacientes con su salud, de manera fácil y segura"

Universidad de las Fuerzas Armadas "ESPE" — Sede Latacunga | Mayo 2026

**Autores:** Christopher Candelejo | Bryan Gualpa | Cristian Bayas

**Docente Tutor:** Ing. Edgar Rubén López Otañez, Mgtr.
      `
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Servidor de desarrollo' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJsdoc(options);
