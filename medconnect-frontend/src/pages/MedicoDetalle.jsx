// src/pages/MedicoDetalle.jsx
// MedConnect — Perfil detallado del médico
// SCRUM-36 | HU-03 | Subtarea: Crear pages/MedicoDetalle.jsx (perfil RF-04)
// RF-04: Nombre, título, especialidad y horarios de atención semanales
// Autor: Cristian Bayas | Sprint 2 — EP-02 Especialidades y Médicos

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { medicosAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DIAS = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo'
};

export default function MedicoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMedico();
  }, [id]);

  async function cargarMedico() {
    setLoading(true);
    setError('');
    try {
      const res = await medicosAPI.getById(id);
      setMedico(res.data.medico);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cargar el perfil del médico.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mc-page">
        <LoadingSpinner label="Cargando perfil..." />
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="container mc-page">
        <div className="mc-alert mc-alert-danger">{error || 'Médico no encontrado.'}</div>
        <Link to="/especialidades" className="mc-btn mc-btn-primary">Volver a especialidades</Link>
      </div>
    );
  }

  const inicial = medico.nombre?.trim().charAt(0).toUpperCase() || 'M';

  return (
    <div className="container mc-page">
      <button type="button" className="mc-back-link" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="mc-card mc-card-celeste overflow-hidden">
        <div className="mc-card-body p-4 p-md-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-3 text-center">
              <div className="mc-avatar mc-avatar-lg">{inicial}</div>
            </div>
            <div className="col-12 col-md-9 text-center text-md-start">
              <span className="mc-page-eyebrow mb-2">Perfil médico</span>
              <h1 className="mc-page-title mb-2">{medico.nombre}</h1>
              <p className="mc-text-primary fw-semibold mb-2">{medico.titulo}</p>
              {medico.especialidad && (
                <span className="mc-badge mc-badge-tag mb-3">{medico.especialidad.nombre}</span>
              )}
              <p className="mc-text-muted mb-4">{medico.descripcion || 'Sin descripción disponible.'}</p>
              <button
                type="button"
                className="mc-btn mc-btn-primary"
                onClick={() => navigate(`/medicos/${id}/agendar`)}
              >
                Agendar cita
              </button>
            </div>
          </div>

          {medico.horarios?.length > 0 && (
            <div className="mt-5">
              <h2 className="h5 fw-bold mb-3">Horarios de atención</h2>
              <div className="mc-table-wrap">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medico.horarios.map((h) => (
                      <tr key={h.id}>
                        <td>{DIAS[h.diaSemana] || h.diaSemana}</td>
                        <td>{h.horaInicio}</td>
                        <td>{h.horaFin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
