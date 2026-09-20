# Portfolio / Interview Talking Points

## What I built

A full-stack project management platform with Angular, Node.js/Express, PostgreSQL, Prisma, JWT authentication, RBAC, Kanban drag-and-drop, comments, attachments, notifications, analytics, Docker, and CI.

## Architecture questions to discuss

- Why keep authorization on the API instead of relying on Angular route/UI checks?
- How would you scale attachments from a local volume to object storage?
- How would you make Kanban reorder operations transactional under concurrent updates?
- How would you add pagination and filtering to large projects?
- How would you move from `db push` in the demo container to versioned Prisma migrations in production?
- How would you introduce Redis for caching, queues, or notification fan-out?
- How would you add observability: structured logs, metrics, traces, and alerting?

## Engineering management talking points

- Break the product into identity, project, task, collaboration, and platform concerns.
- Define API contracts before parallelizing frontend/backend work.
- Use CI to catch build regressions before merge.
- Separate local-demo convenience from production security requirements.
- Document architectural trade-offs so future contributors can make consistent decisions.
