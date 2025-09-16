# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript sources for the GitHub Action (entry: `src/index.ts`).
- `dist/`: (legacy) Compiled JS emitted by `tsc`. Not required by the action anymore.
- `action.yml`: Composite action metadata (inputs/outputs). Installs Bun and runs `src/index.ts` directly.
- Config: `.eslintrc.js`, `.prettierrc`, `tsconfig.json`.
- Docs: `README.md` (usage), this file.

## Build, Test, and Development Commands
- `bun install`: Install dependencies (uses `bun.lock`).
- `bun run build`: Type-check/compile with `tsc` (no longer required for running the action).
- `bun run lint`: Lint sources with ESLint.
- `bun run format` / `bun run check-format`: Apply/check Prettier formatting.
- Local run example:
  - `INPUT_USER="$GITHUB_ACTOR" INPUT_GITHUB_TOKEN="$GITHUB_TOKEN" INPUT_DELIMITER="/" INPUT_FILES="README.md" INPUT_PLACEHOLDER="{{github_profile_bio}}" bun src/index.ts`

## Coding Style & Naming Conventions
- Indentation: 2 spaces; line width 100; semicolons required; single quotes; trailing commas (ES5). Prettier enforces.
- TypeScript: `strict` enabled. Prefer explicit return types. Avoid `any`.
- Naming: `camelCase` for vars/functions, `PascalCase` for types/interfaces, `UPPER_SNAKE_CASE` for constants.
- Keep modules small and pure; side effects limited to file I/O and `@actions/core` logging.

## Testing Guidelines
- No test framework is bundled yet. For contributions adding logic, include lightweight unit tests (e.g., Vitest/Jest) under `tests/` or `src/**/*.spec.ts` and add a `bun run test` script.
- Validate parsing with representative bios and edge cases (missing `:`, extra `/`, unicode keys).

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (e.g., `feat: add placeholder escaping`, `fix: handle missing files`). Keep messages in imperative mood.
- PRs: Include a short description, before/after example of the generated table, and notes on inputs affected. Link related issues and attach screenshots if editing docs.
- Pre-submit: `bun run pre-commit` (format → lint → build) should pass. Committing `dist/` is no longer necessary because the Action runs via Bun at runtime.

## Security & Configuration Tips
- Treat fetched bios as untrusted user content; avoid logging sensitive data and validate before further processing.
- File updates are path-based; prefer repo‑relative files and review patterns to avoid unintended writes.
- Use `github_token` to avoid REST API rate limits when auto-fetching bios.
