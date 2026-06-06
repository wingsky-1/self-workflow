---
title: "OpenCode Plugin 会话启动注入模式"
category: 参考模式
tags: [plugin, session, injection, marker, system-transform, opencode]
date: 2026-06-06
source: tasks/feat-开始v1-7-20260606
quality: draft
---

# OpenCode Plugin 会话启动注入模式

## 摘要

在 OpenCode Plugin 中实现"会话启动时自动注入内容到 system prompt"的标准模式。处理了 TUI 重开重复注入、单 system message 后端兼容、`session.created` 事件 bug 等边界问题。

## 背景

需要在 Agent 会话启动时自动将文档索引注入 system prompt。OpenCode 的 Plugin API 提供 `event` hook 和 `experimental.chat.system.transform` hook。挑战：TUI 重开导致 Plugin 进程重启、部分后端只接受单 system message、`session.created` 有已知 bug。

## 方案

### 架构

```
event hook (session.created) → 预计算注入内容
       ↓
chat.system.transform → marker 检测去重 → 注入
```

### 核心代码

```typescript
const MARKER = "<!-- PLUGIN_INJECTED -->";
let cachedContent: string | null = null;

return {
  event: async ({ event }) => {
    if (event.type === "session.created") {
      cachedContent = buildInjectionContent();
    }
  },
  "experimental.chat.system.transform": async (_input, output) => {
    // marker 检测：已注入则跳过
    for (const entry of output.system) {
      if (entry.includes(MARKER)) return;
    }
    const content = cachedContent ?? buildInjectionContent();
    if (!content) return;
    // 合并到已有 system message（不 push 新条目）
    if (output.system.length > 0) {
      output.system[output.system.length - 1] += "\n\n" + content;
    } else {
      output.system.push(content);
    }
  },
};
```

### 关键决策点

1. **marker 检测优于内存状态**：内存 Set 在 Plugin 重启后丢失，marker 存在于 system prompt 文本中，跨 TUI 重开可靠
2. **合并而非 push**：`output.system[last] += content` 而非 `output.system.push(content)`，兼容单 system message 后端（vLLM/Qwen）
3. **session.created 为信号，非依赖**：如果 session.created bug 未触发，实时 buildInjectionContent() 作为兜底

## 适用场景

- 需要在会话启动时注入上下文的所有 OpenCode Plugin
- 注入内容需要在会话间保持唯一性的场景
- 需要跨 Plugin 重启（TUI reopen）保持状态正确的场景

## 验证项目

- context-mode (mksglu/context-mode)：commit 5aade76 从内存 Set 迁移到 marker 检测
- systematic (marcusrbrown/systematic)：采用 XML-like marker 替换机制
