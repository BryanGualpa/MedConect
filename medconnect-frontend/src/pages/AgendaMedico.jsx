// src/pages/AgendaMedico.jsx
// MedConnect — Agenda Semanal del Médico
// Ref: Arquitectura de Software — Sección 6.5 | SRS RF-08

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { especialidadesAPI, medicosAPI } from '../services/api';
import dayjs from 'dayjs';

export default function AgendaMedico() {
  const { usuario } = useAuth();
  
  const [medicoId, setMedicoId] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [semana, setSemana] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')); // Lunes de la semana actual
  const [error, setError] = useState('');

  // 1. Resolver el medicoId correspondiente al usuario logueado
  useEffect(() => {
    async function resolverMedicoId() {
      setLoadingProfile(true);
      setError('');
      try {
        // Obtener especialidades
        const espRes = await especialidadesAPI.getAll();
        const especialidades = espRes.data.especialidades || [];
        
        let encontradoId = null;
        
        // Buscar el médico en las especialidades
        for (const esp of especialidades) {
          const detailRes = await especialidadesAPI.getById(esp.id);
          const medicos = detailRes.data.especialidad?.medicos || [];
          const match = medicos.find(m => m.usuarioId === usuario?.id);
          if (match) {
            encontradoId = match.id;
            break;
          }
        }
        
        if (encontradoId) {
          setMedicoId(encontradoId);
        } else {
          setError('No se pudo encontrar tu perfil de médico registrado en el sistema.');
        }
      } catch (err) {
        console.error('Error resolviendo perfil de médico:', err);
        setError('Error al obtener el perfil del médico.');
      } finally {
        setLoadingProfile(false);
      }
    }

    if (usuario?.id) {
      resolverMedicoId();
    }
  }, [usuario]);

  // 2. Cargar las citas cuando cambie el medicoId o la semana
  useEffect(() => {
    if (!medicoId) return;

    async function cargarAgenda() {
      setLoadingCitas(true);
      setError('');
      try {
        const res = await medicosAPI.getAgenda(medicoId, semana);
        setCitas(res.data.citas || []);
      } catch (err) {
        console.error('Error cargando agenda semanal:', err);
        setError('No se pudo cargar la agenda de citas.');
      } finally {
        setLoadingCitas(false);
      }
    }

    cargarAgenda();
  }, [medicoId, semana]);

  // Navegación de semanas
  function cambiarSemana(dias) {
    setSemana(prev => dayjs(prev).add(dias, 'day').format('YYYY-MM-DD'));
  }

  // Agrupar citas por día de la semana (Lunes a Viernes)
  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
  
  const agendaPorDia = {};
  diasSemana.forEach(d => {
    agendaPorDia[d] = [];
  });

  const diaSemanaMap = {
    1: 'LUNES',
    2: 'MARTES',
    3: 'MIERCOLES',
    4: 'JUEVES',
    5: 'VIERNES'
  };

  citas.forEach(cita => {
    const dayIndex = dayjs(cita.fecha).day(); // 0 = Domingo, 1 = Lunes, etc.
    const diaNombre = diaSemanaMap[dayIndex];
    if (agendaPorDia[diaNombre]) {
      agendaPorDia[diaNombre].push(cita);
    }
  });

  const styles = {
    columna: {
      flex: '1 1 0px',
      minWidth: '200px',
      backgroundColor: '#f7fafc',
      borderRadius: '12px',
      padding: '1rem',
      border: '1px solid #e2e8f0'
    },
    citaCard: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '0.75rem',
      borderLeft: '4px solid #3182ce',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
    }
  };

  if (loadingProfile) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando perfil de médico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-4 animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h1 className="fw-bold mb-1">Mi Agenda Semanal</h1>
          <p className="text-muted small mb-0">Dr. {usuario?.nombre} — Citas confirmadas en la semana</p>
        </div>
        
        {/* Controles de semana */}
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => cambiarSemana(-7)}>
            &larr; Anterior
          </button>
          <span className="fw-bold text-dark px-2 small">
            Semana del {dayjs(semana).format('DD/MM/YYYY')} al {dayjs(semana).add(4, 'day').format('DD/MM/YYYY')}
          </span>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => cambiarSemana(7)}>
            Siguiente &rarr;
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loadingCitas ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Actualizando agenda...</span>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-row flex-wrap gap-3 overflow-auto">
          {diasSemana.map((dia) => {
            const citasDia = agendaPorDia[dia];
            return (
              <div key={dia} style={styles.columna} className="shadow-sm">
                <h3 className="h6 fw-bold text-center border-bottom pb-2 text-primary">{dia}</h3>
                
                {citasDia.length === 0 ? (
                  <p className="text-muted text-center small py-3 mb-0">Sin citas</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {citasDia.map((cita) => (
                      <div key={cita.id} style={styles.citaCard}>
                        <div className="fw-bold text-dark small">{cita.hora}</div>
                        <div className="text-muted small mb-1">{cita.paciente?.nombre}</div>
                        <span className="badge bg-light text-primary border border-primary-subtle rounded-pill" style={{ fontSize: '0.7rem' }}>
                          {cita.numeroCita}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
