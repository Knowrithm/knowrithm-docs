# Authentication and User APIs

Endpoints in `app/blueprints/auth/routes.py` and `app/blueprints/profile/routes.py` handle credential workflows, user management, and API keys.

All paths use the `/v1` prefix. Unless labeled public, include either `X-API-Key` + `X-API-Secret` or `Authorization: Bearer <JWT>`.

---

## Credential Workflows

| Method | Path | Purpose | Headers |
|--------|------|---------|---------|
| GET | `/v1/auth/super-admin` | Seed super admin from environment (one-time) | none |
| POST | `/v1/auth/register` | Public registration for a company admin | none |
| POST | `/v1/auth/login` | Email/password login; returns access and refresh tokens | none |
| POST | `/v1/auth/refresh` | Exchange refresh token for new access token | `Authorization: Bearer <refresh JWT>` |
| POST | `/v1/auth/logout` | Invalidate the current session | `Authorization: Bearer <JWT>` |
| GET | `/v1/auth/user/me` | Return current user and company context (refreshes tokens if applicable) | API key (`read`) or JWT |

Email verification:
- **POST `/v1/send`** - request verification email (public)
- **POST `/v1/verify`** - confirm ownership using token (public)

---

## User Management

| Method | Path | Description | Headers |
|--------|------|-------------|---------|
| POST | `/v1/auth/user` | Create a user within the authenticated company; super admins may supply `company_id` | API key (`write`) or JWT (admin/super admin) |
| GET | `/v1/user/<user_id>` | Fetch a user within company scope | API key (`read`) or JWT (admin) |
| GET | `/v1/user/profile` | Retrieve authenticated profile | API key (`read`) or JWT |
| PUT | `/v1/user/profile` | Update profile fields (`first_name`, `last_name`, `timezone`, `language`, `preferences`) | API key (`write`) or JWT |

Admin-specific routes (under `app/blueprints/admin/routes.py`):
- `GET /v1/admin/user` - list users with filters (`page`, `status`, `role`, etc.)
- `GET /v1/admin/user/<user_id>` - admin-scoped user retrieval
- `PATCH /v1/user/<user_id>/status` - update user status
- `PATCH /v1/user/<user_id>/role` - update user role (super admin only)
- `POST /v1/user/<user_id>/force-password-reset`
- `POST /v1/user/<user_id>/impersonate`

Headers for admin routes: API key (`admin` scope) or JWT (admin/super admin).

---

## API Keys

These routes live under the OAuth blueprint.

| Method | Path | Description | Headers |
|--------|------|-------------|---------|
| POST | `/v1/auth/api-keys` | Create an API key for the authenticated JWT user | `Authorization: Bearer <JWT>` |
| GET | `/v1/auth/api-keys` | List API keys owned by the JWT user | `Authorization: Bearer <JWT>` |
| DELETE | `/v1/auth/api-keys/<api_key_id>` | Revoke a specific key | `Authorization: Bearer <JWT>` |
| GET | `/v1/auth/validate` | Validate current credentials; returns metadata | `Authorization: Bearer <JWT>` |

API key analytics (`/v1/overview`, `/v1/usage-trends`, `/v1/top-endpoints`, `/v1/api-key-performance`, `/v1/error-analysis`, `/v1/rate-limit-analysis`, `/v1/detailed-usage/<api_key_id>`) require API key scopes `read` + `admin` or an admin JWT.

---

## Headers Summary

- `X-API-Key` and `X-API-Secret`: service-to-service access; ensure scopes (`read`, `write`, `admin`) cover requested endpoints.
- `Authorization: Bearer <token>`: JWT access for dashboard or delegated operations.
- Most endpoints accept either credentials; prefer API keys for automation and JWTs for user-context flows.

---

## Recommendations

- Rotate API keys regularly and monitor usage through analytics endpoints.
- Store credentials in a vault; never embed them in client-side applications.
- Use JWT refresh tokens sparingly and invalidate them on logout or user deactivation.
- Super admin seeding should be run once per environment; subsequent calls return the existing record.






