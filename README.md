# CampusPulse

> A role based campus workspace for notices, academic timelines, faculty communication, and examination workflows.

CampusPulse brings student, faculty, and administrator tools together in one responsive web application. Faculty can publish notices and manage branch specific class profiles. Students can follow campus updates, submit academic requests, and track examination approvals.

[Features](#features) · [Technology](#technology) · [Quick start](#quick-start) · [Configuration](#configuration) · [API](#api-reference) · [Deployment](#deployment) · [Contributing](CONTRIBUTING.md) · [License](#license)

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository structure](#repository-structure)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Commands](#commands)
- [Roles and workflows](#roles-and-workflows)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Contributing](CONTRIBUTING.md)
- [Copyright and license](#copyright-and-license)

## Features

### Student workspace

- Browse notices for all students, a department, or a branch.
- Review deadlines, examination dates, results, and class faculty profiles.
- Submit academic fee approval requests and examination forms.
- Track faculty decisions and access the admit card workflow after approval.
- Submit a student profile and assignments for review.

### Faculty workspace

- Publish notices with a category, audience, and priority.
- Create class profiles for a department and branch.
- Review fee requests, examination forms, student profiles, assignments, and results.
- Approve or reject examination forms and provide assignment feedback.

### Administrator workspace

- Review campus activity and system overview metrics.
- Bootstrap an administrator account using server environment settings.

### Application experience

- Responsive React interface with role specific navigation.
- Express API with MongoDB persistence and indexes.
- JWT based authentication, password hashing, request validation, and a health endpoint.

> **Prototype note:** The AI assistant displayed in the client currently uses predefined client side responses. It is not connected to a language model service.

## Technology

| Area | Stack |
| --- | --- |
| Client | React 18, Vite, Axios, Lucide React, Recharts |
| Server | Node.js, Express, Zod |
| Database | MongoDB |
| Authentication | JSON Web Tokens, bcryptjs |
| Deployment | Render API configuration; client can be deployed to a static host such as Vercel |

## Repository structure

```text
.
├── client/                    # React and Vite application
│   ├── public/                 # Static images and public assets
│   ├── src/
│   │   ├── main.jsx            # Application UI and client workflows
│   │   └── styles.css          # Application styles
│   ├── .env.example            # Local client environment template
│   ├── .env.production.example # Deployed client environment template
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Dev server and local /api proxy
├── server/                     # Express API and MongoDB access
│   ├── src/
│   │   ├── db.js               # Database connection, indexes, admin bootstrap
│   │   └── index.js            # Routes, authentication, validation, startup
│   ├── .env.example            # Server environment template
│   └── package.json
├── CONTRIBUTING.md             # Contribution workflow and pull request checklist
├── LICENSE                     # Apache License 2.0
├── package.json                # npm workspaces and root scripts
├── render.yaml                 # Render API service configuration
└── README.md
```

Build output (`client/dist`), dependencies (`node_modules`), and local environment files are generated or machine specific; they are not part of the maintained source layout.

## Quick start

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB local instance or MongoDB Atlas database

### Install dependencies

Run from the repository root:

```bash
npm install
```

### Configure local environment

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Set `MONGODB_URI` and a private `JWT_SECRET` in `server/.env`. For local development, keep `VITE_API_BASE_URL=/api`; Vite proxies API requests to `http://localhost:4000`.

### Run the app

```bash
npm run dev
```

The Vite client is available at [http://localhost:5173](http://localhost:5173), and the API listens at [http://localhost:4000](http://localhost:4000). The server connects to MongoDB on its first database request and ensures indexes. If both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured, it creates an administrator account when that email is not already present.

## Configuration

### Server environment

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `4000` locally. |
| `NODE_ENV` | No | Runtime mode; use `production` in production. |
| `CLIENT_ORIGIN` | No | Comma separated allowed browser origins; defaults to `http://localhost:5173`. |
| `MONGODB_URI` | Recommended | MongoDB connection URI; defaults to local MongoDB. |
| `MONGODB_DB_NAME` | No | Database name; defaults to `campuspulse`. |
| `JWT_SECRET` | Production required | Secret for signing tokens. Use a long, random value. |
| `ADMIN_NAME` | No | Name for the bootstrap administrator. |
| `ADMIN_EMAIL` | For admin bootstrap | Email for the bootstrap administrator. |
| `ADMIN_PASSWORD` | For admin bootstrap | Initial administrator password. |

### Client environment

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL. Use `/api` with local Vite proxy; use the deployed API URL ending in `/api` when hosted separately. |

The checked in `.env.example` files are templates. Never commit actual `.env` files, credentials, personal student data, or production secrets.

## Commands

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and client development servers together. |
| `npm run build` | Build the client for production. |
| `npm run start` | Start the API server. |
| `npm test` | Run the server's Node.js test suite. |

Workspace specific commands:

```bash
npm run dev --workspace client
npm run build --workspace client
npm run dev --workspace server
npm run start --workspace server
npm test --workspace server
```

## Roles and workflows

### Accounts

Students and faculty register through the client. Public registration does not offer the administrator role. An administrator is provisioned through `ADMIN_EMAIL` and `ADMIN_PASSWORD` during database initialization.

### Notices and class profiles

Faculty and administrators can publish notices with an audience. Student views are filtered against the notice audience and the student's department or branch. Faculty can create class profiles; students see active profiles for their branch.

### Examination approval flow

1. A student submits an academic fee request with semester and amount.
2. Faculty or an administrator reviews the request in **Exam approvals**.
3. The student submits the examination form and photograph after fee approval.
4. Faculty or an administrator approves or rejects the form.
5. The student sees the decision; approval unlocks the admit card workflow.

### Student work and results

Students can submit their profile and assignments. Faculty or administrators review submitted work and update results.

## API reference

All application endpoints are prefixed with `/api`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check. |
| `POST` | `/auth/register` | Public | Register a student or faculty account. |
| `POST` | `/auth/login` | Public | Sign in and receive a bearer token. |
| `GET` | `/me` | Authenticated | Return the signed in user. |
| `GET` | `/dashboard` | Authenticated | Load role specific dashboard data. |
| `GET`, `POST` | `/notices` | Authenticated; create is faculty/admin | List visible notices or publish a notice. |
| `GET`, `POST` | `/classes` | Authenticated; create is faculty/admin | List or create class profiles. |
| `POST` | `/academic-fees` | Student | Submit fee approval request. |
| `GET` | `/exam-status` | Authenticated | Read fee and examination status. |
| `POST` | `/examination-form` | Student | Submit examination form after fee approval. |
| `GET` | `/exam-requests` | Faculty, administrator | List fee requests and examination forms for review. |
| `PATCH` | `/academic-fees/:studentId/approve` | Faculty, administrator | Approve an academic fee request. |
| `PATCH` | `/examination-forms/:studentId/review` | Faculty, administrator | Approve or reject an examination form. |
| `GET` | `/submissions` | Authenticated | Load student profiles and assignments for the current role. |
| `POST` | `/student-profile` | Student | Submit profile for faculty verification. |
| `POST` | `/assignments` | Student | Submit an assignment. |
| `PATCH` | `/assignments/:id/review` | Faculty, administrator | Review an assignment. |
| `GET`, `PATCH` | `/results` | Authenticated; update is faculty/admin | Read or update results. |
| `POST` | `/contact` | Public | Submit contact form. |
| `GET` | `/admin/overview` | Administrator | Load administrator overview data. |

Authenticated routes expect a bearer token:

```http
Authorization: Bearer <token>
```

## Deployment

### API on Render

The included `render.yaml` defines the API service and `/api/health` check. Configure `CLIENT_ORIGIN`, `MONGODB_URI`, and a secure `JWT_SECRET` in the Render environment. Provide `ADMIN_EMAIL` and `ADMIN_PASSWORD` if the service needs to provision its initial administrator.

### Client on a static host

Build the client with:

```bash
npm run build --workspace client
```

Deploy `client/dist`. Set `VITE_API_BASE_URL` to the deployed API URL ending in `/api`, then set the API's `CLIENT_ORIGIN` to the client origin. The Vite proxy applies only during local development. The client repository contains `.env.production.example` as a starting point for production configuration.

## Security notes

- Use a unique, long random `JWT_SECRET` in deployed environments. The built in fallback is for development only.
- Restrict `CLIENT_ORIGIN` to trusted deployed client origins.
- Keep `ADMIN_PASSWORD`, database credentials, and real user information out of source control.
- User submitted images and assignment files are sent as data URLs; consider storage limits and retention needs before production use.
- This repository does not include a privacy policy, institutional data processing agreement, or production security audit.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, change guidelines, pull request details, and contributor recognition.

## Copyright and license

Copyright (c) 2025 CampusPulse contributors. All rights reserved except as expressly granted under the license.

This project is licensed under the [Apache License, Version 2.0](LICENSE). You may use, modify, and distribute the software under that license. Contributions submitted to this repository are provided under the same license, as described in [CONTRIBUTING.md](CONTRIBUTING.md).

The project license applies to the project code and documentation. Third party dependencies, fonts, and media assets may have separate terms; review their respective licenses before reuse.
