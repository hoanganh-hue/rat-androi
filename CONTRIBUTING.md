# Contributing to DogeRat Web Admin

Thanks for your interest in contributing! This document outlines a simple workflow to help keep the project consistent and easy to maintain.

## Getting Started
- Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
- Use Node.js 20.x and Angular 20.x
- Install deps: `npm install && (cd client && npm install)`

## Development
- Backend dev: `npm run dev`
- Frontend dev: `(cd client && npm start)`
- Lint/type-check: `npm run check && (cd client && npm run build --configuration development)`
- Tests (backend): `npm test`
- Tests (frontend): `(cd client && npm test)`

## Code Style
- TypeScript for both FE/BE
- ESLint + Prettier configuration already included
- Prefer small, focused PRs with clear descriptions

## Commit Messages
Follow conventional commits where possible:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` tests only
- `build/chore/refactor:` maintenance

## Pull Request Checklist
- [ ] Target branch is `develop` (unless hotfix)
- [ ] Description: what/why/how and screenshots if UI changes
- [ ] Tests added or updated when appropriate
- [ ] Lint/type-check pass locally
- [ ] No secrets in code (env vars via `.env`)

## Security
- Never commit secrets or credentials
- Report vulnerabilities to `security@dogerat.com`

## License
By contributing, you agree that your contributions will be licensed under the MIT License.

