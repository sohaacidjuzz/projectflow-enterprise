# Interview / Portfolio Talking Points

## Problem
Teams need one place to plan projects, visualize work, collaborate, and track delivery health.

## Engineering decisions
- Angular standalone architecture keeps frontend modular.
- Angular CDK provides accessible drag/drop Kanban interactions.
- Express REST API keeps backend simple and easy to demonstrate.
- Prisma provides typed data access and migrations.
- PostgreSQL supports relational project/member/task relationships.
- RBAC plus project membership prevents relying on UI-only security.
- Analytics are calculated server-side from source-of-truth task records.
- Attachments are abstracted as metadata records so storage can move to cloud object storage later.

## Scale-up path
At larger scale:
- PostgreSQL read replicas / indexes
- Redis caching
- Queue-based notifications
- Object storage + signed URLs
- WebSockets for live board updates
- Audit event stream
- Kubernetes/ECS/Cloud Run deployment
