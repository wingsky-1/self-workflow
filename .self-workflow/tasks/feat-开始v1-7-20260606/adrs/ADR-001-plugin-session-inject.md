# ADR-001：采用 OpenCode Plugin 实现 session_start 文档索引注入

## 背景

V1.7 需求：新会话启动时，Agent 自动获取 `.self-workflow/docs/` 的文档索引（目录用途 + 文件 tag 列表），实现渐进式披露。核心约束：
1. 不修改未来用户的 AGENTS.md
2. 全自动触发，无需用户手动执行命令

OpenCode 审计确认不存在文件级 `on:session-start` hook，但 Plugin API 提供 `experimental.chat.system.transform` 钩子和 `session.created` SSE 事件。

## 决策

**采用 `event` hook（`session.created` 事件）+ `chat.system.transform` hook 的组合**实现自动注入。

Plugin 监听 `session.created` 事件（仅在新会话创建时触发），在 `chat.system.transform` 时注入。注入内容通过扫描 `docs/README.md`（分类权威源）和各分类目录下文档的 YAML frontmatter 生成，仅包含目录用途和 tag 列表，不包含全文摘要。

注入链路（含去重）：
- `session.created` 事件 → 预计算注入内容（optimistic path）
- `chat.system.transform` → marker 检测（`<!-- SELF_WORKFLOW_DOCS_INDEX -->`）
  - 已在 system prompt 中 → 跳过（覆盖 TUI 重开、session resume 场景）
  - 不在 → 注入（使用预计算内容或实时 `scanDocs`）
- 后备：`session.created` bug 未触发时，`scanDocs` 在 `chat.system.transform` 中实时执行

降级方案：如 `experimental` API 在未来版本中移除，降级为 Slash Command `/docs` 手动触发。

## 理由

1. **满足硬约束**：不修改 AGENTS.md，注入逻辑封装在 Plugin 中
2. **全自动**：`session.created` 事件驱动——新会话自动注入，TUI 重开同一会话不重复注入
3. **低侵入**：Plugin 在 `chat.system.transform` 时合并注入到 `output.system[0]`
4. **容错性好**：Plugin 加载失败或 docs/ 目录不存在时静默降级，不阻断 Agent
5. **token 可控**：仅注入 tag 列表（非摘要），9 文档约 180 tokens
6. **零维护**：Plugin 直接扫描目录 + 读取 frontmatter，无需手动维护索引文件

## 关联

- 关联需求：V1.7 #2 — docs 索引在 session_start 时自动注入上下文
- 关联审计：`.self-workflow/docs/audits/opencode-capabilities.md` — Plugin API 能力验证
