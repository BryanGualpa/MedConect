// src/tests/misCitas.test.jsx
// MedConnect — Pruebas RTL: Mis Citas (Frontend)
// SCRUM-50 | HU-06 | Subtarea: Pruebas RTL TC-F08
// TC-F08: Reagendar y cancelar citas desde el perfil del paciente
// Autor: Cristian Bayas | Sprint 3

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MisCitas from '../pages/MisCitas';
import { citasAPI, medicosAPI } from '../services/api';

jest.mock('../services/api');

const citaMock = {
  id: 1,
  numeroCita: 'CIT-2026-111111',
  medicoId: 3,
  fecha: '2026-07-20T00:00:00.000Z',
  hora: '10:00',
  estado: 'CONFIRMADA',
  medico: {
    usuario: { nombre: 'Dr. Ramírez' },
    especialidad: { nombre: 'Cardiología' }
  }
};

function renderMisCitas() {
  return render(
    <BrowserRouter>
      <MisCitas />
    </BrowserRouter>
  );
}

describe('MisCitas — Reagendar y cancelar (HU-06)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    citasAPI.getHistorial.mockResolvedValue({ data: { citas: [citaMock] } });
    window.confirm = jest.fn(() => true);
  });

  // TC-F08: Muestra listado de citas del paciente
  test('TC-F08: Renderiza listado de citas con filtros', async () => {
    renderMisCitas();

    await waitFor(() => {
      expect(screen.getByText('Mis Citas')).toBeInTheDocument();
      expect(screen.getByText('Dr. Ramírez')).toBeInTheDocument();
    });
  });

  // TC-F08: Permite cancelar una cita confirmada
  test('TC-F08b: Cancela cita confirmada al confirmar diálogo', async () => {
    citasAPI.cancel.mockResolvedValue({ data: { mensaje: 'Cita cancelada exitosamente.' } });

    renderMisCitas();

    await waitFor(() => screen.getByText('Cancelar'));
    await userEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(citasAPI.cancel).toHaveBeenCalledWith(1);
    });
  });

  // TC-F08: Abre modal de reagendamiento con horarios disponibles
  test('TC-F08c: Abre modal de reagendamiento con horarios del médico', async () => {
    medicosAPI.getDisponibilidad.mockResolvedValue({
      data: { slots: [{ hora: '11:00', disponible: true }] }
    });

    renderMisCitas();

    await waitFor(() => screen.getByText('Reagendar'));
    await userEvent.click(screen.getByText('Reagendar'));

    await waitFor(() => {
      expect(screen.getByText('Reagendar cita')).toBeInTheDocument();
    });
  });
});
