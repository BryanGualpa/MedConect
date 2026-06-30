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

  const styles = {
    nav: {
      background: 'linear-gradient(135deg, #102a43 0%, #243b53 100%)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.75rem 0'
    },
    brand: {
      fontSize: '1.35rem',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    brandText: {
      fontWeight: '800',
      color: '#ffffff'
    },
    brandSubtext: {
      fontWeight: '400',
      color: '#38bec9'
    },
    navLink: {
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.85)',
      padding: '0.5rem 0.85rem',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    userContainer: {
      background: 'rgba(255, 255, 255, 0.07)',
      padding: '0.35rem 0.9rem',
      borderRadius: '30px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      display: 'flex',
      alignItems: 'center'
    },
    badge: {
      fontSize: '0.7rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: '#38bec9',
      color: '#102a43',
      borderRadius: '20px',
      padding: '0.25rem 0.6rem'
    },
    btnLogout: {
      borderRadius: '30px',
      padding: '0.35rem 1.1rem',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      background: 'transparent',
      color: '#ffffff',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    btnRegister: {
      borderRadius: '30px',
      padding: '0.35rem 1.1rem',
      border: '1px solid #38bec9',
      background: '#38bec9',
      color: '#102a43',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={styles.nav}
      aria-label="Barra de navegación principal"
    >
      <div className="container">
        {/* Logo / marca */}
        <Link className="navbar-brand fw-bold" to="/" style={styles.brand}>
          <span>🏥</span>
          <div>
            <span style={styles.brandText}>Med</span>
            <span style={styles.brandSubtext}>Connect</span>
          </div>
        </Link>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="navbar-toggler border-0"
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
              <Link className="nav-link" style={styles.navLink} to="/especialidades">
                Especialidades
              </Link>
            </li>

            {/* ── Sección PACIENTE ───────────────────────────── */}
            {esPaciente && (
              <li className="nav-item">
                <Link className="nav-link" style={styles.navLink} to="/mis-citas">
                  Mis Citas
                </Link>
              </li>
            )}

            {/* ── Sección MEDICO ─────────────────────────────── */}
            {esMedico && (
              <li className="nav-item">
                <Link className="nav-link" style={styles.navLink} to="/agenda">
                  Mi Agenda
                </Link>
              </li>
            )}

            {/* ── Sección ADMIN ──────────────────────────────── */}
            {esAdmin && (
              <li className="nav-item">
                <Link className="nav-link" style={styles.navLink} to="/admin">
                  Panel Administrativo
                </Link>
              </li>
            )}
          </ul>

          {/* ── Zona de usuario ──────────────────────────────── */}
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {estaAutenticado ? (
              <>
                <li className="nav-item d-flex align-items-center me-2">
                  <div style={styles.userContainer}>
                    <span className="navbar-text text-white small p-0">
                      Hola, <strong className="text-white">{usuario?.nombre?.split(' ')[0]}</strong>
                    </span>
                    <span className="badge ms-2" style={styles.badge}>{usuario?.rol}</span>
                  </div>
                </li>
                <li className="nav-item">
                  <button
                    className="btn"
                    style={styles.btnLogout}
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
                  <Link className="nav-link" style={styles.navLink} to="/login">
                    Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-sm" style={styles.btnRegister} to="/register">
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
