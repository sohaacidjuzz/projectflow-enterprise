# Architecture

```mermaid
flowchart LR
    U[Browser] --> A[Angular 19 SPA]
    A -->|HTTPS / REST + JWT| E[Express API]
    E --> P[Prisma ORM]
    P --> DB[(PostgreSQL)]
    E --> FS[(Attachment Volume)]
    E --> N[Notification Service]
    E --> R[RBAC / Access Service]

    subgraph Docker
      A
      E
      P
      DB
      FS
    ends
```

## Request flow

1. Angular authenticates through `/api/auth/login`.
2. The API signs a short-lived JWT containing safe user identity/role fields.
3. Protected requests carry the JWT as a Bearer token.
4. Authentication middleware validates the token.
5. Role/access helpers enforce Admin/Manager/Developer permissions.
6. Prisma persists project/task/collaboration data in PostgreSQL.
7. Multer stores task attachments in the configured upload volume.
8. The notification service creates in-app notifications for relevant actions.

## Key design decisions

- **Angular standalone components** keep the frontend modular without a large NgModule hierarchy.
- **REST + JWT** makes the API easy to integrate with another frontend or mobile client.
- **Prisma** provides typed database access and a declarative schema.
- **Kanban ordering** stores both status and position so drag/drop state survives refreshes.
- **RBAC** is enforced server-side; the frontend only hides controls as a usability layer.
- **Docker Compose** provides a reproducible local environment with PostgreSQL health checks.
# Architecture

Browser (Angular)
→ REST API (Express)
→ PostgreSQL (Prisma)

Supporting concerns:
- JWT authentication
- RBAC middleware
- Project membership authorization
- Multer attachment upload
- Notification persistence
- Analytics aggregation
- Angular CDK drag/drop

## Data model
User → ProjectMember → Project → Task → Comment / Attachment  
User → Notification  
Task → assignee / creator

## Security model
Authentication and authorization are separate:
1. JWT middleware authenticates identity.
2. Role middleware handles broad permissions.
3. Project access service verifies membership/ownership.
4. Resource routes verify the parent project before operations.

## Production hardening roadmap
- Store attachments in S3/GCS/Azure Blob
- Add refresh tokens / secure HttpOnly cookie sessions
- Add rate limiting
- Add request validation (Zod/Joi)
- Add audit log
- Add OpenTelemetry
- Add Redis-backed notifications/websockets
- Add CI/CD + automated tests
