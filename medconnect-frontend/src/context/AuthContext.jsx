// src/context/AuthContext.jsx
// MedConnect — Contexto Global de Autenticación
// Ref: Arquitectura de Software — Sección 2.2.1 | SRS RF-02

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Proveedor del contexto de autenticación.
 * El token JWT se guarda en memoria (NO en localStorage — OWASP / SRS RNF-08).
 * Se envía en cada petición autenticada como: Authorization: Bearer <token>
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Inicia sesión: guarda el token y los datos del usuario en memoria.
   * @param {{ accessToken: string, usuario: { id, nombre, correo, rol } }} data
   */
  function login(data) {
    setToken(data.accessToken);
    setUsuario(data.usuario);
    window.__medconnect_token__ = data.accessToken;
  }

  /**
   * Cierra sesión: limpia el estado global.
   * La sesión expira automáticamente a los 30 minutos de inactividad (SRS RNF-01).
   */
  function logout() {
    setToken(null);
    setUsuario(null);
    window.__medconnect_token__ = null;
  }

  const estaAutenticado = !!token;
  const esPaciente      = usuario?.rol === 'PACIENTE';
  const esMedico        = usuario?.rol === 'MEDICO';
  const esAdmin         = usuario?.rol === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      login,
      logout,
      estaAutenticado,
      esPaciente,
      esMedico,
      esAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
