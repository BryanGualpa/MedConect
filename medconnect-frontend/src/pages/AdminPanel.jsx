// src/pages/AdminPanel.jsx
// MedConnect — Panel administrativo de médicos
// Ref: SRS RF-09

/**
 * src/pages/AdminPanel.jsx
 * MedConnect — Panel de Administración (RF-09 | SCRUM-57)
 * Interfaz administrativa para gestión de médicos, especialidades y asignación de horarios.
 */
import { adminAPI, especialidadesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const formInicial = {
  nombre: '',
  cedula: '',
  correo: '',
  contrasena: '',
  telefono: '',
  titulo: '',
  descripcion: '',
  especialidadId: ''
};

export default function AdminPanel() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [medicoHorarios, setMedicoHorarios] = useState(null);
  const [horarios, setHorarios] = useState([
    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
  ]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setError('');
    try {
      const [resMedicos, resEsp] = await Promise.all([
        adminAPI.getMedicos(),
        especialidadesAPI.getAll('')
      ]);
      setMedicos(resMedicos.data.medicos || []);
      setEspecialidades(resEsp.data.especialidades || []);
    } catch (err) {
      console.error('Error cargando panel admin:', err);
      setError('No se pudo cargar el panel administrativo.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCrearMedico(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setMensaje('');
    try {
      await adminAPI.createMedico({
        ...form,
        especialidadId: parseInt(form.especialidadId, 10)
      });
      setMensaje('Médico registrado exitosamente.');
      setForm(formInicial);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar el médico.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleDesactivar(id) {
    if (!window.confirm('¿Desactivar este médico?')) return;
    try {
      await adminAPI.deactivate(id);
      setMensaje('Médico desactivado.');
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al desactivar el médico.');
    }
  }

  function agregarHorario() {
    setHorarios([...horarios, { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }]);
  }

  function actualizarHorario(index, campo, valor) {
    const nuevos = [...horarios];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setHorarios(nuevos);
  }

  async function guardarHorarios(e) {
    e.preventDefault();
    try {
      await adminAPI.setHorario(medicoHorarios.id, { horarios });
      setMensaje('Horarios actualizados.');
      setMedicoHorarios(null);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar horarios.');
    }
  }

  return (
    <div className="container mc-page">
      <PageHeader
        align="left"
        eyebrow="Administración"
        title="Panel Administrativo"
        subtitle="Gestión de médicos y horarios del sistema."
      />

      <div className="mc-hint">
        <span className="mc-hint-icon">⚙️</span>
        <span>Registra médicos en el formulario izquierdo. Asigna horarios y gestiona el estado desde la tabla.</span>
      </div>

      {mensaje && <div className="mc-alert mc-alert-success">{mensaje}</div>}
      {error && <div className="mc-alert mc-alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="mc-card mc-card-celeste h-100">
            <div className="mc-card-body">
              <h2 className="h5 fw-bold mb-3">Registrar médico</h2>
              <form onSubmit={handleCrearMedico}>
                {[
                  ['nombre', 'Nombre completo', 'text'],
                  ['cedula', 'Cédula (10 dígitos)', 'text'],
                  ['correo', 'Correo electrónico', 'email'],
                  ['contrasena', 'Contraseña', 'password'],
                  ['telefono', 'Teléfono', 'text'],
                  ['titulo', 'Título profesional', 'text']
                ].map(([name, label, type]) => (
                  <div className="mb-2" key={name}>
                    <label className="mc-form-label">{label}</label>
                    <input
                      type={type}
                      name={name}
                      className="form-control mc-input w-100"
                      value={form[name]}
                      onChange={handleChange}
                      required={name !== 'descripcion'}
                    />
                  </div>
                ))}
                <div className="mb-2">
                  <label className="mc-form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control mc-input w-100"
                    rows={2}
                    value={form.descripcion}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="mc-form-label">Especialidad</label>
                  <select
                    name="especialidadId"
                    className="form-select mc-input w-100"
                    value={form.especialidadId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="mc-btn mc-btn-primary mc-btn-block" disabled={enviando}>
                  {enviando ? 'Registrando...' : 'Registrar médico'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="mc-card mc-card-surface h-100">
            <div className="mc-card-body">
              <h2 className="h5 fw-bold mb-3">Médicos registrados</h2>
              {loading ? (
                <LoadingSpinner label="Cargando médicos..." />
              ) : medicos.length === 0 ? (
                <div className="mc-empty">
                  <div className="mc-empty-icon">👨‍⚕️</div>
                  <p className="mc-text-muted mb-0">No hay médicos registrados.</p>
                </div>
              ) : (
                <div className="mc-table-wrap">
                  <table className="mc-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Especialidad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicos.map((m) => (
                        <tr key={m.id}>
                          <td>{m.usuario?.nombre}</td>
                          <td>{m.especialidad?.nombre}</td>
                          <td>
                            <span className={`mc-badge ${m.estado ? 'mc-badge-success' : 'mc-badge-neutral'}`}>
                              {m.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <button
                                type="button"
                                className="mc-btn mc-btn-outline mc-btn-sm"
                                onClick={() => setMedicoHorarios(m)}
                              >
                                Horarios
                              </button>
                              {m.estado && (
                                <button
                                  type="button"
                                  className="mc-btn mc-btn-outline-danger mc-btn-sm"
                                  onClick={() => handleDesactivar(m.id)}
                                >
                                  Desactivar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {medicoHorarios && (
        <div className="mc-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mc-modal mc-modal-lg">
            <form onSubmit={guardarHorarios}>
              <div className="mc-modal-header">
                <h5 className="mc-modal-title">
                  Horarios — {medicoHorarios.usuario?.nombre}
                </h5>
                <button type="button" className="mc-btn-close" onClick={() => setMedicoHorarios(null)}>
                  ✕
                </button>
              </div>
              <div className="mc-modal-body">
                {horarios.map((h, i) => (
                  <div className="row g-2 mb-2 align-items-end" key={i}>
                    <div className="col-12 col-md-4">
                      <label className="mc-form-label">Día</label>
                      <select
                        className="form-select mc-input w-100"
                        value={h.diaSemana}
                        onChange={(e) => actualizarHorario(i, 'diaSemana', e.target.value)}
                      >
                        {DIAS_SEMANA.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="mc-form-label">Inicio</label>
                      <input
                        type="time"
                        className="form-control mc-input w-100"
                        value={h.horaInicio}
                        onChange={(e) => actualizarHorario(i, 'horaInicio', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="mc-form-label">Fin</label>
                      <input
                        type="time"
                        className="form-control mc-input w-100"
                        value={h.horaFin}
                        onChange={(e) => actualizarHorario(i, 'horaFin', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="mc-link border-0 bg-transparent p-0 small" onClick={agregarHorario}>
                  + Agregar franja horaria
                </button>
              </div>
              <div className="mc-modal-footer">
                <button type="button" className="mc-btn mc-btn-ghost" onClick={() => setMedicoHorarios(null)}>
                  Cerrar
                </button>
                <button type="submit" className="mc-btn mc-btn-primary">
                  Guardar horarios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
