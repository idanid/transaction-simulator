# Transaction Simulator

A banking transaction simulator built with React + .NET 8 + MSSQL.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand, react-i18next |
| Backend | .NET 10, ASP.NET Core Web API, Clean Architecture |
| Database | MSSQL (SQL Server 2022) |
| Auth | JWT (HS256) + BCrypt |

---

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/transaction-simulator.git
cd transaction-simulator

# 2. Copy env file and set your secrets
cp .env.example .env
# Edit .env — set SA_PASSWORD and JWT_SECRET

# 3. Add the real image assets (see Assets section below)

# 4. Start everything
docker-compose up --build
```

The app will be available at **http://localhost:3000**

---

## Local Development (without Docker)

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- SQL Server (local or Docker)

### Backend

```bash
cd backend

# Restore packages
dotnet restore

# Set your connection string and JWT secret in appsettings.json
# (or set env vars)

# Run migrations + start API
dotnet run --project src/TransactionApp.API
# API runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## Database Setup

EF Core migrations run **automatically** on startup.

To run migrations manually:
```bash
cd backend
dotnet ef database update \
  --project src/TransactionApp.Infrastructure \
  --startup-project src/TransactionApp.API
```

---

## Assets

Place the following images in `frontend/src/assets/` (replace the placeholders):

| File | Description |
|---|---|
| `shva-logo.png` | Shva logo (header) |
| `desktop-mockup.png` | Desktop website mockup illustration |
| `mobile-mockup.png` | Mobile phone mockup illustration |

---

## Environment Variables

| Variable | Description |
|---|---|
| `SA_PASSWORD` | SQL Server SA password (min 8 chars, upper+lower+digit+symbol) |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |

---

## API Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login → JWT token |
| POST | `/api/transactions/submit` | ✓ | Submit transaction simulation |
| GET | `/api/transactions/approved` | ✓ | Get user's approved transactions |
| GET | `/api/transactions/regions` | — | List supported regions |
| GET | `/api/transactions/current-time/{region}` | — | Get current local time in region |

---

## Business Logic

A transaction is **Approved** if the entered time (HH:mm) falls within banking hours `08:00–18:00` in the selected region.

| Region | Timezone |
|---|---|
| France | Europe/Paris |
| Israel | Asia/Jerusalem |
| Cyprus | Asia/Nicosia |
| Italy | Europe/Rome |

---

## Features

- ✅ Transaction simulation with timezone-aware approval
- ✅ JWT authentication (Register / Login)
- ✅ EN/HE localization with RTL support
- ✅ Approved transactions carousel
- ✅ Docker Compose single-command startup
