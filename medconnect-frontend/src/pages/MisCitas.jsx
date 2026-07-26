// src/pages/MisCitas.jsx
// MedConnect — Historial de citas del paciente

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { citasAPI, medicosAPI } from '../services/api';
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
  const [mensaje, setMensaje] = useState('');
  const [citaReagendar, setCitaReagendar] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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

  async function handleCancelar(id) {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    setMensaje('');
    try {
      const res = await citasAPI.cancel(id);
      setMensaje(res.data.mensaje);
      cargarCitas();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cancelar la cita.');
    }
  }

  async function abrirReagendar(cita) {
    setCitaReagendar(cita);
    setNuevaFecha(dayjs(cita.fecha).format('YYYY-MM-DD'));
    setNuevaHora(cita.hora);
    setSlots([]);
  }

  async function cargarSlots(medicoId, fecha) {
    if (!fecha) return;
    setLoadingSlots(true);
    try {
      const res = await medicosAPI.getDisponibilidad(medicoId, fecha);
      setSlots(res.data.slots || []);
    } catch (err) {
      setError('No se pudo cargar la disponibilidad.');
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    if (citaReagendar && nuevaFecha) {
      cargarSlots(citaReagendar.medicoId, nuevaFecha);
    }
  }, [citaReagendar, nuevaFecha]);

  async function handleReagendar(e) {
    e.preventDefault();
    setMensaje('');
    try {
      await citasAPI.update(citaReagendar.id, { fecha: nuevaFecha, hora: nuevaHora });
      setMensaje('Cita reagendada exitosamente.');
      setCitaReagendar(null);
      cargarCitas();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al reagendar la cita.');
    }
  }

  const puedeModificar = (estado) => ['CONFIRMADA', 'REAGENDADA'].includes(estado);

  return (
    <div className="container mc-page">
      <PageHeader
        align="left"
        eyebrow="Tu salud"
        title="Mis Citas"
        subtitle="Consulta, reagenda o cancela tus citas médicas."
      />

      <div className="mc-hint">
        <span className="mc-hint-icon">📋</span>
        <span>Usa los filtros para ver citas confirmadas, canceladas o reagendadas. Solo puedes modificar citas activas.</span>
      </div>

      {mensaje && <div className="mc-alert mc-alert-success">{mensaje}</div>}
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
                <div className="small mb-3">
                  <p className="mb-1">📅 {dayjs(cita.fecha).format('DD/MM/YYYY')}</p>
                  <p className="mb-0">🕐 {cita.hora}</p>
                </div>
                {puedeModificar(cita.estado) && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="mc-btn mc-btn-outline mc-btn-sm flex-fill"
                      onClick={() => abrirReagendar(cita)}
                    >
                      Reagendar
                    </button>
                    <button
                      type="button"
                      className="mc-btn mc-btn-outline-danger mc-btn-sm flex-fill"
                      onClick={() => handleCancelar(cita.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {citaReagendar && (
        <div className="mc-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mc-modal">
            <form onSubmit={handleReagendar}>
              <div className="mc-modal-header">
                <h5 className="mc-modal-title">Reagendar cita</h5>
                <button type="button" className="mc-btn-close" onClick={() => setCitaReagendar(null)}>
                  ✕
                </button>
              </div>
              <div className="mc-modal-body">
                <div className="mb-3">
                  <label className="mc-form-label">Nueva fecha</label>
                  <input
                    type="date"
                    className="form-control mc-input w-100"
                    value={nuevaFecha}
                    min={dayjs().format('YYYY-MM-DD')}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-0">
                  <label className="mc-form-label">Nueva hora</label>
                  {loadingSlots ? (
                    <LoadingSpinner label="Cargando horarios..." />
                  ) : (
                    <select
                      className="form-select mc-input w-100"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un horario</option>
                      {slots.filter((s) => s.disponible).map((s) => (
                        <option key={s.hora} value={s.hora}>{s.hora}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <div className="mc-modal-footer">
                <button type="button" className="mc-btn mc-btn-ghost" onClick={() => setCitaReagendar(null)}>
                  Cerrar
                </button>
                <button type="submit" className="mc-btn mc-btn-primary">
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
