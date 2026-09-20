# Deployment Guide

## Local / portfolio demo

Requirements:
- Docker Desktop
- Git

Run:

```bash
docker compose up --build
```

Open `http://localhost:8080`.

For a clean reset:

```bash
docker compose down -v
docker compose up --build
```

## Environment variables

The Compose file provides safe local defaults. For a public deployment, provide your own values:

- `JWT_SECRET`: long random secret
- `SEED_ADMIN_EMAIL`: administrator email
- `SEED_ADMIN_PASSWORD`: strong administrator password
- `CLIENT_ORIGIN`: browser origin allowed by CORS
- `MAX_UPLOAD_MB`: upload size limit

Do not commit `.env` files or production secrets.

## Production architecture

For production, replace the local infrastructure with:

- Managed PostgreSQL
- Object storage such as Amazon S3, Google Cloud Storage, or Azure Blob Storage for attachments
- A secret manager for JWT/database credentials
- HTTPS/TLS at the load balancer or platform edge
- Structured application logging and centralized monitoring

The included Docker image is suitable as the application container for platforms such as AWS ECS, Azure Container Apps, Google Cloud Run, Railway, Render, or Fly.io, subject to each platform's PostgreSQL and persistent-storage configuration.

## GitHub Actions

`.github/workflows/ci.yml` installs dependencies, generates Prisma Client, builds Angular, and validates the Docker image on pushes and pull requests to `main`.
