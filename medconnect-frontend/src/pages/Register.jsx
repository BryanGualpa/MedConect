// src/pages/Register.jsx
// MedConnect — Página de Registro de Paciente
// Ref: Arquitectura de Software — Sección 6.1 | SRS RF-01, RNF-08
// Valida con Zod + React Hook Form; consume POST /api/auth/register

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

// ── Schema de validación Zod (SRS RF-01, RNF-08) ────────────────────────────
const registerSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),

  cedula: z
    .string()
    .length(10, 'La cédula debe tener exactamente 10 dígitos')
    .regex(/^\d{10}$/, 'La cédula solo debe contener números'),

  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),

  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),

  telefono: z
    .string()
    .min(7, 'Ingresa un número de teléfono válido')
    .max(15, 'El teléfono es demasiado largo')
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
});

/**
 * Página de registro de nuevos pacientes en MedConnect.
 * Campos: nombre, cédula (10 dígitos), correo, contraseña, teléfono.
 * Validación en tiempo real con Zod + React Hook Form (SRS RNF-08, OWASP).
 */
export default function Register() {
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [exitoso,       setExitoso]       = useState(false);
  const [cargando,      setCargando]      = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(registerSchema) });

  // ── Envío del formulario ───────────────────────────────────────────────────
  async function onSubmit(datos) {
    setErrorServidor('');
    setCargando(true);

    try {
      await authAPI.register(datos);
      setExitoso(true);
      // Redirigir al login tras 2 segundos
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setErrorServidor(
          'Este correo ya está registrado. ¿Ya tienes cuenta? Inicia sesión.'
        );
      } else if (status === 400) {
        const msgs = err.response.data?.errores?.map((e) => e.msg).join(', ');
        setErrorServidor(msgs || 'Datos inválidos. Revisa el formulario.');
      } else {
        setErrorServidor('Error al registrarse. Intenta nuevamente más tarde.');
      }
    } finally {
      setCargando(false);
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (exitoso) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <span style={{ fontSize: 64 }}>✅</span>
          <h2 className="mt-3 fw-bold">¡Registro exitoso!</h2>
          <p className="text-muted">Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    );
  }

  // ── Render del formulario ──────────────────────────────────────────────────
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="card shadow-sm w-100" style={{ maxWidth: 480 }}>
        <div className="card-body p-4">

          {/* Cabecera */}
          <div className="text-center mb-4">
            <span style={{ fontSize: 40 }}>🏥</span>
            <h1 className="h4 fw-bold mt-2">MedConnect</h1>
            <p className="text-muted small">Crea tu cuenta de paciente</p>
          </div>

          <h2 className="h5 mb-3">Crear cuenta</h2>

          {/* Alerta de error del servidor */}
          {errorServidor && (
            <div
              className="alert alert-danger"
              role="alert"
              data-testid="error-servidor"
            >
              ⚠️ {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Campo: Nombre completo */}
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                autoComplete="name"
                data-testid="input-nombre"
                {...register('nombre')}
              />
              {errors.nombre && (
                <div className="invalid-feedback" data-testid="error-nombre">
                  {errors.nombre.message}
                </div>
              )}
            </div>

            {/* Campo: Cédula ecuatoriana */}
            <div className="mb-3">
              <label htmlFor="cedula" className="form-label">
                Cédula ecuatoriana
              </label>
              <input
                id="cedula"
                type="text"
                placeholder="1712345678"
                maxLength={10}
                className={`form-control ${errors.cedula ? 'is-invalid' : ''}`}
                data-testid="input-cedula"
                {...register('cedula')}
              />
              {errors.cedula && (
                <div className="invalid-feedback" data-testid="error-cedula">
                  {errors.cedula.message}
                </div>
              )}
              <div className="form-text">10 dígitos, sin guiones</div>
            </div>

            {/* Campo: Correo electrónico */}
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                placeholder="juan@correo.com"
                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                autoComplete="email"
                data-testid="input-correo"
                {...register('correo')}
              />
              {errors.correo && (
                <div className="invalid-feedback" data-testid="error-correo">
                  {errors.correo.message}
                </div>
              )}
            </div>

            {/* Campo: Contraseña */}
            <div className="mb-3">
              <label htmlFor="contrasena" className="form-label">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                autoComplete="new-password"
                data-testid="input-contrasena"
                {...register('contrasena')}
              />
              {errors.contrasena && (
                <div className="invalid-feedback" data-testid="error-contrasena">
                  {errors.contrasena.message}
                </div>
              )}
              <div className="form-text">
                Mín. 8 caracteres, 1 mayúscula y 1 número
              </div>
            </div>

            {/* Campo: Teléfono */}
            <div className="mb-4">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                placeholder="0991234567"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                autoComplete="tel"
                data-testid="input-telefono"
                {...register('telefono')}
              />
              {errors.telefono && (
                <div className="invalid-feedback" data-testid="error-telefono">
                  {errors.telefono.message}
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={cargando}
              data-testid="btn-register"
            >
              {cargando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Registrando…
                </>
              ) : (
                'Registrarse'
              )}
            </button>

          </form>

          {/* Enlace a login */}
          <hr />
          <p className="text-center mb-0 small">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="fw-bold">
              Inicia sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
