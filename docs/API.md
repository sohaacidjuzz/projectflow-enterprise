# ProjectFlow Enterprise API

Base URL in the Docker deployment: `http://localhost:8080/api`

All protected endpoints use:

```http
Authorization: Bearer <JWT>
```

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a developer account |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | User | Return the current user |

## Users

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/users` | Admin/Manager | List users |
| PATCH | `/users/:id/role` | Admin | Change a user's role |

## Projects

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/projects` | User | List accessible projects |
| POST | `/projects` | Admin/Manager | Create project |
| GET | `/projects/:id` | User | Get project details |
| PATCH | `/projects/:id` | Admin/Manager | Update project |
| DELETE | `/projects/:id` | Admin/Manager | Delete project |
| POST | `/projects/:id/members` | Admin/Manager | Add member |
| DELETE | `/projects/:id/members/:userId` | Admin/Manager | Remove member |
| GET | `/projects/:id/analytics` | User | Project metrics |

## Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks/project/:projectId` | List project tasks |
| POST | `/tasks/project/:projectId` | Create task |
| PATCH | `/tasks/:id` | Update task |
| POST | `/tasks/reorder` | Persist Kanban status/order |
| DELETE | `/tasks/:id` | Delete task |

## Collaboration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/comments/task/:taskId` | List task comments |
| POST | `/comments/task/:taskId` | Add task comment |
| POST | `/attachments/task/:taskId` | Upload task attachment (`multipart/form-data`) |
| GET | `/attachments/:id/download` | Download attachment |
| GET | `/notifications` | List current user's notifications |
| PATCH | `/notifications/:id/read` | Mark notification read |
| PATCH | `/notifications/read-all` | Mark all notifications read |

## Health

`GET /api/health` returns a lightweight service health response.
