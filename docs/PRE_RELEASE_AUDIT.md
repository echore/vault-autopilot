# Pre-Release Audit — Vault Autopilot

Date: 2026-07-18. Three parallel independent reviews (security attack surface,
core-logic correctness, runtime lifecycle) of the full plugin before public
submission to the Obsidian community plugin store.

Items marked ✅ VERIFIED were reproduced by actually running the code, not just
read.

Legend for "extension impact": whether fixing the item changes the
extension↔plugin `/clip` contract. The contract is locked by
`tests/` (commit 171aa6f) — anything touching `clip-validate.ts` must be checked
against the real extension payload first, so new validation only rejects data
the extension never sends.

---

## 🔴 Must fix — data loss / corrupted files (users hit these in week 1)

### A. User-added `##` headings destroyed on next clip merge — ✅ VERIFIED
- Where: `src/video-note.ts:150-159,190`
- Trigger: a note already has a hand-written `## 我的分析`; the same video is
  clipped again → the heading is rewritten to the plugin's standard heading
  (content kept, heading name lost) and re-sorted.
- Root cause: `parseSections` falls back to `kind='motion'` for unrecognized
  headings, then `emojiHeading` replaces the heading text.
- Fix: leave unrecognized sections untouched (kind `null` → skip
  emojiHeading/renumber, keep original position or append at end).
- Size: small + reproduction test.
- Extension impact: none (plugin-internal).

### B. Videos with `[` `]` `#` in the title fail
- Where: `src/util.ts:8` (`sanitize` only strips `/\:*?"<>|`)
- Trigger: very common YouTube titles — `[Official Video]`, `[4K]`, `C#` →
  Obsidian rejects the note name (500) or the `![[...]]` embed breaks on the
  brackets.
- Fix: add `#^[]` to the strip set.
- Size: one line + test.
- Extension impact: none.

### C. Notes edited once in the Properties panel become permanently unmatchable
- Where: `src/clip-router.ts:174` (matches on exact substring `video_id: "x"`),
  `src/video-note.ts:211`
- Trigger: user edits any property in Obsidian's Properties UI → Obsidian
  re-serializes frontmatter and drops the quotes (`video_id: abc123`) →
  `findNoteByVideoId`'s quoted-substring match never matches again → every
  later clip of that video creates a NEW duplicate note; split is permanent.
  `addDimension`'s regex also stops matching block-style lists.
- Fix: match `video_id:\s*"?x"?` (regex-escaped id), or resolve via
  `metadataCache` frontmatter; make `addDimension` tolerate block lists.
- Size: medium.
- Extension impact: none.

### D. Concurrent clips for the same video race
- Where: `src/main.ts:161-172` (each POST handled independently, awaits
  downloads/reads mid-flight), `src/clip-router.ts:47-75`
- Trigger: double-click / extension retry → different modes: last writer
  discards the first's section; same new video: both `vault.create` the same
  path → 500; first-run `ensureFolder` check-then-create races the same way.
- Fix: chain clip handling through a single promise queue in `onClip`.
- Size: small but needs care.
- Extension impact: none.

### E. Images under ~4 KB written corrupted — ✅ VERIFIED
- Where: `src/clip-router.ts:137,241` (`bytes.buffer as ArrayBuffer` without
  offset)
- Trigger: small/black/low-res frames sit inside Node's shared 8 KB Buffer
  pool; the whole pool (with unrelated memory garbage) gets written as the
  image file.
- Fix: `bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)`.
- Size: one line.
- Extension impact: none.

---

## 🔴 Must fix — security (needs a malicious web page the user visits, but real)

Context: the `/clip` endpoint is CSRF-reachable. CORS blocks *reading* the
response but not *sending* the request — a page can POST JSON as
`Content-Type: text/plain` (a CORS "simple request", no preflight) and the
handler runs its side effects. There is no auth token.

### F. SSRF — download validates scheme but not host
- Where: `src/util.ts:13-17` (`assertDownloadable`) + `src/main.ts:137-143`
- Trigger: malicious page POSTs `thumbnail_url: http://169.254.169.254/...`
  (cloud metadata), `http://127.0.0.1:PORT/...`, or RFC-1918 addresses →
  plugin issues the GET (requestUrl bypasses CORS) and writes the response body
  into the vault as `<video_id>.webp`. If the vault syncs to a public repo /
  Obsidian Publish, this is an exfiltration primitive. Also: 25 MB cap is
  checked *after* full buffering → memory amplification.
- Fix: in `assertDownloadable`, reject literal private/loopback/link-local
  hosts (`127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`, `::1`,
  `fc00::/7`, `localhost`, `.local`). Bound the download read pre-buffer.
- Size: medium.
- Extension impact: half — a host denylist only blocks private/loopback
  addresses; normal YouTube/Bilibili CDN URLs the extension sends are
  unaffected.

### G. YAML + markdown body injection
- Where: `src/video-note.ts:111,116` (`platform`, `published_at` interpolated
  raw, bypassing `yamlString`); `src/video-note.ts:119,78` and
  `src/clip-router.ts:103` (title/transcript written raw, not newline-stripped)
- Trigger: thumbnail fields are only checked for existence, not content. A
  crafted `platform`/`published_at` injects frontmatter keys; a crafted title
  or transcript with newlines + backticks injects a fenced block. If the user
  has the **Dataview** plugin with JS enabled (common in this plugin's target
  workflow), an injected ` ```dataviewjs ` block executes arbitrary JS on
  render.
- Fix: wrap `platform`/`published_at` in `yamlString` (and update the
  `syncOverview` parsers to tolerate quotes); strip newlines/backticks from
  title/transcript before body interpolation; add `typeof === 'string'`
  validation for title/platform/published_at/transcript/channel in
  `clip-validate.ts`.
- Size: medium.
- Extension impact: ⚠️ the added `clip-validate` field checks must match the
  extension's real payload — validate only fields the extension already sends,
  in its real format. Check against the contract test (commit 171aa6f) first.

---

## 🟡 Should fix — hit in normal use, not fatal

- **YouTube Shorts / Live URLs not recognized** (`src/util.ts:37-56`):
  `youtube.com/shorts/<id>` and `/live/<id>` fall back to the full URL as the
  key → same video clipped from shorts vs watch URL splits into two notes, and
  Shorts get no gallery cover. Hook mode is exactly the Shorts use case. (Same
  class, lower priority: `b23.tv` / `xhslink.com` share-links.)
  Extension impact: none (plugin-side URL parsing).
- **Keyframe missing `time_range` validation** (`clip-validate.ts` +
  `src/clip-router.ts:253` dereferences `payload.time_range.start`) → TypeError
  → 500 on a drifted/third-party client. Extension impact: ⚠️ check contract —
  the real extension already sends `time_range` for keyframe, so this only
  rejects malformed third-party clients; confirm first.
- **`video_title: null` / missing thumbnail title → `# undefined` / `# null`**
  (`src/video-note.ts:119`). Fix: coerce null/undefined to `''`. Extension
  impact: none.
- **Port change in settings never restarts the server** (`src/settings.ts:195`):
  the port field's onChange only saves; server keeps listening on the old port
  until Obsidian restarts. Extension impact: none.
- **EADDRINUSE leaves the plugin thinking the server runs** (`src/main.ts:173`):
  `/ping` and clips silently dead until the user toggles. Extension impact:
  none.
- **No `req.on('error')` in the body-read path** (`src/server.ts:89`): client
  disconnect mid-POST → uncaught exception (renderer console noise). Extension
  impact: none.
- **restartServer close→listen same-tick race** (`src/main.ts:63-67`): can lose
  the race → EADDRINUSE → the dead-state above. Fix: close with a callback,
  start in it. Extension impact: none.

---

## 🟢 Defer — cosmetic / performance

- Gallery rebuilds and scroll-resets on every vault-wide metadata resolve
  (`src/gallery-view.ts:27,68`); also emits a broken `<img>` when a cover file
  is missing.
- Every clip full-reads every note in the videos folder to find a match
  (`src/clip-router.ts:166-177`) — slow on large / iCloud vaults. Same fix as
  finding C (use metadataCache).
- 255-byte filename limit with CJK: `slice(0, 60)` counts characters, not bytes,
  and can split an emoji surrogate pair (`src/util.ts:8`).
- Empty `images: []` / `frames: []` pass validation → blank callout.
- `ensureFolder` throws on leading-slash folder settings and on
  externally-created-but-not-yet-indexed folders (`src/main.ts:69-78`).
- Partial state on mid-clip write failure (iCloud full/offline): images written
  before the note → orphan images accumulate on hook/keyframe/screenshot
  retries (fresh timestamp stem each time).

---

## ✅ Confirmed solid

- Path traversal / vault escape: every payload string that becomes a path goes
  through `sanitize`/`safeFileId` + a `[A-Za-z0-9_-]` gate; `../`, absolute
  paths, drive letters all rejected.
- `sopPath` reading: comes only from settings (`data.json`), never influenced by
  a `/clip` payload.
- Bilingual round-trip: heading recognition via `variants()`, dimension dedupe
  by kind not string; zh notes survive an en plugin and vice versa (except the
  finding-C frontmatter-rewrite case).
- gallery-model / collectCards: fully guarded against hand-edited notes — no
  crash path.
- Body size cap checked incrementally before buffering; `JSON.parse` wrapped in
  try/catch.
- loadSettings migration deep-merges over defaults; a 0.1.0 `data.json` gets new
  keys filled. `normalizePort` handles all bad inputs.
- Deep links `encodeURIComponent` both vault name and path.
- All vault writes go through the Obsidian vault API. `manifest` uses no API
  newer than app 1.4.0; `isDesktopOnly: true` is load-bearing (node builtins
  imported at top level → atomic load failure on mobile, no partial run).
- `onunload` closes the server and nulls the reference; no timers/intervals to
  leak.

---

## Recommended fix order before submission

1. A, B, E — smallest, highest user-facing impact, all verified or one-liners.
2. C, D — data integrity, medium effort.
3. F, G — security; do G's validation changes only after checking the extension
   contract test.
4. 🟡 items as a batch.

Each fix follows the project's TDD rule: failing reproduction test → fix →
green → one commit per fix. Bundle the pre-submission changes into a single
`0.4.2` release.
