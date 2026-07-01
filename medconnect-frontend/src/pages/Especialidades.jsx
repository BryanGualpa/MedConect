// src/pages/Especialidades.jsx
// MedConnect — Catálogo de Especialidades y Médicos

import React, { useState, useEffect } from 'react';
import { especialidadesAPI } from '../services/api';
import TarjetaMedico from '../components/TarjetaMedico';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const emojiMap = {
  'Medicina General': '🩺',
  'Cardiología': '❤️',
  'Pediatría': '👶',
  'Ortopedia': '🦴',
  'Neurología': '🧠',
  'Dermatología': '🧴',
  'Ginecología': '🤰',
  'Oftalmología': '👁️'
};

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarEspecialidades();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda]);

  async function cargarEspecialidades() {
    setLoading(true);
    setError('');
    try {
      const res = await especialidadesAPI.getAll(busqueda);
      setEspecialidades(res.data.especialidades || []);
    } catch (err) {
      console.error('Error cargando especialidades:', err);
      setError('Ocurrió un error al cargar el catálogo de especialidades.');
    } finally {
      setLoading(false);
    }
  }

  async function seleccionarEspecialidad(especialidad) {
    setEspecialidadSeleccionada(especialidad);
    setLoadingMedicos(true);
    try {
      const res = await especialidadesAPI.getById(especialidad.id);
      setMedicos(res.data.especialidad.medicos || []);
    } catch (err) {
      console.error('Error cargando médicos:', err);
      setError('Ocurrió un error al cargar los médicos de la especialidad.');
    } finally {
      setLoadingMedicos(false);
    }
  }

  return (
    <div className="container mc-page">
      <PageHeader
        eyebrow="Catálogo médico"
        title="Especialidades Médicas"
        subtitle="Busca y selecciona la especialidad que necesitas para ver médicos disponibles y reservar tu cita en línea."
      />

      <div className="mc-hint">
        <span className="mc-hint-icon">💡</span>
        <span>
          <strong>Paso 1:</strong> elige una especialidad abajo. <strong>Paso 2:</strong> selecciona un médico.
          <strong> Paso 3:</strong> pulsa &quot;Ver disponibilidad&quot; para agendar.
        </span>
      </div>

      <div className="mb-4 px-2">
        <div className="mc-search-wrap">
          <span className="mc-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="mc-search-input"
            placeholder="Buscar especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar especialidad"
          />
        </div>
      </div>

      {error && <div className="mc-alert mc-alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner label="Cargando especialidades..." />
      ) : (
        <>
          <div className="mc-grid-especialidades">
            {especialidades.map((esp, index) => {
              const selected = especialidadSeleccionada?.id === esp.id;
              return (
                <button
                  key={esp.id}
                  type="button"
                  className={`mc-esp-card ${selected ? 'selected' : ''}`}
                  onClick={() => seleccionarEspecialidad(esp)}
                  style={{ border: 'none', textAlign: 'left', width: '100%' }}
                >
                  <span className={`mc-esp-icon mc-esp-icon-${index % 6}`}>
                    {emojiMap[esp.nombre] || '🏥'}
                  </span>
                  <div>
                    <h3 className="h6 fw-bold mb-0 mc-text-heading">{esp.nombre}</h3>
                    <small className="mc-text-muted">
                      {esp.totalMedicos} {esp.totalMedicos === 1 ? 'médico' : 'médicos'}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>

          {especialidadSeleccionada && (
            <section>
              <hr className="mc-section-divider" />
              <div className="mc-section-title">
                <h2 className="h5 fw-bold mb-0">
                  {especialidadSeleccionada.nombre} — Médicos disponibles
                </h2>
                <span className="mc-count-badge">{medicos.length} encontrados</span>
              </div>

              {loadingMedicos ? (
                <LoadingSpinner label="Cargando médicos..." />
              ) : medicos.length === 0 ? (
                <div className="mc-empty">
                  <div className="mc-empty-icon">👨‍⚕️</div>
                  <p className="mc-text-muted mb-0">
                    No hay médicos registrados en esta especialidad por ahora.
                  </p>
                </div>
              ) : (
                <div className="mc-grid-cards">
                  {medicos.map((medico) => (
                    <TarjetaMedico
                      key={medico.id}
                      medico={{
                        id: medico.id,
                        nombre: medico.usuario?.nombre,
                        titulo: medico.titulo,
                        descripcion: medico.descripcion,
                        especialidad: { nombre: especialidadSeleccionada.nombre }
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
