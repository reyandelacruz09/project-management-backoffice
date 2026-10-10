# Project Desk back office

This is a separate Vue 3 frontend for the existing Laravel project-management API. The Blade UI and its web routes are unchanged.

## Run locally

1. Start Laravel from the repository root, for example with `php artisan serve` (the default address is `http://127.0.0.1:8000`).
2. In this `project-management-backoffice/` folder, install the packages with `npm install`.
3. Start Vue with `npm run dev` and open the URL Vite prints (normally `http://localhost:5174`).

The Vite development server proxies `/api` to `http://127.0.0.1:8000`. If Laravel runs elsewhere, set `LARAVEL_API_ORIGIN` in this folder's `.env` to its origin, without `/api`, for example `http://127.0.0.1:8080`.

Sign in with an existing Laravel user account. The API issues a Sanctum bearer token; this frontend keeps it in `sessionStorage` for the current browser tab and sends it with API requests. Signing out revokes that token.

## Current screens

- Overview with project and team totals and recent projects
- Project search, create, edit, and delete
- Project task creation, status updates, and deletion
- Team directory

The API currently does not expose user management, profile editing, team creation/editing, project member management, or comment management, so those actions are not included in this frontend.

For a production deployment on a separate origin, configure the API URL with `VITE_API_BASE_URL` and configure Laravel CORS to allow the back-office origin. The existing token API is used here; cookie-based Sanctum SPA authentication would require additional Laravel stateful-domain and CSRF configuration.
