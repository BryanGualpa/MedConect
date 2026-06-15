// src/pages/Login.jsx
// MedConnect — Página de Inicio de Sesión
// Ref: Arquitectura de Software — Sección 6.1 | SRS RF-02, RNF-08
// Valida con Zod + React Hook Form; consume POST /api/auth/login
// Mensaje de error GENÉRICO — no expone si el correo existe (OWASP)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

// ── Schema de validación Zod ─────────────────────────────────────────────────
const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  contrasena: z
    .string()
    .min(1, 'La contraseña es obligatoria')
});

/**
 * Página de inicio de sesión de MedConnect.
 * - Validación en tiempo real con React Hook Form + Zod (SRS RNF-08, OWASP)
 * - Redirección tras login según rol: PACIENTE→/especialidades | MEDICO→/agenda | ADMIN→/admin
 * - Mensaje de error genérico (no revela si el correo existe)
 */
export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando,      setCargando]      = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(loginSchema) });

  // ── Envío del formulario ───────────────────────────────────────────────────
  async function onSubmit(datos) {
    setErrorServidor('');
    setCargando(true);

    try {
      const res = await authAPI.login({
        correo:     datos.correo,
        contrasena: datos.contrasena
      });

      // Guardar token en memoria para el interceptor de Axios
      window.__medconnect_token__ = res.data.accessToken;

      // Actualizar el contexto global
      login(res.data);

      // Redirigir según rol (HU-02)
      const rol = res.data.usuario?.rol;
      if (rol === 'ADMIN')   return navigate('/admin');
      if (rol === 'MEDICO')  return navigate('/agenda');
      return navigate('/especialidades');

    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        // Bloqueo por intentos — mensaje específico (HU-02 criterio)
        setErrorServidor(
          err.response.data?.mensaje ||
          'Cuenta bloqueada temporalmente. Intenta en 15 minutos.'
        );
      } else {
        // 401 u otro error — mensaje GENÉRICO (OWASP)
        setErrorServidor('Credenciales inválidas. Intente nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4">

          {/* Cabecera */}
          <div className="text-center mb-4">
            <span style={{ fontSize: 40 }}>🏥</span>
            <h1 className="h4 fw-bold mt-2">MedConnect</h1>
            <p className="text-muted small">Conectando pacientes con su salud</p>
          </div>

          <h2 className="h5 mb-3">Iniciar sesión</h2>

          {/* Alerta de error del servidor — mensaje genérico (OWASP) */}
          {errorServidor && (
            <div
              className="alert alert-danger d-flex align-items-center"
              role="alert"
              data-testid="error-servidor"
            >
              <span className="me-2">⚠️</span>
              {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Campo: Correo electrónico */}
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                placeholder="paciente@correo.com"
                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                autoComplete="email"
                data-testid="input-correo"
                {...register('correo')}
              />
              {errors.correo && (
                <div className="invalid-feedback" role="alert" data-testid="error-correo">
                  {errors.correo.message}
                </div>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div className="mb-4">
              <label htmlFor="contrasena" className="form-label">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                autoComplete="current-password"
                data-testid="input-contrasena"
                {...register('contrasena')}
              />
              {errors.contrasena && (
                <div className="invalid-feedback" role="alert">
                  {errors.contrasena.message}
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={cargando}
              data-testid="btn-login"
            >
              {cargando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

          </form>

          {/* Enlace a recuperar contraseña */}
          <p className="text-center mt-3 mb-1">
            <a href="/forgot-password" className="text-muted small">
              ¿Olvidé mi contraseña?
            </a>
          </p>

          {/* Enlace a registro */}
          <hr />
          <p className="text-center mb-0 small">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="fw-bold">
              Regístrate aquí
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
