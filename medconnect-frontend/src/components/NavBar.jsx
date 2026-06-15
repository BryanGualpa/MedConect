// src/components/NavBar.jsx
// MedConnect — Barra de Navegación Principal
// Ref: Arquitectura de Software — Sección 6 | SRS RF-02, RNF-04
// Muestra enlaces según el rol del usuario (AuthContext)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Barra de navegación responsiva (Bootstrap 5).
 * Adapta los enlaces visibles según el rol del usuario autenticado:
 *   - PACIENTE: Especialidades, Mis Citas
 *   - MEDICO:   Mi Agenda
 *   - ADMIN:    Panel Administrativo
 *   - Sin sesión: Login, Registro
 */
export default function NavBar() {
  const { usuario, estaAutenticado, esPaciente, esMedico, esAdmin, logout } =
    useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm"
      aria-label="Barra de navegación principal"
    >
      <div className="container">
        {/* Logo / marca */}
        <Link className="navbar-brand fw-bold" to="/">
          🏥 MedConnect
        </Link>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Menú colapsable */}
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* ── Enlace público ─────────────────────────────── */}
            <li className="nav-item">
              <Link className="nav-link" to="/especialidades">
                Especialidades
              </Link>
            </li>

            {/* ── Sección PACIENTE ───────────────────────────── */}
            {esPaciente && (
              <li className="nav-item">
                <Link className="nav-link" to="/mis-citas">
                  Mis Citas
                </Link>
              </li>
            )}

            {/* ── Sección MEDICO ─────────────────────────────── */}
            {esMedico && (
              <li className="nav-item">
                <Link className="nav-link" to="/agenda">
                  Mi Agenda
                </Link>
              </li>
            )}

            {/* ── Sección ADMIN ──────────────────────────────── */}
            {esAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Panel Administrativo
                </Link>
              </li>
            )}
          </ul>

          {/* ── Zona de usuario ──────────────────────────────── */}
          <ul className="navbar-nav ms-auto">
            {estaAutenticado ? (
              <>
                <li className="nav-item d-flex align-items-center me-2">
                  <span className="navbar-text text-white-50 small">
                    Hola, <strong className="text-white">{usuario?.nombre?.split(' ')[0]}</strong>
                    {' '}
                    <span className="badge bg-secondary ms-1">{usuario?.rol}</span>
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                    data-testid="btn-logout"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm ms-2" to="/register">
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
