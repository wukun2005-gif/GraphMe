# GraphMe Project Rules

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm test` | Run all E2E tests (vitest run) |
| `npm run test:watch` | Watch mode |
| `npm run check` | TypeScript type check (tsc -b) |
| `npm run build` | Full build: check + vite build |
| `npx vitest run path/to/test` | Run a single test file |

## Before Every Commit

**AI must run these commands and ensure they all pass:**

```bash
npm run check     # TypeScript type check — must exit 0
npm test          # All 112 tests in 4 suites — must be 112/112 passed, 0 failed
npm run build     # Production build — must succeed
```

**Failure = DO NOT COMMIT.** Fix the errors before proceeding.

## Test Suites (src/__tests__/)

| File | Tests | Covers |
|------|-------|--------|
| `data-model.test.ts` | 31 | Demo data 10-dimension integrity, emotion colors, insight categories |
| `state-management.test.ts` | 31 | AppContext CRUD, views, demo mode, chat, navigation |
| `business-logic.test.ts` | 21 | Insight version chains, narrative refs, dimension cross-validation |
| `integration.test.ts` | 29 | Complete workflows, PRD compliance, demo flow |

## Code Conventions

- TypeScript + React with `tsx` (not JSX)
- No comments unless asked (project policy)
- State management via `src/store/AppContext.tsx` (React Context + useReducer)
- Styles via Tailwind CSS + `src/index.css`
- Path alias: `@/` maps to `src/`
- Demo data in `src/data/demoData.ts`