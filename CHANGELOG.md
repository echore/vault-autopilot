# Changelog

## 0.4.3

Obsidian plugin review fixes. No functional changes.

- Remove "Obsidian" from the manifest description per plugin guidelines.
- Await `workspace.revealLeaf()` (async since Obsidian 1.7.2) and raise `minAppVersion` to 1.7.2 accordingly.
- Replace inline style assignments in the settings tab with a CSS class (identical appearance).

## 0.4.2

Pre-submission audit fixes. No changes to the extension↔plugin `/clip` contract.

Data integrity:
- A hand-written `##` section is preserved when the same video is clipped again, instead of being renamed to a standard heading and re-sorted.
- Titles containing `[` `]` `#` `^` (e.g. `[Official Video]`, `C#`) no longer produce a note name Obsidian rejects or an embed that breaks.
- Notes are matched by parsed frontmatter (via metadataCache), so editing a property in Obsidian's Properties panel no longer orphans the note and split it into duplicates on the next clip.
- Concurrent clips of the same video (double-click / retry) are serialized, so one no longer discards the other's section or collides on note creation.
- Small image frames are written as exactly their own bytes instead of a shared Buffer pool slice.

Security (the local `/clip` endpoint is CSRF-reachable):
- Cover/thumbnail downloads reject literal private, loopback, and link-local hosts (localhost, `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`, IPv6 loopback/ULA/link-local), closing an SSRF path into LAN and cloud-metadata addresses.
- Frontmatter and note bodies are hardened against injection: `platform`/`published_at` are YAML-escaped, and untrusted titles/transcripts can no longer open a fenced code block (which, with Dataview JS enabled, would execute on render).

Robustness:
- YouTube Shorts and Live URLs are recognized as the same video as the watch URL.
- Changing the port in settings now restarts the server immediately.
- A failed server bind (e.g. port in use) surfaces a notice instead of silently pretending the server is running, and server restarts no longer race their own socket close.
- A client that disconnects mid-request no longer logs an uncaught exception.

## 0.4.1

- Security hardening for the local `/clip` endpoint: payloads are validated and normalized before anything touches the vault. Malformed bodies and unknown modes now get a safe 400 response, and error responses no longer leak internal details.
- Untrusted video ids are sanitized before becoming vault file names, so a crafted id cannot escape the covers folder.
- Note frontmatter values (title, channel, urls) are escaped, so quotes or newlines in a video title can no longer corrupt a note's YAML.
- Cover and thumbnail downloads are restricted to http(s) URLs with a 25 MB size cap.
- An out of range port value in saved settings now falls back to the default 17183.
- Video frames are saved with a `.jpg` extension matching their actual JPEG bytes; screenshots stay `.png`.
- Docs: the network use disclosure now spells out why the local endpoint is unauthenticated and what the worst case is.

## 0.4.0

- Video notes now carry the video's original publish date (`published_at`) in frontmatter; existing notes are backfilled on the next upsert from the same video.
- Gallery cards show the publish date, falling back to the clip date when the platform does not expose one.
- The 16:9 wide-embed fix now also applies in Live Preview, not only Reading view.
- Bundled analysis SOPs (cover, hook, keyframe) synced with the latest rewritten vault versions.

## 0.3.0

- Video library gallery: a ribbon icon opens a native cover-card view of every video note, no Dataview or CSS snippets needed. Filter chips are data driven: platforms (when more than one), analysis dimensions (localized), deep dives (when present), and frequent creators. Cards open their notes; the view refreshes as new clips arrive.
- The gallery and all its labels follow the plugin language setting (English and Chinese).
- Video embeds in notes now render wide at 16:9 on every install (the fix ships in the plugin's styles.css, scoped to YouTube and Bilibili embeds).

## 0.2.0

- Base folder setting: change one field and the four storage paths follow automatically. A Restore button resets the factory layout under `Clips/`.
- Built-in analysis SOPs (cover, hook, keyframe; each in Chinese and English) ship inside the plugin and are on by default: a mode whose SOP path is empty now carries its built-in analysis prompt in every saved note. A master switch in settings turns this off for material-only clipping.
- Per-mode Customize button forks the built-in SOP into `<Base folder>/SOPs` and points that mode's SOP path at the copy; clearing the path returns the mode to built-in. Each SOP row shows which source is currently in effect.
- SOP paths accept vault-relative paths in addition to absolute ones.
- English settings copy avoids dashes; all new settings strings are bilingual (English and Chinese).

## 0.1.0 — Initial release

First public release of Vault Autopilot, the vault-side companion to the **Obsidian Visual Clipper** Chrome extension.

- Local HTTP server (bound to `127.0.0.1:17183` by default) receives clips from the extension via `POST /clip` and writes structured notes and images into the vault.
- `GET /ping` health endpoint (`{ app: 'vault-autopilot', version }`) so the extension can self-check the connection.
- Four clip modes: video cover, hook, keyframe, and webpage screenshot.
- **One note per video**: cover, hook, and keyframe clips from the same video upsert sections into a single note — whichever clip arrives first creates it. Webpage screenshots are saved as standalone notes.
- Zero-config folder defaults: `Clips/Videos` (video notes), `Clips/Videos/covers` (cover images), `Clips/Videos/frames` (hook/keyframe frames), `Clips/Screenshots` + `Clips/Screenshots/frames` (screenshot notes and images) — all overridable in settings.
- Settings UI: 存储位置 (storage locations, 4 fields) and 高级 (advanced: HTTP server toggle, port, max frames per clip, per-mode SOP paths). Leaving a mode's SOP path empty puts it in material-only mode (no analysis prompt block in the note).
- Configurable port as an escape hatch for conflicts (default changed from `27183` to `17183` to avoid colliding with `scrcpy`'s port range; existing installs on the old default migrate automatically).
- First-save notice: a one-time notification per clip mode telling the user where their first note of that type landed.
- Desktop-only (`isDesktopOnly: true`) — required because the plugin runs a local Node HTTP server, which is unavailable on Obsidian mobile.
- Privacy: the HTTP server only binds to loopback and only accepts `/clip` requests from a `chrome-extension://` origin; the only outbound network request the plugin makes is downloading a video's cover image from its source platform's CDN.
