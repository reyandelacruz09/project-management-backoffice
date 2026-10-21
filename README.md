# Project Desk Back Office

A modern Vue 3 administrative frontend for the Laravel `project-management` API built with Vite, Vue Router, Pinia, Tailwind CSS v4, and Lucide Icons.

## Run Locally

1. Start Laravel from the repository root, for example with `php artisan serve` (the default address is `http://127.0.0.1:8000`).
2. In this `project-management-backoffice/` folder, install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the printed URL (normally `http://localhost:5174`).

The Vite development server automatically proxies `/api` requests to `http://127.0.0.1:8000`. If Laravel runs on a different port or host, set `LARAVEL_API_ORIGIN` in this folder's `.env`, e.g.:
```env
LARAVEL_API_ORIGIN=http://127.0.0.1:8080
```

## Features & Screens

- **Authentication & Navigation**:
  - Secure Sanctum token management with automatic expiration handling.
  - Client-side routing with `vue-router` v4, route guards, and deep-linking (`/`, `/projects`, `/projects/:id`, `/teams`, `/login`).
  - Centralized state management via **Pinia** stores (`auth`, `projects`, `teams`, `tasks`, `toast`).
- **Overview Dashboard**:
  - High-level metric cards (Total Projects, Active Projects, Teams, Completed Projects).
  - Quick access to recent projects and connected teams.
- **Projects Management**:
  - Server-side search and status filtering (`planning`, `active`, `on_hold`, `completed`).
  - Server-side pagination controls.
  - Project creation, editing, and deletion with accessible confirmation modals.
- **Project Detail View**:
  - Deep-linked project summary with owner, team, and timeline badges.
  - **Task Board & List View**: Toggle between a 4-column **Kanban Board** (`todo`, `in_progress`, `review`, `done`) and a structured **Task List**.
  - **Task Management**: Create and edit tasks with descriptions, priority levels (`low`, `medium`, `high`, `urgent`), assignees, and due dates with overdue warnings.
  - **Project Members**: Assign team members to projects with specific roles (`manager`, `member`).
  - **Discussions / Comments**: Post and delete polymorphic discussion comments on projects and tasks.
- **Teams Management**:
  - Create, edit, and delete teams.
  - Assign workspace users to teams.
  - Member avatar stacks and project association counts.
- **UI & UX Modernization**:
  - Fully responsive utility-based design powered by **Tailwind CSS v4**.
  - Crisp SVG iconography via **Lucide Icons**.
  - Non-blocking confirmation dialogs and stacked toast notifications.
