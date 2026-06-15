// src/tests/auth.test.jsx
// MedConnect — Pruebas de Componentes: Autenticación (React Testing Library)
// Ref: Laboratorio de Pruebas Unitarias — Sección 5.3
// Cubre: TC-F01 (render formulario Register) | TC-F02 (validación correo inválido Login)

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks de dependencias externas ───────────────────────────────────────────

// Mock de react-router-dom: useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock del contexto de autenticación
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login:           mockLogin,
    logout:          jest.fn(),
    estaAutenticado: false,
    usuario:         null,
    esPaciente:      false,
    esMedico:        false,
    esAdmin:         false
  }),
  AuthProvider: ({ children }) => <>{children}</>
}));

// Mock de la API (evita llamadas HTTP reales)
jest.mock('../services/api', () => ({
  authAPI: {
    login:    jest.fn(),
    register: jest.fn()
  }
}));

// ── Imports de los componentes bajo prueba ────────────────────────────────────
import Login    from '../pages/Login';
import Register from '../pages/Register';
import { authAPI } from '../services/api';

// ── Helper: envolver componente en MemoryRouter ───────────────────────────────
function renderConRouter(componente, ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      {componente}
    </MemoryRouter>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TC-F01 — Formulario de registro: renderizado correcto
// ────────────────────────────────────────────────────────────────────────────
describe('TC-F01 — Register.jsx: renderizado correcto (RF-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    renderConRouter(<Register />);
  });

  test('Muestra el título "Crear cuenta"', () => {
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  test('Muestra el campo de nombre completo', () => {
    expect(screen.getByTestId('input-nombre')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  test('Muestra el campo de cédula ecuatoriana', () => {
    expect(screen.getByTestId('input-cedula')).toBeInTheDocument();
    expect(screen.getByLabelText(/cédula ecuatoriana/i)).toBeInTheDocument();
  });

  test('Muestra el campo de correo electrónico', () => {
    expect(screen.getByTestId('input-correo')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  test('Muestra el campo de contraseña con hint de requisitos', () => {
    expect(screen.getByTestId('input-contrasena')).toBeInTheDocument();
    expect(screen.getByText(/mín. 8 caracteres/i)).toBeInTheDocument();
  });

  test('Muestra el campo de teléfono', () => {
    expect(screen.getByTestId('input-telefono')).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
  });

  test('Muestra el botón de envío "Registrarse"', () => {
    expect(screen.getByTestId('btn-register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  test('Muestra enlace para ir al login', () => {
    expect(screen.getByText(/ya tienes cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// TC-F02 — Formulario de login: validación de correo inválido
// ────────────────────────────────────────────────────────────────────────────
describe('TC-F02 — Login.jsx: validación de correo inválido (RF-02, RNF-08)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Muestra el formulario de login con todos sus campos', () => {
    renderConRouter(<Login />);
    expect(screen.getByTestId('input-correo')).toBeInTheDocument();
    expect(screen.getByTestId('input-contrasena')).toBeInTheDocument();
    expect(screen.getByTestId('btn-login')).toBeInTheDocument();
  });

  test('Correo inválido muestra mensaje de error descriptivo', async () => {
    renderConRouter(<Login />);
    const user = userEvent.setup();

    // Escribir un correo con formato inválido
    await user.type(screen.getByTestId('input-correo'), 'no-es-un-correo');
    await user.type(screen.getByTestId('input-contrasena'), 'cualquier');

    // Enviar el formulario
    await user.click(screen.getByTestId('btn-login'));

    // Esperar el mensaje de error de Zod
    await waitFor(() => {
      expect(screen.getByTestId('error-correo')).toBeInTheDocument();
      expect(screen.getByTestId('error-correo')).toHaveTextContent(
        /correo electrónico válido/i
      );
    });

    // La API NO debe haberse llamado (validación en cliente)
    expect(authAPI.login).not.toHaveBeenCalled();
  });

  test('Correo vacío muestra mensaje de obligatorio', async () => {
    renderConRouter(<Login />);
    const user = userEvent.setup();

    // Enviar sin llenar nada
    await user.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('error-correo')).toBeInTheDocument();
      expect(screen.getByTestId('error-correo')).toHaveTextContent(
        /correo es obligatorio/i
      );
    });

    expect(authAPI.login).not.toHaveBeenCalled();
  });

  test('Login exitoso llama a authAPI y redirige', async () => {
    renderConRouter(<Login />);
    const user = userEvent.setup();

    // Simular respuesta exitosa del servidor
    authAPI.login.mockResolvedValueOnce({
      data: {
        accessToken:  'jwt-token-mock',
        refreshToken: 'refresh-mock',
        usuario: { id: 1, nombre: 'María López', correo: 'maria@test.com', rol: 'PACIENTE' }
      }
    });

    await user.type(screen.getByTestId('input-correo'),    'maria@test.com');
    await user.type(screen.getByTestId('input-contrasena'), 'Segura#2026');
    await user.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        correo:     'maria@test.com',
        contrasena: 'Segura#2026'
      });
      expect(mockLogin).toHaveBeenCalledTimes(1);
      // PACIENTE redirige a /especialidades
      expect(mockNavigate).toHaveBeenCalledWith('/especialidades');
    });
  });

  test('Error 401 muestra mensaje genérico (OWASP)', async () => {
    renderConRouter(<Login />);
    const user = userEvent.setup();

    // Simular respuesta 401
    authAPI.login.mockRejectedValueOnce({
      response: { status: 401, data: { mensaje: 'Credenciales inválidas.' } }
    });

    await user.type(screen.getByTestId('input-correo'),    'maria@test.com');
    await user.type(screen.getByTestId('input-contrasena'), 'incorrecta');
    await user.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('error-servidor')).toBeInTheDocument();
      expect(screen.getByTestId('error-servidor')).toHaveTextContent(
        /credenciales inválidas/i
      );
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// TC-F03 — NavBar: muestra enlaces según rol
// ────────────────────────────────────────────────────────────────────────────
describe('TC-F03 — NavBar.jsx: enlaces según rol', () => {
  test('Sin sesión muestra "Iniciar sesión" y "Registrarse"', () => {
    // El mock de AuthContext ya devuelve estaAutenticado: false
    const NavBar = require('../components/NavBar').default;
    renderConRouter(<NavBar />);

    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByText(/registrarse/i)).toBeInTheDocument();
    expect(screen.queryByTestId('btn-logout')).not.toBeInTheDocument();
  });
});
