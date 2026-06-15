// src/index.js
// MedConnect — Punto de entrada de la aplicación React
// Ref: Arquitectura de Software — Sección 2.2.1

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
