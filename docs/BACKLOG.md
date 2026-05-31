# Vault Autopilot — Backlog

> 按优先级排列。P1 = 最常用路径上的 bug，P2 = 体验问题，P3 = 功能缺失，P4 = 未来想法。

---

## P1 — Hook 手动模式重设计（最高优先级）

**问题**
- 帧图片和 MD 文件混在同一文件夹，笔记文件夹被 PNG 占满
- 模板里没有 `[Image #1]` / `[Image #2]` 标注，Claudian 分析后无法对应帧
- 字幕（transcript）字段未显示（Chrome 扩展可能未发送）
- 分析完没有方便的方式清理帧图片

**目标体验**
```
Content Creation/
  hook-标题-1234.md     ← 笔记文件夹只有 MD

Assets/images/
  hook-标题-1234-f01.png   ← 帧图片和平时截图放一起
  hook-标题-1234-f02.png
```

MD 模板结构：
```markdown
# Hook — 视频标题

▶ [跳转原视频](https://youtu.be/xxx?t=0s)
来源：youtube | 频道名 | 2026-05-30

> [!NOTE] 分析用帧（Claudian 看完后删除此块 + Assets/images 里的对应文件）
> **[Image #1]** ![[hook-标题-1234-f01.png]]
> **[Image #2]** ![[hook-标题-1234-f02.png]]
> **[Image #3]** ![[hook-标题-1234-f03.png]]
>
> **字幕**
> 你有没有想过，为什么有些视频开场 3 秒就能让你停下来？

---

## Hook 类型

## 具体手法

## 为什么有效

## 如何复制

## 我的想法
```

**解决方案**
- [ ] `ClipRule` 加 `framesFolder: string` 字段（默认 `Assets/images`）
- [ ] 设置 UI 加"Frames folder"输入框
- [ ] `buildManualTemplate` 改为 `[Image #N]` 标注 + Callout 块包裹
- [ ] 验证 Chrome 扩展是否发送 `transcript` 字段（curl 测试）
- [ ] 修复 `buildManualTemplate` 字幕显示 bug

---

## P1 — Screenshot 模式点击无响应

**问题**
Chrome 扩展里点击截图按钮，vault-autopilot 收不到请求。

**可能原因**
- 扩展发的是旧格式 `image_base64`，但代码路由出了问题
- 或扩展本身有 bug，根本没发请求

**解决方案**
- [ ] 在 Chrome 扩展里加 console.log，确认请求是否发出
- [ ] 用 curl 发旧格式 payload 到 `/clip`，确认 vault-autopilot 这边处理正常
- [ ] 对比扩展新旧代码差异

---

## P1 — Keyframe 模式点击无响应

**问题**
Chrome 扩展里点击 keyframe 按钮无反应。

**背景**
Keyframe 的理想 UX：用户看到好的动效 → 点"开始" → 点"结束" → 自动截取这段关键帧 → 发到 vault-autopilot。

**解决方案**
- [ ] Chrome 扩展实现 start/end 选择 UI
- [ ] 扩展按时间范围截取帧，组装 keyframe payload 发送
- [ ] vault-autopilot 这边 keyframe 路由已就绪，等扩展对接

---

## P2 — Keyframe 手动模式模板

**问题**
Keyframe 模式和 hook 一样，需要：
- `[Image #N]` 标注
- 帧图片存到 `framesFolder`
- Callout 块包裹，方便删除

**解决方案**
- [ ] 和 Hook 一起改，共用同一套模板逻辑

---

## P2 — Auto 模式（直接调 AI）测试

**问题**
Auto 模式（vault-autopilot 直接调 Anthropic/OpenAI/Gemini API 写好整份笔记）理论上已实现，但从未真实测试过。

**解决方案**
- [ ] 配置一个 API provider（Anthropic 或 OpenAI-compat）
- [ ] 用 curl 发 hook payload，验证笔记是否自动生成
- [ ] 检查 SOP 是否被正确读取和发送

---

## P2 — 帧图片数量控制

**问题**
Chrome 扩展可能发来很多帧（最多 20 张），但 Claudian 分析不需要那么多，且每帧都要上传 token 成本高。

**解决方案**
- [ ] 已有 `maxFrames` 设置（默认 5），验证采样逻辑是否均匀分布
- [ ] 考虑在 MD 里注明"共 N 帧，采样 M 帧"

---

## P3 — 分析后一键清理帧图片

**问题**
Claudian 分析完后，需要手动去 `Assets/images/` 删帧图片，再删 MD 里的引用块。两步操作，容易忘。

**可能解决方案**
- Obsidian 插件命令："清理本笔记的帧图片"（删除 MD 中引用块 + 对应文件）
- 或：接受手动操作，引用块设计成一眼能找到、好删除的样式

---

## P3 — Bilibili 时间戳链接

**问题**
`buildTimestampUrl` 已支持 YouTube 和 Bilibili，但 Bilibili 的时间戳格式（`?t=30`）需要验证是否真的能跳转。

**解决方案**
- [ ] 发一个 Bilibili 视频的 keyframe payload，测试生成的链接

---

## P4 — 多个 SOP 模板

**想法**
同一个 mode 可能有多个分析角度（比如 hook：视觉分析 SOP / 文案分析 SOP）。

**现状**
目前每个 mode 只能配一个 SOP。如需多角度，需手动改设置。

---

## P4 — 自动删除过期帧

**想法**
帧图片存到 `Assets/images/` 后，N 天后自动删除（假设已完成分析）。

**现状**
暂无实现计划，手动删除为主。

---

## 已完成 ✅

- `server.ts` ClipPayload 改为判别联合（screenshot / hook / keyframe / legacy）
- `clip-router.ts` 三种模式路由逻辑
- Anthropic / OpenAI-compat / Gemini API 支持多帧 `analyzeMultiFrame`
- `processingMode: 'auto' | 'manual'` 设置
- `maxFrames` 设置
- YouTube / Bilibili 时间戳链接生成
- hex 颜色代码后处理（`postProcessMarkdown`）
- vault watcher 正常工作（文件拖进 watchFolder 触发分析）
