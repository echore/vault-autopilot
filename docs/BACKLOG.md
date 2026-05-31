# Vault Autopilot — Backlog

> 按优先级排列。P1 = 最常用路径上的 bug，P2 = 体验问题，P3 = 功能缺失，P4 = 未来想法。
> 标注 [扩展] = Chrome 扩展侧工作，[插件] = vault-autopilot 侧工作。

---

## P1 — [扩展] Hook 字幕未发送

**问题**
Chrome 扩展发来的 hook payload 里没有 `transcript` 字段（或为空）。
vault-autopilot 模板里字幕逻辑已实现——问题完全在扩展侧。

**需要扩展做的**
- [ ] 在页面加载时开始监听 `.ytp-caption-segment`，把字幕+时间戳缓存到内存
- [ ] 点击 Hook 按钮时，取 0 到 `video.currentTime` 这段字幕，拼成字符串放入 `transcript`

---

## P1 — [扩展] Hook 帧捕获完整实现

**问题**
当前 Hook 按钮行为不完整：没有从 0 到当前时间均匀截帧，没有发送 `time_range`。

**需要扩展做的**
- [ ] 读取 `video.currentTime` 作为 Hook 结束点
- [ ] 从视频当前帧截图（canvas.drawImage），作为代表帧发送
- [ ] 更完整方案：seek 到均匀时间点截多帧（0, end/4, end/2, 3*end/4, end）
- [ ] payload 加 `time_range: { start: 0, end: Math.floor(video.currentTime) }`

---

## P1 — [扩展] Keyframe 模式 start/end UI 未实现

**问题**
Keyframe 按钮无反应。理想 UX：用户看到好的动效 → 点"开始" → 点"结束" → 截取帧段。

**需要扩展做的**
- [ ] 第一次点击：记录 `startTime = video.currentTime`，UI 显示"已标记开始"
- [ ] 第二次点击：记录 `endTime = video.currentTime`，截帧+发送
- [ ] payload 加 `time_range: { start, end }`
- [ ] vault-autopilot 侧 keyframe 路由和模板已就绪，等扩展对接

---

## P1 — [扩展] Screenshot 批量模式对接

**问题**
插件侧已升级为 `images: string[]`（支持多张图），扩展侧需对齐发送格式。

**需要扩展做的**
- [ ] 批量截图模式发送 `{ mode: 'screenshot', images: [...], url, title }`（数组格式）
- [ ] 单张截图也改成 `images: [singleImage]`（旧 `image: string` 格式已做向后兼容）
- [ ] 端到端测试：截图 → Obsidian 生成含 `![[]]` 的笔记 + 图存到 framesFolder

---

## P2 — [插件] Auto 模式端到端测试

**问题**
Auto 模式（vault-autopilot 直接调 Anthropic/OpenAI/Gemini 写好完整笔记）代码已实现，从未真实测试过。

**步骤**
- [ ] 在插件设置里配置一个 API provider（Anthropic 或 OpenAI-compat）
- [ ] 将 hook ClipRule 的 processingMode 改为 auto
- [ ] curl 发 hook payload，验证笔记是否自动生成
- [ ] 检查 SOP 文件是否被正确读取并发送给 AI

---

## P2 — [插件] iframe 显示确认

**问题**
iframe 模板逻辑已实现，未在真实 Obsidian 里确认渲染正常。

**步骤**
- [ ] 发一个 hook payload，确认 MD 里有 `<iframe>` 和 `[Image #N]`
- [ ] 确认 Obsidian Settings → Editor → "Allow HTML iframes" 已开启

---

## P3 — [插件] 分析后一键清理帧图片

**想法**
Claudian 分析完后，需手动删 `Assets/images/` 里的帧 + MD 里的 Callout 块。
当前设计：用 checklist 提示用户手动清理，不做自动删除（无法监听 wikilink 移除事件）。

**可能方案**
- Obsidian 插件命令："清理本笔记的帧图片"（自动删除 Callout 块 + 对应文件）

---

## P3 — [插件] Bilibili iframe 验证

**问题**
Bilibili embed URL 代码已写，但从未真实测试。

- [ ] 发一个 Bilibili keyframe payload，检查生成的 iframe 在 Obsidian 里是否正常播放

---

## P4 — [插件] 多个 SOP 模板

同一 mode 可能有多个分析角度（hook 视觉分析 / 文案分析）。
目前每个 mode 只能配一个 SOP，如需多角度需手动改设置。

---

## P4 — [插件] 自动删除过期帧

帧图片存到 `Assets/images/` 后，N 天后自动删除。暂无实现计划。

---

## 已完成 ✅

### vault-autopilot 插件
- ClipPayload 判别联合（screenshot / hook / keyframe / legacy）
- clip-router 三种模式路由
- Anthropic / OpenAI-compat / Gemini 支持多帧 `analyzeMultiFrame`
- `processingMode: 'auto' | 'manual'` 设置
- `maxFrames` 设置（默认 5，均匀采样）
- `framesFolder` 设置（默认 `Assets/images`）
- Hook/Keyframe 手动模式模板：iframe 嵌入 + `[Image #N]` Callout 块
- YouTube / Bilibili 视频 ID 提取 + iframe URL 构建
- HookPayload 加可选 `time_range`，MD 标题显示 Hook 时长
- hex 颜色代码后处理（`postProcessMarkdown`）
- vault watcher 正常工作（文件拖进 watchFolder 触发分析）
- **Screenshot ClipRule**：独立于 Watch Rule，有自己的 processingMode / framesFolder / SOP / outputFolder / provider
- **ScreenshotPayload**：`image: string` → `images: string[]`，旧格式向后兼容
- **Manual 模式 SOP 嵌入**：生成笔记时读取 SOP 文件，嵌为 `[!TIP]` callout，带 checklist 提示删除
- **字幕独立章节**：从 `[!NOTE]` 帧块移出，删帧块不丢字幕
- **Settings UI 按模式收折**：manual 隐藏 Provider；auto 隐藏 Frames folder（hook/keyframe）
- **loadSettings 深合并**：screenshot 漏写导致设置页崩溃的 bug 已修

### Chrome 扩展（已完成部分）
- Hook 模式基础 payload 结构（frames / video_title / url / platform / channel）
- POST 到 `http://127.0.0.1:27183/clip`
