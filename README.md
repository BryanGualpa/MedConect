# MedConnect — Sistema Web de Agendamiento de Citas Médicas

> "Conectando pacientes con su salud, de manera fácil y segura"

**Universidad de las Fuerzas Armadas "ESPE" — Sede Latacunga**  
Ingeniería de Software | Mayo 2026

## Integrantes

| Nombre | Rol |
|--------|-----|
| Christopher Candelejo Fasso | Product Owner / Líder del Proyecto |
| Bryan Gualpa Meza | Scrum Master / Analista |
| Cristian Bayas | Desarrollador Principal |

**Docente Tutor:** Ing. Edgar Rubén López Otañez, Mgtr.

---

## Descripción del Proyecto

MedConnect es una plataforma web que digitaliza y optimiza el proceso de agendamiento de citas médicas en centros de salud que actualmente dependen de métodos manuales (llamadas telefónicas, agendas físicas, hojas de cálculo). La solución está disponible desde cualquier navegador web moderno, sin instalación adicional, operativa 24/7.

**Objetivos principales:**
- Reducir la inasistencia en un 40% mediante recordatorios automáticos por correo electrónico
- Disminuir el tiempo de agendamiento a menos de 30 segundos
- Incrementar la eficiencia operativa del centro médico en un 60%

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React.js 18.x + Bootstrap + TanStack Query + React Hook Form + Zod |
| Backend | Node.js 20.x LTS + Express.js (API REST) |
| Base de Datos | PostgreSQL 16.x |
| Autenticación | JWT + bcrypt |
| Correo | Nodemailer + Gmail SMTP / SendGrid |
| ORM | Prisma ORM |
| Infraestructura | Docker Compose |
| CI/CD | GitHub Actions |
| Pruebas | Jest + Supertest + React Testing Library |

---

## Estructura del Repositorio

```
MedConnect/
├── medconnect-backend/          # API REST Node.js + Express.js
│   ├── src/
│   │   ├── controllers/         # AuthController, CitasController, etc.
│   │   ├── routes/              # Endpoints REST por recurso
│   │   ├── middleware/          # JWT, RBAC, validación
│   │   ├── services/            # Nodemailer, Reminder, Auth, Disponibilidad
│   │   └── config/              # Prisma Client, variables de entorno
│   ├── tests/
│   │   ├── unit/                # Pruebas unitarias Jest (RF-01 al RF-09)
│   │   ├── integration/         # Pruebas de integración Supertest
│   │   └── helpers/             # Datos de prueba y helpers
│   ├── prisma/
│   │   └── schema.prisma        # Modelos de datos (Prisma ORM)
│   ├── jest.config.js
│   ├── babel.config.js
│   └── package.json
├── medconnect-frontend/         # Aplicación React.js
│   ├── src/
│   │   ├── components/          # NavBar, Calendario, TarjetaMedico, etc.
│   │   ├── pages/               # Login, Register, Especialidades, etc.
│   │   ├── services/            # TanStack Query hooks
│   │   └── context/             # AuthContext (estado global)
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Instalación y Ejecución

### Prerrequisitos
- Node.js 20.x LTS
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/BryanGualpa/MedConect.git
cd MedConect
```

### 2. Levantar el entorno completo con Docker Compose
```bash
docker-compose up --build
```

Esto levanta automáticamente:
- **Frontend** en http://localhost:3000
- **Backend API** en http://localhost:5000
- **PostgreSQL 16** en puerto 5432
- **Swagger UI** en http://localhost:5000/api-docs

### 3. Configurar variables de entorno (sin Docker)

```bash
cp medconnect-backend/.env.example medconnect-backend/.env
```

Editar `.env` con tus credenciales:
```env
DATABASE_URL=postgresql://medconnect_user:password@localhost:5432/medconnect_db
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password
NODE_ENV=development
PORT=5000
```

### 4. Instalar dependencias y ejecutar migraciones (sin Docker)

```bash
# Backend
cd medconnect-backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (nueva terminal)
cd medconnect-frontend
npm install
npm start
```

---

## Pruebas Unitarias

```bash
cd medconnect-backend

# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura (mínimo 60% — SRS RNF-06)
npm run test:coverage

# Modo watch (desarrollo)
npm run test:watch

# Modo CI
npm run test:ci
```

Cobertura actual proyectada: **87.3%** (supera el umbral del 60% del SRS v1.0).

---

## API REST — Endpoints Principales

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Registro de paciente | Público |
| POST | `/api/auth/login` | Inicio de sesión / JWT | Público |
| GET | `/api/especialidades` | Listado especialidades | Público |
| GET | `/api/medicos/:id` | Perfil y disponibilidad | Auth |
| POST | `/api/citas` | Agendar cita | Paciente |
| PUT | `/api/citas/:id` | Reagendar cita | Paciente |
| DELETE | `/api/citas/:id` | Cancelar cita | Paciente |
| GET | `/api/medicos/:id/agenda` | Agenda semanal médico | Médico |
| GET/POST/PUT | `/api/admin/medicos` | Gestión médicos | Admin |
| GET | `/api/health` | Estado del sistema | Público |

Documentación interactiva: **http://localhost:5000/api-docs**

---

## Metodología de Desarrollo

- **Metodología ágil:** Scrum (sprints de 2 semanas)
- **Estimación:** Scrum Poker
- **Control de versiones:** GitFlow simplificado
- **Cobertura de pruebas:** ≥ 60% (RNF-06)
- **CI/CD:** GitHub Actions

### Ramas Git

| Rama | Propósito |
|------|-----------|
| `main` | Código estable de producción |
| `testing` | Integración y pruebas |
| `develop` | Desarrollo activo |
| `feature/*` | Funcionalidades individuales |

---

## Cronograma del Proyecto

| Fase | Período |
|------|---------|
| Análisis | 26 abril – 15 mayo 2026 |
| Diseño | 16 mayo – 5 junio 2026 |
| Codificación | 6 junio – 31 julio 2026 |
| Pruebas | 1 agosto – 20 agosto 2026 |

---

## Documentación Académica

- `docs/Plan_Proyecto_MedConnect.pdf`
- `docs/MedConnect_Especificacion_Requisitos_Software.pdf`
- `docs/MedConnect_Arquitectura_Software.pdf`
- `docs/MedConnect_Laboratorio_Pruebas_Unitarias.pdf`

---

## Licencia

Proyecto académico — Universidad de las Fuerzas Armadas "ESPE" Sede Latacunga — 2026
