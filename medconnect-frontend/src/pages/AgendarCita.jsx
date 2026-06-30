// src/pages/AgendarCita.jsx
// MedConnect — Vista de Agendamiento de Citas
// Ref: Arquitectura de Software — Sección 6.3 | SRS RF-05, RF-06, RF-07

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicosAPI, citasAPI } from '../services/api';
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad';
import ModalConfirmacion from '../components/ModalConfirmacion';
import dayjs from 'dayjs';

export default function AgendarCita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medico, setMedico] = useState(null);
  const [loadingMedico, setLoadingMedico] = useState(true);
  const [error, setError] = useState('');
  
  // Fecha seleccionada en formato YYYY-MM-DD (por defecto hoy)
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  
  // Control de Modal de Confirmación
  const [showModal, setShowModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  
  // Pantalla de Éxito
  const [citaCreada, setCitaCreada] = useState(null);

  useEffect(() => {
    async function cargarMedico() {
      try {
        const res = await medicosAPI.getById(id);
        setMedico(res.data.medico);
      } catch (err) {
        console.error('Error cargando médico:', err);
        setError('No se pudo encontrar la información del médico seleccionado.');
      } finally {
        setLoadingMedico(false);
      }
    }
    cargarMedico();
  }, [id]);

  function handleSelectSlot(fechaSel, horaSel) {
    setFecha(fechaSel);
    setHoraSeleccionada(horaSel);
    setShowModal(true);
  }

  async function handleConfirmBooking() {
    setConfirming(true);
    setError('');
    try {
      const res = await citasAPI.create({
        medicoId: parseInt(id),
        fecha,
        hora: horaSeleccionada
      });
      setCitaCreada(res.data.cita);
      setShowModal(false);
    } catch (err) {
      console.error('Error confirmando cita:', err);
      const msg = err.response?.data?.mensaje || 'Error al registrar la cita médica.';
      setError(msg);
      setShowModal(false);
    } finally {
      setConfirming(false);
    }
  }

  if (loadingMedico) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando médico...</span>
        </div>
      </div>
    );
  }

  if (error && !medico) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-4">{error}</div>
        <button className="btn btn-primary rounded-pill" onClick={() => navigate('/especialidades')}>
          Volver a Especialidades
        </button>
      </div>
    );
  }

  // Pantalla de Éxito (Sección 6.3 - Pantalla de éxito con número único de cita)
  if (citaCreada) {
    return (
      <div className="container py-5 text-center d-flex justify-content-center align-items-center min-vh-100">
        <div className="card shadow p-5 border-0 rounded-4" style={{ maxWidth: '500px' }}>
          <span style={{ fontSize: '4.5rem' }}>✅</span>
          <h2 className="mt-3 fw-bold text-dark">¡Cita agendada con éxito!</h2>
          <p className="text-muted small mb-4">
            Tu cita ha sido bloqueada y registrada de forma atómica en el sistema.
          </p>

          <div className="card bg-light p-3 border-0 rounded-3 text-start mb-4">
            <h4 className="h6 fw-bold mb-2">Resumen de la cita</h4>
            <ul className="list-unstyled mb-0 small">
              <li className="mb-1"><strong>Número de Cita:</strong> {citaCreada.numeroCita}</li>
              <li className="mb-1"><strong>Médico:</strong> {citaCreada.medico}</li>
              <li className="mb-1"><strong>Especialidad:</strong> {citaCreada.especialidad}</li>
              <li className="mb-1"><strong>Fecha:</strong> {citaCreada.fecha}</li>
              <li className="mb-1"><strong>Hora:</strong> {citaCreada.hora}</li>
            </ul>
          </div>

          <div className="alert alert-info py-2 px-3 small border-0 text-start rounded-3 mb-4">
            📧 Hemos enviado un correo electrónico de confirmación con los detalles.
          </div>

          <button
            className="btn btn-primary rounded-pill w-100 fw-semibold py-2"
            onClick={() => navigate('/mis-citas')}
          >
            Ir a Mis Citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-link text-muted mb-4 p-0 text-decoration-none" onClick={() => navigate(-1)}>
        &larr; Volver
      </button>

      <div className="row g-4">
        {/* Info del médico */}
        <div className="col-md-4">
          <div className="card shadow-sm p-4 border-0 text-center" style={{ borderRadius: '16px', background: '#ffffff' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#eaf4ff',
                color: '#3182ce',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}
            >
              {medico?.nombre.charAt(4)}
            </div>
            <h3 className="h5 fw-bold mb-1">{medico?.nombre}</h3>
            <p className="text-primary small fw-semibold mb-3">{medico?.titulo}</p>
            <span className="badge bg-light text-primary mb-0 px-3 py-2 border border-primary-subtle rounded-pill">
              {medico?.especialidad?.nombre}
            </span>
          </div>
        </div>

        {/* Agendamiento */}
        <div className="col-md-8">
          <div className="card shadow-sm p-4 border-0 mb-4" style={{ borderRadius: '16px' }}>
            <h2 className="h4 fw-bold mb-4">Seleccionar Fecha y Hora</h2>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {/* Selector de fecha */}
            <div className="mb-4">
              <label htmlFor="fechaCita" className="form-label fw-semibold text-muted small">
                Elige la fecha de tu consulta
              </label>
              <input
                type="date"
                id="fechaCita"
                className="form-control"
                style={{ borderRadius: '10px', padding: '0.6rem 1rem' }}
                value={fecha}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            {/* Calendario de Slots de disponibilidad */}
            <CalendarioDisponibilidad
              medicoId={parseInt(id)}
              fechaSeleccionada={fecha}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBooking}
        loading={confirming}
        datosCita={{
          medicoNombre: medico?.nombre,
          especialidadNombre: medico?.especialidad?.nombre,
          fechaFormateada: dayjs(fecha).format('DD/MM/YYYY'),
          hora: horaSeleccionada
        }}
      />
    </div>
  );
}
