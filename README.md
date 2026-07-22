**English** | [简体中文](https://github.com/echore/vault-autopilot/blob/master/README.zh.md)

# Vault Autopilot

Vault Autopilot receives clips from the companion Chrome extension, **[Obsidian Visual Clipper](https://github.com/echore/visual-clipper)**, and writes them into structured notes and images in your vault — automatically, with no manual paste-and-format step.

The plugin and the extension are a suite: the extension captures (screenshots, video covers, hooks, keyframes) from your browser; this plugin receives and files them. Neither is useful without the other.

## What it does

- **Webpage screenshots** → saved as a standalone note, with images placed in a `frames/` subfolder.
- **Video clips** (cover, hook, keyframe) → all clips from the same video are merged into **one note per video**. Whichever clip type arrives first creates the note; later clips upsert new sections into it.
- Every clip response includes an `obsidian://` deep link back to the note that was created or updated, so the extension can jump you straight to it.

## Install

**Community plugin store** (recommended): open Obsidian → Settings → Community plugins → Browse → search "Vault Autopilot" → Install → Enable.

Vault Autopilot is **desktop-only** — it runs a local Node HTTP server, which is not available on Obsidian mobile.

You'll also need the [Obsidian Visual Clipper](https://github.com/echore/visual-clipper) Chrome extension installed for anything to actually reach the plugin.

## Quickstart

Vault Autopilot works with **zero configuration**. Install and enable the plugin, install the extension, and start clipping — notes land in the default `Clips/` folders described below.

To confirm the two sides are talking to each other, open the extension's welcome page: it runs a live self-check against the plugin's health endpoint and lets you send a test clip end-to-end, so you can confirm the whole pipeline before relying on it.

## Folder layout

By default, everything lives under `Clips/`:

```
Clips/
  Videos/
    covers/       ← video cover images (<video_id>.webp)
    frames/       ← extracted hook / keyframe frames
    <video note>.md
  Screenshots/
    frames/       ← screenshot images
    <screenshot note>.md
```

**One note per video.** A cover clip, a hook clip, and a keyframe clip from the same video all upsert sections into the same note — whichever clip arrives first creates it. Webpage screenshots are unrelated to any video, so each one becomes its own standalone note.

## Settings reference

Open Settings → Vault Autopilot.

### Language

The **Language** dropdown at the top of the settings tab switches the plugin between English and 中文 — settings UI, notices, and the text written into generated notes. Default is English. Notes created under one language remain fully recognized after switching: section matching understands both languages, so existing notes never break (headings inside one note may end up mixed, which is cosmetic only).

### Storage locations

| Field | Default | Purpose |
|---|---|---|
| Video notes folder | `Clips/Videos` | Where video notes (cover/hook/keyframe, merged) are written |
| Cover images folder | `Clips/Videos/covers` | Where `<video_id>.webp` cover images are saved |
| Frame images folder | `Clips/Videos/frames` | Where hook/keyframe extracted frames are saved |
| Screenshots folder | `Clips/Screenshots` (+ `/frames`) | Where standalone screenshot notes and their images go |

All four fields accept any vault-relative folder path; leaving a field at its default keeps zero-config behavior.

### Advanced

| Field | Default | Purpose |
|---|---|---|
| Enable HTTP server | on | Turns the local server that receives clips on/off |
| Port | `17183` | The port the local server listens on. This is an escape hatch for port conflicts only — if you change it, you must change the same value in the extension's settings, or the two sides will stop talking to each other |
| Max frames | `5` | Maximum frames kept per hook/keyframe clip (1–20) |
| Cover/Screenshot/Hook/Keyframe SOP path | empty | Optional path to a markdown file in your vault with analysis instructions for that clip type. Leaving a SOP path empty puts that mode in **material-only mode** — the note is written with no analysis prompt block |

## Network use disclosure

Vault Autopilot starts a local HTTP server bound to `127.0.0.1:17183` (configurable). It exists solely so the companion Chrome extension can hand off clipped content to the plugin — there is no way for a browser extension to write files into your vault directly, so a local loopback server is the bridge.

- The server only binds to `127.0.0.1` (loopback) — it is not reachable from your network or the internet.
- `GET /ping` is a health-check endpoint returning `{ "app": "vault-autopilot", "version": "<version>" }`, used by the extension's self-check.
- `POST /clip` is the only endpoint that accepts data. The server sets CORS response headers only for `chrome-extension://` origins, so ordinary web pages cannot read its responses; combined with the loopback-only bind, only software running on your own machine can reach it.
- The endpoint is intentionally unauthenticated. A pairing token would only defend against malicious software already running on your machine, at the cost of a more complicated setup. The endpoint only writes clipped content into your vault and never reads anything back, so the worst such software could do is add unwanted notes.
- **The one outbound network request the plugin itself makes** is downloading a video's cover/thumbnail image from the video platform's CDN (e.g. YouTube's or Bilibili's image servers), so it can save that image into your vault. No other outbound requests are made, and no data is sent anywhere except to your own local filesystem.
- Nothing is uploaded, tracked, or sent to any third-party service by this plugin.

## Troubleshooting

**"Port already in use" / extension can't connect:**
- Another process may already be using port 17183. Vault Autopilot will show a notice naming the conflicting port when this happens.
- Fix: either quit whatever else is using that port, or change the port in **both** places — Vault Autopilot's settings (Advanced → Port) and the extension's settings (Advanced → Port) — to the same new value, then restart Obsidian.

**Extension shows the plugin as offline / self-check fails:**
- Confirm Vault Autopilot is enabled in Obsidian's Community plugins list.
- Confirm **Enable HTTP server** is toggled on in the plugin's settings.
- Confirm the port configured in the extension matches the plugin's port setting exactly.
- Vault Autopilot is desktop-only; it will not run (and the extension will not be able to reach it) if Obsidian is only open on mobile.

**Clips arrive but land in an unexpected folder:**
- Check **Storage locations** in settings — folders are fully configurable, and a first-save notice tells you exactly where each mode's first note landed.

## License

MIT — see [LICENSE](LICENSE).
