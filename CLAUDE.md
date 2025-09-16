# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Action that converts profile bio text to markdown table format. It parses bio strings with `key: value` pairs separated by `/` and generates markdown tables for insertion into files.

## Development Commands
- **Build**: `bun run build` - Type-checks/compiles with `tsc` (not required to run the action)
- **Lint**: `bun run lint` - Runs ESLint on TypeScript files
- **Format**: `bun run format` - Formats code with Prettier
- **Check format**: `bun run check-format` - Verifies code formatting
- **Pre-commit**: `bun run pre-commit` - Runs format, lint, and build in sequence

## Core Architecture

- **Main entry**: `src/index.ts` - Single file containing all logic
- **Runtime**: Bun executes TypeScript directly in the composite action
- **Core functions**:
  - `convertBioToTable()` - Parses bio string and generates markdown table
  - `updateFiles()` - Replaces placeholders in specified files
  - `main()` - Entry point that handles GitHub Actions inputs/outputs

## GitHub Action Configuration

- **Using**: Composite action (`using: composite`)
- **Steps**: Installs Bun, installs deps, runs `bun src/index.ts`
- **Inputs**: `user`, `github_token`, `delimiter`, `files`, `placeholder`
- **Outputs**: `table` (propagated from the run step via `@actions/core.setOutput`)
- **Action metadata**: Defined in `action.yml`

## Development Notes

- Uses Bun as package manager and task runner
- Strict TypeScript configuration with comprehensive compiler checks
- CI runs format check, lint, and (optional) build verification
- Committing built files in `dist/` is no longer needed for the Action
- Bio parsing expects format: `key: value / key: value / ...`
