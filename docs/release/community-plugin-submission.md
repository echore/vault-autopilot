# Obsidian 官方社区插件市场：提交材料与步骤

状态：材料已备齐，**尚未提交**（提交动作需要你本人的 GitHub 账号发 PR）。

## 为什么要上架

上架后用户在 Obsidian 设置 → 第三方插件 → 浏览 里搜索 "Vault Autopilot" 一键安装；之后每次发新版，用户的插件设置页直接出现 Update 按钮。这是唯一对小白零门槛的自动更新通道（zip 手动装不会更新，BRAT 对新手门槛高）。

## 前置条件核对（当前状态）

- [x] 公开 GitHub 仓库：github.com/echore/vault-autopilot
- [x] LICENSE 文件存在
- [x] 英文 README.md 存在（另有 README.zh.md）
- [x] GitHub Release 以版本号命名（0.2.0），附件含 `main.js`、`manifest.json`（release 工作流自动打包）
- [x] `manifest.json` 的 `version` 与 tag 一致；`versions.json` 维护版本与 minAppVersion 映射
- [x] `isDesktopOnly: true` 已声明（本插件跑本地 HTTP server，移动端不可用）
- [ ] 审核常见关注点自查（见下）

## 审核自查要点

官方审核（自动 bot + 人工）常见意见，提交前建议过一遍：

1. 设置页里我们用了少量内联样式（SOP 状态小字的颜色、字号）。审核偏好 CSS class + `styles.css`；如果被要求，把三处 `el.style.*` 移到 `styles.css` 即可，半小时的活。
2. 插件监听本地端口接收浏览器扩展的数据。README 里已写明只绑定 127.0.0.1、只接受 chrome-extension 来源；审核若问网络行为，指向 README 的 Privacy 段落。
3. `fs` / `path` 直读文件（SOP 绝对路径支持）。桌面端插件允许，但审核可能建议尽量走 vault API；有现成解释：sopPath 需要支持 vault 外的绝对路径这一历史行为。

## 提交步骤（你来执行，约 10 分钟）

1. Fork github.com/obsidianmd/obsidian-releases
2. 编辑 `community-plugins.json`，在数组**末尾**追加：

```json
{
  "id": "vault-autopilot",
  "name": "Vault Autopilot",
  "author": "liyachen",
  "description": "Receive screenshots and video frames from the Obsidian Visual Clipper Chrome extension over a local port and write structured notes into your vault.",
  "repo": "echore/vault-autopilot"
}
```

3. 发 PR，标题 `Add plugin: Vault Autopilot`，按 PR 模板勾选 checklist。
4. 等 bot 校验通过（几分钟）→ 进入人工审核队列（数周）。期间有意见会在 PR 里 at 你。
5. 合并后数小时内市场可搜到；之后发版只需要 push tag，无需再动 obsidian-releases。
