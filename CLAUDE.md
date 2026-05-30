# Vault Autopilot — Project Instructions

## What This Is

A general-purpose Obsidian plugin. When a new file appears in a watched folder, it reads a user-configured SOP/prompt, calls an AI provider, and writes the output as a note.

This is a standalone repo at `~/Documents/fang/vault-autopilot/`. All paths in this repo use no prefix — `src/`, `tests/`, `docs/` are at the root.

## Implementation Plan

`docs/superpowers/plans/2026-05-30-vault-autopilot-v3.md`

The plan has Tasks 0–9 (Task 10–11 are Chrome extension + integration tests, done separately).

## Core Development Principles

### TDD — Non-negotiable
Every Task with logic must:
1. Write failing tests first
2. Run tests — confirm they fail
3. Implement the code
4. Run tests — confirm they pass
5. Commit

Tasks 0 (scaffold), 1 (types), 8 (settings UI), 9 (main.ts) have no unit tests — commit directly after implementing.

### YAGNI — Strict
Only implement what the plan explicitly requires. No extra error handling, no extra abstractions, no "nice to haves".

### Task Isolation
- One commit per Task
- Never merge two Tasks into one commit
- Never implement Task N+1 work while doing Task N

### Sub-agent Execution
Each Task is implemented by an independent sub-agent. After implementation, run two review passes:
1. Spec compliance — does it match the plan?
2. Code quality — YAGNI, no unnecessary complexity

## File Structure

```
src/
  types.ts
  providers/
    cli-base.ts
    openai-compat.ts
    anthropic.ts
    gemini-api.ts
  path-detector.ts
  processor.ts
  server.ts
  startup-check.ts
  settings.ts
  main.ts
tests/
  __mocks__/obsidian.ts
  providers/
    cli-base.test.ts
    openai-compat.test.ts
    anthropic.test.ts
    gemini-api.test.ts
  path-detector.test.ts
  processor.test.ts
  server.test.ts
```

## Commands

```bash
npm test              # run all tests
npx jest <file>       # run single test file
npm run build         # tsc check + esbuild bundle → main.js
npm run dev           # esbuild watch mode
```

## Git Rules

- `main.js` is gitignored (build artifact). To release: `git add -f main.js`
- Commit messages: `feat: <what>` for new code, `fix: <what>` for bug fixes
- Never `--no-verify`

## Forbidden

- Do not add features not in the plan
- Do not merge Task commits
- Do not skip the TDD red→green cycle
- Do not add comments explaining what code does (only WHY if non-obvious)
