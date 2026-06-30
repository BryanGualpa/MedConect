// src/pages/Register.jsx
// MedConnect — Registro de paciente (tema pastel)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const registerSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Nombre demasiado largo'),
  cedula: z.string().length(10, '10 dígitos exactos').regex(/^\d{10}$/, 'Solo números'),
  correo: z.string().min(1, 'Obligatorio').email('Correo inválido'),
  contrasena: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayúscula')
    .regex(/[0-9]/, 'Al menos un número'),
  telefono: z
    .string()
    .min(7, 'Teléfono inválido')
    .max(15, 'Demasiado largo')
    .regex(/^\d+$/, 'Solo números')
});

export default function Register() {
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState('');
  const [exitoso, setExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  async function onSubmit(datos) {
    setErrorServidor('');
    setCargando(true);
    try {
      await authAPI.register(datos);
      setExitoso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setErrorServidor('Este correo ya está registrado. ¿Ya tienes cuenta? Inicia sesión.');
      } else if (status === 400) {
        const msgs = err.response.data?.errores?.map((e) => e.msg).join(', ');
        setErrorServidor(msgs || 'Datos inválidos. Revisa el formulario.');
      } else {
        setErrorServidor('Error al registrarse. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  }

  if (exitoso) {
    return (
      <div className="mc-auth-page">
        <div className="mc-auth-card text-center">
          <div className="mc-auth-body py-5">
            <div style={{ fontSize: '3.5rem' }}>✨</div>
            <h2 className="h4 fw-bold mt-3">¡Registro exitoso!</h2>
            <p className="mc-text-muted">Redirigiendo al inicio de sesión…</p>
          </div>
        </div>
      </div>
    );
  }

  const campos = [
    ['nombre', 'Nombre completo', 'text', 'Juan Pérez'],
    ['cedula', 'Cédula ecuatoriana', 'text', '1712345678'],
    ['correo', 'Correo electrónico', 'email', 'juan@correo.com'],
    ['contrasena', 'Contraseña', 'password', '••••••••'],
    ['telefono', 'Teléfono', 'tel', '0991234567']
  ];

  return (
    <div className="mc-auth-page">
      <div className="mc-auth-card mc-auth-card-wide">
        <div className="mc-auth-header">
          <div className="mc-auth-logo" aria-hidden="true">🏥</div>
          <h1 className="h4 fw-bold mb-1">Crear cuenta</h1>
          <p className="mc-text-muted small mb-0">Regístrate como paciente en MedConnect</p>
        </div>

        <div className="mc-auth-body">
          {errorServidor && (
            <div className="mc-alert mc-alert-danger" role="alert" data-testid="error-servidor">
              ⚠️ {errorServidor}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {campos.map(([name, label, type, placeholder]) => (
              <div className="mb-3" key={name}>
                <label htmlFor={name} className="mc-form-label">{label}</label>
                <input
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  maxLength={name === 'cedula' ? 10 : undefined}
                  className={`form-control mc-input w-100 ${errors[name] ? 'is-invalid' : ''}`}
                  data-testid={`input-${name}`}
                  {...register(name)}
                />
                {errors[name] && (
                  <div className="invalid-feedback" data-testid={`error-${name}`}>
                    {errors[name].message}
                  </div>
                )}
                {name === 'cedula' && <div className="form-text small">10 dígitos, sin guiones</div>}
                {name === 'contrasena' && (
                  <div className="form-text small">Mín. 8 caracteres, 1 mayúscula y 1 número</div>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="mc-btn mc-btn-primary mc-btn-block mt-2"
              disabled={cargando}
              data-testid="btn-register"
            >
              {cargando ? 'Registrando…' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 small">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="mc-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
