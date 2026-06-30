// src/pages/Login.jsx
// MedConnect — Inicio de sesión (tema pastel)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const loginSchema = z.object({
  correo: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria')
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(datos) {
    setErrorServidor('');
    setCargando(true);
    try {
      const res = await authAPI.login({
        correo: datos.correo,
        contrasena: datos.contrasena
      });
      window.__medconnect_token__ = res.data.accessToken;
      login(res.data);
      const rol = res.data.usuario?.rol;
      if (rol === 'ADMIN') return navigate('/admin');
      if (rol === 'MEDICO') return navigate('/agenda');
      return navigate('/especialidades');
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setErrorServidor(
          err.response.data?.mensaje ||
          'Cuenta bloqueada temporalmente. Intenta en 15 minutos.'
        );
      } else {
        setErrorServidor('Credenciales inválidas. Intente nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-card">
        <div className="mc-auth-header">
          <div className="mc-auth-logo" aria-hidden="true">🏥</div>
          <h1 className="h4 fw-bold mb-1">MedConnect</h1>
          <p className="mc-text-muted small mb-0">Conectando pacientes con su salud</p>
        </div>

        <div className="mc-auth-body">
          <h2 className="h5 fw-bold mb-3">Iniciar sesión</h2>

          {errorServidor && (
            <div className="mc-alert mc-alert-danger" role="alert" data-testid="error-servidor">
              ⚠️ {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label htmlFor="correo" className="mc-form-label">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="paciente@correo.com"
                className={`form-control mc-input w-100 ${errors.correo ? 'is-invalid' : ''}`}
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

            <div className="mb-4">
              <label htmlFor="contrasena" className="mc-form-label">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                className={`form-control mc-input w-100 ${errors.contrasena ? 'is-invalid' : ''}`}
                autoComplete="current-password"
                data-testid="input-contrasena"
                {...register('contrasena')}
              />
              {errors.contrasena && (
                <div className="invalid-feedback">{errors.contrasena.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="mc-btn mc-btn-primary mc-btn-block"
              disabled={cargando}
              data-testid="btn-login"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center mt-4 mb-2 small">
            <Link to="/register" className="mc-link">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
