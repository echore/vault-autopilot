# Changelog

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
