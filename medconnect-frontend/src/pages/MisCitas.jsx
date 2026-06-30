// src/pages/MisCitas.jsx
// MedConnect — Panel de Historial de Citas del Paciente
// Ref: Arquitectura de Software — Sección 6.4 | SRS RF-06, RF-10

import React, { useState, useEffect } from 'react';
import { citasAPI } from '../services/api';
import dayjs from 'dayjs';

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState(''); // vacío = Todas
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Estados para Modal de Reagendamiento
  const [reagendandoCita, setReagendandoCita] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [guardandoReagenda, setGuardandoReagenda] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, [filtroEstado]);

  async function cargarCitas() {
    setLoading(true);
    setError('');
    try {
      const res = await citasAPI.getHistorial(filtroEstado);
      setCitas(res.data.citas || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('No se pudo cargar el historial de citas.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelarCita(id) {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita médica?')) return;
    setError('');
    setMensaje('');
    try {
      const res = await citasAPI.cancel(id);
      setMensaje(res.data.mensaje);
      cargarCitas();
    } catch (err) {
      console.error('Error cancelando cita:', err);
      setError(err.response?.data?.mensaje || 'Error al cancelar la cita.');
    }
  }

  function abrirModalReagendar(cita) {
    setReagendandoCita(cita);
    setNuevaFecha(dayjs(cita.fecha).format('YYYY-MM-DD'));
    setNuevaHora(cita.hora);
  }

  async function handleGuardarReagendar(e) {
    e.preventDefault();
    if (!nuevaFecha || !nuevaHora) return;
    setGuardandoReagenda(true);
    setError('');
    setMensaje('');
    try {
      await citasAPI.update(reagendandoCita.id, {
        fecha: nuevaFecha,
        hora: nuevaHora
      });
      setMensaje('Cita reagendada con éxito.');
      setReagendandoCita(null);
      cargarCitas();
    } catch (err) {
      console.error('Error reagendando cita:', err);
      setError(err.response?.data?.mensaje || 'Error al reagendar la cita.');
    } finally {
      setGuardandoReagenda(false);
    }
  }

  const badgeClass = (estado) => {
    switch (estado) {
      case 'CONFIRMADA': return 'bg-success';
      case 'REAGENDADA': return 'bg-warning text-dark';
      case 'CANCELADA': return 'bg-danger';
      case 'INASISTENCIA': return 'bg-secondary';
      default: return 'bg-primary';
    }
  };

  const tabs = [
    { label: 'Todas', value: '' },
    { label: 'Confirmadas', value: 'CONFIRMADA' },
    { label: 'Reagendadas', value: 'REAGENDADA' },
    { label: 'Canceladas', value: 'CANCELADA' },
    { label: 'Inasistencias', value: 'INASISTENCIA' }
  ];

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <h1 className="fw-bold mb-4">Mis Citas Médicas</h1>

      {/* Alertas */}
      {mensaje && <div className="alert alert-success alert-dismissible fade show" role="alert">{mensaje}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}</div>}

      {/* Filtros */}
      <ul className="nav nav-pills mb-4 small bg-light p-2 rounded-3 gap-1">
        {tabs.map((tab) => (
          <li key={tab.label} className="nav-item">
            <button
              className={`nav-link border-0 rounded-3 ${filtroEstado === tab.value ? 'active bg-primary' : 'text-dark bg-transparent'}`}
              onClick={() => setFiltroEstado(tab.value)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Listado de Citas */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando citas...</span>
          </div>
        </div>
      ) : citas.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm rounded-4">
          <p className="text-muted mb-0">No se encontraron citas médicas en este estado.</p>
        </div>
      ) : (
        <div className="row g-3">
          {citas.map((cita) => (
            <div key={cita.id} className="col-12">
              <div className="card shadow-sm border-0 p-4 rounded-4" style={{ background: '#ffffff' }}>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fw-bold text-dark">{cita.numeroCita}</span>
                      <span className={`badge ${badgeClass(cita.estado)}`}>{cita.estado}</span>
                    </div>
                    
                    <h3 className="h6 fw-bold mb-1 text-dark">
                      Médico: {cita.medico?.usuario?.nombre}
                    </h3>
                    <p className="text-primary small mb-3">
                      Especialidad: {cita.medico?.especialidad?.nombre}
                    </p>

                    <div className="d-flex gap-4 text-muted small">
                      <div>📅 <strong>Fecha:</strong> {dayjs(cita.fecha).format('DD/MM/YYYY')}</div>
                      <div>⏰ <strong>Hora:</strong> {cita.hora}</div>
                    </div>
                  </div>

                  {/* Acciones */}
                  {['CONFIRMADA', 'REAGENDADA'].includes(cita.estado) && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={() => abrirModalReagendar(cita)}
                      >
                        Reagendar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={() => handleCancelarCita(cita.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Reagendar en línea */}
      {reagendandoCita && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <form onSubmit={handleGuardarReagendar}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Reagendar Cita</h5>
                  <button type="button" className="btn-close" onClick={() => setReagendandoCita(null)} />
                </div>
                <div className="modal-body">
                  <p className="text-muted small">
                    Selecciona el nuevo horario de atención. Recuerda que solo se puede reagendar con un mínimo de 2 horas de anticipación.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Nueva Fecha</label>
                    <input
                      type="date"
                      className="form-control"
                      value={nuevaFecha}
                      min={dayjs().format('YYYY-MM-DD')}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Nueva Hora</label>
                    <input
                      type="time"
                      className="form-control"
                      value={nuevaHora}
                      step={1800} // Intervalos de 30 minutos
                      onChange={(e) => setNuevaHora(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setReagendandoCita(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-3" disabled={guardandoReagenda}>
                    {guardandoReagenda ? 'Reagendando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
