# ProjectFlow Enterprise

Portfolio-grade project management platform built with Angular + Node.js + PostgreSQL.

## Highlights
- Angular standalone app
- Node.js + Express REST API
- PostgreSQL + Prisma ORM
- JWT authentication
- RBAC: Admin, Manager, Developer
- Kanban board with drag and drop (Angular CDK)
- Projects, members, tasks, comments
- File attachments
- In-app notifications
- Project analytics
- Audit-friendly role controls
- Dockerized production deployment
- Health check endpoint

## Roles
**Admin**
- Manage users and roles
- Access all projects
- Create / update / delete projects
- Manage members and tasks

**Manager**
- Create / update projects
- Manage project members
- Create / update / assign tasks
- View analytics

**Developer**
- View assigned/member projects
- Move/update project tasks
- Add comments and attachments
- Read notifications

## One-command Docker startup

Prerequisite: Docker Desktop must be running. From the extracted project folder, run:

```bash
docker compose up --build
```

The first startup automatically:

- pulls PostgreSQL and Node images,
- installs frontend/backend dependencies inside Docker,
- builds the Angular production bundle,
- generates the Prisma client,
- creates/updates the PostgreSQL schema with `prisma db push`,
- seeds the demo administrator idempotently, and
- starts the application on `http://localhost:8080`.

Demo login: `admin@projectflow.dev` / `Admin@123`.

To reset all database and upload data and start fresh:

```bash
docker compose down -v
docker compose up --build
```

## Local development

1. Copy environment file:
```bash
cp server/.env.example server/.env
```

2. Start PostgreSQL:
```bash
docker compose up postgres -d
```

3. Backend:
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

4. Frontend:
```bash
cd client
npm install
npm start
```

Frontend: http://localhost:4200  
API: http://localhost:3000/api

Seed admin:
- Email: `admin@projectflow.dev`
- Password: `Admin@123`

Change the seed password and JWT secret before any public deployment.

## Production
```bash
docker compose up --build -d
```

App: http://localhost:8080

## Production environment
Required:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

Optional:
- `UPLOAD_DIR`
- `MAX_UPLOAD_MB`

## Cloud deployment
This repo can be deployed as a Docker service to Render, Railway, Fly.io, Azure Web App for Containers, AWS ECS, Google Cloud Run, or similar.

For production, use a managed PostgreSQL database and persistent object storage (S3/Cloud Storage/Azure Blob) for attachments instead of local disk.
