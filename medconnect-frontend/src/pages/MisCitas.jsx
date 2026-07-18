// src/pages/MisCitas.jsx
// MedConnect — Historial de citas del paciente (listado)
// SCRUM-48 | HU-06 | Subtarea: Crear pages/MisCitas.jsx listado con filtros
// RF-10: Historial con filtros por estado (CONFIRMADA, CANCELADA, etc.)
// Autor: Cristian Bayas | Sprint 3 — EP-03 Agendamiento de Citas

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { citasAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const ESTADOS = [
  { valor: '', label: 'Todas' },
  { valor: 'CONFIRMADA', label: 'Confirmadas' },
  { valor: 'REAGENDADA', label: 'Reagendadas' },
  { valor: 'CANCELADA', label: 'Canceladas' },
  { valor: 'INASISTENCIA', label: 'Inasistencias' }
];

const badgeEstado = {
  CONFIRMADA: 'mc-badge-success',
  REAGENDADA: 'mc-badge-info',
  CANCELADA: 'mc-badge-neutral',
  INASISTENCIA: 'mc-badge-warning'
};

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCitas();
  }, [filtroEstado]);

  async function cargarCitas() {
    setLoading(true);
    setError('');
    try {
      const res = await citasAPI.getHistorial(filtroEstado || undefined);
      setCitas(res.data.citas || []);
    } catch (err) {
      console.error('Error cargando citas:', err);
      setError('No se pudo cargar tu historial de citas.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mc-page">
      <PageHeader
        align="left"
        eyebrow="Tu salud"
        title="Mis Citas"
        subtitle="Consulta el historial de tus citas médicas."
      />

      <div className="mc-hint">
        <span className="mc-hint-icon">📋</span>
        <span>Usa los filtros para ver citas confirmadas, canceladas o reagendadas.</span>
      </div>

      {error && <div className="mc-alert mc-alert-danger">{error}</div>}

      <div className="mc-filter-group mb-4">
        {ESTADOS.map(({ valor, label }) => (
          <button
            key={valor || 'todas'}
            type="button"
            className={`mc-filter-pill ${filtroEstado === valor ? 'active' : ''}`}
            onClick={() => setFiltroEstado(valor)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Cargando citas..." />
      ) : citas.length === 0 ? (
        <div className="mc-empty">
          <div className="mc-empty-icon">📅</div>
          <p className="mc-text-muted mb-0">No tienes citas con este filtro.</p>
        </div>
      ) : (
        <div className="mc-grid-cards">
          {citas.map((cita) => (
            <div key={cita.id} className="mc-card mc-card-celeste h-100">
              <div className="mc-card-body">
                <div className="d-flex justify-content-between align-items-start mb-3 gap-2 flex-wrap">
                  <span className="mc-badge mc-badge-neutral">{cita.numeroCita}</span>
                  <span className={`mc-badge ${badgeEstado[cita.estado] || 'mc-badge-neutral'}`}>
                    {cita.estado}
                  </span>
                </div>
                <h3 className="h6 fw-bold mb-1">{cita.medico?.usuario?.nombre}</h3>
                <p className="mc-text-primary small fw-semibold mb-3">
                  {cita.medico?.especialidad?.nombre}
                </p>
                <div className="small mb-0">
                  <p className="mb-1">📅 {dayjs(cita.fecha).format('DD/MM/YYYY')}</p>
                  <p className="mb-0">🕐 {cita.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
