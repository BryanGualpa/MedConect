// src/pages/AgendaMedico.jsx
// MedConnect — Agenda semanal del médico

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { medicosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

dayjs.locale('es');

export default function AgendaMedico() {
  const { usuario } = useAuth();
  const [medicoId, setMedicoId] = useState(null);
  const [citas, setCitas] = useState([]);
  const [semanaInicio, setSemanaInicio] = useState(dayjs().startOf('week').add(1, 'day'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarPerfilMedico();
  }, []);

  useEffect(() => {
    if (medicoId) cargarAgenda();
  }, [medicoId, semanaInicio]);

  async function cargarPerfilMedico() {
    try {
      const res = await medicosAPI.getMe();
      setMedicoId(res.data.medico.id);
    } catch (err) {
      console.error('Error cargando perfil médico:', err);
      setError('No se pudo cargar tu perfil médico.');
      setLoading(false);
    }
  }

  async function cargarAgenda() {
    setLoading(true);
    setError('');
    try {
      const semana = semanaInicio.format('YYYY-MM-DD');
      const res = await medicosAPI.getAgenda(medicoId, semana);
      setCitas(res.data.citas || []);
    } catch (err) {
      console.error('Error cargando agenda:', err);
      setError('No se pudo cargar la agenda semanal.');
    } finally {
      setLoading(false);
    }
  }

  const diasSemana = Array.from({ length: 7 }, (_, i) => semanaInicio.add(i, 'day'));

  function citasDelDia(fecha) {
    const fechaStr = fecha.format('YYYY-MM-DD');
    return citas.filter((c) => dayjs(c.fecha).format('YYYY-MM-DD') === fechaStr);
  }

  const coloresDia = ['mc-card-celeste'];

  return (
    <div className="container mc-page">
      <PageHeader
        align="left"
        eyebrow="Panel médico"
        title="Mi Agenda"
        subtitle={`Citas confirmadas de ${usuario?.nombre || 'tu perfil'}`}
      />

      <div className="mc-hint">
        <span className="mc-hint-icon">📅</span>
        <span>Navega entre semanas con los botones. Cada tarjeta muestra las citas del día con hora y paciente.</span>
      </div>

      <div className="mc-week-nav mb-4">
        <button
          type="button"
          className="mc-btn mc-btn-outline mc-btn-sm"
          onClick={() => setSemanaInicio((p) => p.subtract(1, 'week'))}
        >
          ← Anterior
        </button>
        <span className="mc-week-label">
          {semanaInicio.format('DD/MM')} — {semanaInicio.add(6, 'day').format('DD/MM/YYYY')}
        </span>
        <button
          type="button"
          className="mc-btn mc-btn-outline mc-btn-sm"
          onClick={() => setSemanaInicio((p) => p.add(1, 'week'))}
        >
          Siguiente →
        </button>
      </div>

      {error && <div className="mc-alert mc-alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner label="Cargando agenda..." />
      ) : (
        <div className="mc-grid-agenda">
          {diasSemana.map((dia, index) => {
            const citasDia = citasDelDia(dia);
            return (
              <div
                key={dia.format('YYYY-MM-DD')}
                className={`mc-card ${coloresDia[index % coloresDia.length]} h-100 overflow-hidden`}
              >
                <div className="mc-day-card-header">{dia.format('dddd DD/MM')}</div>
                <div className="mc-card-body pt-3">
                  {citasDia.length === 0 ? (
                    <p className="mc-text-muted small mb-0">Sin citas</p>
                  ) : (
                    citasDia.map((cita) => (
                      <div key={cita.id} className="mc-cita-chip">
                        <div className="fw-bold">{cita.hora}</div>
                        <div className="small">{cita.paciente?.nombre}</div>
                        <span className="mc-badge mc-badge-success mt-1">{cita.estado}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
