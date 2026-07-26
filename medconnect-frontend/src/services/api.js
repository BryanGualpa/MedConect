// src/services/api.js
// MedConnect — Cliente HTTP (Axios)
// Ref: Arquitectura de Software — Sección 2.2.1 | SRS RNF-08

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 5000 // 5 segundos máximo (SRS RNF-01)
});

/**
 * Interceptor de solicitud: agrega el token JWT en cada petición autenticada.
 * Authorization: Bearer <token>
 */
api.interceptors.request.use((config) => {
  // El token se obtiene del store en memoria (no localStorage — OWASP)
  const token = window.__medconnect_token__;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de respuesta: manejo centralizado de errores HTTP.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado — limpiar sesión
      window.__medconnect_token__ = null;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── ENDPOINTS DE LA API ──────────────────────────────────────────────────────

// Autenticación (RF-01, RF-02)
export const authAPI = {
  register: (datos) => api.post('/auth/register', datos),
  login:    (datos) => api.post('/auth/login',    datos)
};

// Especialidades (RF-03)
export const especialidadesAPI = {
  getAll:   (q) => api.get('/especialidades', { params: { q } }),
  getById:  (id) => api.get(`/especialidades/${id}`)
};

// Médicos (RF-04, RF-05, RF-08)
export const medicosAPI = {
  getMe:           ()             => api.get('/medicos/me'),
  getById:         (id)           => api.get(`/medicos/${id}`),
  getDisponibilidad: (id, fecha)  => api.get(`/medicos/${id}/disponibilidad`, { params: { fecha } }),
  getAgenda:       (id, semana)   => api.get(`/medicos/${id}/agenda`, { params: { semana } })
};

// Citas (RF-06, RF-07, RF-10)
export const citasAPI = {
  create:      (datos) => api.post('/citas',           datos),
  update:      (id, datos) => api.put(`/citas/${id}`,  datos),
  cancel:      (id)    => api.delete(`/citas/${id}`),
  getHistorial: (estado) => api.get('/citas/historial', { params: { estado } })
};

// Admin (RF-09)
export const adminAPI = {
  getMedicos:    ()          => api.get('/admin/medicos'),
  createMedico:  (datos)     => api.post('/admin/medicos',          datos),
  updateMedico:  (id, datos) => api.put(`/admin/medicos/${id}`,     datos),
  setHorario:    (id, datos) => api.post(`/admin/medicos/${id}/horarios`, datos),
  deactivate:    (id)        => api.patch(`/admin/medicos/${id}/desactivar`)
};

export default api;
