---
title: "Spec 上下文注入架构"
category: 关键决策
tags: [spec-injection, plugin, system-transform, tool-execute-before, dual-hook]
date: 2026-06-07
source: tasks/feat-specs结构奠基-20260606
quality: verified
---

# Spec 上下文注入架构

## 架构：双钩子注入

`self-workflow-session.ts` 通过两个钩子确保所有 Agent 获取 spec 约束：

| Agent 类型 | 钩子 | 机制 |
|---|---|---|
| **主 Agent** | `experimental.chat.system.transform` | `scanSpecs()` → 注入 system prompt |
| **子 Agent** | `tool.execute.before` | 拦截 Task 调用 → 注入 `output.args.prompt` |

## 为什么双钩子

- `system.transform` 覆盖主 Agent 的 system prompt
- 子 Agent prompt 由调用方控制，不一定继承主 Agent system prompt
- `tool.execute.before`（Trellis 验证模式）在 Task 调用时**显式注入**，不依赖继承

## 注入格式

```
<!-- SELF_WORKFLOW_SPECS -->
## ⚠️ Self-Workflow 项目规范（必须遵守）
### default/（始终生效）
- **{filename}** [{tags}] — {summary}
### 如何使用
- 用 Read 工具查看完整内容
```

Marker 检测防重复注入。

## 新增 spec 的注入

在 `specs/default/` 下创建 `.md` → 填写 frontmatter（含 `summary`）→ Plugin 下次会话自动注入。
