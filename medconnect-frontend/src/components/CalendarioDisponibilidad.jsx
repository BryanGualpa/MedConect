// src/components/CalendarioDisponibilidad.jsx
// MedConnect — Calendario de disponibilidad horaria del médico
// SCRUM-37 | HU-03 | RF-05 — Muestra slots disponibles y bloqueados diferenciados
// Autor: Cristian Bayas | Sprint 2

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente reutilizable que renderiza la grilla de horarios de un médico.
 * Los slots bloqueados se muestran deshabilitados; los libres son seleccionables.
 *
 * @param {Array<{ hora: string, disponible: boolean }>} slots - Horarios del día
 * @param {string} horaSeleccionada - Hora actualmente elegida (HH:mm)
 * @param {Function} onSeleccionar - Callback al elegir un slot disponible
 * @param {boolean} loading - Indica si se están cargando los horarios
 */
export default function CalendarioDisponibilidad({
  slots = [],
  horaSeleccionada = '',
  onSeleccionar,
  loading = false
}) {
  if (loading) {
    return <LoadingSpinner label="Consultando horarios..." />;
  }

  if (!slots.length) {
    return (
      <p className="mc-text-muted small mb-0">
        No hay horarios configurados para esta fecha.
      </p>
    );
  }

  const disponibles = slots.filter((s) => s.disponible);
  const bloqueados  = slots.filter((s) => !s.disponible);

  return (
    <div>
      {disponibles.length > 0 && (
        <div className="mb-3">
          <p className="mc-form-label mb-2">Horarios disponibles</p>
          <div className="mc-slots-grid" role="listbox" aria-label="Horarios disponibles">
            {disponibles.map((slot) => (
              <button
                key={slot.hora}
                type="button"
                role="option"
                aria-selected={horaSeleccionada === slot.hora}
                className={`mc-slot-btn ${horaSeleccionada === slot.hora ? 'selected' : ''}`}
                onClick={() => onSeleccionar(slot.hora)}
              >
                {slot.hora}
              </button>
            ))}
          </div>
        </div>
      )}

      {bloqueados.length > 0 && (
        <div>
          <p className="mc-form-label mb-2 mc-text-muted">Horarios ocupados</p>
          <div className="mc-slots-grid">
            {bloqueados.map((slot) => (
              <button
                key={slot.hora}
                type="button"
                className="mc-slot-btn mc-slot-btn-blocked"
                disabled
                title="Horario no disponible"
              >
                {slot.hora}
              </button>
            ))}
          </div>
        </div>
      )}

      {disponibles.length === 0 && bloqueados.length > 0 && (
        <p className="mc-text-muted small mb-0">
          Todos los horarios están ocupados. Prueba otra fecha.
        </p>
      )}
    </div>
  );
}
