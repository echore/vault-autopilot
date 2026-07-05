# Vault Autopilot

Vault Autopilot receives clips from the companion Chrome extension, **[Obsidian Visual Clipper](https://github.com/liyachen/obsidian-visual-clipper)**, and writes them into structured notes and images in your vault — automatically, with no manual paste-and-format step.

The plugin and the extension are a suite: the extension captures (screenshots, video covers, hooks, keyframes) from your browser; this plugin receives and files them. Neither is useful without the other.

## What it does

- **Webpage screenshots** → saved as a standalone note, with images placed in a `frames/` subfolder.
- **Video clips** (cover, hook, keyframe) → all clips from the same video are merged into **one note per video**. Whichever clip type arrives first creates the note; later clips upsert new sections into it.
- Every clip response includes an `obsidian://` deep link back to the note that was created or updated, so the extension can jump you straight to it.

## Install

**Community plugin store** (recommended, once listed): open Obsidian → Settings → Community plugins → Browse → search "Vault Autopilot" → Install → Enable.

**Via BRAT (while the store listing is pending):** install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, then use "Add a beta plugin" and point it at this repository.

Vault Autopilot is **desktop-only** — it runs a local Node HTTP server, which is not available on Obsidian mobile.

You'll also need the [Obsidian Visual Clipper](https://github.com/liyachen/obsidian-visual-clipper) Chrome extension installed for anything to actually reach the plugin.

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

### 存储位置 (Storage locations)

| Field | Default | Purpose |
|---|---|---|
| 视频笔记文件夹 (video notes folder) | `Clips/Videos` | Where video notes (cover/hook/keyframe, merged) are written |
| 封面图片文件夹 (cover images folder) | `Clips/Videos/covers` | Where `<video_id>.webp` cover images are saved |
| 帧图片文件夹 (frames folder) | `Clips/Videos/frames` | Where hook/keyframe extracted frames are saved |
| 截图文件夹 (screenshots folder) | `Clips/Screenshots` (+ `/frames`) | Where standalone screenshot notes and their images go |

All four fields accept any vault-relative folder path; leaving a field at its default keeps zero-config behavior.

### 高级 (Advanced)

| Field | Default | Purpose |
|---|---|---|
| 启用 HTTP 服务 (enable HTTP server) | on | Turns the local server that receives clips on/off |
| 端口 (port) | `17183` | The port the local server listens on. This is an escape hatch for port conflicts only — if you change it, you must change the same value in the extension's settings, or the two sides will stop talking to each other |
| 抽帧数量上限 (max frames) | `5` | Maximum frames kept per hook/keyframe clip (1–20) |
| Per-mode SOP path (封面/截图/Hook/关键帧 SOP 路径) | empty | Optional path to a markdown file in your vault with analysis instructions for that clip type. Leaving a SOP path empty puts that mode in **material-only mode** — the note is written with no analysis prompt block |

## Network use disclosure

Vault Autopilot starts a local HTTP server bound to `127.0.0.1:17183` (configurable). It exists solely so the companion Chrome extension can hand off clipped content to the plugin — there is no way for a browser extension to write files into your vault directly, so a local loopback server is the bridge.

- The server only binds to `127.0.0.1` (loopback) — it is not reachable from your network or the internet.
- `GET /ping` is a health-check endpoint returning `{ "app": "vault-autopilot", "version": "<version>" }`, used by the extension's self-check.
- `POST /clip` is the only endpoint that accepts data; it only accepts requests whose `Origin` is a `chrome-extension://` origin.
- **The one outbound network request the plugin itself makes** is downloading a video's cover/thumbnail image from the video platform's CDN (e.g. YouTube's or Bilibili's image servers), so it can save that image into your vault. No other outbound requests are made, and no data is sent anywhere except to your own local filesystem.
- Nothing is uploaded, tracked, or sent to any third-party service by this plugin.

## Troubleshooting

**"Port already in use" / extension can't connect:**
- Another process may already be using port 17183. Vault Autopilot will show a notice naming the conflicting port when this happens.
- Fix: either quit whatever else is using that port, or change the port in **both** places — Vault Autopilot's settings (高级 → 端口) and the extension's settings (高级 → 端口) — to the same new value, then restart Obsidian.

**Extension shows the plugin as offline / self-check fails:**
- Confirm Vault Autopilot is enabled in Obsidian's Community plugins list.
- Confirm 启用 HTTP 服务 (enable HTTP server) is toggled on in the plugin's settings.
- Confirm the port configured in the extension matches the plugin's port setting exactly.
- Vault Autopilot is desktop-only; it will not run (and the extension will not be able to reach it) if Obsidian is only open on mobile.

**Clips arrive but land in an unexpected folder:**
- Check 存储位置 in settings — folders are fully configurable, and a first-save notice tells you exactly where each mode's first note landed.

## License

MIT — see [LICENSE](LICENSE).

---

## 中文快速上手

Vault Autopilot 是配合 Chrome 扩展 **Obsidian Visual Clipper** 使用的 Obsidian 插件：扩展负责在网页/视频页面截图、抓封面、抓 Hook、抓关键帧，插件负责接收并写入结构化笔记。

- **零配置可用**：装好插件和扩展即可直接使用，默认存到 `Clips/` 目录下。
- **一个视频一条笔记**：同一视频的封面、Hook、关键帧会合并写入同一条笔记，谁先到谁建笔记；网页截图则各自独立成笔记。
- 扩展的引导页有实时自检和测试剪藏功能，装好后可以直接验证插件和扩展是否连通。
- 所有存储路径和端口都可在设置里修改；插件仅在本机 `127.0.0.1:17183` 提供本地服务，不会被局域网或公网访问到；插件发出的唯一一次网络请求，是从视频平台下载封面图存入 vault。
