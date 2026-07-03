// src/components/LoadingSpinner.jsx
// MedConnect — Indicador de carga reutilizable
// SCRUM-35 | HU-03 | Componente auxiliar para estados async
// Autor: Cristian Bayas | Sprint 2

import React from 'react';

export default function LoadingSpinner({ label = 'Cargando...' }) {
  return (
    <div className="mc-loading" role="status">
      <div className="mc-spinner" aria-hidden="true" />
      <span className="mc-text-muted small">{label}</span>
    </div>
  );
}
