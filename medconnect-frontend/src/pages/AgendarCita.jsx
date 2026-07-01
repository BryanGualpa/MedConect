// src/pages/AgendarCita.jsx
// MedConnect — Agendar cita con un médico

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { medicosAPI, citasAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AgendarCita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medico, setMedico] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [hora, setHora] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  useEffect(() => {
    cargarMedico();
  }, [id]);

  useEffect(() => {
    if (medico) cargarDisponibilidad();
  }, [medico, fecha]);

  async function cargarMedico() {
    setLoading(true);
    setError('');
    try {
      const res = await medicosAPI.getById(id);
      setMedico(res.data.medico);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cargar el médico.');
    } finally {
      setLoading(false);
    }
  }

  async function cargarDisponibilidad() {
    setLoadingSlots(true);
    setHora('');
    try {
      const res = await medicosAPI.getDisponibilidad(id, fecha);
      setSlots(res.data.slots || []);
    } catch (err) {
      setError('No se pudo cargar la disponibilidad horaria.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleAgendar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const res = await citasAPI.create({
        medicoId: parseInt(id, 10),
        fecha,
        hora
      });
      setExito(res.data.cita);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.errores?.[0]?.msg ||
        'No se pudo agendar la cita.'
      );
    } finally {
      setEnviando(false);
    }
  }

  const slotsDisponibles = slots.filter((s) => s.disponible);

  if (loading) {
    return (
      <div className="container mc-page">
        <LoadingSpinner label="Cargando..." />
      </div>
    );
  }

  if (exito) {
    return (
      <div className="container mc-page">
        <div className="mc-auth-card mx-auto">
          <div className="mc-auth-body text-center py-5">
            <div style={{ fontSize: '3.5rem' }}>🎉</div>
            <h1 className="h4 fw-bold mt-3">¡Cita agendada!</h1>
            <p className="mc-badge mc-badge-tag mb-4">{exito.numeroCita}</p>
            <ul className="list-unstyled text-start small mb-4 mx-auto" style={{ maxWidth: 280 }}>
              <li className="mb-2">👨‍⚕️ <strong>Médico:</strong> {exito.medico}</li>
              <li className="mb-2">🏥 <strong>Especialidad:</strong> {exito.especialidad}</li>
              <li className="mb-2">📅 <strong>Fecha:</strong> {exito.fecha}</li>
              <li className="mb-2">🕐 <strong>Hora:</strong> {exito.hora}</li>
              <li>✅ <strong>Estado:</strong> {exito.estado}</li>
            </ul>
            <button type="button" className="mc-btn mc-btn-primary mc-btn-block mb-2" onClick={() => navigate('/mis-citas')}>
              Ver mis citas
            </button>
            <Link to="/especialidades" className="mc-btn mc-btn-outline mc-btn-block">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mc-page">
      <button type="button" className="mc-back-link" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <div className="mc-card mc-card-celeste">
            <div className="mc-card-body p-4 p-md-5">
              <div className="mc-steps">
                <span className="mc-step active"><span className="mc-step-num">1</span> Elige fecha</span>
                <span className="mc-step active"><span className="mc-step-num">2</span> Selecciona hora</span>
                <span className="mc-step"><span className="mc-step-num">3</span> Confirma</span>
              </div>

              <span className="mc-page-eyebrow mb-2">Reservar cita</span>
              <h1 className="h4 fw-bold mb-1">Agendar cita</h1>
              {medico && (
                <p className="mc-text-muted mb-4">
                  con <strong>{medico.nombre}</strong> — {medico.especialidad?.nombre}
                </p>
              )}

              {error && <div className="mc-alert mc-alert-danger">{error}</div>}

              <form onSubmit={handleAgendar}>
                <div className="mb-4">
                  <label htmlFor="fecha" className="mc-form-label">Fecha</label>
                  <input
                    id="fecha"
                    type="date"
                    className="form-control mc-input w-100"
                    value={fecha}
                    min={dayjs().format('YYYY-MM-DD')}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mc-form-label">Horario disponible</label>
                  {loadingSlots ? (
                    <LoadingSpinner label="Consultando horarios..." />
                  ) : slotsDisponibles.length === 0 ? (
                    <p className="mc-text-muted small mb-0">
                      No hay horarios para esta fecha. Prueba otra.
                    </p>
                  ) : (
                    <div className="mc-slots-grid">
                      {slotsDisponibles.map((slot) => (
                        <button
                          key={slot.hora}
                          type="button"
                          className={`mc-slot-btn ${hora === slot.hora ? 'selected' : ''}`}
                          onClick={() => setHora(slot.hora)}
                        >
                          {slot.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="mc-btn mc-btn-primary mc-btn-block"
                  disabled={enviando || !hora}
                >
                  {enviando ? 'Agendando...' : 'Confirmar cita'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0 small">
                <Link to={`/medicos/${id}`} className="mc-link">Ver perfil completo</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
