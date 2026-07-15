# Developer Setup Guide — Transaction Simulator

This guide takes you from zero to a fully running app.  
There are **two ways to run** the project:

| Mode | When to use | What you need |
|---|---|---|
| **Local dev** (recommended for development) | Writing code, debugging, making changes | Node.js + .NET SDK |
| **Docker** (full production stack) | Testing the real thing, demo, deployment | Docker Desktop only |

Read **Step 1–3** no matter which mode you choose. Then follow **either** Step 4A (local) or Step 4B (Docker).

---

## Step 1 — Install the Required Tools

### 1.1 Node.js (required for local frontend)

**What it is:** The JavaScript runtime that runs the frontend dev server and installs npm packages.  
**Which version:** 20 or higher (LTS recommended).

**Download:** https://nodejs.org → click "LTS" → install.

**Verify it worked (open a terminal):**
```bash
node --version   # should print v20.x.x or higher
npm --version    # should print 10.x.x or higher
```

---

### 1.2 .NET 10 SDK (required for local backend)

**What it is:** The development kit that compiles and runs C# code.  
**Which version:** .NET 10 (the project targets `net10.0`).

**Download:** https://dotnet.microsoft.com/download → select .NET 10 → SDK → install.

**Verify it worked:**
```bash
dotnet --version   # should print 10.x.x
```

---

### 1.3 Docker Desktop (required for Docker mode, optional for local mode)

**What it is:** Runs containers — isolated environments that bundle the app + its dependencies.  
You need Docker if you want to run the full stack (frontend + backend + SQL Server) with one command, or if you do not want to install Node/dotnet on your machine.

**Download:** https://www.docker.com/products/docker-desktop → install → open it once so it starts.

**Verify it worked:**
```bash
docker --version          # should print Docker version 24.x or higher
docker compose version    # should print Docker Compose version v2.x
```

> **Important:** Docker Desktop must be **open and running** (look for the whale icon in your system tray / menu bar) before you run any `docker` command.

---

### 1.4 Git (you likely already have it)

**What it is:** Version control — used to clone the repository.

**Verify it worked:**
```bash
git --version   # should print git version 2.x
```

If not installed: https://git-scm.com/downloads

---

### 1.5 VS Code (the IDE)

**Download:** https://code.visualstudio.com

**Install these extensions inside VS Code** (press `Ctrl+Shift+X` / `Cmd+Shift+X`):

| Extension | Why |
|---|---|
| **C# Dev Kit** (Microsoft) | IntelliSense, debugging, and run for .NET / C# |
| **ESLint** | Catches JavaScript/TypeScript errors as you type |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind class names |
| **REST Client** | Run `.http` files to test API endpoints directly in VS Code |
| **Docker** (Microsoft) | View containers, images, and logs inside VS Code |
| **GitLens** | Better git history and blame |

---

## Step 2 — Get the Code

If someone sent you the project folder directly, skip this step.  
If you need to clone from a repository:

```bash
git clone <repository-url>
cd project
```

Open the project in VS Code:
```bash
code .
```

---

## Step 3 — One-Time Project Setup

These steps are done **only once**, no matter which run mode you choose.

### 3.1 Create the `.env` file

The `.env` file holds secret values (passwords, JWT key) that are NOT committed to git.  
There is a template file called `.env.example` in the root of the project.

**Copy it:**

On Mac/Linux:
```bash
cp .env.example .env
```

On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

**Now open `.env` and fill it in:**
```
SA_PASSWORD=YourStr0ngPass!
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

Rules:
- `SA_PASSWORD` — the SQL Server admin password. Must be at least 8 characters and include uppercase, lowercase, number, and a symbol. Example: `MyPass123!`
- `JWT_SECRET` — any long random string (at least 32 characters). Example: `my-very-long-secret-key-for-jwt-signing-2024`

> **Never commit `.env` to git.** It is already in `.gitignore`.

---

### 3.2 Make sure the `db/` folder exists (local dev only)

For local development the backend uses SQLite — a simple file-based database. The file lives in `db/transaction.db`.

The `db/` folder should already exist in the project. If it does not:

```bash
mkdir db
```

The `transaction.db` file is created automatically the first time the backend starts.

---

## Step 4A — Run Locally (Recommended for Development)

This mode is best when you are writing code, because:
- Changes to frontend code appear **instantly** in the browser (hot reload)
- You can set breakpoints and debug the backend in VS Code
- No Docker needed

You will run **two terminals** side by side.

---

### Terminal 1 — Start the Frontend

```bash
# Navigate to the frontend folder
cd frontend

# Install all npm packages (only needed once, or after package.json changes)
npm install

# Start the development server
npm run dev
```

**What you will see:**
```
  VITE v6.x.x  ready in 300ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

Open **http://localhost:3000** in your browser.

**What `npm install` does:**  
Reads `package.json` and downloads every library the project needs into a `node_modules/` folder. This folder is never committed to git (it can be hundreds of MB).

**What `npm run dev` does:**  
Starts Vite, which serves the React app with hot-module replacement — if you edit a `.tsx` file and save, the browser updates in under 1 second without a full page reload.

---

### Terminal 2 — Start the Backend

```bash
# Navigate to the API project
cd backend/src/TransactionApp.API

# Restore NuGet packages (only needed once, or after .csproj changes)
dotnet restore

# Run the backend server
dotnet run
```

**What you will see:**
```
info: Microsoft.EntityFrameworkCore.Database.Command[...] Applying migration ...
info: Microsoft.Hosting.Lifetime[14] Now listening on: http://localhost:5000
```

The backend is running at **http://localhost:5000**.

**What `dotnet restore` does:**  
Downloads all NuGet packages (C# libraries) listed in the `.csproj` files. Same concept as `npm install`.

**What `dotnet run` does:**  
Compiles the C# code and runs the server. On the first run it also creates the SQLite database and runs all EF Core migrations (creates the `Users` and `Transactions` tables automatically).

---

### How local mode connects the two

The frontend dev server (port 3000) is configured in `vite.config.ts` with a **proxy**:

```
Any request to /api/* → automatically forwarded to http://localhost:5000
```

So when the browser calls `/api/auth/login`, Vite silently sends it to `http://localhost:5000/api/auth/login`. You never have to hardcode the backend URL in your frontend code.

---

### Stopping Local Mode

In each terminal, press `Ctrl + C` to stop the server.

---

### Re-running after the first time

You do **not** need to run `npm install` or `dotnet restore` again unless the dependency files changed.

```bash
# Terminal 1
cd frontend
npm run dev

# Terminal 2
cd backend/src/TransactionApp.API
dotnet run
```

---

## Step 4B — Run with Docker (Full Stack)

This mode runs everything — frontend, backend, and SQL Server — inside containers with one command.

Make sure Docker Desktop is open and running before continuing.

### Create the `.env` file (if you haven't already — see Step 3.1)

Docker Compose reads the `.env` file automatically.

### Build and start all containers

From the **root of the project** (where `docker-compose.yml` lives):

```bash
docker compose up --build
```

**What this does step by step:**
1. Reads `docker-compose.yml`
2. Builds the **frontend** Docker image (installs npm packages, builds `dist/`, puts it into nginx)
3. Builds the **backend** Docker image (restores NuGet, compiles, creates the .dll)
4. Pulls the **SQL Server 2022** image from Microsoft (first time takes a few minutes)
5. Starts SQL Server first, waits until its health check passes
6. Starts the backend (which runs EF Core migrations and creates tables)
7. Starts the frontend nginx server

**Wait until you see something like:**
```
backend-1   | info: Now listening on: http://[::]:8080
frontend-1  | /docker-entrypoint.sh: Configuration complete; ready for start up
```

Open **http://localhost:3000** in your browser.

---

### First run takes longer

The first `docker compose up --build` can take **3–10 minutes** because:
- It downloads the SQL Server image (~1.5 GB)
- It builds both Docker images from scratch
- SQL Server takes ~30 seconds to be ready

**Subsequent runs** (without `--build`) start in about 10 seconds:
```bash
docker compose up
```

---

### Stopping Docker

```bash
# Stop all containers (keeps data)
docker compose down

# Stop and DELETE all data (fresh start)
docker compose down -v
```

The `-v` flag removes the `mssql_data` volume — the database is wiped clean. Use this if you want to reset everything.

---

### Viewing logs in Docker mode

```bash
# All services
docker compose logs -f

# Only the backend
docker compose logs -f backend

# Only the frontend
docker compose logs -f frontend
```

---

## Step 5 — Verify Everything Works

After either run mode:

1. Open **http://localhost:3000** in your browser
2. You should see the Shva login page
3. Click **"אין לך חשבון? הירשם"** (or "Don't have an account? Sign up")
4. Register with any email and password (minimum 6 characters)
5. You should be redirected to the dashboard
6. Select a region (e.g. "Israel")
7. The time picker will auto-fill with the current local time in that region
8. Click **"אישור"** to confirm the time
9. The **"שלח עסקה"** button appears — click it
10. A toast notification appears: approved (if between 08:00–18:00) or rejected

If all 10 steps work — the project is fully running. ✓

---

## Useful Commands Reference

### Frontend

| Command | What it does |
|---|---|
| `npm install` | Install/update all packages from `package.json` |
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production files into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code for style/quality issues |

### Backend

| Command | What it does |
|---|---|
| `dotnet restore` | Download NuGet packages |
| `dotnet run` | Compile and run the server |
| `dotnet build` | Compile only (no run) |
| `dotnet ef migrations add <Name>` | Create a new EF Core migration after changing entities |
| `dotnet ef database update` | Apply pending migrations manually |

### Docker

| Command | What it does |
|---|---|
| `docker compose up --build` | Build images and start all containers |
| `docker compose up` | Start all containers (no rebuild) |
| `docker compose down` | Stop all containers |
| `docker compose down -v` | Stop and delete all data |
| `docker compose logs -f` | Stream live logs from all containers |
| `docker ps` | List running containers |

---

## Ports Summary

| Service | Local dev port | Docker port |
|---|---|---|
| Frontend (React) | http://localhost:3000 | http://localhost:3000 |
| Backend (API) | http://localhost:5000 | http://localhost:5000 (maps to 8080 inside) |
| SQL Server | N/A (SQLite used) | localhost:1433 |
| Swagger (API docs) | http://localhost:5000/swagger | not exposed |

---

## VS Code Tips for This Project

### Open the right folder

Always open VS Code at the **project root** (the folder that contains `docker-compose.yml`, `frontend/`, `backend/`):

```bash
code /path/to/project
```

### Run frontend and backend without leaving VS Code

VS Code has a built-in terminal. Open two terminals side by side:
- `Ctrl + ~` (backtick) to open terminal
- Click the `+` button to open a second terminal
- Use the terminal dropdown to switch between them

### Debug the backend in VS Code

1. Install the **C# Dev Kit** extension
2. Open any `.cs` file
3. Set a breakpoint by clicking the left margin (a red dot appears)
4. Press `F5` to start debugging — VS Code will compile and attach the debugger
5. When a request hits your breakpoint, execution pauses and you can inspect variables

### Test API endpoints directly

The project includes `backend/src/TransactionApp.API/TransactionApp.API.http`.  
With the **REST Client** extension installed, open this file and click "Send Request" above any HTTP call to test the API without Postman.

---

## Common Problems and Fixes

### "Port 3000 is already in use"
Something else is running on port 3000. Find and stop it:
```bash
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Port 5000 is already in use"
Same as above but for port 5000.

### "npm install" fails with permission errors (Mac)
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

### Backend fails with "database file not found"
Make sure the `db/` folder exists in the project root:
```bash
mkdir db
```
Then restart the backend.

### Docker: "Cannot connect to the Docker daemon"
Docker Desktop is not running. Open it from your Applications / Start Menu and wait for the whale icon to appear in the menu bar.

### Docker: SQL Server health check keeps failing
SQL Server takes up to 60 seconds on the first start. Wait and watch the logs:
```bash
docker compose logs -f mssql
```
You should eventually see: `SQL Server is now ready for client connections`.

### Docker: old data causes issues after code changes
Do a clean restart:
```bash
docker compose down -v
docker compose up --build
```

### `dotnet run` says "migration already applied"
This is not an error — it just means the database already has the latest schema. Safe to ignore.

### Frontend compiles but API calls return 404
Make sure the backend is running. In local mode, both terminal processes must be active at the same time.

---

## Project File Structure (Quick Reference)

```
project/
├── .env                    ← your secret keys (you create this — never commit it)
├── .env.example            ← template showing what goes in .env
├── docker-compose.yml      ← orchestrates all 3 Docker containers
├── SETUP_GUIDE.md          ← this file
├── FRONTEND_EXPLAINED.md   ← full explanation of the frontend code (Hebrew)
├── BACKEND_EXPLAINED.md    ← full explanation of the backend + Docker (Hebrew)
│
├── frontend/
│   ├── src/                ← all React/TypeScript source code
│   ├── package.json        ← npm dependencies list
│   ├── vite.config.ts      ← Vite config (proxy, aliases)
│   ├── Dockerfile          ← instructions to build frontend Docker image
│   └── nginx.conf          ← web server config for Docker
│
├── backend/
│   ├── src/
│   │   ├── TransactionApp.API/           ← HTTP controllers, Program.cs
│   │   ├── TransactionApp.Application/   ← business logic, interfaces
│   │   ├── TransactionApp.Domain/        ← entities, enums
│   │   └── TransactionApp.Infrastructure/← database, repositories
│   └── Dockerfile          ← instructions to build backend Docker image
│
└── db/
    └── transaction.db      ← SQLite database file (local dev only)
```
