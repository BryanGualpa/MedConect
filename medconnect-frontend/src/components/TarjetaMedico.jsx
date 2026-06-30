// src/components/TarjetaMedico.jsx
// MedConnect — Componente Tarjeta de Médico
// Ref: Arquitectura de Software — Sección 6.2 | SRS RF-04

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Muestra el perfil abreviado de un médico y permite acceder a su disponibilidad.
 * @param {{ medico: { id: number, nombre: string, titulo: string, descripcion: string, especialidad: { nombre: string } } }} props
 */
export default function TarjetaMedico({ medico }) {
  const navigate = useNavigate();

  function handleVerDisponibilidad() {
    navigate(`/medicos/${medico.id}/agendar`);
  }

  const styles = {
    card: {
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      background: '#ffffff',
      overflow: 'hidden'
    },
    imgPlaceholder: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#eaf4ff',
      color: '#3182ce',
      fontSize: '2rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    btn: {
      borderRadius: '30px',
      fontWeight: '600',
      padding: '0.5rem 1.5rem',
      backgroundColor: '#3182ce',
      borderColor: '#3182ce',
      color: '#ffffff',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div className="card h-100 shadow-sm p-4 text-center" style={styles.card}>
      {/* Icono / Inicial del médico como avatar */}
      <div style={styles.imgPlaceholder}>
        {medico.nombre ? medico.nombre.charAt(4) || '👨‍⚕️' : '👨‍⚕️'}
      </div>
      
      <h3 className="h5 fw-bold mb-1 text-dark">{medico.nombre}</h3>
      <p className="text-primary small fw-semibold mb-2">{medico.titulo}</p>
      
      {medico.especialidad && (
        <span className="badge bg-light text-primary mb-3 px-3 py-2 border border-primary-subtle rounded-pill">
          {medico.especialidad.nombre}
        </span>
      )}
      
      <p className="card-text text-muted small mb-4 text-start" style={{ minHeight: '60px' }}>
        {medico.descripcion && medico.descripcion.length > 120
          ? `${medico.descripcion.substring(0, 120)}...`
          : medico.descripcion || 'Sin descripción disponible.'}
      </p>
      
      <div className="mt-auto">
        <button
          className="btn btn-primary w-100"
          style={styles.btn}
          onClick={handleVerDisponibilidad}
        >
          Ver disponibilidad
        </button>
      </div>
    </div>
  );
}
