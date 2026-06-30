// src/pages/MedicoDetalle.jsx
// MedConnect — Detalle del Médico
// Ref: Arquitectura de Software — Sección 2.2.1 | SRS RF-04

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicosAPI } from '../services/api';

export default function MedicoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarMedico() {
      try {
        const res = await medicosAPI.getById(id);
        setMedico(res.data.medico);
      } catch (err) {
        console.error('Error cargando médico:', err);
        setError('No se pudo encontrar la información del médico seleccionado.');
      } finally {
        setLoading(false);
      }
    }
    cargarMedico();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando perfil del médico...</span>
        </div>
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-4">{error || 'Médico no encontrado'}</div>
        <button className="btn btn-primary rounded-pill" onClick={() => navigate('/especialidades')}>
          Volver a Especialidades
        </button>
      </div>
    );
  }

  const diaMap = {
    'LUNES': 'Lunes',
    'MARTES': 'Martes',
    'MIERCOLES': 'Miércoles',
    'JUEVES': 'Jueves',
    'VIERNES': 'Viernes',
    'SABADO': 'Sábado',
    'DOMINGO': 'Domingo'
  };

  return (
    <div className="container py-5">
      <button className="btn btn-link text-muted mb-4 p-0 text-decoration-none" onClick={() => navigate(-1)}>
        &larr; Volver
      </button>

      <div className="row g-4 justify-content-center">
        {/* Perfil del médico */}
        <div className="col-lg-8">
          <div className="card shadow-sm p-4 border-0 mb-4" style={{ borderRadius: '16px' }}>
            <div className="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-md-start">
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#eaf4ff',
                  color: '#3182ce',
                  fontSize: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                {medico.nombre.charAt(4)}
              </div>
              <div>
                <span className="badge bg-light text-primary mb-2 px-3 py-2 border border-primary-subtle rounded-pill small">
                  {medico.especialidad?.nombre}
                </span>
                <h1 className="h3 fw-bold mb-1 text-dark">{medico.nombre}</h1>
                <p className="text-primary fw-semibold mb-0">{medico.titulo}</p>
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="h6 fw-bold text-dark mb-3">Sobre mí</h3>
            <p className="text-muted small mb-4" style={{ lineHeight: '1.6' }}>
              {medico.descripcion || 'Este médico aún no cuenta con una descripción profesional.'}
            </p>

            <button
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
              onClick={() => navigate(`/medicos/${medico.id}/agendar`)}
            >
              🗓️ Agendar una cita
            </button>
          </div>
        </div>

        {/* Horarios de atención general */}
        <div className="col-lg-4">
          <div className="card shadow-sm p-4 border-0" style={{ borderRadius: '16px' }}>
            <h3 className="h5 fw-bold mb-3 text-dark">Horarios de Atención</h3>
            <p className="text-muted small mb-4">Días y horas de disponibilidad general programados en la clínica.</p>
            
            {medico.horarios && medico.horarios.length > 0 ? (
              <ul className="list-group list-group-flush small">
                {medico.horarios.map((h) => (
                  <li key={h.id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-0 bg-transparent">
                    <span className="fw-semibold text-dark">{diaMap[h.diaSemana]}</span>
                    <span className="text-muted">{h.horaInicio} - {h.horaFin}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted small mb-0">No hay horarios programados de disponibilidad actualmente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
