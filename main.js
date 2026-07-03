var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VaultAutopilotPlugin
});
module.exports = __toCommonJS(main_exports);
var fs = __toESM(require("fs"));
var import_obsidian2 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  httpServer: {
    enabled: true,
    port: 27183
  },
  clipRules: {
    thumbnail: { sopPath: "", outputFolder: "Content Creation/Great Videos", thumbnailFolder: "Assets/Great Videos" },
    screenshot: { sopPath: "", outputFolder: "", framesFolder: "Assets/images" },
    hook: { sopPath: "", outputFolder: "", maxFrames: 5, framesFolder: "Assets/images" },
    keyframe: { sopPath: "", outputFolder: "", maxFrames: 5, framesFolder: "Assets/images" }
  }
};
var VaultAutopilotSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("HTTP Server").setHeading();
    new import_obsidian.Setting(containerEl).setName("Enable HTTP server").setDesc("Allows Chrome extension and other tools to drop files via POST /clip").addToggle((t) => t.setValue(this.plugin.settings.httpServer.enabled).onChange(async (v) => {
      this.plugin.settings.httpServer.enabled = v;
      await this.plugin.saveSettings();
      this.plugin.restartServer();
    }));
    new import_obsidian.Setting(containerEl).setName("Port").setDesc("Default: 27183. Restart Obsidian after changing.").addText((t) => t.setValue(String(this.plugin.settings.httpServer.port)).onChange(async (v) => {
      const n = parseInt(v, 10);
      if (n > 1024 && n < 65536) {
        this.plugin.settings.httpServer.port = n;
        await this.plugin.saveSettings();
      }
    }));
    new import_obsidian.Setting(containerEl).setName("Clip Rules").setHeading();
    new import_obsidian.Setting(containerEl).setName("Thumbnail / Great Videos").setHeading();
    this.renderThumbnailClipRule(containerEl);
    new import_obsidian.Setting(containerEl).setName("Screenshot").setHeading();
    this.renderScreenshotClipRule(containerEl);
    for (const mode of ["hook", "keyframe"]) {
      const label = mode === "hook" ? "Hook Analysis" : "Keyframe Analysis";
      new import_obsidian.Setting(containerEl).setName(label).setHeading();
      new import_obsidian.Setting(containerEl).setName("Max frames to save").setDesc("How many frames to sample and save (1\u201320). Default: 5.").addText((t) => t.setValue(String(this.plugin.settings.clipRules[mode].maxFrames)).onChange(async (v) => {
        const n = parseInt(v, 10);
        if (n >= 1 && n <= 20) {
          this.plugin.settings.clipRules[mode].maxFrames = n;
          await this.plugin.saveSettings();
        }
      }));
      new import_obsidian.Setting(containerEl).setName("Frames folder").setDesc("Vault-relative path where frame images are saved. Default: Assets/images").addText((t) => t.setValue(this.plugin.settings.clipRules[mode].framesFolder).onChange(async (v) => {
        this.plugin.settings.clipRules[mode].framesFolder = v.trim();
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("SOP / prompt path").setDesc("Absolute path to the markdown SOP file.").addText((t) => t.setValue(this.plugin.settings.clipRules[mode].sopPath).onChange(async (v) => {
        this.plugin.settings.clipRules[mode].sopPath = v.trim();
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("Output folder").setDesc("Vault-relative path. e.g. Notes/Hooks").addText((t) => t.setValue(this.plugin.settings.clipRules[mode].outputFolder).onChange(async (v) => {
        this.plugin.settings.clipRules[mode].outputFolder = v.trim();
        await this.plugin.saveSettings();
      }));
    }
  }
  renderThumbnailClipRule(el) {
    const rule = this.plugin.settings.clipRules.thumbnail;
    new import_obsidian.Setting(el).setName("Output folder").setDesc("Vault-relative path for generated notes. Default: Content Creation/Great Videos").addText((t) => t.setValue(rule.outputFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(el).setName("Thumbnail folder").setDesc("Vault-relative path for downloaded thumbnail images. Default: Assets/Great Videos").addText((t) => t.setValue(rule.thumbnailFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(el).setName("SOP / prompt path").setDesc("Absolute path to the markdown SOP file.").addText((t) => t.setValue(rule.sopPath).onChange(async (v) => {
      this.plugin.settings.clipRules.thumbnail.sopPath = v.trim();
      await this.plugin.saveSettings();
    }));
  }
  renderScreenshotClipRule(el) {
    const rule = this.plugin.settings.clipRules.screenshot;
    new import_obsidian.Setting(el).setName("Frames folder").setDesc("Vault-relative path where screenshot images are saved. Default: Assets/images").addText((t) => t.setValue(rule.framesFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.screenshot.framesFolder = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(el).setName("SOP / prompt path").setDesc("Absolute path to the markdown SOP file.").addText((t) => t.setValue(rule.sopPath).onChange(async (v) => {
      this.plugin.settings.clipRules.screenshot.sopPath = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(el).setName("Output folder").setDesc("Vault-relative path. e.g. Notes/Screenshots").addText((t) => t.setValue(rule.outputFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.screenshot.outputFolder = v.trim();
      await this.plugin.saveSettings();
    }));
  }
};

// src/server.ts
var http = __toESM(require("http"));
function createServer2(port, onClip) {
  const server = http.createServer((req, res) => {
    const origin = req.headers["origin"] || "";
    if (origin.startsWith("chrome-extension://")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method !== "POST" || req.url !== "/clip") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Not found" }));
      return;
    }
    let body = "";
    let bodySize = 0;
    const MAX_BODY = 20 * 1024 * 1024;
    req.on("data", (chunk) => {
      bodySize += chunk.length;
      if (bodySize > MAX_BODY) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Payload too large" }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { obsidianUrl, notice } = await onClip(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ...obsidianUrl ? { obsidianUrl } : {}, ...notice ? { notice } : {} }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: String(err) }));
      }
    });
  });
  server.listen(port, "127.0.0.1");
  return server;
}

// src/util.ts
function sanitize(str) {
  return (str || "").replace(/[/\\:*?"<>|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
function extractVideoId(url, platform) {
  const p = (platform != null ? platform : "").toLowerCase();
  if (p === "youtube" || url.includes("youtube.com") || url.includes("youtu.be")) {
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (short) return short[1];
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watch) return watch[1];
    const embed = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (embed) return embed[1];
  }
  if (p === "bilibili" || url.includes("bilibili.com")) {
    const bv = url.match(/\/(BV[a-zA-Z0-9]+)/);
    if (bv) return bv[1];
  }
  if (p === "xiaohongshu" || url.includes("xiaohongshu.com")) {
    const m = url.match(/\/(?:explore|discovery\/item)\/(\w+)/);
    if (m) return m[1];
  }
  return null;
}
function canonicalUrl(url) {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).replace(/\/+$/, "");
  } catch (e) {
    return url;
  }
}
function videoKey(url, platform) {
  var _a;
  return (_a = extractVideoId(url, platform)) != null ? _a : canonicalUrl(url);
}
function detectPlatform(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("bilibili.com")) return "bilibili";
  if (url.includes("xiaohongshu.com")) return "xiaohongshu";
  return "other";
}
function buildVideoEmbed(url, platform, startSeconds, endSeconds) {
  const p = (platform != null ? platform : "").toLowerCase();
  const start = Math.floor(startSeconds);
  if (p === "youtube" || url.includes("youtube.com") || url.includes("youtu.be")) {
    const id = extractVideoId(url, platform);
    if (id) {
      const endParam = endSeconds != null ? `&end=${Math.floor(endSeconds)}` : "";
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}?start=${start}${endParam}" frameborder="0" allowfullscreen></iframe>`;
    }
  }
  if (p === "bilibili" || url.includes("bilibili.com")) {
    const id = extractVideoId(url, platform);
    if (id) return `<iframe width="100%" height="315" src="https://player.bilibili.com/player.html?bvid=${id}&page=1&t=${start}&autoplay=0&danmaku=0" frameborder="0" allowfullscreen></iframe>`;
  }
  return `[\u25B6 \u8DF3\u8F6C\u539F\u89C6\u9891](${url})`;
}

// src/video-note.ts
var RANK = { "\u5C01\u9762\u6807\u9898": 0, "\u5185\u5BB9": 1, "\u52A8\u6548": 2, "\u622A\u56FE": 3 };
var EMOJI = { "\u5C01\u9762\u6807\u9898": "\u{1F5BC}\uFE0F", "\u5185\u5BB9": "\u{1F3AC}", "\u52A8\u6548": "\u2728", "\u622A\u56FE": "\u{1F4F8}" };
function circledNumber(i) {
  return i >= 1 && i <= 20 ? String.fromCodePoint(9312 + i - 1) : `(${i})`;
}
function sopBlock(sopContent) {
  const lines = sopContent.split("\n").map((l) => `> ${l}`).join("\n");
  const checklist = ["> ", "> ---", "> **\u5B8C\u6210\u540E\u6267\u884C\uFF1A**", "> - [ ] \u5206\u6790\u5DF2\u5199\u5165\u7B14\u8BB0\u5404\u7AE0\u8282", "> - [ ] \u5220\u9664\u6B64\u6574\u4E2A\u63D0\u793A\u5757"].join("\n");
  return `> [!TIP] \u5206\u6790\u63D0\u793A
${lines}
${checklist}`;
}
function framesBlock(frameNames) {
  const lines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join("\n");
  return `> [!NOTE] \u5206\u6790\u7528\u5E27
${lines}
> 
> - [ ] \u6309 SOP \u5B8C\u6210\u5206\u6790\uFF0C\u586B\u5165\u5404\u7AE0\u8282`;
}
function coverSection(coverFile, sop) {
  const parts = [`## \u5C01\u9762\u6807\u9898`, ``, `![[${coverFile}]]`, ``];
  if (sop) parts.push(sopBlock(sop), ``);
  return { kind: "\u5C01\u9762\u6807\u9898", startSeconds: 0, text: parts.join("\n") };
}
function hookSection(p, sop) {
  const embed = buildVideoEmbed(p.url, p.platform, 0);
  const parts = [`## \u5185\u5BB9`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (p.transcript) parts.push(`### \u5B57\u5E55`, ``, p.transcript, ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: "\u5185\u5BB9", startSeconds: 0, text: parts.join("\n") };
}
function keyframeSection(p, sop) {
  const embed = buildVideoEmbed(p.url, p.platform, p.start);
  const parts = [`## \u52A8\u6548 \u2460 \xB7 ${Math.floor(p.start)}s\u2013${Math.round(p.end)}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: "\u52A8\u6548", startSeconds: p.start, text: parts.join("\n") };
}
function screenshotSection(imageNames, sop, aiResult) {
  const imgs = imageNames.map((n) => `![[${n}]]`).join("\n");
  const parts = [`## \u622A\u56FE \u2460`, ``, imgs, ``];
  if (aiResult) parts.push(aiResult, ``);
  else if (sop) parts.push(sopBlock(sop), ``);
  return { kind: "\u622A\u56FE", startSeconds: 0, text: parts.join("\n") };
}
function buildAnchor(meta) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const fm = [
    `---`,
    `type: video`,
    `platform: ${meta.platform}`,
    `video_id: "${meta.videoId}"`,
    `video_url: "${meta.videoUrl}"`,
    `title: "${meta.title}"`,
    ...meta.channel ? [`channel: "${meta.channel}"`] : [],
    `dimensions: []`,
    `analyzed_at: ${today}`,
    `tags: []`,
    `depth: normal`,
    `---`
  ].join("\n");
  return `${fm}

# ${meta.title}
`;
}
function kindOf(heading) {
  for (const k of ["\u5C01\u9762\u6807\u9898", "\u5185\u5BB9", "\u52A8\u6548", "\u622A\u56FE"]) {
    if (heading.includes(k)) return k;
  }
  return null;
}
function emojiHeading(text, kind) {
  return text.replace(/^## .*$/m, (line) => {
    const heading = line.slice(3);
    const idx = heading.indexOf(kind);
    const tail = idx >= 0 ? heading.slice(idx) : kind;
    return `## ${EMOJI[kind]} ${tail}`;
  });
}
function stripTrailingRule(t) {
  return t.replace(/\s+$/, "").replace(/\n-{3,}$/, "").replace(/\s+$/, "");
}
function syncOverview(head, frontmatter, dims) {
  var _a, _b;
  const channel = (_a = frontmatter.match(/^channel:\s*"?(.*?)"?\s*$/m)) == null ? void 0 : _a[1];
  const platform = (_b = frontmatter.match(/^platform:\s*(.*?)\s*$/m)) == null ? void 0 : _b[1];
  const label = [channel, platform].filter(Boolean).join(" \xB7 ") || "\u89C6\u9891";
  const overview = `> [!abstract] ${label}
> ${dims.map((d) => `${EMOJI[d]} ${d}`).join(" \xB7 ")}`;
  const cleaned = head.replace(/\n*> \[!abstract\][^\n]*(?:\n>[^\n]*)*/g, "");
  if (/^# .+$/m.test(cleaned)) return cleaned.replace(/^(# .+)$/m, `$1

${overview}`);
  return `${cleaned.replace(/\s+$/, "")}

${overview}`;
}
function parseSections(body) {
  const lines = body.split("\n");
  const head = [];
  const sections = [];
  let cur = null;
  let curHeading = "";
  const flush = () => {
    var _a;
    if (cur) {
      const kind = (_a = kindOf(curHeading)) != null ? _a : "\u52A8\u6548";
      const m = curHeading.match(/(\d+)s/);
      sections.push({ kind, startSeconds: m ? parseInt(m[1], 10) : 0, text: cur.join("\n") });
    }
  };
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && line.startsWith("## ")) {
      flush();
      cur = [line];
      curHeading = line.slice(3).trim();
    } else if (cur) {
      cur.push(line);
    } else {
      head.push(line);
    }
  }
  flush();
  return { head: head.join("\n"), sections };
}
var DIMENSION_ORDER = ["\u5C01\u9762\u6807\u9898", "\u5185\u5BB9", "\u52A8\u6548", "\u622A\u56FE"];
function addDimension(frontmatter, dim) {
  return frontmatter.replace(/^(dimensions:\s*\[)([^\]]*)(\])/m, (_, open, inner, close) => {
    const dims = inner.split(",").map((d) => d.trim()).filter(Boolean);
    if (!dims.includes(dim)) dims.push(dim);
    dims.sort((a, b) => DIMENSION_ORDER.indexOf(a) - DIMENSION_ORDER.indexOf(b));
    return `${open}${dims.join(", ")}${close}`;
  });
}
function renumber(sections) {
  const counters = {};
  return sections.map((s) => {
    var _a;
    if (s.kind !== "\u52A8\u6548" && s.kind !== "\u622A\u56FE") return s;
    counters[s.kind] = ((_a = counters[s.kind]) != null ? _a : 0) + 1;
    const text = s.text.replace(new RegExp(`^(## .*?${s.kind} )\\S+( \xB7.*)?$`, "m"), `$1${circledNumber(counters[s.kind])}$2`);
    return { ...s, text };
  });
}
function mergeSection(existing, section) {
  const fmMatch = existing.match(/^---\n[\s\S]*?\n---/);
  const frontmatter = fmMatch ? fmMatch[0] : "";
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;
  const { head, sections } = parseSections(body);
  if (section.kind !== "\u52A8\u6548" && section.kind !== "\u622A\u56FE" && sections.some((s) => s.kind === section.kind)) {
    return { content: existing, skipped: true };
  }
  const incoming = { kind: section.kind, startSeconds: section.startSeconds, text: section.text };
  const all = [...sections, incoming].sort(
    (a, b) => RANK[a.kind] - RANK[b.kind] || a.startSeconds - b.startSeconds
  );
  const ordered = renumber(all);
  const newFrontmatter = addDimension(frontmatter, section.kind);
  const dims = DIMENSION_ORDER.filter((k) => ordered.some((s) => s.kind === k));
  const newHead = syncOverview(head, newFrontmatter, dims).replace(/\s+$/, "");
  const renderedSections = ordered.map((s) => stripTrailingRule(emojiHeading(s.text, s.kind))).join("\n\n---\n\n");
  const newBody = [newHead, "", renderedSections, ""].join("\n");
  return { content: `${newFrontmatter}${newBody}`, skipped: false };
}

// src/clip-router.ts
async function routeClip(payload, clipRules, vaultOps) {
  if (payload.mode === "thumbnail") return handleThumbnail(payload, clipRules.thumbnail, vaultOps);
  if (payload.mode === "screenshot") {
    const normalized = normalizeScreenshot(payload);
    return handleScreenshot(normalized, clipRules.screenshot, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder);
  }
  if (payload.mode === "hook") return handleMultiFrame(payload, clipRules.hook, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder);
  if (payload.mode === "keyframe") return handleMultiFrame(payload, clipRules.keyframe, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder);
  throw new Error("Unknown clip mode");
}
function normalizeScreenshot(payload) {
  if (!payload.images && payload.image) {
    return { ...payload, images: [payload.image] };
  }
  return payload;
}
function readSopSafely(sopPath, vaultOps) {
  if (!sopPath) return void 0;
  try {
    return vaultOps.readFileSync(sopPath);
  } catch (e) {
    return void 0;
  }
}
async function upsertVideoNote(meta, section, vaultOps, folder) {
  await vaultOps.ensureFolder(folder);
  const existing = meta.videoId ? await findNoteByVideoId(meta.videoId, folder, vaultOps) : null;
  if (existing) {
    const { content: content2, skipped } = mergeSection(existing.content, section);
    if (skipped) return { notePath: existing.path, notice: `\u300C${section.kind}\u300D\u5DF2\u5B58\u5728\uFF0C\u672A\u8986\u76D6\u3002\u60F3\u91CD\u505A\u8BF7\u5148\u5220\u6389\u8BE5\u5C0F\u8282\u518D\u70B9\u3002` };
    await vaultOps.modify(existing.path, content2);
    return { notePath: existing.path };
  }
  const { content } = mergeSection(buildAnchor(meta), section);
  let stem = (meta.channel ? `${sanitize(meta.channel)} - ${sanitize(meta.title)}` : sanitize(meta.title)) || "video";
  if (vaultOps.listMarkdownFiles(folder).includes(`${folder}/${stem}.md`)) {
    stem = `${stem} \xB7 ${fileFingerprint(meta.videoId)}`;
  }
  const notePath = `${folder}/${stem}.md`;
  await vaultOps.create(notePath, content);
  return { notePath };
}
function fileFingerprint(videoId) {
  if (/^[A-Za-z0-9_-]{1,24}$/.test(videoId)) return videoId;
  let h = 0;
  for (let i = 0; i < videoId.length; i++) h = h * 31 + videoId.charCodeAt(i) | 0;
  return (h >>> 0).toString(36);
}
async function ensureCover(videoId, coverUrl, vaultOps, assetFolder) {
  if (!coverUrl || !/^[A-Za-z0-9_-]{1,24}$/.test(videoId)) return;
  const path = `${assetFolder}/${videoId}.webp`;
  if (vaultOps.fileExists(path)) return;
  try {
    await vaultOps.ensureFolder(assetFolder);
    await vaultOps.createBinary(path, await vaultOps.downloadUrl(coverUrl));
  } catch (_) {
  }
}
function buildScreenshotTemplate(payload, imageNames, sopContent) {
  const imageLines = imageNames.map((n) => `> ![[${n}]]`).join("\n");
  const parts = [
    `# Screenshot \u2014 ${payload.title}`,
    ``,
    `\u6765\u6E90\uFF1A${payload.url}`,
    ``,
    `> [!NOTE] \u622A\u56FE`,
    imageLines,
    ``
  ];
  if (sopContent) {
    const lines = sopContent.split("\n").map((l) => `> ${l}`).join("\n");
    const checklist = [`> `, `> ---`, `> **\u5B8C\u6210\u540E\u6267\u884C\uFF1A**`, `> - [ ] \u5206\u6790\u5DF2\u5199\u5165\u7B14\u8BB0\u5404\u7AE0\u8282`, `> - [ ] \u5220\u9664\u6B64\u6574\u4E2A\u63D0\u793A\u5757`].join("\n");
    parts.push(`> [!TIP] \u5206\u6790\u63D0\u793A
${lines}
${checklist}`, ``);
  }
  parts.push(`---`, ``, `## \u7B14\u8BB0`, ``);
  return parts.join("\n");
}
async function handleScreenshot(payload, rule, vaultOps, searchFolder, assetFolder) {
  if (!rule.outputFolder) {
    throw new Error("Screenshot output folder is not configured. Go to Settings \u2192 Clip Rules \u2192 Screenshot \u2192 Output folder.");
  }
  const stem = `screenshot-${sanitize(payload.title)}-${Date.now()}`;
  const notePath = `${rule.outputFolder}/${stem}.md`;
  const framesDir = rule.framesFolder || rule.outputFolder;
  await vaultOps.ensureFolder(framesDir);
  await vaultOps.ensureFolder(rule.outputFolder);
  const imageNames = [];
  for (let i = 0; i < payload.images.length; i++) {
    const name = `${stem}-${String(i + 1).padStart(2, "0")}.png`;
    const bytes = Buffer.from(payload.images[i], "base64");
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer);
    imageNames.push(name);
  }
  const key = videoKey(payload.url);
  const existing = await findNoteByVideoId(key, searchFolder, vaultOps);
  const intoVideoNote = !!existing || extractVideoId(payload.url, void 0) != null;
  const meta = { platform: detectPlatform(payload.url), videoId: key, videoUrl: payload.url, title: payload.title };
  const sopContent = readSopSafely(rule.sopPath, vaultOps);
  if (intoVideoNote) {
    const r = await upsertVideoNote(meta, screenshotSection(imageNames, sopContent), vaultOps, searchFolder);
    await ensureCover(meta.videoId, payload.cover_url, vaultOps, assetFolder);
    return r;
  }
  const template = buildScreenshotTemplate(payload, imageNames, sopContent);
  await vaultOps.create(notePath, template);
  return { notePath };
}
function sampleFrames(frames, max) {
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  return Array.from({ length: max }, (_, i) => frames[Math.floor(i * step)]);
}
async function findNoteByVideoId(videoId, folder, vaultOps) {
  const files = vaultOps.listMarkdownFiles(folder);
  for (const filePath of files) {
    const content = await vaultOps.read(filePath);
    if (content.includes(`video_id: "${videoId}"`)) return { path: filePath, content };
  }
  return null;
}
async function handleThumbnail(payload, rule, vaultOps) {
  if (!rule.outputFolder || !rule.thumbnailFolder) {
    throw new Error("Thumbnail output folder or thumbnail folder is not configured. Go to Settings \u2192 Clip Rules \u2192 Thumbnail.");
  }
  await vaultOps.ensureFolder(rule.thumbnailFolder);
  const thumbnailFile = `${payload.video_id}.webp`;
  const thumbnailPath = `${rule.thumbnailFolder}/${thumbnailFile}`;
  const imgData = await vaultOps.downloadUrl(payload.thumbnail_url);
  await vaultOps.createBinary(thumbnailPath, imgData);
  const sopContent = readSopSafely(rule.sopPath, vaultOps);
  const section = coverSection(thumbnailFile, sopContent);
  const meta = {
    platform: payload.platform,
    videoId: videoKey(payload.video_url, payload.platform),
    videoUrl: payload.video_url,
    title: payload.title,
    channel: payload.channel
  };
  return upsertVideoNote(meta, section, vaultOps, rule.outputFolder);
}
async function handleMultiFrame(payload, rule, vaultOps, searchFolder, assetFolder) {
  var _a, _b, _c;
  const count = payload.frames_select && payload.frames_select > 0 ? payload.frames_select : (_a = rule.maxFrames) != null ? _a : 5;
  const sampled = count >= payload.frames.length ? payload.frames : sampleFrames(payload.frames, count);
  const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;
  const platform = detectPlatform(payload.url);
  const videoId = videoKey(payload.url, platform);
  const meta = {
    platform,
    videoId,
    videoUrl: payload.url,
    title: payload.video_title,
    channel: payload.mode === "hook" ? payload.channel : void 0
  };
  const framesDir = rule.framesFolder || rule.outputFolder;
  await vaultOps.ensureFolder(framesDir);
  const frameNames = [];
  for (let i = 0; i < sampled.length; i++) {
    const name = `${stem}-f${String(i + 1).padStart(2, "0")}.png`;
    const bytes = Buffer.from(sampled[i], "base64");
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer);
    frameNames.push(name);
  }
  const sopContent = readSopSafely(rule.sopPath, vaultOps);
  let section;
  if (payload.mode === "hook") {
    section = hookSection(
      { url: payload.url, platform, endSeconds: (_c = (_b = payload.time_range) == null ? void 0 : _b.end) != null ? _c : 15, frameNames, transcript: payload.transcript, aiResult: void 0 },
      sopContent
    );
  } else {
    section = keyframeSection(
      { url: payload.url, platform, start: payload.time_range.start, end: payload.time_range.end, frameNames, aiResult: void 0 },
      sopContent
    );
  }
  const result = await upsertVideoNote(meta, section, vaultOps, searchFolder);
  await ensureCover(meta.videoId, payload.cover_url, vaultOps, assetFolder);
  return result;
}

// src/main.ts
var VaultAutopilotPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.server = null;
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    if (this.settings.httpServer.enabled) this.startServer();
  }
  onunload() {
    var _a;
    (_a = this.server) == null ? void 0 : _a.close();
    this.server = null;
  }
  async loadSettings() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      httpServer: { ...DEFAULT_SETTINGS.httpServer, ...(_a = loaded == null ? void 0 : loaded.httpServer) != null ? _a : {} },
      clipRules: {
        thumbnail: { ...DEFAULT_SETTINGS.clipRules.thumbnail, ...(_c = (_b = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _b.thumbnail) != null ? _c : {} },
        screenshot: { ...DEFAULT_SETTINGS.clipRules.screenshot, ...(_e = (_d = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _d.screenshot) != null ? _e : {} },
        hook: { ...DEFAULT_SETTINGS.clipRules.hook, ...(_g = (_f = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _f.hook) != null ? _g : {} },
        keyframe: { ...DEFAULT_SETTINGS.clipRules.keyframe, ...(_i = (_h = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _h.keyframe) != null ? _i : {} }
      }
    };
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  restartServer() {
    var _a;
    (_a = this.server) == null ? void 0 : _a.close();
    this.server = null;
    if (this.settings.httpServer.enabled) this.startServer();
  }
  async ensureFolder(folderPath) {
    const parts = folderPath.split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }
  startServer() {
    const { port } = this.settings.httpServer;
    const vaultOps = {
      ensureFolder: (p) => this.ensureFolder(p),
      createBinary: async (p, data) => {
        const existing = this.app.vault.getAbstractFileByPath(p);
        if (existing instanceof import_obsidian2.TFile) await this.app.vault.modifyBinary(existing, data);
        else await this.app.vault.createBinary(p, data);
      },
      create: async (p, content) => {
        await this.app.vault.create(p, content);
      },
      readFileSync: (p) => fs.readFileSync(p, "utf8"),
      downloadUrl: async (url) => {
        const resp = await (0, import_obsidian2.requestUrl)({ url, method: "GET" });
        return resp.arrayBuffer;
      },
      fileExists: (p) => this.app.vault.getAbstractFileByPath(p) != null,
      listMarkdownFiles: (folderPath) => {
        return this.app.vault.getFiles().filter((f) => f.path.startsWith(folderPath + "/") && f.extension === "md").map((f) => f.path);
      },
      read: async (filePath) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof import_obsidian2.TFile)) throw new Error(`File not found: ${filePath}`);
        return this.app.vault.read(file);
      },
      modify: async (filePath, content) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof import_obsidian2.TFile)) throw new Error(`File not found: ${filePath}`);
        await this.app.vault.modify(file, content);
      }
    };
    this.server = createServer2(
      port,
      async (payload) => {
        const { notePath, notice } = await routeClip(payload, this.settings.clipRules, vaultOps);
        const obsidianUrl = notePath ? `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(notePath)}` : void 0;
        return { obsidianUrl, notice };
      }
    );
    this.server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        new import_obsidian2.Notice(`Vault Autopilot: Port ${port} is already in use. Close the other process or change the port in settings.`, 1e4);
      }
    });
  }
};
