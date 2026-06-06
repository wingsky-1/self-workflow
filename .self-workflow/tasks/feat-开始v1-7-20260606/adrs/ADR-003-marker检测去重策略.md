# ADR-003：marker 检测作为注入去重策略

> 日期：2026-06-06
> 状态：已采纳
> 关联：ADR-001

## 背景

Plugin 在 `chat.system.transform` 中注入 docs 索引到 system prompt。以下场景会导致重复注入：
- TUI 重开：Plugin 进程重启，内存状态（injectedSessions Set）丢失 → 同一 session 的系统提示可能已含注入内容
- `session.created` 事件已知 bug（#14808）→ 新会话可能不触发此事件

需要一种去重策略确保每个会话只注入一次，且跨 Plugin 重启可靠。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：纯 session.created 事件 | 仅在新会话创建时注入 | 语义清晰 | session.created bug 会导致注入缺失；不处理 TUI 重开 |
| B：内存 Set 去重 | injectedSessions Set 按 sessionID 去重 | 快速 | Plugin 重启后丢失；TUI 重开会重复注入 |
| C：marker 检测 | 在注入内容前加 `<!-- SELF_WORKFLOW_DOCS_INDEX -->` marker，system.transform 时检查 marker 是否已存在 | 跨重启可靠；社区验证 | 依赖 chat.system.transform 每次触发检查 |

## 决策

**选择方案 C（marker 检测）**，结合 session.created 作为预计算信号。

注入链路：
1. `session.created` → 预计算注入内容（optimistic path，能触发最好）
2. `chat.system.transform` → 遍历 `output.system` 检查是否含 marker
   - 有 → 跳过（TUI 重开、session resume、正常会话的重复调用）
   - 无 → 注入（使用预计算内容或实时 scanDocs）

## 理由

1. **业界验证**：context-mode（最成熟 OpenCode 插件）从内存 Set 迁移到 marker 检测（commit 5aade76），systematic 项目同样经历了"单例→全局变量→放弃所有单例，采用 marker 替换"的演进
2. **跨重启可靠**：marker 存在于 system prompt 文本中，不依赖 Plugin 进程内存
3. **chat.system.transform 是唯一注入点**：OpenCode 架构中，只有此 hook 能修改 system prompt，marker 检测是在此约束下的最优解
4. **session.created 仍有用**：作为预计算信号减少 scanDocs 调用，即使它因 bug 未触发，实时 scanDocs 作为兜底

## 关联

- ADR-001：Plugin 方案选定
- 参考项目：context-mode (mksglu/context-mode)、systematic (marcusrbrown/systematic)
