// src/pages/Especialidades.jsx
// MedConnect — Catálogo de Especialidades y Médicos
// Ref: Arquitectura de Software — Sección 6.2 | SRS RF-03, RF-04

import React, { useState, useEffect } from 'react';
import { especialidadesAPI, medicosAPI } from '../services/api';
import TarjetaMedico from '../components/TarjetaMedico';

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [error, setError] = useState('');

  // Cargar especialidades al montar y cuando cambie la búsqueda
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarEspecialidades();
    }, 300); // Debounce de 300ms para búsqueda en tiempo real

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

  // Cargar médicos de la especialidad seleccionada
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

  const styles = {
    searchBar: {
      borderRadius: '30px',
      padding: '0.65rem 1.5rem',
      borderColor: 'rgba(0, 0, 0, 0.12)',
      fontSize: '0.95rem'
    },
    gridEsp: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2rem'
    },
    cardEsp: (selected) => ({
      borderRadius: '12px',
      border: selected ? '2px solid #3182ce' : '1px solid rgba(0, 0, 0, 0.08)',
      backgroundColor: selected ? '#f0f8ff' : '#ffffff',
      cursor: 'pointer',
      transition: 'transform 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      gap: '0.75rem'
    }),
    iconEsp: {
      fontSize: '2rem',
      backgroundColor: '#ebf8ff',
      color: '#2b6cb0',
      borderRadius: '8px',
      padding: '0.25rem 0.5rem'
    }
  };

  // Mapa de emojis para las especialidades seeded
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

  return (
    <div className="container py-5">
      {/* Cabecera */}
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-2">Especialidades Médicas</h1>
        <p className="text-muted col-lg-6 mx-auto">
          Busca y selecciona la especialidad requerida para ver los médicos disponibles y reservar tu cita médica en línea.
        </p>
      </div>

      {/* Buscador */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6 col-lg-5">
          <div className="input-group shadow-sm" style={{ borderRadius: '30px', overflow: 'hidden' }}>
            <span className="input-group-text bg-white border-end-0 px-3">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              style={styles.searchBar}
              placeholder="Buscar especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Catálogo de Especialidades */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando especialidades...</span>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.gridEsp}>
            {especialidades.map((esp) => {
              const selected = especialidadSeleccionada?.id === esp.id;
              return (
                <div
                  key={esp.id}
                  style={styles.cardEsp(selected)}
                  onClick={() => seleccionarEspecialidad(esp)}
                  className="shadow-sm hover-effect"
                >
                  <span style={styles.iconEsp}>{emojiMap[esp.nombre] || '🏥'}</span>
                  <div>
                    <h3 className="h6 fw-bold mb-0 text-dark">{esp.nombre}</h3>
                    <small className="text-muted">{esp.totalMedicos} {esp.totalMedicos === 1 ? 'médico' : 'médicos'}</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Listado de Médicos si hay especialidad seleccionada */}
          {especialidadSeleccionada && (
            <div className="mt-5 animate__animated animate__fadeIn">
              <hr className="my-5" />
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="h4 fw-bold mb-0">
                  {especialidadSeleccionada.nombre} — Médicos Disponibles
                </h2>
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  {medicos.length} encontrados
                </span>
              </div>

              {loadingMedicos ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando médicos...</span>
                  </div>
                </div>
              ) : medicos.length === 0 ? (
                <div className="card text-center p-5 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <p className="text-muted mb-0">No hay médicos registrados actualmente en esta especialidad.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {medicos.map((medico) => (
                    <div key={medico.id} className="col-md-6 col-lg-4">
                      {/* Adaptación de la respuesta de getById en especialidad para TarjetaMedico */}
                      <TarjetaMedico
                        medico={{
                          id: medico.id,
                          nombre: medico.usuario?.nombre,
                          titulo: medico.titulo,
                          descripcion: medico.descripcion,
                          especialidad: { nombre: especialidadSeleccionada.nombre }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
