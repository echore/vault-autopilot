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
var nodePath = __toESM(require("path"));
var import_obsidian3 = require("obsidian");

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
  "gallery.title": "Video library",
  "gallery.open": "Open video library",
  "gallery.all": "All",
  "gallery.deep": "Deep dives",
  "gallery.empty": "No videos yet. Open any video page, click the extension icon, and save a cover. It will show up here.",
  "settings.sopHeading": "Analysis SOPs",
  "settings.useBuiltinSops.name": "Use built-in analysis SOPs",
  "settings.useBuiltinSops.desc": "On: every saved clip carries its matching built-in SOP (cover, hook, keyframe), and plugin updates keep them current. Off: clips save material only, with no analysis prompt.",
  "settings.sopRow.cover": "Cover SOP",
  "settings.sopRow.screenshot": "Screenshot SOP",
  "settings.sopRow.hook": "Hook SOP",
  "settings.sopRow.keyframe": "Keyframe SOP",
  "settings.sopRow.desc": "Leave empty to use the built-in SOP. Want to tweak it? Click Customize: the copy and the path are set up for you.",
  "settings.sopRow.descNoBuiltin": "Screenshot mode has no built-in SOP. To attach one, enter the path of your own SOP file (inside the vault or absolute).",
  "settings.sopRow.placeholder": "Empty = built-in",
  "settings.sopRow.placeholderNoBuiltin": "Optional: path to your own SOP",
  "settings.sopState.builtin": "In effect: built-in SOP (updates with the plugin)",
  "settings.sopState.custom": "In effect: your custom file (clear the path to return to built-in)",
  "settings.sopState.off": "In effect: no analysis (master switch is off)",
  "settings.sopState.none": "In effect: no analysis (this mode has no built-in SOP)",
  "settings.sopCustomize": "Customize",
  "notice.sopExported": "Exported to {path}. Open it and edit; changes apply on the next save.",
  "notice.sopExportExists": "{path} already exists. The path now points to it.",
  "notice.savedTo": "Saved to {folder}\nWant a different location? Settings \u2192 Vault Autopilot \u2192 Storage locations",
  "notice.portInUse": "Vault Autopilot: port {port} is already in use. Quit the program using it, or set the same new port in both the plugin settings and the extension settings.",
  "notice.serverError": "Vault Autopilot: the local server on port {port} stopped. Toggle it off and on in settings to retry.",
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
  "gallery.title": "\u89C6\u9891\u5E93",
  "gallery.open": "\u6253\u5F00\u89C6\u9891\u5E93",
  "gallery.all": "\u5168\u90E8",
  "gallery.deep": "\u6DF1\u5EA6\u7814\u7A76",
  "gallery.empty": "\u8FD8\u6CA1\u6709\u89C6\u9891\u3002\u6253\u5F00\u4EFB\u610F\u89C6\u9891\u9875\uFF0C\u70B9\u6269\u5C55\u56FE\u6807\u5B58\u4E00\u4E2A\u5C01\u9762\uFF0C\u5B83\u5C31\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002",
  "settings.sopHeading": "\u5206\u6790 SOP",
  "settings.useBuiltinSops.name": "\u4F7F\u7528\u5185\u7F6E\u5206\u6790 SOP",
  "settings.useBuiltinSops.desc": "\u5F00\u7740\uFF1A\u4FDD\u5B58 clip \u65F6\u81EA\u52A8\u9644\u5E26\u5BF9\u5E94\u7684\u5185\u7F6E\u5206\u6790 SOP\uFF08\u5C01\u9762\u3001Hook\u3001\u5173\u952E\u5E27\uFF09\uFF0C\u63D2\u4EF6\u66F4\u65B0\u65F6 SOP \u81EA\u52A8\u66F4\u65B0\u3002\u5173\u6389\uFF1A\u53EA\u5B58\u7D20\u6750\uFF0C\u4E0D\u5E26\u5206\u6790\u63D0\u793A\u3002",
  "settings.sopRow.cover": "\u5C01\u9762 SOP",
  "settings.sopRow.screenshot": "\u7F51\u9875\u622A\u56FE SOP",
  "settings.sopRow.hook": "Hook SOP",
  "settings.sopRow.keyframe": "\u5173\u952E\u5E27 SOP",
  "settings.sopRow.desc": "\u7559\u7A7A = \u7528\u5185\u7F6E\u7684\u3002\u60F3\u5728\u5185\u7F6E\u57FA\u7840\u4E0A\u6539\uFF1F\u70B9\u300C\u81EA\u5B9A\u4E49\u300D\uFF0C\u526F\u672C\u548C\u8DEF\u5F84\u90FD\u4F1A\u5E2E\u4F60\u5F04\u597D\u3002",
  "settings.sopRow.descNoBuiltin": "\u622A\u56FE\u6A21\u5F0F\u6CA1\u6709\u5185\u7F6E SOP\u3002\u60F3\u7ED9\u622A\u56FE\u6302\u5206\u6790\u63D0\u793A\uFF0C\u586B\u4E00\u4E2A\u4F60\u81EA\u5DF1\u7684 SOP \u6587\u4EF6\u8DEF\u5F84\uFF08\u5E93\u5185\u8DEF\u5F84\u6216\u7EDD\u5BF9\u8DEF\u5F84\u90FD\u884C\uFF09\u3002",
  "settings.sopRow.placeholder": "\u7559\u7A7A\u5373\u7528\u5185\u7F6E",
  "settings.sopRow.placeholderNoBuiltin": "\u53EF\u9009\uFF1A\u4F60\u81EA\u5DF1\u7684 SOP \u8DEF\u5F84",
  "settings.sopState.builtin": "\u5F53\u524D\u751F\u6548\uFF1A\u5185\u7F6E SOP\uFF08\u8DDF\u968F\u63D2\u4EF6\u81EA\u52A8\u66F4\u65B0\uFF09",
  "settings.sopState.custom": "\u5F53\u524D\u751F\u6548\uFF1A\u4F60\u7684\u81EA\u5B9A\u4E49\u6587\u4EF6\uFF08\u6E05\u7A7A\u8DEF\u5F84\u53EF\u56DE\u5230\u5185\u7F6E\uFF09",
  "settings.sopState.off": "\u5F53\u524D\u751F\u6548\uFF1A\u4E0D\u5E26\u5206\u6790\uFF08\u603B\u5F00\u5173\u5DF2\u5173\uFF09",
  "settings.sopState.none": "\u5F53\u524D\u751F\u6548\uFF1A\u4E0D\u5E26\u5206\u6790\uFF08\u6B64\u6A21\u5F0F\u65E0\u5185\u7F6E SOP\uFF09",
  "settings.sopCustomize": "\u81EA\u5B9A\u4E49",
  "notice.sopExported": "\u5DF2\u5BFC\u51FA\u5230 {path}\uFF0C\u6253\u5F00\u7F16\u8F91\u5373\u53EF\uFF0C\u6539\u52A8\u4E0B\u6B21\u4FDD\u5B58\u65F6\u751F\u6548\u3002",
  "notice.sopExportExists": "{path} \u5DF2\u5B58\u5728\uFF0C\u8DEF\u5F84\u5DF2\u6307\u5411\u5B83\u3002",
  "notice.savedTo": "\u5DF2\u5B58\u5230 {folder}\n\u60F3\u6362\u4F4D\u7F6E\uFF1F\u8BBE\u7F6E \u2192 Vault Autopilot \u2192 \u5B58\u50A8\u4F4D\u7F6E",
  "notice.portInUse": "Vault Autopilot\uFF1A\u7AEF\u53E3 {port} \u88AB\u5360\u7528\u3002\u8BF7\u5173\u95ED\u5360\u7528\u5B83\u7684\u7A0B\u5E8F\uFF1B\u6216\u5728\u63D2\u4EF6\u8BBE\u7F6E\u548C\u6269\u5C55\u8BBE\u7F6E\u4E24\u5904\u6539\u6210\u540C\u4E00\u4E2A\u65B0\u7AEF\u53E3\u3002",
  "notice.serverError": "Vault Autopilot\uFF1A\u7AEF\u53E3 {port} \u4E0A\u7684\u672C\u5730\u670D\u52A1\u5DF2\u505C\u6B62\u3002\u8BF7\u5728\u8BBE\u7F6E\u91CC\u5173\u95ED\u518D\u6253\u5F00\u91CD\u8BD5\u3002",
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
var SOP_default = '# \u5C01\u9762 & \u6807\u9898\u5206\u6790 SOP\n\n_\u8BFB\u5B8C\u672C\u6587\u6863\u540E\uFF0C\u76F4\u63A5\u6309\u4E0B\u9762\u7684\u6846\u67B6\u8F93\u51FA\u5206\u6790\u3002_\n\n---\n\n## \u8F93\u51FA\u7ED3\u6784\n\n**\u7B2C\u4E00\u773C**\uFF08\u5FC5\u5199\uFF0C1\u20132 \u53E5\uFF09\n\u4F60\u6CA1\u6709\u773C\u775B\uFF0C\u522B\u5047\u88C5\u6709\u3002\u4ECE\u56FE\u7684\u5C5E\u6027\u63A8\uFF1A\u4EBA\u773C\u5148\u770B\u8138\uFF0C\u7136\u540E\u662F\u9971\u548C\u5EA6\u6700\u9AD8\u3001\n\u6700\u5927\u3001\u6700\u9760\u4E2D\u5FC3\u7684\u4E1C\u897F\u3002\u6309\u8FD9\u4E2A\u89C4\u5219\u8BF4\u51FA\u8C01\u8D62\u3001\u5269\u4E0B\u7684\u6309\u4EC0\u4E48\u987A\u5E8F\u770B\u3002\n\u8FD9\u662F\u63A8\u6D4B\uFF1B\u5982\u679C\u4EBA\u770B\u5B8C\u7684\u771F\u5B9E\u53CD\u5E94\u548C\u4F60\u4E0D\u4E00\u6837\uFF0C\u4EE5\u4EBA\u7684\u4E3A\u51C6\u3002\n\n**\u597D\u5728\u54EA**\uFF08\u6838\u5FC3\uFF0C2\u20134 \u6761\uFF09\n\u4E0D\u63CF\u8FF0\u753B\u9762\u2014\u2014\u56FE\u5C31\u5728\u5206\u6790\u4E0A\u65B9\uFF0C\u6C38\u8FDC\u4E0D\u8981\u590D\u8FF0\u56FE\u91CC\u6709\u4EC0\u4E48\u3002\n\u6BCF\u6761\u6307\u8BA4\u4E00\u4E2A\u80FD\u7528\u624B\u6307\u51FA\u6765\u7684\u5177\u4F53\u8BBE\u8BA1\u52A8\u4F5C\uFF08\u6784\u56FE\u3001\u989C\u8272\u3001\u8868\u60C5\u3001\u9053\u5177\u3001\n\u6587\u5B57\u600E\u4E48\u5904\u7406\u7684\uFF09\uFF0C\u4E00\u53E5\u8BDD\u8BF4\u6E05\u5B83\u4E3A\u4EC0\u4E48\u6293\u4EBA\uFF0C\u518D\u52A0\u4E00\u53E5\u600E\u4E48\u590D\u5236\u3002\n\n\u683C\u5F0F\uFF1A\n- **[\u52A8\u4F5C]** \u2014\u2014 \u4E3A\u4EC0\u4E48\u6293\u4EBA\uFF0C\u4E00\u53E5\u8BDD\u3002\u2192 \u60F3\u590D\u5236\uFF1A\u53EF\u64CD\u4F5C\u7684\u4E00\u53E5\u8BDD\u3002\n\n**\u6807\u9898\u94A9\u5B50**\uFF08\u6709\u6807\u9898\u624D\u5199\uFF0C2\u20133 \u53E5\uFF09\n\u6807\u9898\u9760\u4E09\u79CD\u60C5\u7EEA\u6293\u4EBA\uFF1A\u597D\u5947\uFF08\u60F3\u77E5\u9053\u7B54\u6848\uFF09\u3001\u6B32\u671B\uFF08\u60F3\u8981\u90A3\u4E2A\u7ED3\u679C\uFF09\u3001\n\u6050\u60E7\uFF08\u6015\u8E29\u5751\u6015\u635F\u5931\uFF09\uFF0C\u901A\u5E38\u4E00\u4E3B\u4E00\u8F85\u3002\u6307\u51FA\u8FD9\u4E2A\u6807\u9898\u62C9\u7684\u662F\u54EA\u79CD\u60C5\u7EEA\u3001\n\u5177\u4F53\u9760\u54EA\u4E2A\u8BCD\uFF0C\u4EE5\u53CA\u770B\u5B8C\u6807\u9898\u4F60\u81EA\u7136\u4F1A\u5192\u51FA\u7684\u90A3\u4E2A\u95EE\u9898\u3002\n\n**\u5C01\u9762\u6807\u9898\u914D\u5408**\uFF08\u6709\u6807\u9898\u624D\u5199\uFF0C1\u20132 \u53E5\uFF09\n\u597D\u7684\u642D\u914D\u662F\u4E24\u8005\u4E0D\u91CD\u590D\uFF1A\u5404\u8BB2\u4E00\u534A\uFF0C\u62FC\u8D77\u6765\u624D\u662F\u5B8C\u6574\u7684\u94A9\u5B50\u3002\n\u6307\u51FA\u5C01\u9762\u8D1F\u8D23\u4EC0\u4E48\u3001\u6807\u9898\u8D1F\u8D23\u4EC0\u4E48\uFF1B\u5982\u679C\u4E92\u76F8\u91CD\u590D\u4E86\uFF0C\u4E5F\u6307\u51FA\u6765\u3002\n\n---\n\n## \u786C\u6027\u89C4\u5219\n\n- \u6574\u7BC7\u5206\u6790\u4E0D\u8D85\u8FC7 12 \u884C\u3002\u5199\u957F\u4E86\u5C31\u662F\u5728\u63CF\u8FF0\uFF0C\u4E0D\u662F\u5728\u5206\u6790\u3002\n- \u901A\u7528\u6027\u68C0\u9A8C\uFF1A\u4E00\u6761\u5206\u6790\u5982\u679C\u539F\u5C01\u4E0D\u52A8\u642C\u5230\u522B\u7684\u5C01\u9762\u4E0B\u4E5F\u6210\u7ACB\n  \uFF08"\u89C6\u89C9\u5C42\u6B21\u5206\u660E""\u5F15\u53D1\u597D\u5947"\uFF09\uFF0C\u5C31\u662F\u7A7A\u8BDD\u2014\u2014\u5220\u6389\u6216\u5199\u5177\u4F53\u3002\n- \u6307\u7740\u4E1C\u897F\u8BF4\u8BDD\uFF1A\u6BCF\u53E5\u5206\u6790\u90FD\u8981\u80FD\u56DE\u7B54"\u4F60\u8BF4\u7684\u662F\u56FE\u91CC\u7684\u54EA\u4E2A\u4E1C\u897F\uFF1F"\n  \u6307\u4E0D\u51FA\u6765\u7684\u53E5\u5B50\uFF0C\u5220\u6389\uFF0C\u6216\u8005\u6539\u5230\u6307\u5F97\u51FA\u6765\u4E3A\u6B62\u3002\n- \u597D\u5C01\u9762\u901A\u5E38\u53EA\u9760 2\u20133 \u4E2A\u5143\u7D20\u6210\u7ACB\u3002\u627E\u51FA\u662F\u54EA\u51E0\u4E2A\uFF0C\u522B\u628A\u914D\u89D2\u4E5F\u5206\u6790\u4E00\u904D\u3002\n- \u8BF4\u4EBA\u8BDD\u6D4B\u8BD5\uFF1A\u6BCF\u53E5\u5199\u5B8C\u95EE\u81EA\u5DF1\u2014\u2014\u5F53\u9762\u8DDF\u670B\u53CB\u804A\u8FD9\u4E2A\u5C01\u9762\u7684\u65F6\u5019\uFF0C\n  \u6211\u4F1A\u8FD9\u4E48\u8BF4\u5417\uFF1F\u4E0D\u4F1A\u8BF4\u51FA\u53E3\u7684\u53E5\u5B50\uFF0C\u6539\u6210\u4F60\u4F1A\u8BF4\u51FA\u53E3\u7684\u6837\u5B50\u3002\n';

// src/sops/zh/视频Hook分析 SOP.md
var Hook_SOP_default = '# \u89C6\u9891 Hook \u5206\u6790 SOP\n\n_\u8BFB\u5B8C\u672C\u6587\u6863\u540E\uFF0C\u76F4\u63A5\u6309\u4E0B\u9762\u7684\u6846\u67B6\u8F93\u51FA\u5206\u6790\u3002_\n\n> Hook \u7684\u4EFB\u52A1\u662F\u8BA9\u70B9\u8FDB\u6765\u7684\u4EBA\u7559\u4E0B\uFF0C\u4E0D\u662F\u8BA9\u4EBA\u70B9\u8FDB\u6765\uFF08\u90A3\u662F\u5C01\u9762\u548C\u6807\u9898\u7684\u4E8B\uFF09\u3002\n> \u6574\u4E2A\u5206\u6790\u53EA\u56DE\u7B54\u4E00\u4EF6\u4E8B\uFF1A\u8FD9\u4E2A\u5F00\u5934\u9760\u4EC0\u4E48\u8BA9\u4EBA\u4E0D\u5212\u8D70\u3002\n\n---\n\n## \u8F93\u5165\n\n- \u89C6\u9891\u5F00\u5934\u90E8\u5206\u7684\u8FDE\u7EED\u622A\u56FE\uFF08\u6309\u65F6\u95F4\u987A\u5E8F\uFF0C\u65F6\u957F\u4E0D\u5B9A\uFF09\n- \u5B57\u5E55\u6587\u672C\uFF08\u6709\u5C31\u7528\uFF1B\u6CA1\u6709\u5C31\u53EA\u5206\u6790\u753B\u9762\uFF0C\u5E76\u6CE8\u660E\u6CA1\u6709\u5B57\u5E55\uFF09\n\n---\n\n## \u8F93\u51FA\u7ED3\u6784\n\n**Hook \u7C7B\u578B**\uFF081 \u53E5\uFF09\n\u60AC\u5FF5 / \u51B2\u7A81 / \u4EF7\u503C\u627F\u8BFA / \u8EAB\u4EFD\u4EE3\u5165 / \u89C6\u89C9\u51B2\u51FB / \u53CD\u76F4\u89C9 / \u6545\u4E8B\u5F00\u573A\uFF0C\n\u9009\u4E00\u5230\u4E24\u4E2A\uFF0C\u4E00\u53E5\u8BDD\u8BF4\u4E3A\u4EC0\u4E48\u3002\n\n**\u8BF4\u4E86\u4EC0\u4E48**\uFF082\u20133 \u53E5\uFF09\n\u5F15\u7528\u5F00\u5934\u7684\u539F\u8BDD\uFF0C\u6307\u7740\u5177\u4F53\u7684\u8BCD\u8BF4\uFF1A\u4EC0\u4E48\u627F\u8BFA\u3001\u4EC0\u4E48\u6570\u5B57\u3001\u4EC0\u4E48\u53CD\u5DEE\uFF0C\n\u4EE5\u53CA\u542C\u5B8C\u4F60\u5FC3\u91CC\u5192\u51FA\u7684\u95EE\u9898\u3002\n\n**\u753B\u9762\u505A\u4E86\u4EC0\u4E48**\uFF082\u20134 \u53E5\uFF09\n\u622A\u56FE\u662F\u540C\u4E00\u6BB5\u753B\u9762\u7684\u5148\u540E\u51E0\u4E2A\u77AC\u95F4\u3002\u5148\u641E\u6E05\u695A\u4ECE\u7B2C\u4E00\u5F20\u5230\u6700\u540E\u4E00\u5F20\uFF0C\n\u4EC0\u4E48\u4E1C\u897F\u53D8\u4E86\uFF1A\u51FA\u73B0\u4E86\u4EC0\u4E48\u3001\u85CF\u4F4F\u4E86\u4EC0\u4E48\u3001\u9732\u51FA\u4E86\u4EC0\u4E48\u3002\u53D8\u5316\u672C\u8EAB\u5C31\u662F\n\u52A8\u753B\u3002\u7136\u540E\u8BF4\u8FD9\u4E2A\u53D8\u5316\u4E3A\u4EC0\u4E48\u8BA9\u4EBA\u7559\u4E0B\u3002\n\n**\u600E\u4E48\u590D\u73B0**\uFF08\u7ED9\u526A\u8F91\u5E08\u7684\u6E05\u5355\uFF09\n\u5199\u6210"\u5634\u4E0A\u8BF4\u4EC0\u4E48 + \u5C4F\u5E55\u540C\u65F6\u653E\u4EC0\u4E48"\u7684\u5BF9\u7167\u6B65\u9AA4\uFF0C\u5177\u4F53\u5230\u53E5\u5F0F\u548C\u753B\u9762\n\u52A8\u4F5C\u3002\u5408\u683C\u6807\u51C6\uFF1A\u4E00\u4E2A\u6CA1\u770B\u8FC7\u539F\u89C6\u9891\u7684\u526A\u8F91\u5E08\uFF0C\u7167\u7740\u6E05\u5355\u80FD\u505A\u51FA\u5DEE\u4E0D\u591A\n\u7684\u4E1C\u897F\u3002\u505A\u4E0D\u51FA\u6765\u5C31\u662F\u5199\u5F97\u4E0D\u591F\u5177\u4F53\u3002\n\n**\u6211\u7684\u60F3\u6CD5**\n\uFF08\u7559\u7A7A\uFF0C\u4EBA\u6765\u586B\uFF09\n\n---\n\n## \u786C\u6027\u89C4\u5219\n\n- \u522B\u731C\u753B\u9762\uFF1A\u622A\u56FE\u91CC\u6CA1\u6709\u7684\u4E1C\u897F\u4E00\u4E2A\u5B57\u90FD\u4E0D\u8BB8\u5199\uFF1B\u54EA\u5F20\u56FE\u6CA1\u770B\u61C2\u5C31\u5199\n  "\u6CA1\u770B\u61C2"\uFF0C\u7F16\u51FA\u6765\u7684\u5206\u6790\u6574\u6761\u4F5C\u5E9F\u3002\n- \u6307\u7740\u4E1C\u897F\u8BF4\u8BDD\uFF1A\u6BCF\u53E5\u90FD\u80FD\u56DE\u7B54"\u4F60\u8BF4\u7684\u662F\u54EA\u5F20\u56FE\u3001\u54EA\u53E5\u8BDD\u91CC\u7684\u54EA\u4E2A\u4E1C\u897F"\u3002\n- \u901A\u7528\u6027\u68C0\u9A8C\uFF1A\u8FD9\u53E5\u8BDD\u653E\u5230\u522B\u7684\u89C6\u9891\u5F00\u5934\u4E5F\u6210\u7ACB\uFF0C\u5C31\u662F\u7A7A\u8BDD\uFF0C\u5220\u6389\u6216\u5199\u5177\u4F53\u3002\n- \u8BF4\u4EBA\u8BDD\u6D4B\u8BD5\uFF1A\u5F53\u9762\u8DDF\u670B\u53CB\u8BB2\u8FD9\u4E2A\u5F00\u5934\u65F6\u4F1A\u8FD9\u4E48\u8BF4\u5417\uFF1F\u4E0D\u4F1A\u8BF4\u51FA\u53E3\u7684\u91CD\u5199\u3002\n  \u77ED\u53E5\u76F4\u8BF4\uFF0C\u4E0D\u7528\u7834\u6298\u53F7\u4E32\u53E5\u5B50\uFF0C\u4E0D\u7528 fancy \u8BCD\u3002\n';

// src/sops/zh/视频关键帧分析 SOP.md
var SOP_default2 = "# \u89C6\u9891\u5173\u952E\u5E27\uFF08\u52A8\u6548\uFF09\u5206\u6790 SOP\n\n_\u8BFB\u5B8C\u672C\u6587\u6863\u540E\uFF0C\u76F4\u63A5\u6309\u4E0B\u9762\u7684\u6846\u67B6\u8F93\u51FA\u5206\u6790\u3002_\n\n> \u8F93\u5165\uFF1A\u4E00\u7EC4\u6309\u65F6\u95F4\u987A\u5E8F\u7684\u5173\u952E\u5E27\u622A\u56FE\u3002\u56FE\u5C31\u8D34\u5728\u5206\u6790\u4E0A\u9762\u3002\n> \u5355\u5F20\u56FE\u4EC0\u4E48\u6837\uFF0C\u4EBA\u81EA\u5DF1\u4F1A\u770B\u3002\u5206\u6790\u53EA\u5199\u8FDE\u8D77\u6765\u624D\u80FD\u770B\u89C1\u7684\u4E1C\u897F\uFF1A\n> \u8FD9\u6BB5\u4ECE\u5934\u5230\u5C3E\u600E\u4E48\u63A8\u8FDB\uFF0C\u63A8\u8FDB\u5F97\u597D\u5728\u54EA\u3002\n\n---\n\n## \u8F93\u51FA\u7ED3\u6784\n\n**\u597D\u5728\u54EA**\uFF082\u20134 \u6761\uFF09\n\u6BCF\u6761\u6307\u8BA4\u4E00\u4E2A\u8DE8\u753B\u9762\u7684\u8BBE\u8BA1\u52A8\u4F5C\u3002\u53EA\u5199\u5355\u5F20\u56FE\u770B\u4E0D\u51FA\u6765\u7684\uFF1A\n\u987A\u5E8F\u3001\u8282\u594F\u3001\u505C\u987F\u3001\u85CF\u548C\u9732\u3001\u4EAE\u548C\u6697\u3001\u955C\u5934\u600E\u4E48\u79FB\u3002\n\u683C\u5F0F\uFF1A\n- **[\u52A8\u4F5C]** \u2014\u2014 \u4E3A\u4EC0\u4E48\u597D\uFF0C\u4E00\u53E5\u8BDD\u3002\u2192 \u60F3\u590D\u5236\uFF1A\u53EF\u64CD\u4F5C\u7684\u4E00\u53E5\u8BDD\u3002\n\n**\u6211\u7684\u60F3\u6CD5**\n\uFF08\u7559\u7A7A\uFF0C\u4EBA\u6765\u586B\uFF09\n\n---\n\n## \u786C\u6027\u89C4\u5219\n\n- \u4E0D\u63CF\u8FF0\u4EFB\u4F55\u4E00\u5E55\u3002\u56FE\u91CC\u80FD\u76F4\u63A5\u770B\u89C1\u7684\u4E0D\u5199\uFF0C\u53EA\u5199\u8FDE\u8D77\u6765\u624D\u80FD\u770B\u89C1\u7684\u3002\n- \u522B\u731C\u3002\u6CA1\u6709\u5B57\u5E55\u5C31\u4E0D\u7F16\u4ED6\u5728\u8BF4\u4EC0\u4E48\uFF1B\u5B57\u5E55\u70E7\u5728\u753B\u9762\u91CC\u7684\u53EF\u4EE5\u76F4\u63A5\u5F15\u7528\uFF0C\n  \u90A3\u7B97\u6307\u7740\u4E1C\u897F\u8BF4\u8BDD\u3002\n- \u6307\u7740\u4E1C\u897F\u8BF4\u8BDD\u3002\u6BCF\u6761\u90FD\u80FD\u6307\u51FA\uFF1A\u662F\u54EA\u51E0\u5F20\u56FE\u4E4B\u95F4\u7684\u4E8B\u3002\n- \u901A\u7528\u6027\u68C0\u9A8C\u3002\u8FD9\u6761\u642C\u5230\u522B\u7684\u52A8\u6548\u4E0B\u4E5F\u6210\u7ACB\uFF0C\u5C31\u662F\u7A7A\u8BDD\u3002\n- \u8BF4\u4EBA\u8BDD\u3002\u77ED\u53E5\uFF0C\u4E00\u53E5\u8BDD\u53EA\u8BF4\u4E00\u4EF6\u4E8B\u3002\u5F53\u9762\u4E0D\u4F1A\u8FD9\u4E48\u8BF4\u7684\uFF0C\u91CD\u5199\u3002\n";

// src/sops/en/Cover Analysis SOP.md
var Cover_Analysis_SOP_default = `# Cover & Title Analysis SOP

_After reading this document, output your analysis directly in the framework below._

---

## Output Structure

**First Glance** (required, 1-2 sentences)
You are not a pair of eyes, so do not pretend to be one. Work it out
from the image: the eye goes to faces first, then to whatever is most
saturated, biggest, or closest to center. Name the element that wins by
those rules, and the order the rest follows. This is a prediction; when
the human's real reaction differs, theirs wins.

**Why It Works** (the core, 2-4 bullets)
Never describe the image. It sits right above the analysis, so never
restate what is in it. Each bullet points at one concrete design move
(composition, color, facial expression, props, how the text is treated),
says in one sentence why it grabs, then adds one sentence on how to copy it.

Format:
- **[The move]**: why it grabs, one sentence. To copy: one actionable sentence.

**Title Hook** (only when there is a title, 2-3 sentences)
Titles pull three emotions: curiosity (want the answer), desire (want
that outcome), fear (afraid of losses or mistakes). Usually one leads
and one assists. Name which emotion this title pulls, the exact word
doing the pulling, and the question that pops into your head after
reading it.

**Cover + Title Together** (only when there is a title, 1-2 sentences)
A good pair never repeats itself: each carries half the story, and only
together do they form the full hook. Say what the cover handles, what
the title handles, and call it out if they overlap.

---

## Hard Rules

- The whole analysis fits in 12 lines. Longer means you are describing,
  not analyzing.
- The generic test: if a line still holds when pasted under a different
  cover ("clear visual hierarchy", "sparks curiosity"), it is empty talk.
  Cut it or make it specific.
- Point at things: every line must answer "which thing in the image are
  you talking about?" If you cannot point at it, cut the line or rewrite
  it until you can.
- A good cover usually stands on 2 or 3 elements. Find out which ones,
  and skip the supporting cast.
- The say-it-out-loud test: after each line, ask yourself whether you
  would say it to a friend while pointing at the screen. If not, rewrite
  it the way you would actually say it.
`;

// src/sops/en/Video Hook Analysis SOP.md
var Video_Hook_Analysis_SOP_default = `# Video Hook Analysis SOP

_After reading this document, output your analysis directly in the framework below._

> A hook's job is to make people stay, not to make them click (that is
> the cover and title's job). The whole analysis answers one question:
> what does this opening do that stops people from swiping away?

---

## Input

- Sequential screenshots of the video's opening (in time order; length varies)
- Subtitle text (use it if available; otherwise analyze the visuals only
  and say there is no subtitle)

---

## Output Structure

**Hook Type** (1 sentence)
Suspense / Conflict / Value Promise / Identity / Visual Impact /
Counterintuitive / Story Opening. Pick one or two and say why in one
sentence.

**What Was Said** (2-3 sentences)
Quote the actual opening lines and point at the exact words: what
promise, what number, what contradiction, and the question that pops
into your head after hearing it.

**What the Visuals Do** (2-4 sentences)
The screenshots are moments of one animation in time order. First work
out what changes from the first shot to the last: what appears, what is
hidden, what gets revealed. The change is the animation. Then say why
that change makes people stay.

**How to Replicate** (a checklist for an editor)
Write it as "what the mouth says + what the screen shows at the same
time", down to the sentence pattern and the on-screen action. Pass bar:
an editor who never watched the original could build something close
from your checklist. If they could not, it is not specific enough.

**My Thoughts**
(leave blank, the human fills this in)

---

## Hard Rules

- Do not guess the visuals: write nothing that is not in the
  screenshots; if you cannot read a shot, write "cannot read this",
  because an invented line kills the whole analysis.
- Point at things: every line must answer "which shot, which word are
  you talking about?"
- The generic test: if a line still holds under a different video's
  opening, it is empty talk. Cut it or make it specific.
- The say-it-out-loud test: would you say this line to a friend about
  this opening? If not, rewrite it. Short direct sentences, no dashes
  chaining clauses, no fancy words.
`;

// src/sops/en/Video Keyframe Analysis SOP.md
var Video_Keyframe_Analysis_SOP_default = "# Video Keyframe (Motion) Analysis SOP\n\n_After reading this document, output your analysis directly in the framework below._\n\n> Input: a set of keyframe screenshots in time order. The images sit\n> right above the analysis. What a single frame looks like, people can\n> see for themselves. The analysis only covers what you can see across\n> frames: how the segment moves from start to end, and what makes that\n> flow good.\n\n---\n\n## Output Structure\n\n**Why It Works** (2-4 bullets)\nEach bullet points at one design move that spans frames. Only write\nwhat a single frame cannot show: order, rhythm, pauses, hiding and\nrevealing, dimming and highlighting, how the camera moves.\nFormat:\n- **[The move]**: why it works, one sentence. To copy: one actionable sentence.\n\n**My Thoughts**\n(leave blank, the human fills this in)\n\n---\n\n## Hard Rules\n\n- Describe no single frame. What is visible in one image, skip; write\n  only what appears across images.\n- Do not guess. No subtitles means do not invent what is being said;\n  subtitles burned into the frame are fine to quote, that counts as\n  pointing at things.\n- Point at things. Every bullet must say which frames it happens\n  between.\n- The generic test: if a bullet still holds under a different motion\n  sequence, it is empty talk.\n- Plain speech. Short sentences, one idea per sentence. If you would\n  not say it out loud, rewrite it.\n";

// src/bundled-sops.ts
var BUILTIN = {
  thumbnail: {
    zh: { filename: "\u5C01\u9762\u62C6\u89E3\u5B66\u4E60 SOP.md", content: SOP_default },
    en: { filename: "Cover Analysis SOP.md", content: Cover_Analysis_SOP_default }
  },
  hook: {
    zh: { filename: "\u89C6\u9891Hook\u5206\u6790 SOP.md", content: Hook_SOP_default },
    en: { filename: "Video Hook Analysis SOP.md", content: Video_Hook_Analysis_SOP_default }
  },
  keyframe: {
    zh: { filename: "\u89C6\u9891\u5173\u952E\u5E27\u5206\u6790 SOP.md", content: SOP_default2 },
    en: { filename: "Video Keyframe Analysis SOP.md", content: Video_Keyframe_Analysis_SOP_default }
  }
};
function builtinSopFor(mode, language) {
  var _a, _b;
  return (_b = (_a = BUILTIN[mode]) == null ? void 0 : _a[language]) == null ? void 0 : _b.content;
}
async function exportBuiltinSop(ops, baseFolder, mode, language) {
  var _a;
  const sop = (_a = BUILTIN[mode]) == null ? void 0 : _a[language];
  if (!sop) return void 0;
  const folder = `${(baseFolder || "Clips").trim().replace(/\/+$/, "") || "Clips"}/SOPs`;
  const path = `${folder}/${sop.filename}`;
  if (ops.fileExists(path)) return { path, existed: true };
  await ops.ensureFolder(folder);
  await ops.create(path, sop.content);
  return { path, existed: false };
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  language: "en",
  baseFolder: "Clips",
  useBuiltinSops: true,
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
  if (!Number.isInteger(loaded) || loaded <= 1024 || loaded >= 65536) return DEFAULT_SETTINGS.httpServer.port;
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
        this.plugin.restartServer();
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
    new import_obsidian.Setting(containerEl).setName(t("settings.sopHeading")).setHeading();
    const sopRows = [
      { mode: "thumbnail", name: t("settings.sopRow.cover"), hasBuiltin: true },
      { mode: "screenshot", name: t("settings.sopRow.screenshot"), hasBuiltin: false },
      { mode: "hook", name: t("settings.sopRow.hook"), hasBuiltin: true },
      { mode: "keyframe", name: t("settings.sopRow.keyframe"), hasBuiltin: true }
    ];
    const sopStateEls = {};
    const refreshSopStates = () => {
      for (const row of sopRows) {
        const el = sopStateEls[row.mode];
        if (!el) continue;
        const custom = this.plugin.settings.clipRules[row.mode].sopPath.trim().length > 0;
        let key;
        let color;
        if (custom) {
          key = "settings.sopState.custom";
          color = "#b08c2e";
        } else if (!row.hasBuiltin) {
          key = "settings.sopState.none";
          color = "var(--text-muted)";
        } else if (this.plugin.settings.useBuiltinSops) {
          key = "settings.sopState.builtin";
          color = "var(--color-green, #3d8a5f)";
        } else {
          key = "settings.sopState.off";
          color = "var(--text-muted)";
        }
        el.textContent = t(key);
        el.style.color = color;
      }
    };
    new import_obsidian.Setting(containerEl).setName(t("settings.useBuiltinSops.name")).setDesc(t("settings.useBuiltinSops.desc")).addToggle((tg) => tg.setValue(this.plugin.settings.useBuiltinSops).onChange(async (v) => {
      this.plugin.settings.useBuiltinSops = v;
      await this.plugin.saveSettings();
      refreshSopStates();
    }));
    for (const row of sopRows) {
      const setting = new import_obsidian.Setting(containerEl).setName(row.name).setDesc(t(row.hasBuiltin ? "settings.sopRow.desc" : "settings.sopRow.descNoBuiltin")).addText((txt) => txt.setPlaceholder(t(row.hasBuiltin ? "settings.sopRow.placeholder" : "settings.sopRow.placeholderNoBuiltin")).setValue(this.plugin.settings.clipRules[row.mode].sopPath).onChange(async (v) => {
        this.plugin.settings.clipRules[row.mode].sopPath = v.trim();
        await this.plugin.saveSettings();
        refreshSopStates();
      }));
      if (row.hasBuiltin) {
        setting.addButton((b) => b.setButtonText(t("settings.sopCustomize")).onClick(async () => {
          const r = await exportBuiltinSop(
            this.plugin.sopInstallOps(),
            this.plugin.settings.baseFolder,
            row.mode,
            this.plugin.settings.language
          );
          if (!r) return;
          this.plugin.settings.clipRules[row.mode].sopPath = r.path;
          await this.plugin.saveSettings();
          new import_obsidian.Notice(t(r.existed ? "notice.sopExportExists" : "notice.sopExported", { path: r.path }), 8e3);
          this.display();
        }));
      }
      const stateEl = setting.infoEl.createDiv();
      stateEl.style.fontSize = "12px";
      stateEl.style.marginTop = "4px";
      sopStateEls[row.mode] = stateEl;
    }
    refreshSopStates();
  }
};

// src/server.ts
var http = __toESM(require("http"));

// src/clip-validate.ts
var ClipValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ClipValidationError";
  }
};
var MODES = ["thumbnail", "screenshot", "hook", "keyframe"];
function isStringArray(v) {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}
function assertOptionalStrings(p, keys) {
  for (const key of keys) {
    const v = p[key];
    if (v !== void 0 && v !== null && typeof v !== "string") {
      throw new ClipValidationError(`${key} must be a string`);
    }
  }
}
function validateClipPayload(raw) {
  if (typeof raw !== "object" || raw === null) {
    throw new ClipValidationError("Body must be a JSON object");
  }
  const p = raw;
  if (typeof p.mode !== "string" || !MODES.includes(p.mode)) {
    throw new ClipValidationError("Unknown or missing clip mode");
  }
  if (p.mode === "screenshot") {
    if (!isStringArray(p.images)) {
      if (typeof p.image === "string") {
        p.images = [p.image];
        delete p.image;
      } else throw new ClipValidationError("screenshot requires images[]");
    }
    if (typeof p.url !== "string" || typeof p.title !== "string") {
      throw new ClipValidationError("screenshot requires url and title");
    }
    return p;
  }
  if (p.mode === "thumbnail") {
    if (typeof p.video_id !== "string" || typeof p.thumbnail_url !== "string" || typeof p.video_url !== "string") {
      throw new ClipValidationError("thumbnail requires video_id, thumbnail_url, video_url");
    }
    assertOptionalStrings(p, ["title", "platform", "published_at", "channel"]);
    return p;
  }
  if (!isStringArray(p.frames)) throw new ClipValidationError(`${p.mode} requires frames[]`);
  if (typeof p.url !== "string") throw new ClipValidationError(`${p.mode} requires url`);
  assertOptionalStrings(p, ["video_title", "transcript", "channel"]);
  return p;
}

// src/server.ts
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
    req.on("error", () => {
    });
    req.on("end", async () => {
      let payload;
      try {
        payload = validateClipPayload(JSON.parse(body));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err instanceof ClipValidationError ? err.message : "Invalid request body" }));
        return;
      }
      try {
        const { obsidianUrl, notice } = await onClip(payload);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ...obsidianUrl ? { obsidianUrl } : {}, ...notice ? { notice } : {} }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Save failed" }));
      }
    });
  });
  server.listen(port, "127.0.0.1");
  return server;
}

// src/util.ts
function makeSerialQueue() {
  let tail = Promise.resolve();
  return (task) => {
    const result = tail.then(task, task);
    tail = result.catch(() => void 0);
    return result;
  };
}
function sanitize(str) {
  return (str || "").replace(/[/\\:*?"<>|#^\[\]`]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
function isPrivateHost(hostname) {
  let h = hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (h.startsWith("::ffff:")) {
    const rest = h.slice(7);
    const hex = rest.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      h = `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
    } else {
      h = rest;
    }
  }
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    return a === 0 || a === 10 || a === 127 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 169 && b === 254;
  }
  if (h.includes(":")) {
    return h === "::1" || h === "::" || /^f[cd]/.test(h) || /^fe[89ab]/.test(h);
  }
  return false;
}
function assertDownloadable(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Unsupported URL scheme");
  if (isPrivateHost(parsed.hostname)) throw new Error("Blocked host");
}
function inlineText(v) {
  return String(v != null ? v : "").replace(/`/g, "").replace(/[\r\n]+/g, " ").trim();
}
function yamlString(v) {
  const s = String(v != null ? v : "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");
  return `"${s}"`;
}
function safeFileId(id) {
  const cleaned = (id || "").replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return cleaned || "cover";
}
function extractVideoId(url, platform) {
  const p = (platform != null ? platform : "").toLowerCase();
  if (p === "youtube" || url.includes("youtube.com") || url.includes("youtu.be")) {
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (short) return short[1];
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watch) return watch[1];
    const embed = url.match(/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/);
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
    if (p.transcript) parts.push(`### ${t("note.transcript")}`, ``, p.transcript.replace(/`/g, ""), ``);
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
    `platform: ${yamlString(meta.platform)}`,
    `video_id: ${yamlString(meta.videoId)}`,
    `video_url: ${yamlString(meta.videoUrl)}`,
    `title: ${yamlString(meta.title)}`,
    ...meta.channel ? [`channel: ${yamlString(meta.channel)}`] : [],
    ...meta.published ? [`published: ${yamlString(meta.published)}`] : [],
    `dimensions: []`,
    `analyzed_at: ${today}`,
    `tags: []`,
    `depth: normal`,
    `---`
  ].join("\n");
  return `${fm}

# ${inlineText(meta.title)}
`;
}
function ensurePublished(content, published) {
  if (!published || !content.startsWith("---\n")) return content;
  const end = content.indexOf("\n---", 4);
  if (end === -1) return content;
  const fm = content.slice(0, end);
  if (/^published:/m.test(fm)) return content;
  return `${fm}
published: ${yamlString(published)}${content.slice(end)}`;
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
  const platform = (_b = frontmatter.match(/^platform:\s*"?(.*?)"?\s*$/m)) == null ? void 0 : _b[1];
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
    if (cur) {
      const kind = kindOf(curHeading);
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
  const unquote = (d) => d.replace(/^"(.*)"$/, "$1");
  const merged = (dims) => {
    if (!dims.some((d) => labelToKind(d) === kind)) dims.push(headingLabel(kind));
    const rank = (d) => {
      const k = labelToKind(d);
      return k ? KINDS.indexOf(k) : -1;
    };
    return dims.sort((a, b) => rank(a) - rank(b));
  };
  const inline = /^(dimensions:\s*\[)([^\]]*)(\])/m;
  if (inline.test(frontmatter)) {
    return frontmatter.replace(inline, (_, open, inner, close) => {
      const dims = merged(inner.split(",").map((d) => unquote(d.trim())).filter(Boolean));
      return `${open}${dims.join(", ")}${close}`;
    });
  }
  return frontmatter.replace(/^dimensions:\n((?:[ \t]+- [^\n]*(?:\n|$))*)/m, (_, items) => {
    const dims = merged(
      items.split("\n").map((l) => unquote(l.replace(/^[ \t]+- /, "").trim())).filter(Boolean)
    );
    return `dimensions:
${dims.map((d) => `  - ${d}`).join("\n")}
`;
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
  const rank = (k) => k === null ? KINDS.length : KINDS.indexOf(k);
  const all = [...sections, incoming].sort(
    (a, b) => rank(a.kind) - rank(b.kind) || (a.kind === null || b.kind === null ? 0 : a.startSeconds - b.startSeconds)
  );
  const ordered = renumber(all);
  const newFrontmatter = addDimension(frontmatter, section.kind);
  const dims = KINDS.filter((k) => ordered.some((s) => s.kind === k));
  const newHead = syncOverview(head, newFrontmatter, dims).replace(/\s+$/, "");
  const renderedSections = ordered.map((s) => stripTrailingRule(s.kind === null ? s.text : emojiHeading(s.text, s.kind))).join("\n\n---\n\n");
  const newBody = [newHead, "", renderedSections, ""].join("\n");
  return { content: `${newFrontmatter}${newBody}`, skipped: false };
}

// src/clip-router.ts
async function routeClip(payload, clipRules, vaultOps, builtinSops = {}) {
  if (payload.mode === "thumbnail") return handleThumbnail(payload, clipRules.thumbnail, vaultOps, builtinSops.thumbnail);
  if (payload.mode === "screenshot") {
    const normalized = normalizeScreenshot(payload);
    return handleScreenshot(normalized, clipRules.screenshot, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.screenshot);
  }
  if (payload.mode === "hook") return handleMultiFrame(payload, clipRules.hook, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.hook);
  if (payload.mode === "keyframe") return handleMultiFrame(payload, clipRules.keyframe, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.keyframe);
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
    if (skipped) {
      const patched = ensurePublished(existing.content, meta.published);
      if (patched !== existing.content) await vaultOps.modify(existing.path, patched);
      return { notePath: existing.path, notice: t("notice.sectionExists", { section: headingLabel(section.kind) }) };
    }
    await vaultOps.modify(existing.path, ensurePublished(content2, meta.published));
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
    `# Screenshot \u2014 ${inlineText(payload.title)}`,
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
async function handleScreenshot(payload, rule, vaultOps, searchFolder, assetFolder, builtinSop) {
  var _a;
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
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    imageNames.push(name);
  }
  const key = videoKey(payload.url);
  const existing = await findNoteByVideoId(key, searchFolder, vaultOps);
  const intoVideoNote = !!existing || extractVideoId(payload.url, void 0) != null;
  const meta = { platform: detectPlatform(payload.url), videoId: key, videoUrl: payload.url, title: payload.title };
  const sopContent = (_a = readSopSafely(rule.sopPath, vaultOps)) != null ? _a : builtinSop;
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
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function findNoteByVideoId(videoId, folder, vaultOps) {
  var _a;
  const files = vaultOps.listMarkdownFiles(folder);
  const pattern = new RegExp(`^video_id:\\s*"?${escapeRegExp(videoId)}"?\\s*$`, "m");
  for (const filePath of files) {
    const fm = vaultOps.getFrontmatter(filePath);
    if (fm) {
      if (String((_a = fm.video_id) != null ? _a : "") === videoId) return { path: filePath, content: await vaultOps.read(filePath) };
      continue;
    }
    const content = await vaultOps.read(filePath);
    if (pattern.test(content)) return { path: filePath, content };
  }
  return null;
}
async function handleThumbnail(payload, rule, vaultOps, builtinSop) {
  var _a;
  if (!rule.outputFolder || !rule.thumbnailFolder) {
    throw new Error(t("error.videoFolderNotConfigured"));
  }
  await vaultOps.ensureFolder(rule.thumbnailFolder);
  const thumbnailFile = `${safeFileId(payload.video_id)}.webp`;
  const thumbnailPath = `${rule.thumbnailFolder}/${thumbnailFile}`;
  const imgData = await vaultOps.downloadUrl(payload.thumbnail_url);
  await vaultOps.createBinary(thumbnailPath, imgData);
  const sopContent = (_a = readSopSafely(rule.sopPath, vaultOps)) != null ? _a : builtinSop;
  const section = coverSection(thumbnailFile, sopContent);
  const meta = {
    platform: payload.platform,
    videoId: videoKey(payload.video_url, payload.platform),
    videoUrl: payload.video_url,
    title: payload.title,
    channel: payload.channel,
    published: payload.published_at
  };
  return upsertVideoNote(meta, section, vaultOps, rule.outputFolder);
}
async function handleMultiFrame(payload, rule, vaultOps, searchFolder, assetFolder, builtinSop) {
  var _a, _b, _c, _d;
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
    const name = `${stem}-f${String(i + 1).padStart(2, "0")}.jpg`;
    const bytes = Buffer.from(sampled[i], "base64");
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    frameNames.push(name);
  }
  const sopContent = (_b = readSopSafely(rule.sopPath, vaultOps)) != null ? _b : builtinSop;
  let section;
  if (payload.mode === "hook") {
    section = hookSection(
      { url: payload.url, platform, endSeconds: (_d = (_c = payload.time_range) == null ? void 0 : _c.end) != null ? _d : 15, frameNames, transcript: payload.transcript, aiResult: void 0 },
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

// src/gallery-view.ts
var import_obsidian2 = require("obsidian");

// src/gallery-model.ts
function displayDate(card) {
  var _a, _b;
  return (_b = (_a = card.published) != null ? _a : card.date) != null ? _b : "";
}
var EMPTY_FILTER = { dims: [], platform: null, source: null };
var DEEP_SOURCE = "__deep__";
var CHANNEL_CHIP_MIN = 6;
function dimensionChips(cards) {
  const seen = [];
  for (const c of cards)
    for (const d of c.dimensions)
      if (!seen.includes(d)) seen.push(d);
  return seen;
}
function platformChips(cards) {
  const seen = [];
  for (const c of cards)
    if (c.platform && !seen.includes(c.platform)) seen.push(c.platform);
  return seen.length > 1 ? seen : [];
}
function channelChips(cards, min = CHANNEL_CHIP_MIN) {
  var _a;
  const counts = /* @__PURE__ */ new Map();
  for (const c of cards)
    if (c.channel) counts.set(c.channel, ((_a = counts.get(c.channel)) != null ? _a : 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]).map(([ch]) => ch);
}
function hasDeep(cards) {
  return cards.some((c) => c.depth === "deep");
}
function filterCards(cards, filter) {
  return cards.filter((c) => {
    if (filter.platform && c.platform !== filter.platform) return false;
    if (filter.source === DEEP_SOURCE && c.depth !== "deep") return false;
    if (filter.source && filter.source !== DEEP_SOURCE && c.channel !== filter.source) return false;
    if (filter.dims.length > 0 && !filter.dims.some((d) => c.dimensions.includes(d))) return false;
    return true;
  }).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

// src/gallery-view.ts
var GALLERY_VIEW_TYPE = "vault-autopilot-gallery";
var PLATFORM_LABELS = { youtube: "YouTube", bilibili: "Bilibili" };
var GalleryView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.filter = { ...EMPTY_FILTER, dims: [] };
  }
  getViewType() {
    return GALLERY_VIEW_TYPE;
  }
  getDisplayText() {
    return t("gallery.title");
  }
  getIcon() {
    return "layout-grid";
  }
  async onOpen() {
    this.registerEvent(this.app.metadataCache.on("resolved", () => this.render()));
    this.render();
  }
  collectCards() {
    var _a;
    const folder = this.plugin.settings.clipRules.thumbnail.outputFolder;
    const cards = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!file.path.startsWith(`${folder}/`)) continue;
      const fm = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
      if (!fm || fm.type !== "video") continue;
      const rawDims = fm.dimensions;
      const dims = (Array.isArray(rawDims) ? rawDims : rawDims ? [rawDims] : []).map(String).map((label) => {
        var _a2;
        return (_a2 = labelToKind(label)) != null ? _a2 : label;
      });
      cards.push({
        path: file.path,
        title: fm.title ? String(fm.title) : file.basename,
        videoId: fm.video_id ? String(fm.video_id) : "",
        platform: fm.platform ? String(fm.platform) : void 0,
        channel: fm.channel ? String(fm.channel) : void 0,
        dimensions: [...new Set(dims)],
        depth: fm.depth ? String(fm.depth) : void 0,
        views: fm.views ? String(fm.views) : void 0,
        note: fm.note ? String(fm.note) : void 0,
        date: fm.analyzed_at ? String(fm.analyzed_at).slice(0, 10) : new Date(file.stat.ctime).toISOString().slice(0, 10),
        published: fm.published ? String(fm.published).slice(0, 10) : void 0
      });
    }
    return cards;
  }
  dimLabel(dim) {
    const kinds = ["cover", "content", "motion", "screenshot"];
    return kinds.includes(dim) ? headingLabel(dim) : dim;
  }
  render() {
    var _a;
    const root = this.contentEl;
    root.empty();
    root.addClass("vap-gallery");
    const cards = this.collectCards();
    if (cards.length === 0) {
      root.createEl("div", { text: t("gallery.empty"), cls: "vap-empty" });
      return;
    }
    const bar = root.createEl("div", { cls: "vap-filter-bar" });
    const chip = (text, active, onClick) => {
      const el = bar.createEl("span", { text, cls: "vap-chip" + (active ? " active" : "") });
      el.onclick = () => {
        onClick();
        this.render();
      };
    };
    const f = this.filter;
    const isAll = f.dims.length === 0 && !f.platform && !f.source;
    chip(t("gallery.all"), isAll, () => {
      this.filter = { ...EMPTY_FILTER, dims: [] };
    });
    for (const p of platformChips(cards)) {
      chip(
        (_a = PLATFORM_LABELS[p]) != null ? _a : p,
        f.platform === p,
        () => {
          f.platform = f.platform === p ? null : p;
        }
      );
    }
    for (const dim of dimensionChips(cards)) {
      chip(
        this.dimLabel(dim),
        f.dims.includes(dim),
        () => {
          f.dims = f.dims.includes(dim) ? f.dims.filter((d) => d !== dim) : [...f.dims, dim];
        }
      );
    }
    if (hasDeep(cards)) {
      chip(
        t("gallery.deep"),
        f.source === DEEP_SOURCE,
        () => {
          f.source = f.source === DEEP_SOURCE ? null : DEEP_SOURCE;
        }
      );
    }
    for (const ch of channelChips(cards)) {
      chip(ch, f.source === ch, () => {
        f.source = f.source === ch ? null : ch;
      });
    }
    const grid = root.createEl("div", { cls: "vap-grid" });
    const coversFolder = this.plugin.settings.clipRules.thumbnail.thumbnailFolder;
    for (const c of filterCards(cards, this.filter)) {
      const card = grid.createEl("a", { cls: "vap-card" + (c.depth === "deep" ? " vap-card-deep" : "") });
      card.onclick = (e) => {
        e.preventDefault();
        this.app.workspace.openLinkText(c.path, "", false);
      };
      const imgWrap = card.createEl("div", { cls: "vap-img-wrap" });
      if (c.videoId) {
        const src = this.app.vault.adapter.getResourcePath(`${coversFolder}/${c.videoId}.webp`);
        imgWrap.createEl("img", { attr: { src, loading: "lazy" } });
      }
      if (c.depth === "deep") imgWrap.createEl("span", { text: t("gallery.deep"), cls: "vap-deep-badge" });
      const body = card.createEl("div", { cls: "vap-body" });
      if (c.channel) body.createEl("span", { text: c.channel, cls: "vap-creator" });
      body.createEl("div", { text: c.title, cls: "vap-title" });
      if (c.note) body.createEl("div", { text: c.note, cls: "vap-highlight" });
      const footer = body.createEl("div", { cls: "vap-footer" });
      footer.createEl("span", { text: c.views ? `\u25B6 ${c.views}` : "", cls: "vap-views" });
      footer.createEl("span", { text: displayDate(c), cls: "vap-date" });
    }
  }
};

// src/main.ts
var VaultAutopilotPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.server = null;
    // Double-clicks / extension retries race their read-modify-write on the same
    // note; every clip goes through this queue so only one is in flight at a time.
    this.enqueueClip = makeSerialQueue();
  }
  async onload() {
    await this.loadSettings();
    setLanguage(this.settings.language);
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    this.registerView(GALLERY_VIEW_TYPE, (leaf) => new GalleryView(leaf, this));
    this.addRibbonIcon("layout-grid", t("gallery.open"), () => this.activateGallery());
    if (this.settings.httpServer.enabled) this.startServer();
  }
  async activateGallery() {
    const existing = this.app.workspace.getLeavesOfType(GALLERY_VIEW_TYPE)[0];
    if (existing) {
      this.app.workspace.revealLeaf(existing);
      return;
    }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: GALLERY_VIEW_TYPE, active: true });
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
    const start = () => {
      if (this.settings.httpServer.enabled) this.startServer();
    };
    const old = this.server;
    this.server = null;
    if (old) old.close(() => start());
    else start();
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
  // Built-in SOP contents for modes whose sopPath is empty, respecting the
  // master switch and the plugin language.
  builtinSops() {
    if (!this.settings.useBuiltinSops) return {};
    const lang = this.settings.language;
    return {
      thumbnail: builtinSopFor("thumbnail", lang),
      hook: builtinSopFor("hook", lang),
      keyframe: builtinSopFor("keyframe", lang)
    };
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
    new import_obsidian3.Notice(t("notice.savedTo", { folder }), 8e3);
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
        if (existing instanceof import_obsidian3.TFile) await this.app.vault.modifyBinary(existing, data);
        else await this.app.vault.createBinary(p, data);
      },
      create: async (p, content) => {
        await this.app.vault.create(p, content);
      },
      readFileSync: (p) => {
        const abs = nodePath.isAbsolute(p) ? p : nodePath.join(this.app.vault.adapter.getBasePath(), p);
        return fs.readFileSync(abs, "utf8");
      },
      downloadUrl: async (url) => {
        assertDownloadable(url);
        const resp = await (0, import_obsidian3.requestUrl)({ url, method: "GET" });
        const MAX = 25 * 1024 * 1024;
        if (resp.arrayBuffer.byteLength > MAX) throw new Error("Remote file too large");
        return resp.arrayBuffer;
      },
      fileExists: (p) => this.app.vault.getAbstractFileByPath(p) != null,
      listMarkdownFiles: (folderPath) => {
        return this.app.vault.getFiles().filter((f) => f.path.startsWith(folderPath + "/") && f.extension === "md").map((f) => f.path);
      },
      read: async (filePath) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof import_obsidian3.TFile)) throw new Error(`File not found: ${filePath}`);
        return this.app.vault.read(file);
      },
      modify: async (filePath, content) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof import_obsidian3.TFile)) throw new Error(`File not found: ${filePath}`);
        await this.app.vault.modify(file, content);
      },
      getFrontmatter: (filePath) => {
        var _a, _b;
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof import_obsidian3.TFile)) return null;
        return (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) != null ? _b : null;
      }
    };
    this.server = createServer2(
      port,
      (payload) => this.enqueueClip(async () => {
        const { notePath, notice } = await routeClip(payload, this.settings.clipRules, vaultOps, this.builtinSops());
        if (notePath) await this.maybeFirstSaveNotice(payload.mode, notePath);
        const obsidianUrl = notePath ? `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(notePath)}` : void 0;
        return { obsidianUrl, notice };
      }),
      this.manifest.version
    );
    this.server.on("error", (err) => {
      this.server = null;
      new import_obsidian3.Notice(
        err.code === "EADDRINUSE" ? t("notice.portInUse", { port }) : t("notice.serverError", { port }),
        1e4
      );
    });
  }
};
