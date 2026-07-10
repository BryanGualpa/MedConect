// src/tests/agendarCita.test.jsx
// MedConnect — Pruebas RTL: Agendar Cita (Frontend)
// SCRUM-42 | HU-04 | Subtarea: Pruebas RTL TC-F07
// TC-F07: Flujo de agendamiento con selección de horario y confirmación
// Autor: Cristian Bayas | Sprint 2

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AgendarCita from '../pages/AgendarCita';
import { medicosAPI, citasAPI } from '../services/api';

jest.mock('../services/api');

function renderAgendarCita() {
  return render(
    <MemoryRouter initialEntries={['/medicos/1/agendar']}>
      <Routes>
        <Route path="/medicos/:id/agendar" element={<AgendarCita />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AgendarCita — Flujo de agendamiento (HU-04)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    medicosAPI.getById.mockResolvedValue({
      data: {
        medico: {
          id: 1,
          nombre: 'Dr. Mendoza',
          especialidad: { nombre: 'Cardiología' }
        }
      }
    });
    medicosAPI.getDisponibilidad.mockResolvedValue({
      data: { slots: [{ hora: '09:00', disponible: true }, { hora: '09:30', disponible: false }] }
    });
  });

  // TC-F07: Muestra formulario de agendamiento con horarios disponibles
  test('TC-F07: Renderiza formulario y permite seleccionar horario disponible', async () => {
    renderAgendarCita();

    await waitFor(() => {
      expect(screen.getByText('Agendar cita')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '09:00' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('option', { name: '09:00' }));
    expect(screen.getByRole('button', { name: /Confirmar cita/i })).not.toBeDisabled();
  });

  test('TC-F07b: Muestra pantalla de éxito tras agendar correctamente', async () => {
    citasAPI.create.mockResolvedValue({
      data: {
        cita: {
          numeroCita: 'CIT-2026-123456',
          medico: 'Dr. Mendoza',
          especialidad: 'Cardiología',
          fecha: '15/07/2026',
          hora: '09:00',
          estado: 'CONFIRMADA'
        }
      }
    });

    renderAgendarCita();

    await waitFor(() => screen.getByRole('option', { name: '09:00' }));
    await userEvent.click(screen.getByRole('option', { name: '09:00' }));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar cita/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cita agendada/i)).toBeInTheDocument();
      expect(screen.getByText('CIT-2026-123456')).toBeInTheDocument();
    });
  });
});
