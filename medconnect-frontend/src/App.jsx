// src/App.jsx
// MedConnect — Enrutamiento principal
// Ref: Arquitectura de Software — Sección 2.2.1 | SRS RF-01, RF-02, RNF-08
// Gestiona rutas públicas y protegidas con redirección por rol

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from './components/NavBar';
import Login    from './pages/Login';
import Register from './pages/Register';
import Especialidades from './pages/Especialidades';
import MisCitas       from './pages/MisCitas';
import Agenda         from './pages/AgendaMedico';
import AdminPanel     from './pages/AdminPanel';
import MedicoDetalle  from './pages/MedicoDetalle';
import AgendarCita    from './pages/AgendarCita';

// Crear cliente de TanStack Query para el manejo de estado asíncrono
const queryClient = new QueryClient();

// ── Ruta protegida: redirige a /login si no está autenticado ─────────────────
function RutaProtegida({ children, rolesPermitidos }) {
  const { estaAutenticado, usuario } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    // Redirigir al home del rol correspondiente
    if (usuario?.rol === 'ADMIN')  return <Navigate to="/admin" replace />;
    if (usuario?.rol === 'MEDICO') return <Navigate to="/agenda" replace />;
    return <Navigate to="/especialidades" replace />;
  }

  return children;
}

// ── Ruta pública: redirige al home si ya está autenticado ─────────────────────
function RutaPublica({ children }) {
  const { estaAutenticado, usuario } = useAuth();

  if (estaAutenticado) {
    if (usuario?.rol === 'ADMIN')  return <Navigate to="/admin" replace />;
    if (usuario?.rol === 'MEDICO') return <Navigate to="/agenda" replace />;
    return <Navigate to="/especialidades" replace />;
  }

  return children;
}

// ── Componente raíz con el router ─────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <NavBar />
      <Routes>
        {/* Página raíz: redirige según estado de autenticación */}
        <Route path="/" element={<Navigate to="/especialidades" replace />} />

        {/* Rutas PÚBLICAS (redirigen al home si ya está logueado) */}
        <Route
          path="/login"
          element={
            <RutaPublica>
              <Login />
            </RutaPublica>
          }
        />
        <Route
          path="/register"
          element={
            <RutaPublica>
              <Register />
            </RutaPublica>
          }
        />

        {/* Ruta pública de especialidades (también visible sin login) */}
        <Route path="/especialidades" element={<Especialidades />} />

        {/* Rutas PROTEGIDAS — PACIENTE */}
        <Route
          path="/mis-citas"
          element={
            <RutaProtegida rolesPermitidos={['PACIENTE']}>
              <MisCitas />
            </RutaProtegida>
          }
        />
        <Route
          path="/medicos/:id"
          element={
            <RutaProtegida rolesPermitidos={['PACIENTE']}>
              <MedicoDetalle />
            </RutaProtegida>
          }
        />
        <Route
          path="/medicos/:id/agendar"
          element={
            <RutaProtegida rolesPermitidos={['PACIENTE']}>
              <AgendarCita />
            </RutaProtegida>
          }
        />

        {/* Rutas PROTEGIDAS — MEDICO */}
        <Route
          path="/agenda"
          element={
            <RutaProtegida rolesPermitidos={['MEDICO']}>
              <Agenda />
            </RutaProtegida>
          }
        />

        {/* Rutas PROTEGIDAS — ADMIN */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={['ADMIN']}>
              <AdminPanel />
            </RutaProtegida>
          }
        />

        {/* 404 — ruta no encontrada */}
        <Route
          path="*"
          element={
            <div className="container text-center mt-5">
              <h2>404 — Página no encontrada</h2>
              <a href="/" className="btn btn-primary mt-3">Volver al inicio</a>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
