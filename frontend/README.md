# Frontend Scaffold

Next.js App Router monorepo scaffold for JobAppliesTracker.

## Workspace

- App: `apps/web`
- Shared UI package: `packages/ui`
- Shared ESLint config: `packages/eslint-config`
- Shared TypeScript config: `packages/typescript-config`

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
```

## API Types

Generate API types from the backend OpenAPI schema:

```bash
pnpm --filter web types:generate
```
