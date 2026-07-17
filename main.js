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
  "settings.baseFolder.name": "Base folder",
  "settings.baseFolder.desc": "Root folder for everything this plugin saves. Change it and the four paths below follow automatically. Default: Clips",
  "settings.restoreDefaults.name": "Restore default folders",
  "settings.restoreDefaults.desc": "Reset Base folder and the four paths below to the factory layout under Clips/.",
  "settings.restoreDefaults.button": "Restore",
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
  "settings.maxFrames.desc": "Maximum frames kept per hook / keyframe clip (1 to 20). Default 5.",
  "settings.installSops.name": "Bundled SOPs",
  "settings.installSops.desc": "Three ready-made analysis SOPs (cover, hook, keyframe), each in Chinese and English. One click writes them into <Base folder>/SOPs. Existing files are never overwritten. Point the SOP path fields below at the ones you want to use.",
  "settings.installSops.button": "Install",
  "notice.sopsInstalled": "Installed {count} SOP file(s) into {folder}. Skipped {skipped} already there.",
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
  "settings.baseFolder.name": "\u6839\u6587\u4EF6\u5939",
  "settings.baseFolder.desc": "\u672C\u63D2\u4EF6\u4FDD\u5B58\u7684\u6240\u6709\u5185\u5BB9\u7684\u6839\u76EE\u5F55\u3002\u6539\u8FD9\u4E00\u9879\uFF0C\u4E0B\u9762\u56DB\u4E2A\u8DEF\u5F84\u81EA\u52A8\u8DDF\u7740\u6362\u3002\u9ED8\u8BA4\uFF1AClips",
  "settings.restoreDefaults.name": "\u6062\u590D\u9ED8\u8BA4\u6587\u4EF6\u5939",
  "settings.restoreDefaults.desc": "\u628A\u6839\u6587\u4EF6\u5939\u548C\u4E0B\u9762\u56DB\u4E2A\u8DEF\u5F84\u91CD\u7F6E\u56DE Clips/ \u51FA\u5382\u5E03\u5C40\u3002",
  "settings.restoreDefaults.button": "\u6062\u590D",
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
  "settings.installSops.name": "\u5185\u7F6E SOP",
  "settings.installSops.desc": "\u4E09\u4EFD\u73B0\u6210\u7684\u5206\u6790 SOP\uFF08\u5C01\u9762\u3001Hook\u3001\u5173\u952E\u5E27\uFF09\uFF0C\u4E2D\u82F1\u5404\u4E00\u4EFD\u3002\u70B9\u4E00\u4E0B\u5199\u5165 <\u6839\u6587\u4EF6\u5939>/SOPs\uFF0C\u5DF2\u5B58\u5728\u7684\u6587\u4EF6\u4E0D\u4F1A\u88AB\u8986\u76D6\u3002\u60F3\u542F\u7528\u54EA\u4EFD\uFF0C\u628A\u4E0B\u9762\u5BF9\u5E94\u7684 SOP \u8DEF\u5F84\u6307\u5411\u5B83\u3002",
  "settings.installSops.button": "\u5B89\u88C5",
  "notice.sopsInstalled": "\u5DF2\u5B89\u88C5 {count} \u4EFD SOP \u5230 {folder}\uFF0C\u8DF3\u8FC7 {skipped} \u4EFD\u5DF2\u5B58\u5728\u7684\u6587\u4EF6\u3002",
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

// src/sops/zh/封面拆解学习 SOP.md
var SOP_default = '---\ntitle: \u5C01\u9762\u62C6\u89E3\u5B66\u4E60 SOP2\ntype: note\npermalink: obsidian-sop/02-\u5199\u4F5C\u4E0E\u5185\u5BB9/\u5C01\u9762\u62C6\u89E3\u5B66\u4E60-sop2\n---\n\n# \u5C01\u9762\u4E0E\u6807\u9898\u5206\u6790 Prompt\n\n_\u8BFB\u5B8C\u8FD9\u4EFD\u6587\u6863\u540E\uFF0C\u76F4\u63A5\u6309\u4EE5\u4E0B\u6846\u67B6\u8F93\u51FA\u5206\u6790\u3002_\n\n---\n\n## \u8F93\u51FA\u7ED3\u6784\n\n**\u63CF\u8FF0**\n\u4E00\u53E5\u8BDD\u8BF4\u6E05\u695A\u5C01\u9762\u91CC\u6709\u4EC0\u4E48\uFF1A\u6709\u6CA1\u6709\u4EBA\u7269\u3001\u5728\u505A\u4EC0\u4E48\u3001\u6709\u6CA1\u6709\u9053\u5177\u6216\u5927\u5B57\u3001\u80CC\u666F\u5927\u6982\u662F\u4EC0\u4E48\u3002\n\n**\u5C01\u9762\u94A9\u5B50**\n\u7B2C\u4E00\u773C\u89E6\u53D1\u4E86\u4EC0\u4E48\u53CD\u5E94\u2014\u2014\u597D\u5947\u3001\u4E0D\u4FE1\u3001\u88AB\u770B\u89C1\u3001\u60F3\u77E5\u9053\u7B54\u6848\u2026\u2026\u8BF4\u6E05\u695A\u662F\u4EC0\u4E48\u8BA9\u4F60\u6709\u8FD9\u4E2A\u53CD\u5E94\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u8FD9\u4E2A\u53CD\u5E94\u4F1A\u8BA9\u4F60\u70B9\u8FDB\u53BB\u3002\n\n**\u6807\u9898\u94A9\u5B50**\uFF08\u6709\u6807\u9898\u65F6\u5FC5\u586B\uFF0C\u65E0\u6807\u9898\u65F6\u8DF3\u8FC7\uFF09\n\u8BFB\u5B8C\u6807\u9898\u4E4B\u540E\u8111\u5B50\u91CC\u5192\u51FA\u6765\u7684\u7B2C\u4E00\u4E2A\u95EE\u9898\u662F\u4EC0\u4E48\u2014\u2014\u90A3\u4E2A\u95EE\u9898\u5C31\u662F\u94A9\u5B50\u3002\u8BF4\u6E05\u695A\u5B83\u662F\u600E\u4E48\u5236\u9020\u51FA\u8FD9\u4E2A\u95EE\u9898\u7684\uFF0C\u4EE5\u53CA\u4E3A\u4EC0\u4E48\u4F60\u4F1A\u60F3\u70B9\u8FDB\u53BB\u627E\u7B54\u6848\u3002\n\n**\u534F\u4F5C**\uFF08\u6709\u6807\u9898\u65F6\u5FC5\u586B\uFF0C\u65E0\u6807\u9898\u65F6\u8DF3\u8FC7\uFF09\n\u5C01\u9762\u548C\u6807\u9898\u52A0\u5728\u4E00\u8D77\uFF0C\u70B9\u51FB\u7684\u7406\u7531\u6709\u6CA1\u6709\u53D8\u5F97\u66F4\u5F3A\uFF1F\u8FD8\u662F\u8BF4\u4E00\u4E2A\u5C31\u591F\u4E86\uFF1F\n\n**\u7279\u6B8A\u5904\u7406**\uFF08\u6761\u4EF6\u89E6\u53D1\uFF0C\u4E0D\u662F\u6BCF\u5F20\u90FD\u6709\uFF09\n\u89E6\u53D1\u6761\u4EF6\uFF1A\u5C01\u9762\u6709\u7279\u6B8A\u89C6\u89C9\u6548\u679C\u3001\u660E\u663E\u7684\u5B57\u4F53\u5904\u7406\u3001\u6216\u503C\u5F97\u5B66\u4E60\u7684\u6784\u56FE\u624B\u6CD5\u3002\u666E\u901A\u7684\u300C\u4EBA\u8138 + \u80CC\u666F + \u6587\u5B57\u300D\u4E0D\u89E6\u53D1\u3002\n\u89E6\u53D1\u65F6\u5199\u4E09\u70B9\uFF1A\n- \u8FD9\u4E2A\u6548\u679C\u6216\u6280\u6CD5\u662F\u4EC0\u4E48\n- \u4E3A\u4EC0\u4E48\u8FD9\u6837\u505A\n- \u600E\u4E48\u590D\u523B\n\n---\n\n## \u8BED\u6C14\u8981\u6C42\n\n\u50CF\u5728\u8DDF\u4EBA\u8BF4"\u4F60\u770B\u8FD9\u5F20\u56FE\uFF0C\u4F60\u770B\u5B8C\u4EC0\u4E48\u611F\u89C9"\uFF0C\u4E0D\u662F\u5728\u5199\u8BBE\u8BA1\u62A5\u544A\u3002\n\n\u4E0D\u8981\u7528\uFF1A\n- "\u5929\u7136\u89C6\u89C9\u5165\u53E3"\u3001"\u89C6\u89C9\u5C42\u7EA7"\u3001"\u6784\u6210\u5B8C\u6574\u7684\u70B9\u51FB\u7406\u7531"\n- \u957F\u6392\u6BD4\u53E5\u3001AI \u603B\u7ED3\u8154\n\n\u8981\u505A\u5230\uFF1A\u6BCF\u9879 2-3 \u53E5\uFF0C\u77ED\uFF0C\u76F4\u63A5\uFF0C\u53E3\u8BED\u611F\u3002\n\n';

// src/sops/zh/视频Hook分析 SOP.md
var Hook_SOP_default = '---\ntitle: \u89C6\u9891Hook\u5206\u6790 SOP\ntype: note\npermalink: obsidian-sop/05-\u5BA1\u7F8E\u79EF\u7D2F/\u89C6\u9891-hook-\u5206\u6790-sop\n---\n\n# \u89C6\u9891 Hook \u5206\u6790 Prompt\n\n_\u8BFB\u5B8C\u8FD9\u4EFD\u6587\u6863\u540E\uFF0C\u76F4\u63A5\u6309\u4EE5\u4E0B\u6846\u67B6\u8F93\u51FA Hook \u5206\u6790\u3002_\n\n> Hook \u7684\u4F5C\u7528\u662F\u8BA9\u4EBA\u7559\u4E0B\uFF0C\u4E0D\u662F\u8BA9\u4EBA\u70B9\u8FDB\u6765\uFF08\u90A3\u662F\u5C01\u9762\u548C\u6807\u9898\u7684\u4E8B\uFF09\u3002\u5206\u6790\u65F6\u59CB\u7EC8\u56F4\u7ED5\u8FD9\u4E00\u4EF6\u4E8B\uFF1A\u8FD9\u6BB5\u5F00\u573A\u65E0\u8BBA\u662F\u8BDD\u8FD8\u662F\u753B\u9762\uFF0C\u600E\u4E48\u8BA9\u4EBA\u4E0D\u8D70\uFF1F\n\n---\n\n## \u8F93\u5165\n\n- \u89C6\u9891\u5F00\u573A\u5E27\u622A\u56FE\uFF080\u201315 \u79D2\uFF09\n- \u5B57\u5E55\u6587\u672C\uFF08\u6709\u5219\u7528\uFF0C\u6CA1\u6709\u5219\u53EA\u5206\u6790\u753B\u9762\u5E76\u6CE8\u660E\uFF09\n\n---\n\n## \u8F93\u51FA\u7ED3\u6784\n\n**Hook \u7C7B\u578B**\n\u4ECE\u4EE5\u4E0B\u9009\u4E00\u4E2A\u6216\u4E24\u4E2A\uFF0C\u4E00\u53E5\u8BDD\u8BF4\u4E3A\u4EC0\u4E48\uFF1A\n\u60AC\u5FF5\u578B / \u51B2\u7A81\u578B / \u4EF7\u503C\u627F\u8BFA\u578B / \u8EAB\u4EFD\u8BA4\u540C\u578B / \u89C6\u89C9\u51B2\u51FB\u578B / \u53CD\u5E38\u8BC6\u578B / \u6545\u4E8B\u5207\u5165\u578B\n\n**\u4ED6\u8BF4\u4E86\u4EC0\u4E48**\n\u5206\u6790\u5F00\u573A\u7684\u7B2C\u4E00\u53E5\u8BDD\u6216\u524D\u51E0\u53E5\u8BDD\uFF1A\u8FD9\u53E5\u8BDD\u5982\u4F55\u5728\u7B2C\u4E00\u65F6\u95F4\u62A2\u5360\u6CE8\u610F\u529B\uFF1F\u662F\u4EC0\u4E48\u53E5\u5F0F\u3001\u4EC0\u4E48\u627F\u8BFA\u3001\u4EC0\u4E48\u6570\u5B57\u3001\u8FD8\u662F\u4EC0\u4E48\u53CD\u5DEE\uFF1F\n\n**\u753B\u9762\u600E\u4E48\u914D\u5408**\n\u4E0D\u8981\u9010\u5E27\u63CF\u8FF0"\u7B2C\u4E00\u5E27\u662FX\uFF0C\u7B2C\u4E8C\u5E27\u662FY"\u3002\u5206\u6790\u753B\u9762\u5728\u505A\u4EC0\u4E48\u4E8B\u3001\u4E3A\u4EC0\u4E48\u8FD9\u6837\u505A\u80FD\u8BA9\u4EBA\u7559\u4E0B\u6765\u3002\u753B\u9762\u548C\u8BDD\u4E4B\u95F4\u662F\u653E\u5927\u5173\u7CFB\u8FD8\u662F\u8865\u5145\u5173\u7CFB\uFF1F\n\n**\u5982\u4F55\u590D\u5236**\n\u7ED9\u51FA\u53EF\u4EE5\u76F4\u63A5\u5957\u7528\u7684\u6A21\u677F\u6216\u64CD\u4F5C\u6B65\u9AA4\uFF0C\u5177\u4F53\u5230\u53E5\u5F0F\u3001\u753B\u9762\u5904\u7406\u65B9\u5F0F\u3002\u4E0D\u80FD\u5199"\u7528\u7C7B\u4F3C\u624B\u6CD5"\u3002\n\n**\u6211\u7684\u60F3\u6CD5**\n\uFF08\u7559\u7A7A\u2014\u2014\u8FD9\u662F\u4F60\u81EA\u5DF1\u586B\u7684\uFF09\n\n---\n\n## \u8BED\u6C14\u8981\u6C42\n\n\u50CF\u5728\u8DDF\u4EBA\u63CF\u8FF0\u4F60\u770B\u8FD9\u6BB5\u89C6\u9891\u7684\u611F\u53D7\uFF0C\u4E0D\u662F\u5728\u5199\u5206\u6790\u62A5\u544A\u3002\n\n\u4E0D\u8981\u7528\uFF1A\u89C6\u89C9\u5C42\u7EA7\u3001\u4FE1\u606F\u5BC6\u5EA6\u3001\u5F3A\u5316\u8BA4\u77E5\u3001\u9010\u5E27\u7F57\u5217\n\u8981\u505A\u5230\uFF1A\u77ED\u53E5\uFF0C\u53E3\u8BED\u611F\uFF0C\u6BCF\u9879 3-5 \u53E5\u4EE5\u5185\n\n';

// src/sops/zh/视频关键帧分析 SOP.md
var SOP_default2 = '---\ntitle: \u89C6\u9891\u5173\u952E\u5E27\u5206\u6790 SOP\ntype: note\npermalink: obsidian-sop/05-\u5BA1\u7F8E\u79EF\u7D2F/\u89C6\u9891\u5173\u952E\u5E27\u5206\u6790-sop\n---\n\n# \u89C6\u9891\u5173\u952E\u5E27\u5206\u6790 SOP\n\n> \u8F93\u5165\uFF1A\u89C6\u9891\u67D0\u6BB5\u65F6\u95F4\u5185\u7684\u591A\u5F20\u5173\u952E\u5E27\u622A\u56FE\uFF08\u6587\u4EF6\u540D\u524D\u7F00 `keyframe-`\uFF09\u3002\n> \u8F93\u51FA\uFF1A\u4E00\u4EFD\u52A8\u6548\u5206\u6790\u7B14\u8BB0\uFF0C\u4E24\u5C42\u5185\u5BB9\uFF1A\u8BBE\u8BA1\u7406\u89E3 + \u5B9E\u73B0\u7EA6\u5B9A\u3002\n> \u76EE\u7684\uFF1A\u65E2\u80FD\u4F5C\u4E3A\u6539\u7F16\u53C2\u8003\uFF08\u7406\u89E3\u6846\u67B6\u548C\u611F\u89C9\uFF09\uFF0C\u4E5F\u80FD\u76F4\u63A5\u4EA4\u7ED9 Agent \u5B9E\u73B0\u800C\u4E0D\u9700\u8981 back and forth\u3002\n\n---\n\n## \u8F93\u51FA\u683C\u5F0F\n\n```\n# \u52A8\u6548\u5206\u6790 \u2014 {\u89C6\u9891\u6807\u9898} \xB7 \u52A8\u6548{N} \xB7 {start}s\u2013{end}s\n\n## \u5173\u952E\u5E27\u63CF\u8FF0\n\uFF08\u6309\u5E27\u987A\u5E8F\u63CF\u8FF0\uFF1A\u753B\u9762\u91CC\u6709\u4EC0\u4E48\u5143\u7D20\uFF0C\u5E27\u4E0E\u5E27\u4E4B\u95F4\u53D1\u751F\u4E86\u4EC0\u4E48\u53D8\u5316\u3002\n \u5BA2\u89C2\u63CF\u8FF0\uFF0C\u4E0D\u89E3\u91CA\u539F\u56E0\u3002\uFF09\n\n## \u52A8\u6548\u903B\u8F91\n\uFF08\u8FD9\u4E9B\u53D8\u5316\u80CC\u540E\u7684\u8BBE\u8BA1\u610F\u56FE\uFF1A\u4E3A\u4EC0\u4E48\u8FD9\u6837\u8FD0\u52A8\u3001\u8282\u594F\u611F\u662F\u4EC0\u4E48\u3001\n \u60F3\u7ED9\u89C2\u4F17\u4EC0\u4E48\u611F\u53D7\u3002\u5199\u6E05\u695A"\u6846\u67B6"\uFF0C\u800C\u4E0D\u662F\u5177\u4F53\u6570\u5B57\u2014\u2014\n \u8FD9\u6837\u6539\u5185\u5BB9\u65F6\u6846\u67B6\u8FD8\u80FD\u590D\u7528\u3002\uFF09\n\n## \u5B9E\u73B0\u7EA6\u5B9A\n\uFF08\u4EE5\u4E0B\u662F\u6BCF\u6B21\u505A\u8FD9\u7C7B HTML \u52A8\u6548 overlay \u90FD\u5FC5\u987B\u9075\u5B88\u7684\u7EA6\u5B9A\uFF0C\n \u4E0D\u9700\u8981\u518D\u95EE\uFF0C\u4E0D\u9700\u8981\u518D\u6539\uFF1A\uFF09\n\n- \u80CC\u666F\u6C38\u8FDC\u900F\u660E\uFF0C\u7528\u4E8E\u53E0\u52A0\u5B9E\u62CD\u89C6\u9891\n- \u52A0 `?preview` URL \u53C2\u6570\u65F6\u663E\u793A\u6DF1\u7070\u80CC\u666F `#1a1a1a`\uFF0C\u65B9\u4FBF\u9884\u89C8\u767D\u8272\u5143\u7D20\uFF1B\u6E32\u67D3\u65F6\u53BB\u6389\u53C2\u6570\n- \u6587\u4EF6\u9876\u90E8\u56FA\u5B9A CONFIG \u5757\uFF1A\n    DURATION = [\u89C6\u9891\u65F6\u957F ms]   \u2190 \u63A7\u5236\u6E32\u67D3\u51FA\u6765\u7684\u89C6\u9891\u957F\u5EA6\n    FPS      = 30\n    [\u5176\u4ED6\u5185\u5BB9\u53C2\u6570]              \u2190 \u8FD9\u4E2A\u52A8\u6548\u7279\u6709\uFF0C\u5217\u5728\u4E0B\u9762\n- \u6587\u4EF6\u4FDD\u5B58\u5728 `Raw/Superpower/`\n\n## \u6211\u7684\u60F3\u6CD5\n\uFF08\u7559\u7A7A\uFF09\n```\n\n---\n\n## \u586B\u5199\u89C4\u5219\n\n- **\u5173\u952E\u5E27\u63CF\u8FF0**\uFF1A\u53EA\u63CF\u8FF0"\u770B\u5230\u4E86\u4EC0\u4E48"\uFF0C\u9010\u5E27\u5199\uFF0C\u5E27\u95F4\u53D8\u5316\u91CD\u70B9\u6807\u51FA\n- **\u52A8\u6548\u903B\u8F91**\uFF1A\u56DE\u7B54"\u4E3A\u4EC0\u4E48\u8FD9\u6837\u505A"\uFF0C\u805A\u7126\u8BBE\u8BA1\u6846\u67B6\uFF0C\u4E0D\u8981\u5199\u6B7B\u5177\u4F53\u6570\u503C\uFF08\u6570\u503C\u662F\u5185\u5BB9\u53C2\u6570\uFF0C\u4F1A\u53D8\uFF09\n- **\u5B9E\u73B0\u7EA6\u5B9A**\uFF1A\u8FD9\u4E00\u5757\u6BCF\u6B21\u683C\u5F0F\u5B8C\u5168\u4E00\u6837\uFF0C\u76F4\u63A5\u590D\u5236\u8FC7\u53BB\uFF0C\u4E0D\u8981\u4FEE\u6539\n\n---\n\n## \u591A\u5E27\u5904\u7406\n\n- \u6309\u65F6\u95F4\u987A\u5E8F\u63CF\u8FF0\uFF0C\u4E0D\u8981\u8DF3\u5E27\n- \u5E27\u95F4\u5DEE\u5F02\u5C0F\uFF08\u8FDE\u7EED\u52A8\u753B\uFF09\uFF1A\u91CD\u70B9\u5199\u6574\u4F53\u8FD0\u52A8\u611F\uFF0C\u4E0D\u8981\u9010\u5E27\u7F57\u5217\n- \u5E27\u95F4\u5DEE\u5F02\u5927\uFF08\u6709\u526A\u8F91\u5207\u6362\uFF09\uFF1A\u91CD\u70B9\u5206\u6790\u5207\u6362\u8282\u594F\u548C\u903B\u8F91\n';

// src/sops/en/Cover Analysis SOP.md
var Cover_Analysis_SOP_default = '---\ntitle: Cover Analysis SOP2\ntype: note\npermalink: obsidian-sop/02-writing-and-content/cover-analysis-sop2\n---\n\n# Cover and Title Analysis Prompt\n\n_After reading this document, output your analysis directly using the framework below._\n\n---\n\n## Output Structure\n\n**Description**\nState in one sentence what is in the cover: is there a person, what are they doing, are there props or large text, what does the background roughly look like.\n\n**Cover Hook**\nWhat reaction did the first glance trigger: curiosity, disbelief, feeling seen, wanting to know the answer. Explain what caused this reaction and why this reaction would make someone click in.\n\n**Title Hook** (required when there is a title, skip when there is no title)\nWhat is the first question that comes to mind right after reading the title. That question is the hook. Explain how the title creates this question and why you would want to click in to find the answer.\n\n**Collaboration** (required when there is a title, skip when there is no title)\nWhen the cover and title are combined, does the reason to click become stronger, or is either one enough on its own?\n\n**Special Treatment** (conditional, not every cover has this)\nTrigger condition: the cover has a special visual effect, noticeable font treatment, or a composition technique worth learning. A plain "face plus background plus text" does not trigger this.\nWhen triggered, write three points:\n- What this effect or technique is\n- Why it was done this way\n- How to replicate it\n\n---\n\n## Tone Requirements\n\nWrite like you are telling someone "look at this image, what do you feel after seeing it," not writing a design report.\n\nDo not use:\n- Phrases like "a natural visual entry point," "visual hierarchy," "forms a complete reason to click"\n- Long parallel sentences, AI summary tone\n\nDo this instead: 2 to 3 sentences per item, short, direct, conversational.\n';

// src/sops/en/Video Hook Analysis SOP.md
var Video_Hook_Analysis_SOP_default = `---
title: Video Hook Analysis SOP
type: note
permalink: obsidian-sop/05-aesthetic-collection/video-hook-analysis-sop
---

# Video Hook Analysis Prompt

_After reading this document, output your Hook analysis directly using the framework below._

> The job of a hook is to make people stay, not to make them click in (that is the job of the cover and title). When analyzing, always focus on this one thing: whether through words or visuals, how does this opening keep people from leaving?

---

## Input

- Screenshot of the video's opening frames (0 to 15 seconds)
- Subtitle text (use it if available, otherwise analyze only the visuals and note that there is no subtitle)

---

## Output Structure

**Hook Type**
Choose one or two from the list below and explain why in one sentence:
Suspense / Conflict / Value Promise / Identity / Visual Impact / Counterintuitive / Story Opening

**What Was Said**
Analyze the first sentence or first few sentences of the opening: how does this sentence grab attention right away? What sentence pattern, what promise, what number, or what contrast is used?

**How the Visuals Support It**
Do not describe frame by frame, such as "the first frame is X, the second frame is Y." Analyze what the visuals are doing and why doing it this way makes people stay. Is the relationship between the visuals and the words one of amplification or one of supplement?

**How to Replicate**
Give a template or steps that can be directly applied, specific down to the sentence pattern and visual treatment. Do not write something like "use a similar technique."

**My Thoughts**
(leave blank, this is for you to fill in yourself)

---

## Tone Requirements

Write like you are describing how you felt watching this video, not writing an analysis report.

Do not use: visual hierarchy, information density, reinforces cognition, frame by frame listing
Do this instead: short sentences, conversational, no more than 3 to 5 sentences per item
`;

// src/sops/en/Video Keyframe Analysis SOP.md
var Video_Keyframe_Analysis_SOP_default = '---\ntitle: Video Keyframe Analysis SOP\ntype: note\npermalink: obsidian-sop/05-aesthetic-collection/video-keyframe-analysis-sop\n---\n\n# Video Keyframe Analysis SOP\n\n> Input: multiple keyframe screenshots from a segment of the video (filename prefix `keyframe-`).\n> Output: a motion analysis note with two layers of content: design understanding plus implementation conventions.\n> Purpose: can be used as a reference for adaptation (understanding the framework and feel), and can also be handed directly to an Agent to implement without back and forth.\n\n---\n\n## Output Format\n\n```\n# Motion Analysis - {Video Title} \xB7 Motion {N} \xB7 {start}s-{end}s\n\n## Keyframe Description\n(Describe in frame order: what elements are in the frame, what changes\n between frames. Describe objectively, do not explain the reason.)\n\n## Motion Logic\n(The design intent behind these changes: why it moves this way, what the\n rhythm is, what feeling it should give the viewer. Describe the "framework"\n clearly, not specific numbers, so the framework can be reused when the\n content changes.)\n\n## Implementation Conventions\n(The following are conventions that must be followed every time you build\n this type of HTML motion overlay. No need to ask again, no need to change\n them:)\n\n- The background is always transparent, for overlaying on top of the real footage\n- Adding the `?preview` URL parameter shows a dark gray background `#1a1a1a`, to make it easier to preview white elements; remove the parameter when rendering\n- A fixed CONFIG block at the top of the file:\n    DURATION = [video duration in ms]   \u2190 controls the length of the rendered video\n    FPS      = 30\n    [other content parameters]          \u2190 specific to this motion, listed below\n- File saved in `Raw/Superpower/`\n\n## My Thoughts\n(leave blank)\n```\n\n---\n\n## Filling Rules\n\n- **Keyframe Description**: only describe "what you see," write frame by frame, highlight the changes between frames\n- **Motion Logic**: answer "why it was done this way," focus on the design framework, do not hardcode specific values (values are content parameters and will change)\n- **Implementation Conventions**: this section is exactly the same format every time, copy it over directly, do not modify it\n\n---\n\n## Handling Multiple Frames\n\n- Describe in chronological order, do not skip frames\n- When the difference between frames is small (continuous animation): focus on the overall sense of motion, do not list frame by frame\n- When the difference between frames is large (there are cuts or transitions): focus on analyzing the rhythm and logic of the transitions\n';

// src/bundled-sops.ts
var BUNDLED_SOPS = [
  { filename: "\u5C01\u9762\u62C6\u89E3\u5B66\u4E60 SOP.md", content: SOP_default },
  { filename: "\u89C6\u9891Hook\u5206\u6790 SOP.md", content: Hook_SOP_default },
  { filename: "\u89C6\u9891\u5173\u952E\u5E27\u5206\u6790 SOP.md", content: SOP_default2 },
  { filename: "Cover Analysis SOP.md", content: Cover_Analysis_SOP_default },
  { filename: "Video Hook Analysis SOP.md", content: Video_Hook_Analysis_SOP_default },
  { filename: "Video Keyframe Analysis SOP.md", content: Video_Keyframe_Analysis_SOP_default }
];
async function installBundledSops(ops, baseFolder, sops = BUNDLED_SOPS) {
  const folder = `${(baseFolder || "Clips").trim().replace(/\/+$/, "") || "Clips"}/SOPs`;
  await ops.ensureFolder(folder);
  const written = [];
  const skipped = [];
  for (const s of sops) {
    const path = `${folder}/${s.filename}`;
    if (ops.fileExists(path)) {
      skipped.push(path);
      continue;
    }
    await ops.create(path, s.content);
    written.push(path);
  }
  return { written, skipped };
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  language: "en",
  baseFolder: "Clips",
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
function deriveFolders(base) {
  const b = base.trim().replace(/\/+$/, "") || "Clips";
  return {
    videoNotes: `${b}/Videos`,
    covers: `${b}/Videos/covers`,
    frames: `${b}/Videos/frames`,
    screenshots: `${b}/Screenshots`,
    screenshotFrames: `${b}/Screenshots/frames`
  };
}
function applyBaseFolder(settings, base) {
  const f = deriveFolders(base);
  settings.baseFolder = base.trim().replace(/\/+$/, "") || "Clips";
  settings.clipRules.thumbnail.outputFolder = f.videoNotes;
  settings.clipRules.thumbnail.thumbnailFolder = f.covers;
  settings.clipRules.hook.framesFolder = f.frames;
  settings.clipRules.keyframe.framesFolder = f.frames;
  settings.clipRules.screenshot.outputFolder = f.screenshots;
  settings.clipRules.screenshot.framesFolder = f.screenshotFrames;
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
    const folderInputs = [];
    new import_obsidian.Setting(containerEl).setName(t("settings.baseFolder.name")).setDesc(t("settings.baseFolder.desc")).addText((txt) => txt.setValue(this.plugin.settings.baseFolder).onChange(async (v) => {
      var _a, _b, _c, _d;
      applyBaseFolder(this.plugin.settings, v);
      const f = deriveFolders(v);
      (_a = folderInputs[0]) == null ? void 0 : _a.setValue(f.videoNotes);
      (_b = folderInputs[1]) == null ? void 0 : _b.setValue(f.covers);
      (_c = folderInputs[2]) == null ? void 0 : _c.setValue(f.frames);
      (_d = folderInputs[3]) == null ? void 0 : _d.setValue(f.screenshots);
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName(t("settings.videoNotesFolder.name")).setDesc(t("settings.videoNotesFolder.desc")).addText((t2) => {
      folderInputs.push(t2);
      t2.setValue(this.plugin.settings.clipRules.thumbnail.outputFolder).onChange(async (v) => {
        this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t("settings.coverFolder.name")).setDesc(t("settings.coverFolder.desc")).addText((t2) => {
      folderInputs.push(t2);
      t2.setValue(this.plugin.settings.clipRules.thumbnail.thumbnailFolder).onChange(async (v) => {
        this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t("settings.framesFolder.name")).setDesc(t("settings.framesFolder.desc")).addText((t2) => {
      folderInputs.push(t2);
      t2.setValue(this.plugin.settings.clipRules.hook.framesFolder).onChange(async (v) => {
        const folder = v.trim();
        this.plugin.settings.clipRules.hook.framesFolder = folder;
        this.plugin.settings.clipRules.keyframe.framesFolder = folder;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t("settings.screenshotFolder.name")).setDesc(t("settings.screenshotFolder.desc")).addText((t2) => {
      folderInputs.push(t2);
      t2.setValue(this.plugin.settings.clipRules.screenshot.outputFolder).onChange(async (v) => {
        const folder = v.trim();
        this.plugin.settings.clipRules.screenshot.outputFolder = folder;
        this.plugin.settings.clipRules.screenshot.framesFolder = folder ? `${folder}/frames` : "";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t("settings.restoreDefaults.name")).setDesc(t("settings.restoreDefaults.desc")).addButton((b) => b.setButtonText(t("settings.restoreDefaults.button")).onClick(async () => {
      applyBaseFolder(this.plugin.settings, "Clips");
      await this.plugin.saveSettings();
      this.display();
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
    new import_obsidian.Setting(containerEl).setName(t("settings.installSops.name")).setDesc(t("settings.installSops.desc")).addButton((b) => b.setButtonText(t("settings.installSops.button")).onClick(async () => {
      const { written, skipped } = await installBundledSops(
        this.plugin.sopInstallOps(),
        this.plugin.settings.baseFolder
      );
      new import_obsidian.Notice(t("notice.sopsInstalled", {
        count: written.length,
        folder: `${this.plugin.settings.baseFolder}/SOPs`,
        skipped: skipped.length
      }), 8e3);
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
  // Narrow vault access for the settings tab's bundled-SOP installer.
  sopInstallOps() {
    return {
      fileExists: (p) => this.app.vault.getAbstractFileByPath(p) != null,
      ensureFolder: (p) => this.ensureFolder(p),
      create: async (p, content) => {
        await this.app.vault.create(p, content);
      }
    };
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
