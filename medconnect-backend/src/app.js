// src/app.js
// MedConnect — Configuración de Express
// Ref: SRS v1.0 sección 5.1 | Arquitectura sección 2.2.2

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');

// Rutas
const authRoutes          = require('./routes/auth.routes');
const especialidadesRoutes = require('./routes/especialidades.routes');
const medicosRoutes       = require('./routes/medicos.routes');
const citasRoutes         = require('./routes/citas.routes');
const adminRoutes         = require('./routes/admin.routes');

// Swagger
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// ─── MIDDLEWARE DE SEGURIDAD ──────────────────────────────────────────────────
// Helmet: encabezados HTTP seguros (RNF-08 / OWASP)
app.use(helmet());

// CORS: solo el origen del frontend está autorizado (RNF-08)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ─── MIDDLEWARE GENERAL ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── DOCUMENTACIÓN SWAGGER ───────────────────────────────────────────────────
// Disponible en http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── RUTAS DE LA API ──────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/medicos',        medicosRoutes);
app.use('/api/citas',          citasRoutes);
app.use('/api/admin',          adminRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor operativo
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    proyecto: 'MedConnect',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─── MANEJO DE ERRORES ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
