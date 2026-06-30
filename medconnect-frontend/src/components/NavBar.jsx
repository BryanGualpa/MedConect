// src/components/NavBar.jsx
// MedConnect — Barra de Navegación Principal (tema pastel responsive)

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { usuario, estaAutenticado, esPaciente, esMedico, esAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
    setMenuAbierto(false);
  }

  function navClass(path) {
    return `nav-link mc-nav-link ${location.pathname === path ? 'active' : ''}`;
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <nav className="mc-navbar" aria-label="Barra de navegación principal">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <Link className="mc-brand" to="/" onClick={cerrarMenu}>
            <div className="mc-brand-icon" aria-hidden="true">🏥</div>
            <div className="mc-brand-text">
              Med<span>Connect</span>
            </div>
          </Link>

          <button
            type="button"
            className="mc-nav-toggle d-lg-none"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`${menuAbierto ? 'd-block' : 'd-none'} d-lg-flex flex-lg-row flex-column align-items-lg-center w-100 w-lg-auto mc-nav-menu`}>
            <ul className="navbar-nav me-lg-auto mb-2 mb-lg-0 flex-row flex-wrap gap-1">
              <li className="nav-item">
                <Link className={navClass('/especialidades')} to="/especialidades" onClick={cerrarMenu}>
                  Especialidades
                </Link>
              </li>
              {esPaciente && (
                <li className="nav-item">
                  <Link className={navClass('/mis-citas')} to="/mis-citas" onClick={cerrarMenu}>
                    Mis Citas
                  </Link>
                </li>
              )}
              {esMedico && (
                <li className="nav-item">
                  <Link className={navClass('/agenda')} to="/agenda" onClick={cerrarMenu}>
                    Mi Agenda
                  </Link>
                </li>
              )}
              {esAdmin && (
                <li className="nav-item">
                  <Link className={navClass('/admin')} to="/admin" onClick={cerrarMenu}>
                    Panel Admin
                  </Link>
                </li>
              )}
            </ul>

            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-2 mc-nav-actions">
              {estaAutenticado ? (
                <>
                  <li className="nav-item">
                    <div className="mc-user-chip">
                      <span>Hola, <strong>{usuario?.nombre?.split(' ')[0]}</strong></span>
                      <span className="mc-role-badge">{usuario?.rol}</span>
                    </div>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="mc-btn mc-btn-ghost mc-btn-sm"
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
                    <Link className={navClass('/login')} to="/login" onClick={cerrarMenu}>
                      Iniciar sesión
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="mc-btn mc-btn-primary mc-btn-sm" to="/register" onClick={cerrarMenu}>
                      Registrarse
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
