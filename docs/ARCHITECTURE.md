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
