// src/tests/especialidades.test.jsx
// MedConnect — Pruebas RTL: Especialidades (Frontend)
// SCRUM-38 | HU-03 | Subtarea: Pruebas RTL TC-F04, TC-F05, TC-F06
// TC-F04: Renderiza catálogo | TC-F05: Filtra en tiempo real | TC-F06: Muestra médicos
// Autor: Cristian Bayas | Sprint 2

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Especialidades from '../pages/Especialidades';
import { especialidadesAPI } from '../services/api';

jest.mock('../services/api');

function renderEspecialidades() {
  return render(
    <BrowserRouter>
      <Especialidades />
    </BrowserRouter>
  );
}

describe('Especialidades — Catálogo (HU-03)', () => {
  beforeEach(() => jest.clearAllMocks());

  // TC-F04: Renderiza el catálogo de especialidades
  test('TC-F04: Renderiza el catálogo de especialidades con título', async () => {
    especialidadesAPI.getAll.mockResolvedValue({
      data: { especialidades: [{ id: 1, nombre: 'Cardiología', totalMedicos: 3, descripcion: '' }] }
    });

    renderEspecialidades();

    await waitFor(() => {
      expect(screen.getByText('Especialidades Médicas')).toBeInTheDocument();
    });
    expect(screen.getByText('Cardiología')).toBeInTheDocument();
  });

  // TC-F05: Filtra especialidades en tiempo real al escribir
  test('TC-F05: Filtra especialidades al escribir en el buscador', async () => {
    especialidadesAPI.getAll.mockResolvedValue({ data: { especialidades: [] } });

    renderEspecialidades();
    const input = screen.getByPlaceholderText(/Buscar especialidad/i);
    await userEvent.type(input, 'cardio');

    await waitFor(() => {
      expect(especialidadesAPI.getAll).toHaveBeenCalledWith('cardio');
    }, { timeout: 1000 });
  });

  // TC-F06: Muestra médicos al seleccionar una especialidad
  test('TC-F06: Muestra médicos al seleccionar una especialidad', async () => {
    especialidadesAPI.getAll.mockResolvedValue({
      data: { especialidades: [{ id: 2, nombre: 'Pediatría', totalMedicos: 1, descripcion: '' }] }
    });
    especialidadesAPI.getById.mockResolvedValue({
      data: {
        especialidad: {
          medicos: [{ id: 5, titulo: 'Dr.', descripcion: 'Pediatra', usuario: { nombre: 'Ana Torres' } }]
        }
      }
    });

    renderEspecialidades();

    await waitFor(() => screen.getByText('Pediatría'));
    await userEvent.click(screen.getByText('Pediatría'));

    await waitFor(() => {
      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });
  });
});
