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

Self-check: "Could a senior engineer call this over-engineered?" If yes, simplify. Can 50 lines solve it? Don't write 200.

### Think Before Coding
Before touching any file:
- State your assumptions explicitly. If something is ambiguous, stop and ask — don't silently pick one interpretation.
- If there's a simpler approach, say so and push back.
- If anything is unclear, say exactly what's unclear before proceeding.

### Surgical Changes
Only touch what is required by the task.
- Do not "improve" adjacent code, comments, or formatting that wasn't asked about.
- Do not refactor working code.
- Match the style of existing code, even if you'd do it differently.
- If you spot unrelated dead code: mention it, don't delete it.

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

## Agent Reporting Standards

Every step must end with a real report — not "done":
- Run the test command and paste the actual output (e.g. `7 passed, 0 failed`)
- If TypeScript is involved, confirm `tsc --noEmit` is clean
- Never say "should work" or "appears complete" without evidence

**API keys:** When reading config files that contain keys/tokens, only report status ("key is present"). Never print the raw value.

**Bug fixes:** Must follow this sequence — (1) write a test that reproduces the bug, (2) fix the root cause, (3) confirm no other tests broke. Do not fix by guessing.

**Settings UI changes (Task 8):** Before writing any UI code, state in one sentence what the expected user-visible behavior will be. Get confirmation before proceeding.

## Forbidden

- Do not add features not in the plan
- Do not merge Task commits
- Do not skip the TDD red→green cycle
- Do not add comments explaining what code does (only WHY if non-obvious)
- Do not print raw API keys or tokens in any output
