# Security Notes

ProjectFlow Enterprise is a portfolio/demo application. Before production use:

1. Replace all local/default secrets.
2. Store secrets in the deployment platform's secret manager.
3. Use HTTPS.
4. Restrict `CLIENT_ORIGIN` to the real frontend origin.
5. Move attachments from local disk to private object storage with signed download URLs.
6. Add rate limiting and account lockout controls around authentication.
7. Add stronger file validation and malware scanning for uploads.
8. Add audit logging for administrative actions.
9. Run dependency and container vulnerability scanning in CI.
10. Use managed PostgreSQL backups, encryption, and least-privilege database credentials.

The repository intentionally keeps `.env` and runtime uploads out of Git.
