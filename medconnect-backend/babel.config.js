// babel.config.js
// Ref: Laboratorio de Pruebas Unitarias — Sección 4.3
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '20' }, // Node.js 20.x LTS (SRS v1.0)
        modules: 'commonjs'      // Compatibilidad con Jest require()
      }
    ]
  ]
};
