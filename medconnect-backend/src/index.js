// src/index.js
// MedConnect — Punto de entrada del servidor
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ MedConnect Backend corriendo en http://localhost:${PORT}`);
  console.log(`📄 Swagger UI disponible en http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
