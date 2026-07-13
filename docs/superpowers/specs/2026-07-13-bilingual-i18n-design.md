# Vault Autopilot 中英双语（i18n）设计

日期：2026-07-13
状态：待用户评审

## 背景与目标

插件将发布给国际用户和中文用户（GitHub release + Obsidian 官方社区商店两个渠道）。当前所有用户可见文字硬编码为中文。目标：全部用户可见内容支持中英双语，用户在设置页自由切换。

**范围内**：设置页 UI、Notice 弹窗、生成的笔记内容（小节标题、提示块等）、README。
**范围外**：Chrome 扩展（obsidian-visual-clipper，独立仓库，单独立项）；用户自己写的 SOP 文件内容（那是用户的文字，插件不翻译）。

## 已确认的决定

| 决定点 | 结论 |
|---|---|
| 语言选择器 | 设置页顶部下拉框，两选项：`English / 中文`，默认 `English` |
| 追加小节到已有笔记时的语言 | 用当前设置的语言（允许单条笔记内中英标题混排） |
| 解析已有笔记 | 无条件同时识别中英两套标题（旧笔记永不失配） |
| 语言文字存放 | `src/locales/en.json` + `src/locales/zh.json`，esbuild 构建时打进 main.js（社区商店只分发 main.js/manifest.json/styles.css，运行时加载 JSON 行不通） |
| i18n 依赖 | 零依赖，手写 `t()`，不引入 i18next 等库 |

## 设计

### 1. 语言设置项

- `PluginSettings` 新增 `language: 'en' | 'zh'`，默认 `'en'`。
- 设置页最顶部新增下拉框（英文界面下标签 `Language`，中文界面下标签 `语言`）。
- 切换时：保存设置 → 调用 `setLanguage()` → `this.display()` 重渲染设置页，立即生效。
- 已有安装升级后 `language` 字段缺失 → 按默认值 `'en'`，界面变英文；用户手动切一次中文即可，永久记住。这是已知且接受的一次性影响。

### 2. i18n 模块

- `src/locales/en.json`、`src/locales/zh.json`：平铺键值对，键用点分命名（`settings.storageHeading`、`notice.savedTo`、`note.transcriptHeading` …）。
- `src/i18n.ts`：
  - `setLanguage(lang: 'en' | 'zh')` — 插件 `onload` 读取设置后调用一次；设置页切换时再调用。
  - `t(key, vars?)` — 返回当前语言文案；`vars` 做 `{folder}` 式插值。
  - 键名类型从 `en.json` 推导（`keyof typeof en`），拼错键编译期报错。
- `tsconfig.json` 开 `resolveJsonModule`；esbuild 原生支持 JSON 导入，无需改构建配置。

### 3. 覆盖范围（改为 t() 调用的文件）

- `src/settings.ts` — 全部 `setName` / `setDesc` / 分组标题。
- `src/main.ts` — 首次保存提示、端口占用提示等 Notice。
- `src/clip-router.ts` — 「已存在，未覆盖」Notice、`来源：`、`视频` 兜底标签等笔记内文字。
- `src/video-note.ts` — 小节标题、`字幕` 子标题、分析提示块（`[!TIP] 分析提示`）、帧清单块（`[!NOTE] 分析用帧`）、完成检查清单。

### 4. 笔记双语解析与写入（核心改动）

现状：`SectionKind` 的类型字面量就是中文标题（`'封面标题' | '内容' | '动效' | '截图'`），同时承担「内部标识」和「显示文字」两个职责。拆开：

- `SectionKind` 改为语言中立标识：`'cover' | 'content' | 'motion' | 'screenshot'`。
- 每种语言一张标题映射表（放在 locale 文件中）：

  | kind | clip 模式来源 | 中文标题 | 英文标题 | emoji |
  |---|---|---|---|---|
  | `cover` | 封面 (thumbnail) | 封面标题 | Cover & Title | 🖼️ |
  | `content` | Hook | 内容 | Content | 🎬 |
  | `motion` | 关键帧 (keyframe) | 动效 | Motion | ✨ |
  | `screenshot` | 截图 (screenshot) | 截图 | Screenshots | 📸 |

- **解析** `kindOf()`：对**两种语言**的标题都做子串匹配（emoji 前缀照旧兼容）。已验证四个英文标题、四个中文标题互相无子串冲突。
- **写入**：新小节标题用当前语言。
- `RANK` / `EMOJI` / `DIMENSION_ORDER` 改用中立 kind 作键。
- `renumber()` 现有正则用 `s.kind` 内嵌进标题匹配 → 改为用「该 kind 的中文标题|英文标题」交替式正则匹配编号占位符，两种语言的标题行都能正确重编号。
- frontmatter 维度列表（`addDimension`）：写入用当前语言的标题词（与方案 A 一致），排序前先经双语识别映射回中立 kind 再定序，混排列表也能正确排序。

### 5. README 双语

- `README.md` — 英文（商店与 GitHub 默认展示）。现有英文内容保留，补齐语言功能说明。
- `README.zh.md` — 中文完整翻译。
- 两个文件顶部互挂切换链接：`English | 简体中文`。

### 6. 测试计划（TDD）

- `tests/i18n.test.ts`（新增）：
  - en / zh 两个 locale 文件键集合完全一致（防漏翻）。
  - `t()` 插值、语言切换后返回值变化。
- `tests/video-note.test.ts`（扩展）：
  - 中文标题笔记解析（既有用例保留，作为旧笔记兼容回归）。
  - 英文标题笔记解析。
  - 中英混排笔记 upsert：往中文旧笔记追加英文小节，识别、排序、重编号均正确。
  - 写入语言跟随当前设置。
- 设置页 UI 按项目惯例不写单测。

## 验收标准

1. 设置页下拉切换 English/中文，设置页文字立即整体切换。
2. 语言为 English 时：Notice、新建笔记的小节标题、提示块全部为英文；为中文时全部为中文。
3. 用中文攒下的旧笔记，在切到 English 后追加任意 clip：不产生重复小节，排序与编号正确。
4. `npm test` 全绿，`tsc --noEmit` 干净。
5. 仓库含 `README.md`（英文）与 `README.zh.md`（中文），顶部互链。
