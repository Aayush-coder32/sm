# CampusPulse

> A role-based campus workspace for notices, academic timelines, faculty communication, and examination workflows.

CampusPulse brings student, faculty, and administrator tools into one responsive web application. Faculty can publish notices and create branch-specific class profiles; students can follow campus updates, submit academic requests, and track examination approvals.

## Contents

- [Highlights](#highlights)
- [Technology](#technology)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available commands](#available-commands)
- [Roles and workflows](#roles-and-workflows)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Highlights

### Student workspace

- Browse notices targeted to all students, a department, or a branch.
- Review deadlines, examination dates, results, and class faculty profiles.
- Request academic-fee approval and submit an examination form.
- Track faculty decisions and access the admit-card workflow after approval.
- Use the CampusPulse AI assistant interface for guided campus and study prompts.

### Faculty workspace

- Publish notices with a category, audience, and priority.
- Create class profiles with faculty photos and signatures, assigned to a department and branch.
- Review examination-fee requests and submitted examination forms.
- Approve or reject examination forms and review student submissions.

### Administrator workspace

- Review campus activity and system overview metrics.
- Bootstrap an administrator account through server environment settings.

### Experience and interface

- Responsive React interface with role-specific navigation.
- MongoDB-backed API for accounts, notices, classes, submissions, results, and examination workflows.
- Health endpoint for deployment checks.

> **Prototype note:** The current AI assistant uses predefined client-side responses. It is a UI/workflow prototype and is not connected to a language-model service.

## Technology

| Area | Stack |
| --- | --- |
| Client | React 18, Vite, Axios, Lucide React |
| Server | Node.js, Express, Zod |
| Database | MongoDB |
| Authentication | JSON Web Tokens and bcryptjs password hashing |
| Deployment | Render configuration for the API; compatible with a separately hosted static client |

## Project layout

```text
.
├── client/                 # React and Vite application
│   ├── src/main.jsx         # UI, pages, and client-side workflows
│   ├── src/styles.css       # Application styles
│   ├── .env.example         # Client environment template
│   └── vite.config.js       # Development server and /api proxy
├── server/                 # Express API and MongoDB access
│   ├── src/index.js         # Routes, auth, validation, and API startup
│   ├── src/db.js            # MongoDB connection, indexes, and admin bootstrap
│   └── .env.example         # Server environment template
├── render.yaml              # Render API service configuration
├── package.json             # npm workspaces and root commands
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or later
- npm
- A running MongoDB instance or MongoDB Atlas database

### Install dependencies

From the repository root:

```bash
npm install
```

### Configure environment

Copy the examples and set your local values:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Set `MONGODB_URI` and a private `JWT_SECRET` in `server/.env`. Keep the local Vite client on `VITE_API_BASE_URL=/api`; Vite forwards `/api` requests to `http://localhost:4000` during development.

### Start the application

```bash
npm run dev
```

The client runs at [http://localhost:5173](http://localhost:5173) and the API runs at [http://localhost:4000](http://localhost:4000). The first API request connects to MongoDB and creates the configured indexes. If both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the server creates an administrator account when that email does not already exist.

## Environment variables

### Server

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `4000` locally. |
| `NODE_ENV` | No | Runtime mode. Set to `production` in production. |
| `CLIENT_ORIGIN` | No | Comma-separated allowed browser origins; defaults to `http://localhost:5173`. |
| `MONGODB_URI` | Recommended | MongoDB connection URI. Defaults to local MongoDB at `mongodb://127.0.0.1:27017`. |
| `MONGODB_DB_NAME` | No | Database name; defaults to `campuspulse`. |
| `JWT_SECRET` | Production required | Secret used to sign authentication tokens. Use a long, random value. |
| `ADMIN_NAME` | No | Name for the bootstrap administrator. |
| `ADMIN_EMAIL` | For admin bootstrap | Email for the bootstrap administrator. |
| `ADMIN_PASSWORD` | For admin bootstrap | Initial administrator password. |

### Client

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL. Use `/api` with the local Vite proxy; set the deployed API URL (including `/api`) when hosting the client separately. |

Never commit `.env` files, credentials, database URIs, or production secrets.

## Available commands

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API and Vite client together. |
| `npm run build` | Build the client for production. |
| `npm run start` | Start the API server. |
| `npm test` | Run the server's Node.js test suite. |

Workspace commands are also available:

```bash
npm run dev --workspace client
npm run build --workspace client
npm run dev --workspace server
npm run start --workspace server
npm test --workspace server
```

## Roles and workflows

### Student registration and sign-in

Students and faculty can register through the client. An administrator account is created from the server bootstrap variables; administrator registration is not offered in the public sign-up form.

### Notices

Faculty or administrators publish a notice with an audience. Students see notices addressed to all students, General, their department, or their branch.

### Class profiles

Faculty create class profiles with department, branch, faculty details, photo, and signature. Students receive active profiles whose branch matches their own branch.

### Examination approval flow

1. A student submits an academic-fee request with semester and amount.
2. Faculty reviews and approves the fee request in **Exam approvals**.
3. The student submits the examination form and photograph.
4. Faculty approves or rejects the examination form.
5. The student sees the decision; approval unlocks the admit-card workflow.

## API overview

All routes are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check. |
| `POST` | `/auth/register` | Public | Register a student or faculty account. |
| `POST` | `/auth/login` | Public | Sign in and receive a bearer token. |
| `GET` | `/me` | Authenticated | Return the signed-in user. |
| `GET` | `/dashboard` | Authenticated | Load role-specific dashboard data. |
| `GET` | `/notices` | Authenticated | Search and list notices visible to the user. |
| `POST` | `/notices` | Faculty, administrator | Publish a notice. |
| `GET`, `POST` | `/classes` | Authenticated; create is faculty/admin | List or create class profiles. |
| `POST` | `/academic-fees` | Student | Submit an academic-fee approval request. |
| `GET` | `/exam-status` | Authenticated | Read the student's fee/form status. |
| `POST` | `/examination-form` | Student | Submit an examination form after fee approval. |
| `GET` | `/exam-requests` | Faculty, administrator | List fee requests and examination forms for review. |
| `PATCH` | `/academic-fees/:studentId/approve` | Faculty, administrator | Approve an academic-fee request. |
| `PATCH` | `/examination-forms/:studentId/review` | Faculty, administrator | Approve or reject an examination form. |
| `GET`, `POST` | `/assignments` | Authenticated; create is student | List or submit assignments. |
| `PATCH` | `/assignments/:id/review` | Faculty, administrator | Review an assignment. |
| `GET`, `PATCH` | `/results` | Authenticated; update is faculty/admin | Read or update student results. |
| `POST` | `/contact` | Public | Submit the contact form. |
| `GET` | `/admin/overview` | Administrator | Load administrator overview data. |

Authenticated endpoints expect:

```http
Authorization: Bearer <token>
```

## Deployment

### API on Render

The included `render.yaml` defines the API service. Configure its environment variables in Render, including `CLIENT_ORIGIN`, `MONGODB_URI`, and a secure `JWT_SECRET`. Provide `ADMIN_EMAIL` and `ADMIN_PASSWORD` if an initial administrator account is required. The health check is `/api/health`.

### Client on a static host

Build the client with `npm run build --workspace client` and deploy `client/dist`. Set `VITE_API_BASE_URL` to the deployed API base URL ending in `/api`, and set the API's `CLIENT_ORIGIN` to the client origin. Vite's local proxy is only for development.

## Contributing

Contributions are welcome. A useful contribution process is:

1. Open an issue describing the change or bug.
2. Create a focused branch from the current default branch.
3. Keep changes scoped and follow the existing React/Express patterns.
4. Run the relevant checks (`npm run build` and/or `npm test`).
5. Open a pull request with a summary, screenshots for UI changes, and verification notes.

Please do not include real student data, personal photographs, credentials, or production environment files in commits.

### Contributors

- **Aayush Sharma**
- **Aarnav Gupta**

## License

No license file or license grant is currently included in this repository. Until a license is selected and added, the source code is not granted for reuse, redistribution, or modification. Add the chosen license text as a `LICENSE` file before publishing the project as open source.
