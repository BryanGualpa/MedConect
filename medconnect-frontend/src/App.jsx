// src/App.jsx
// MedConnect — Enrutamiento principal
// SCRUM-41 | HU-04 | Rutas de especialidades, perfil médico y agendamiento
// Ref: Arquitectura de Software — Sección 2.2.1 | SRS RF-03, RF-04, RF-06
// Autor: Cristian Bayas | Sprint 2

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Especialidades from './pages/Especialidades';
import MedicoDetalle  from './pages/MedicoDetalle';
import AgendarCita    from './pages/AgendarCita';
import AdminPanel     from './pages/AdminPanel';

function RutaProtegida({ children, rolesPermitidos }) {
  const { estaAutenticado, usuario } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    if (usuario?.rol === 'ADMIN')  return <Navigate to="/admin" replace />;
    return <Navigate to="/especialidades" replace />;
  }

  return children;
}

function RutaPublica({ children }) {
  const { estaAutenticado, usuario } = useAuth();

  if (estaAutenticado) {
    if (usuario?.rol === 'ADMIN')  return <Navigate to="/admin" replace />;
    return <Navigate to="/especialidades" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <div className="mc-app-shell">
      <NavBar />
      <main className="mc-main">
        <Routes>
          <Route path="/" element={<Navigate to="/especialidades" replace />} />

          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
          <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />

          <Route path="/especialidades" element={<Especialidades />} />

          <Route path="/medicos/:id" element={
            <RutaProtegida rolesPermitidos={['PACIENTE']}>
              <MedicoDetalle />
            </RutaProtegida>
          } />
          <Route path="/medicos/:id/agendar" element={
            <RutaProtegida rolesPermitidos={['PACIENTE']}>
              <AgendarCita />
            </RutaProtegida>
          } />

          <Route path="/admin" element={
            <RutaProtegida rolesPermitidos={['ADMIN']}>
              <AdminPanel />
            </RutaProtegida>
          } />

          <Route path="*" element={
            <div className="container mc-404">
              <h2 className="mc-page-title">404 — Página no encontrada</h2>
              <a href="/" className="mc-btn mc-btn-primary">Volver al inicio</a>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
