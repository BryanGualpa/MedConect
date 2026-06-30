// src/components/CalendarioDisponibilidad.jsx
// MedConnect — Componente Calendario de Disponibilidad
// Ref: Arquitectura de Software — Sección 6.3 | SRS RF-05

import React, { useState, useEffect } from 'react';
import { medicosAPI } from '../services/api';
import dayjs from 'dayjs';

/**
 * Componente que muestra los slots de tiempo disponibles para una fecha seleccionada.
 * @param {{ medicoId: number, fechaSeleccionada: string, onSelectSlot: (fecha: string, hora: string) => void }} props
 */
export default function CalendarioDisponibilidad({ medicoId, fechaSeleccionada, onSelectSlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);

  useEffect(() => {
    if (!medicoId || !fechaSeleccionada) return;

    async function cargarDisponibilidad() {
      setLoading(true);
      setError('');
      setSlotSeleccionado(null);
      try {
        const res = await medicosAPI.getDisponibilidad(medicoId, fechaSeleccionada);
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
        setError('No se pudo cargar la disponibilidad para este día.');
      } finally {
        setLoading(false);
      }
    }

    cargarDisponibilidad();
  }, [medicoId, fechaSeleccionada]);

  function handleSelect(slot) {
    if (!slot.disponible) return;
    setSlotSeleccionado(slot.hora);
    onSelectSlot(fechaSeleccionada, slot.hora);
  }

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    slot: (disponible, seleccionado) => ({
      borderRadius: '8px',
      padding: '0.6rem 0.5rem',
      fontWeight: '600',
      fontSize: '0.9rem',
      textAlign: 'center',
      cursor: disponible ? 'pointer' : 'not-allowed',
      border: '1px solid',
      transition: 'all 0.2s ease',
      backgroundColor: seleccionado
        ? '#3182ce'
        : disponible
        ? '#eaf4ff'
        : '#f7fafc',
      borderColor: seleccionado
        ? '#3182ce'
        : disponible
        ? '#bee3f8'
        : '#e2e8f0',
      color: seleccionado
        ? '#ffffff'
        : disponible
        ? '#2b6cb0'
        : '#a0aec0'
    })
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando disponibilidad...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }

  return (
    <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '16px', background: '#f7fafc' }}>
      <h4 className="h5 fw-bold mb-3">Horarios disponibles</h4>
      
      {slots.length === 0 ? (
        <p className="text-muted small mb-0 text-center py-3">
          El médico no tiene horarios de atención programados para este día.
        </p>
      ) : (
        <>
          <div className="d-flex justify-content-center gap-3 mb-3 text-muted small">
            <div><span className="badge me-1" style={{ backgroundColor: '#eaf4ff', border: '1px solid #bee3f8', width: 14, height: 14 }}>&nbsp;</span> Disponible</div>
            <div><span className="badge me-1" style={{ backgroundColor: '#3182ce', width: 14, height: 14 }}>&nbsp;</span> Seleccionado</div>
            <div><span className="badge me-1" style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', width: 14, height: 14 }}>&nbsp;</span> Reservado / Inactivo</div>
          </div>
          
          <div style={styles.grid}>
            {slots.map((slot) => {
              const seleccionado = slotSeleccionado === slot.hora;
              return (
                <button
                  key={slot.hora}
                  style={styles.slot(slot.disponible, seleccionado)}
                  onClick={() => handleSelect(slot)}
                  disabled={!slot.disponible}
                  type="button"
                >
                  {slot.hora} {!slot.disponible && '❌'}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
