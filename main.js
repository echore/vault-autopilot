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

// src/locales/en.json
var en_default = {
  "settings.language": "Language",
  "settings.storageHeading": "Storage locations",
  "settings.videoNotesFolder.name": "Video notes folder",
  "settings.videoNotesFolder.desc": "One note per video: cover, hook, and keyframe clips all merge into the same note. Default: Clips/Videos",
  "settings.coverFolder.name": "Cover images folder",
  "settings.coverFolder.desc": "Video cover images (<video ID>.webp). Default: Clips/Videos/covers",
  "settings.framesFolder.name": "Frame images folder",
  "settings.framesFolder.desc": "Frames extracted by hook / keyframe clips. Default: Clips/Videos/frames",
  "settings.screenshotFolder.name": "Screenshots folder",
  "settings.screenshotFolder.desc": "Webpage screenshots become standalone notes stored here; images go into its frames/ subfolder. Default: Clips/Screenshots",
  "settings.advancedHeading": "Advanced",
  "settings.httpEnable.name": "Enable HTTP server",
  "settings.httpEnable.desc": "Receives content sent by the Chrome extension via POST /clip",
  "settings.port.name": "Port",
  "settings.port.desc": "Default 17183. Only change it if the port is taken; after changing, set the same value on the extension's welcome page (Advanced \u2192 Port), or the two sides will disconnect. Restart Obsidian afterwards.",
  "settings.maxFrames.name": "Max frames",
  "settings.maxFrames.desc": "Maximum frames kept per hook / keyframe clip (1\u201320). Default 5.",
  "settings.sop.thumbnail": "Cover SOP path",
  "settings.sop.screenshot": "Screenshot SOP path",
  "settings.sop.hook": "Hook SOP path",
  "settings.sop.keyframe": "Keyframe SOP path",
  "settings.sop.desc": "Leave empty for material-only mode (no analysis prompt). Absolute path to a markdown file inside the vault.",
  "notice.savedTo": "Saved to {folder}\nWant a different location? Settings \u2192 Vault Autopilot \u2192 Storage locations",
  "notice.portInUse": "Vault Autopilot: port {port} is already in use. Quit the program using it, or set the same new port in both the plugin settings and the extension settings.",
  "notice.sectionExists": '"{section}" already exists \u2014 not overwritten. To redo it, delete that section first, then clip again.',
  "error.screenshotFolderNotConfigured": "Screenshots folder not configured: set it in Settings \u2192 Vault Autopilot \u2192 Storage locations \u2192 Screenshots folder.",
  "error.videoFolderNotConfigured": "Video notes folder or cover images folder not configured: set them in Settings \u2192 Vault Autopilot \u2192 Storage locations.",
  "note.heading.cover": "Cover & Title",
  "note.heading.content": "Content",
  "note.heading.motion": "Motion",
  "note.heading.screenshot": "Screenshots",
  "note.transcript": "Transcript",
  "note.source": "Source: {url}",
  "note.screenshotCallout": "Screenshots",
  "note.notesHeading": "Notes",
  "note.videoFallback": "Video",
  "note.openOriginal": "\u25B6 Open original video",
  "note.sopCalloutTitle": "Analysis prompt",
  "note.sopDone": "When done:",
  "note.sopStep1": "Analysis written into the note's sections",
  "note.sopStep2": "Delete this entire prompt block",
  "note.framesCalloutTitle": "Frames for analysis",
  "note.framesChecklist": "Complete the analysis per the SOP and fill in the sections"
};

// src/locales/zh.json
var zh_default = {
  "settings.language": "\u8BED\u8A00",
  "settings.storageHeading": "\u5B58\u50A8\u4F4D\u7F6E",
  "settings.videoNotesFolder.name": "\u89C6\u9891\u7B14\u8BB0\u6587\u4EF6\u5939",
  "settings.videoNotesFolder.desc": "\u4E00\u4E2A\u89C6\u9891\u4E00\u6761\u7B14\u8BB0\uFF1A\u5C01\u9762\u3001Hook\u3001\u5173\u952E\u5E27\u90FD\u5199\u8FDB\u540C\u4E00\u6761\u3002\u9ED8\u8BA4 Clips/Videos",
  "settings.coverFolder.name": "\u5C01\u9762\u56FE\u7247\u6587\u4EF6\u5939",
  "settings.coverFolder.desc": "\u89C6\u9891\u5C01\u9762\u56FE\uFF08<\u89C6\u9891ID>.webp\uFF09\u3002\u9ED8\u8BA4 Clips/Videos/covers",
  "settings.framesFolder.name": "\u5E27\u56FE\u7247\u6587\u4EF6\u5939",
  "settings.framesFolder.desc": "Hook / \u5173\u952E\u5E27\u62BD\u51FA\u7684\u5E27\u56FE\u3002\u9ED8\u8BA4 Clips/Videos/frames",
  "settings.screenshotFolder.name": "\u622A\u56FE\u6587\u4EF6\u5939",
  "settings.screenshotFolder.desc": "\u666E\u901A\u7F51\u9875\u622A\u56FE\u72EC\u7ACB\u6210\u7B14\u8BB0\uFF0C\u5B58\u5728\u8FD9\u91CC\uFF1B\u56FE\u7247\u81EA\u52A8\u653E\u5165\u5176 frames/ \u5B50\u6587\u4EF6\u5939\u3002\u9ED8\u8BA4 Clips/Screenshots",
  "settings.advancedHeading": "\u9AD8\u7EA7",
  "settings.httpEnable.name": "\u542F\u7528 HTTP \u670D\u52A1",
  "settings.httpEnable.desc": "\u63A5\u6536 Chrome \u6269\u5C55\u901A\u8FC7 POST /clip \u53D1\u6765\u7684\u5185\u5BB9",
  "settings.port.name": "\u7AEF\u53E3",
  "settings.port.desc": "\u9ED8\u8BA4 17183\u3002\u4EC5\u5F53\u7AEF\u53E3\u88AB\u5360\u7528\u65F6\u624D\u9700\u8981\u6539\uFF1B\u6539\u5B8C\u5FC5\u987B\u5728\u6269\u5C55\u7684\u5F15\u5BFC\u9875\uFF08\u9AD8\u7EA7 \u2192 \u7AEF\u53E3\uFF09\u6539\u6210\u540C\u4E00\u4E2A\u503C\uFF0C\u5426\u5219\u4E24\u8FB9\u4F1A\u65AD\u5F00\u3002\u6539\u540E\u91CD\u542F Obsidian\u3002",
  "settings.maxFrames.name": "\u62BD\u5E27\u6570\u91CF\u4E0A\u9650",
  "settings.maxFrames.desc": "Hook / \u5173\u952E\u5E27\u6A21\u5F0F\u6700\u591A\u4FDD\u5B58\u51E0\u5E27\uFF081\u201320\uFF09\u3002\u9ED8\u8BA4 5\u3002",
  "settings.sop.thumbnail": "\u5C01\u9762 SOP \u8DEF\u5F84",
  "settings.sop.screenshot": "\u622A\u56FE SOP \u8DEF\u5F84",
  "settings.sop.hook": "Hook SOP \u8DEF\u5F84",
  "settings.sop.keyframe": "\u5173\u952E\u5E27 SOP \u8DEF\u5F84",
  "settings.sop.desc": "\u7559\u7A7A = \u7EAF\u7D20\u6750\u6A21\u5F0F\uFF08\u4E0D\u9644\u5E26\u5206\u6790\u63D0\u793A\uFF09\u3002\u586B vault \u5185 markdown \u6587\u4EF6\u7684\u7EDD\u5BF9\u8DEF\u5F84\u3002",
  "notice.savedTo": "\u5DF2\u5B58\u5230 {folder}\n\u60F3\u6362\u4F4D\u7F6E\uFF1F\u8BBE\u7F6E \u2192 Vault Autopilot \u2192 \u5B58\u50A8\u4F4D\u7F6E",
  "notice.portInUse": "Vault Autopilot\uFF1A\u7AEF\u53E3 {port} \u88AB\u5360\u7528\u3002\u8BF7\u5173\u95ED\u5360\u7528\u5B83\u7684\u7A0B\u5E8F\uFF1B\u6216\u5728\u63D2\u4EF6\u8BBE\u7F6E\u548C\u6269\u5C55\u8BBE\u7F6E\u4E24\u5904\u6539\u6210\u540C\u4E00\u4E2A\u65B0\u7AEF\u53E3\u3002",
  "notice.sectionExists": "\u300C{section}\u300D\u5DF2\u5B58\u5728\uFF0C\u672A\u8986\u76D6\u3002\u60F3\u91CD\u505A\u8BF7\u5148\u5220\u6389\u8BE5\u5C0F\u8282\u518D\u70B9\u3002",
  "error.screenshotFolderNotConfigured": "\u622A\u56FE\u6587\u4EF6\u5939\u672A\u914D\u7F6E\uFF1A\u8BF7\u5728 \u8BBE\u7F6E \u2192 Vault Autopilot \u2192 \u5B58\u50A8\u4F4D\u7F6E \u2192 \u622A\u56FE\u6587\u4EF6\u5939 \u586B\u5199\u3002",
  "error.videoFolderNotConfigured": "\u89C6\u9891\u7B14\u8BB0\u6587\u4EF6\u5939\u6216\u5C01\u9762\u56FE\u7247\u6587\u4EF6\u5939\u672A\u914D\u7F6E\uFF1A\u8BF7\u5728 \u8BBE\u7F6E \u2192 Vault Autopilot \u2192 \u5B58\u50A8\u4F4D\u7F6E \u586B\u5199\u3002",
  "note.heading.cover": "\u5C01\u9762\u6807\u9898",
  "note.heading.content": "\u5185\u5BB9",
  "note.heading.motion": "\u52A8\u6548",
  "note.heading.screenshot": "\u622A\u56FE",
  "note.transcript": "\u5B57\u5E55",
  "note.source": "\u6765\u6E90\uFF1A{url}",
  "note.screenshotCallout": "\u622A\u56FE",
  "note.notesHeading": "\u7B14\u8BB0",
  "note.videoFallback": "\u89C6\u9891",
  "note.openOriginal": "\u25B6 \u8DF3\u8F6C\u539F\u89C6\u9891",
  "note.sopCalloutTitle": "\u5206\u6790\u63D0\u793A",
  "note.sopDone": "\u5B8C\u6210\u540E\u6267\u884C\uFF1A",
  "note.sopStep1": "\u5206\u6790\u5DF2\u5199\u5165\u7B14\u8BB0\u5404\u7AE0\u8282",
  "note.sopStep2": "\u5220\u9664\u6B64\u6574\u4E2A\u63D0\u793A\u5757",
  "note.framesCalloutTitle": "\u5206\u6790\u7528\u5E27",
  "note.framesChecklist": "\u6309 SOP \u5B8C\u6210\u5206\u6790\uFF0C\u586B\u5165\u5404\u7AE0\u8282"
};

// src/i18n.ts
var locales = { en: en_default, zh: zh_default };
var current = "en";
function setLanguage(lang) {
  current = lang;
}
function t(key, vars) {
  let s = locales[current][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}
function variants(key) {
  return Object.keys(locales).map((l) => locales[l][key]);
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  language: "en",
  httpServer: {
    enabled: true,
    port: 17183
  },
  clipRules: {
    thumbnail: { sopPath: "", outputFolder: "Clips/Videos", thumbnailFolder: "Clips/Videos/covers" },
    screenshot: { sopPath: "", outputFolder: "Clips/Screenshots", framesFolder: "Clips/Screenshots/frames" },
    hook: { sopPath: "", outputFolder: "", maxFrames: 5, framesFolder: "Clips/Videos/frames" },
    keyframe: { sopPath: "", outputFolder: "", maxFrames: 5, framesFolder: "Clips/Videos/frames" }
  },
  firstSaveNoticed: { thumbnail: false, screenshot: false, hook: false, keyframe: false }
};
var LEGACY_DEFAULT_PORT = 27183;
function normalizePort(loaded) {
  if (loaded === void 0 || loaded === LEGACY_DEFAULT_PORT) return DEFAULT_SETTINGS.httpServer.port;
  return loaded;
}
function emptyToDefault(loaded, defaults) {
  const merged = { ...defaults, ...loaded != null ? loaded : {} };
  for (const key of Object.keys(defaults)) {
    if (key !== "sopPath" && merged[key] === "" && defaults[key] !== "") merged[key] = defaults[key];
  }
  return merged;
}
var VaultAutopilotSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(t("settings.language")).addDropdown((d) => d.addOption("en", "English").addOption("zh", "\u4E2D\u6587").setValue(this.plugin.settings.language).onChange(async (v) => {
      this.plugin.settings.language = v;
      setLanguage(this.plugin.settings.language);
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.storageHeading")).setHeading();
    new import_obsidian.Setting(containerEl).setName(t("settings.videoNotesFolder.name")).setDesc(t("settings.videoNotesFolder.desc")).addText((t2) => t2.setValue(this.plugin.settings.clipRules.thumbnail.outputFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.coverFolder.name")).setDesc(t("settings.coverFolder.desc")).addText((t2) => t2.setValue(this.plugin.settings.clipRules.thumbnail.thumbnailFolder).onChange(async (v) => {
      this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.framesFolder.name")).setDesc(t("settings.framesFolder.desc")).addText((t2) => t2.setValue(this.plugin.settings.clipRules.hook.framesFolder).onChange(async (v) => {
      const folder = v.trim();
      this.plugin.settings.clipRules.hook.framesFolder = folder;
      this.plugin.settings.clipRules.keyframe.framesFolder = folder;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.screenshotFolder.name")).setDesc(t("settings.screenshotFolder.desc")).addText((t2) => t2.setValue(this.plugin.settings.clipRules.screenshot.outputFolder).onChange(async (v) => {
      const folder = v.trim();
      this.plugin.settings.clipRules.screenshot.outputFolder = folder;
      this.plugin.settings.clipRules.screenshot.framesFolder = folder ? `${folder}/frames` : "";
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.advancedHeading")).setHeading();
    new import_obsidian.Setting(containerEl).setName(t("settings.httpEnable.name")).setDesc(t("settings.httpEnable.desc")).addToggle((t2) => t2.setValue(this.plugin.settings.httpServer.enabled).onChange(async (v) => {
      this.plugin.settings.httpServer.enabled = v;
      await this.plugin.saveSettings();
      this.plugin.restartServer();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.port.name")).setDesc(t("settings.port.desc")).addText((t2) => t2.setValue(String(this.plugin.settings.httpServer.port)).onChange(async (v) => {
      const n = parseInt(v, 10);
      if (n > 1024 && n < 65536) {
        this.plugin.settings.httpServer.port = n;
        await this.plugin.saveSettings();
      }
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.maxFrames.name")).setDesc(t("settings.maxFrames.desc")).addText((t2) => t2.setValue(String(this.plugin.settings.clipRules.hook.maxFrames)).onChange(async (v) => {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 20) {
        this.plugin.settings.clipRules.hook.maxFrames = n;
        this.plugin.settings.clipRules.keyframe.maxFrames = n;
        await this.plugin.saveSettings();
      }
    }));
    const sopModes = [
      ["thumbnail", t("settings.sop.thumbnail")],
      ["screenshot", t("settings.sop.screenshot")],
      ["hook", t("settings.sop.hook")],
      ["keyframe", t("settings.sop.keyframe")]
    ];
    for (const [mode, label] of sopModes) {
      new import_obsidian.Setting(containerEl).setName(label).setDesc(t("settings.sop.desc")).addText((t2) => t2.setValue(this.plugin.settings.clipRules[mode].sopPath).onChange(async (v) => {
        this.plugin.settings.clipRules[mode].sopPath = v.trim();
        await this.plugin.saveSettings();
      }));
    }
  }
};

// src/server.ts
var http = __toESM(require("http"));
function createServer2(port, onClip, version = "") {
  const server = http.createServer((req, res) => {
    const origin = req.headers["origin"] || "";
    if (origin.startsWith("chrome-extension://")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method === "GET" && req.url === "/ping") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ app: "vault-autopilot", version }));
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
  return `[${t("note.openOriginal")}](${url})`;
}

// src/video-note.ts
var KINDS = ["cover", "content", "motion", "screenshot"];
var HEADING_KEY = {
  cover: "note.heading.cover",
  content: "note.heading.content",
  motion: "note.heading.motion",
  screenshot: "note.heading.screenshot"
};
var EMOJI = { cover: "\u{1F5BC}\uFE0F", content: "\u{1F3AC}", motion: "\u2728", screenshot: "\u{1F4F8}" };
function headingLabel(kind) {
  return t(HEADING_KEY[kind]);
}
function labelVariants(kind) {
  return variants(HEADING_KEY[kind]);
}
function labelToKind(label) {
  for (const k of KINDS) if (labelVariants(k).includes(label)) return k;
  return null;
}
function circledNumber(i) {
  return i >= 1 && i <= 20 ? String.fromCodePoint(9312 + i - 1) : `(${i})`;
}
function sopBlock(sopContent) {
  const lines = sopContent.split("\n").map((l) => `> ${l}`).join("\n");
  const checklist = ["> ", "> ---", `> **${t("note.sopDone")}**`, `> - [ ] ${t("note.sopStep1")}`, `> - [ ] ${t("note.sopStep2")}`].join("\n");
  return `> [!TIP] ${t("note.sopCalloutTitle")}
${lines}
${checklist}`;
}
function framesBlock(frameNames) {
  const lines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join("\n");
  return `> [!NOTE] ${t("note.framesCalloutTitle")}
${lines}
> 
> - [ ] ${t("note.framesChecklist")}`;
}
function coverSection(coverFile, sop) {
  const parts = [`## ${headingLabel("cover")}`, ``, `![[${coverFile}]]`, ``];
  if (sop) parts.push(sopBlock(sop), ``);
  return { kind: "cover", startSeconds: 0, text: parts.join("\n") };
}
function hookSection(p, sop) {
  const embed = buildVideoEmbed(p.url, p.platform, 0);
  const parts = [`## ${headingLabel("content")}`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (p.transcript) parts.push(`### ${t("note.transcript")}`, ``, p.transcript, ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: "content", startSeconds: 0, text: parts.join("\n") };
}
function keyframeSection(p, sop) {
  const embed = buildVideoEmbed(p.url, p.platform, p.start);
  const parts = [`## ${headingLabel("motion")} \u2460 \xB7 ${Math.floor(p.start)}s\u2013${Math.round(p.end)}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: "motion", startSeconds: p.start, text: parts.join("\n") };
}
function screenshotSection(imageNames, sop, aiResult) {
  const imgs = imageNames.map((n) => `![[${n}]]`).join("\n");
  const parts = [`## ${headingLabel("screenshot")} \u2460`, ``, imgs, ``];
  if (aiResult) parts.push(aiResult, ``);
  else if (sop) parts.push(sopBlock(sop), ``);
  return { kind: "screenshot", startSeconds: 0, text: parts.join("\n") };
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
  for (const k of KINDS) {
    for (const label of labelVariants(k)) {
      if (heading.includes(label)) return k;
    }
  }
  return null;
}
function emojiHeading(text, kind) {
  return text.replace(/^## .*$/m, (line) => {
    const heading = line.slice(3);
    let tail = headingLabel(kind);
    for (const label of labelVariants(kind)) {
      const idx = heading.indexOf(label);
      if (idx >= 0) {
        tail = heading.slice(idx);
        break;
      }
    }
    return `## ${EMOJI[kind]} ${tail}`;
  });
}
function stripTrailingRule(t2) {
  return t2.replace(/\s+$/, "").replace(/\n-{3,}$/, "").replace(/\s+$/, "");
}
function syncOverview(head, frontmatter, dims) {
  var _a, _b;
  const channel = (_a = frontmatter.match(/^channel:\s*"?(.*?)"?\s*$/m)) == null ? void 0 : _a[1];
  const platform = (_b = frontmatter.match(/^platform:\s*(.*?)\s*$/m)) == null ? void 0 : _b[1];
  const label = [channel, platform].filter(Boolean).join(" \xB7 ") || t("note.videoFallback");
  const overview = `> [!abstract] ${label}
> ${dims.map((d) => `${EMOJI[d]} ${headingLabel(d)}`).join(" \xB7 ")}`;
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
      const kind = (_a = kindOf(curHeading)) != null ? _a : "motion";
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
function addDimension(frontmatter, kind) {
  return frontmatter.replace(/^(dimensions:\s*\[)([^\]]*)(\])/m, (_, open, inner, close) => {
    const dims = inner.split(",").map((d) => d.trim()).filter(Boolean);
    if (!dims.some((d) => labelToKind(d) === kind)) dims.push(headingLabel(kind));
    const rank = (d) => {
      const k = labelToKind(d);
      return k ? KINDS.indexOf(k) : -1;
    };
    dims.sort((a, b) => rank(a) - rank(b));
    return `${open}${dims.join(", ")}${close}`;
  });
}
function renumber(sections) {
  const counters = {};
  return sections.map((s) => {
    var _a;
    if (s.kind !== "motion" && s.kind !== "screenshot") return s;
    counters[s.kind] = ((_a = counters[s.kind]) != null ? _a : 0) + 1;
    const labels = labelVariants(s.kind).join("|");
    const text = s.text.replace(new RegExp(`^(## .*?(?:${labels}) )\\S+( \xB7.*)?$`, "m"), `$1${circledNumber(counters[s.kind])}$2`);
    return { ...s, text };
  });
}
function mergeSection(existing, section) {
  const fmMatch = existing.match(/^---\n[\s\S]*?\n---/);
  const frontmatter = fmMatch ? fmMatch[0] : "";
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;
  const { head, sections } = parseSections(body);
  if (section.kind !== "motion" && section.kind !== "screenshot" && sections.some((s) => s.kind === section.kind)) {
    return { content: existing, skipped: true };
  }
  const incoming = { kind: section.kind, startSeconds: section.startSeconds, text: section.text };
  const all = [...sections, incoming].sort(
    (a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.startSeconds - b.startSeconds
  );
  const ordered = renumber(all);
  const newFrontmatter = addDimension(frontmatter, section.kind);
  const dims = KINDS.filter((k) => ordered.some((s) => s.kind === k));
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
    if (skipped) return { notePath: existing.path, notice: t("notice.sectionExists", { section: headingLabel(section.kind) }) };
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
    t("note.source", { url: payload.url }),
    ``,
    `> [!NOTE] ${t("note.screenshotCallout")}`,
    imageLines,
    ``
  ];
  if (sopContent) parts.push(sopBlock(sopContent), ``);
  parts.push(`---`, ``, `## ${t("note.notesHeading")}`, ``);
  return parts.join("\n");
}
async function handleScreenshot(payload, rule, vaultOps, searchFolder, assetFolder) {
  if (!rule.outputFolder) {
    throw new Error(t("error.screenshotFolderNotConfigured"));
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
    throw new Error(t("error.videoFolderNotConfigured"));
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
    setLanguage(this.settings.language);
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    if (this.settings.httpServer.enabled) this.startServer();
  }
  onunload() {
    var _a;
    (_a = this.server) == null ? void 0 : _a.close();
    this.server = null;
  }
  async loadSettings() {
    var _a, _b, _c, _d, _e, _f, _g;
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      httpServer: {
        ...DEFAULT_SETTINGS.httpServer,
        ...(_a = loaded == null ? void 0 : loaded.httpServer) != null ? _a : {},
        port: normalizePort((_b = loaded == null ? void 0 : loaded.httpServer) == null ? void 0 : _b.port)
      },
      clipRules: {
        thumbnail: emptyToDefault((_c = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _c.thumbnail, DEFAULT_SETTINGS.clipRules.thumbnail),
        screenshot: emptyToDefault((_d = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _d.screenshot, DEFAULT_SETTINGS.clipRules.screenshot),
        hook: emptyToDefault((_e = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _e.hook, DEFAULT_SETTINGS.clipRules.hook),
        keyframe: emptyToDefault((_f = loaded == null ? void 0 : loaded.clipRules) == null ? void 0 : _f.keyframe, DEFAULT_SETTINGS.clipRules.keyframe)
      },
      firstSaveNoticed: { ...DEFAULT_SETTINGS.firstSaveNoticed, ...(_g = loaded == null ? void 0 : loaded.firstSaveNoticed) != null ? _g : {} }
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
    let current2 = "";
    for (const part of parts) {
      current2 = current2 ? `${current2}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current2)) {
        await this.app.vault.createFolder(current2);
      }
    }
  }
  // First successful save per mode: tell the user where it landed and that the
  // location is changeable — they can't design folders before seeing output.
  async maybeFirstSaveNotice(mode, notePath) {
    if (this.settings.firstSaveNoticed[mode]) return;
    this.settings.firstSaveNoticed[mode] = true;
    const folder = notePath.includes("/") ? notePath.split("/").slice(0, -1).join("/") : "/";
    new import_obsidian2.Notice(t("notice.savedTo", { folder }), 8e3);
    try {
      await this.saveSettings();
    } catch (e) {
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
        if (notePath) await this.maybeFirstSaveNotice(payload.mode, notePath);
        const obsidianUrl = notePath ? `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(notePath)}` : void 0;
        return { obsidianUrl, notice };
      },
      this.manifest.version
    );
    this.server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        new import_obsidian2.Notice(t("notice.portInUse", { port }), 1e4);
      }
    });
  }
};
