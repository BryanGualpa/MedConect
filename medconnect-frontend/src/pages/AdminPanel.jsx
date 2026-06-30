// src/pages/AdminPanel.jsx
// MedConnect — Panel de Control Administrativo
// Ref: Arquitectura de Software — Sección 6.6 | SRS RF-09

import React, { useState, useEffect } from 'react';
import { adminAPI, especialidadesAPI } from '../services/api';

export default function AdminPanel() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Estados para Registro de Médico
  const [showRegistro, setShowRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [especialidadId, setEspecialidadId] = useState('');
  const [guardandoMedico, setGuardandoMedico] = useState(false);

  // Estados para Configuración de Horarios
  const [configurandoMedico, setConfigurandoMedico] = useState(null);
  const [horarios, setHorarios] = useState([
    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
  ]);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setError('');
    try {
      const [medRes, espRes] = await Promise.all([
        adminAPI.getMedicos(),
        especialidadesAPI.getAll()
      ]);
      setMedicos(medRes.data.medicos || []);
      setEspecialidades(espRes.data.especialidades || []);
    } catch (err) {
      console.error('Error cargando datos administrativos:', err);
      setError('No se pudieron cargar los datos del panel.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegistrarMedico(e) {
    e.preventDefault();
    setGuardandoMedico(true);
    setError('');
    setMensaje('');
    try {
      await adminAPI.createMedico({
        nombre,
        cedula,
        correo,
        contrasena,
        telefono,
        titulo,
        descripcion,
        especialidadId: parseInt(especialidadId)
      });
      setMensaje('Médico registrado con éxito.');
      setShowRegistro(false);
      limpiarRegistroForm();
      cargarDatos();
    } catch (err) {
      console.error('Error creando médico:', err);
      setError(err.response?.data?.mensaje || 'Error al registrar el médico.');
    } finally {
      setGuardandoMedico(false);
    }
  }

  async function handleDesactivarMedico(id) {
    if (!window.confirm('¿Estás seguro de que deseas desactivar a este médico?')) return;
    setError('');
    setMensaje('');
    try {
      await adminAPI.deactivate(id);
      setMensaje('Médico desactivado.');
      cargarDatos();
    } catch (err) {
      console.error('Error desactivando médico:', err);
      setError('No se pudo desactivar al médico.');
    }
  }

  function abrirConfigHorario(medico) {
    setConfigurandoMedico(medico);
    // Cargar horarios actuales si existen
    if (medico.horarios && medico.horarios.length > 0) {
      setHorarios(medico.horarios.map(h => ({
        diaSemana: h.diaSemana,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      })));
    } else {
      setHorarios([{ diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }]);
    }
  }

  function handleAgregarFilaHorario() {
    setHorarios([...horarios, { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }]);
  }

  function handleFilaHorarioChange(index, campo, valor) {
    const nuevos = [...horarios];
    nuevos[index][campo] = valor;
    setHorarios(nuevos);
  }

  function handleEliminarFilaHorario(index) {
    const nuevos = [...horarios];
    nuevos.splice(index, 1);
    setHorarios(nuevos);
  }

  async function handleGuardarHorarios(e) {
    e.preventDefault();
    setGuardandoHorario(true);
    setError('');
    setMensaje('');
    try {
      await adminAPI.setHorario(configurandoMedico.id, { horarios });
      setMensaje(`Horarios del Dr. ${configurandoMedico.usuario?.nombre} actualizados.`);
      setConfigurandoMedico(null);
      cargarDatos();
    } catch (err) {
      console.error('Error guardando horarios:', err);
      setError('Error al actualizar los horarios.');
    } finally {
      setGuardandoHorario(false);
    }
  }

  function limpiarRegistroForm() {
    setNombre('');
    setCedula('');
    setCorreo('');
    setContrasena('');
    setTelefono('');
    setTitulo('');
    setDescripcion('');
    setEspecialidadId('');
  }

  const diasOpciones = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando panel administrativo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h1 className="fw-bold mb-1">Panel Administrativo</h1>
          <p className="text-muted small mb-0">Gestión de profesionales médicos y sus horarios de atención</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowRegistro(true)}>
          + Registrar Médico
        </button>
      </div>

      {/* Alertas */}
      {mensaje && <div className="alert alert-success alert-dismissible fade show" role="alert">{mensaje}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}</div>}

      {/* Listado de Médicos */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light text-muted">
              <tr>
                <th>Médico</th>
                <th>Cédula</th>
                <th>Especialidad</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No hay médicos registrados actualmente.
                  </td>
                </tr>
              ) : (
                medicos.map((medico) => (
                  <tr key={medico.id}>
                    <td>
                      <div>
                        <span className="fw-bold text-dark">{medico.usuario?.nombre}</span>
                        <div className="text-muted small">{medico.titulo}</div>
                      </div>
                    </td>
                    <td>{medico.usuario?.cedula}</td>
                    <td>{medico.especialidad?.nombre}</td>
                    <td>
                      <div>
                        <div>{medico.usuario?.correo}</div>
                        <div className="text-muted small">{medico.usuario?.telefono}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${medico.estado ? 'bg-success' : 'bg-danger'}`}>
                        {medico.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill px-3"
                          onClick={() => abrirConfigHorario(medico)}
                        >
                          Horarios
                        </button>
                        {medico.estado && (
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={() => handleDesactivarMedico(medico.id)}
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Médico */}
      {showRegistro && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleRegistrarMedico}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Registrar Nuevo Médico</h5>
                  <button type="button" className="btn-close" onClick={() => setShowRegistro(false)} />
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Nombre completo</label>
                      <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Cédula (10 dígitos)</label>
                      <input type="text" className="form-control" maxLength="10" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Correo electrónico</label>
                      <input type="email" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Contraseña temporal (mín. 8 chars)</label>
                      <input type="password" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Teléfono de contacto</label>
                      <input type="text" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Especialidad</label>
                      <select className="form-select" value={especialidadId} onChange={(e) => setEspecialidadId(e.target.value)} required>
                        <option value="">Selecciona...</option>
                        {especialidades.map(esp => (
                          <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Título profesional (ej. Pediatra — UCE)</label>
                      <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Descripción / Perfil</label>
                      <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowRegistro(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={guardandoMedico}>
                    {guardandoMedico ? 'Guardando...' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Horarios */}
      {configurandoMedico && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleGuardarHorarios}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    Horarios de Atención — Dr. {configurandoMedico.usuario?.nombre}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setConfigurandoMedico(null)} />
                </div>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-4">
                    Asigna las franjas de disponibilidad semanal en las que atiende el médico.
                  </p>

                  <div className="d-flex flex-column gap-2 mb-3">
                    {horarios.map((h, index) => (
                      <div key={index} className="row g-2 align-items-center">
                        <div className="col-md-4">
                          <select
                            className="form-select small"
                            value={h.diaSemana}
                            onChange={(e) => handleFilaHorarioChange(index, 'diaSemana', e.target.value)}
                            required
                          >
                            {diasOpciones.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <input
                            type="time"
                            className="form-control small"
                            value={h.horaInicio}
                            step={1800}
                            onChange={(e) => handleFilaHorarioChange(index, 'horaInicio', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="time"
                            className="form-control small"
                            value={h.horaFin}
                            step={1800}
                            onChange={(e) => handleFilaHorarioChange(index, 'horaFin', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100 rounded-pill btn-sm"
                            onClick={() => handleEliminarFilaHorario(index)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    onClick={handleAgregarFilaHorario}
                  >
                    + Agregar franja horaria
                  </button>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setConfigurandoMedico(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={guardandoHorario}>
                    {guardandoHorario ? 'Guardando...' : 'Guardar Horarios'}
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
