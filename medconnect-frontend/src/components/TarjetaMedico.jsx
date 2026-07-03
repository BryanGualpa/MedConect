// src/components/TarjetaMedico.jsx
// MedConnect — Tarjeta de médico en catálogo de especialidades
// SCRUM-35 | HU-03 | RF-04: Muestra perfil resumido y enlace a disponibilidad
// Autor: Cristian Bayas | Sprint 2

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TarjetaMedico({ medico }) {
  const navigate = useNavigate();

  const inicial = medico.nombre
    ? medico.nombre.trim().charAt(0).toUpperCase()
    : '👨‍⚕️';

  return (
    <div className="mc-card mc-card-hover h-100 d-flex flex-column text-center">
      <div className="mc-card-body d-flex flex-column">
        <div className="mc-avatar">{inicial}</div>

        <h3 className="h6 fw-bold mb-1 mc-text-heading">{medico.nombre}</h3>
        <p className="mc-text-primary small fw-semibold mb-2">{medico.titulo}</p>

        {medico.especialidad && (
          <span className="mc-badge mc-badge-tag mb-3">{medico.especialidad.nombre}</span>
        )}

        <p className="mc-text-muted small mb-4 text-start flex-grow-1" style={{ minHeight: '56px' }}>
          {medico.descripcion && medico.descripcion.length > 120
            ? `${medico.descripcion.substring(0, 120)}...`
            : medico.descripcion || 'Sin descripción disponible.'}
        </p>

        <button
          type="button"
          className="mc-btn mc-btn-primary mc-btn-block mt-auto"
          onClick={() => navigate(`/medicos/${medico.id}/agendar`)}
        >
          Ver disponibilidad
        </button>
      </div>
    </div>
  );
}
