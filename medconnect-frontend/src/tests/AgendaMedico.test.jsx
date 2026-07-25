/**
 * src/tests/AgendaMedico.test.jsx
 * MedConnect — Pruebas RTL: Agenda Médica (RF-08 | SCRUM-53)
 * Cobertura de pruebas en el renderizado y navegación de la agenda del médico.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgendaMedico from '../pages/AgendaMedico';
import { AuthContext } from '../context/AuthContext';

const mockUsuarioMedico = {
  id: 2,
  nombre: 'Dr. Roberto Gómez',
  correo: 'rgomez@medconnect.ec',
  rol: 'MEDICO',
  medicoId: 1
};

const renderWithContext = (ui, authValue = { usuario: mockUsuarioMedico }) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('AgendaMedico Component (RF-08 | SCRUM-53)', () => {
  test('renderiza el título de la agenda médica', () => {
    renderWithContext(<AgendaMedico />);
    expect(screen.getByText(/Agenda Médica/i)).toBeInTheDocument();
  });

  test('muestra mensaje si no se identifica el perfil del médico', () => {
    renderWithContext(<AgendaMedico />, { usuario: null });
    expect(screen.getByText(/No se pudo identificar tu perfil médico/i)).toBeInTheDocument();
  });
});
