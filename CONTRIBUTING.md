# Contributing to CampusPulse

Thanks for helping improve CampusPulse. This guide describes how to propose and prepare changes.

## Before you begin

- Check existing issues and pull requests for related work.
- For larger feature changes, open an issue first to discuss the scope and approach.
- Do not include real student records, personal photographs, credentials, production environment files, or other private data in an issue or commit.

## Development setup

1. Install Node.js 20 or later and npm.
2. Clone the repository and run `npm install` from the project root.
3. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.
4. Configure a local MongoDB connection and a development `JWT_SECRET` in `server/.env`.
5. Start both applications with `npm run dev`.

## Change guidelines

- Keep each change focused and explain the user or maintenance problem it addresses.
- Follow the existing React, Express, and JavaScript module conventions.
- Validate request payloads and enforce authentication and role checks for new API routes.
- Keep secrets and personal information out of source files, logs, screenshots, and test fixtures.
- Update the README or other documentation when behavior, configuration, or API contracts change.
- Avoid adding dependencies when the existing stack can support the change.

## Branches and commits

Use a short, descriptive branch name, for example `feat/notice-filters` or `fix/exam-review`. Use clear commit messages that summarize the change, such as `Add notice audience filtering`.

## Verification

Before opening a pull request, run the checks relevant to your change:

```bash
npm run build
npm test
```

If a check cannot be run, explain why and include any manual verification performed. For UI changes, include screenshots or a short recording when useful.

## Pull requests

A pull request should include:

- A concise summary and motivation.
- The key implementation choices, especially API or data changes.
- Verification steps and their results.
- Screenshots for meaningful visual changes.
- Any required environment or deployment changes.

Keep pull requests small enough to review, and respond to review feedback with follow-up commits.

## Contributor recognition

Contributors may be recognized in the project documentation or release notes. The current README credits **Aayush Sharma** and **Aarnav Gupta** as project contributors; please open a pull request if that recognition needs correction or expansion.

## License and contribution terms

By submitting a contribution to this repository, you agree that it will be licensed under the repository's [Apache License 2.0](LICENSE). You retain copyright in your contribution and grant the rights described by that license. Unless you explicitly state otherwise, you confirm that you have the right to submit the contribution under these terms.
