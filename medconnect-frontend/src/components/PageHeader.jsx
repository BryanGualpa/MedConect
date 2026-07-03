// src/components/PageHeader.jsx
// MedConnect — Encabezado reutilizable de páginas
// SCRUM-35 | HU-03 | Componente auxiliar para Especialidades y MisCitas
// Autor: Cristian Bayas | Sprint 2

import React from 'react';

export default function PageHeader({ eyebrow, title, subtitle, align = 'center', children }) {
  const alignClass = align === 'left' ? 'mc-page-header-left' : '';

  return (
    <header className={`mc-page-header ${alignClass}`}>
      {eyebrow && <span className="mc-page-eyebrow">{eyebrow}</span>}
      <h1 className="mc-page-title">{title}</h1>
      {subtitle && <p className="mc-page-subtitle">{subtitle}</p>}
      {children}
    </header>
  );
}
