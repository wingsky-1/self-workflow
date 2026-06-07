---
id: ADR-003
status: 已选择
date: 2026-06-07
decision-makers: [Agent, Human]
workflow: feat-agent自主决策-feat增强-20260607
---

# ADR-003：内置 tool 实现方式

## 背景

当前 Agent 通过逐个工具调用执行确定性操作，每次消耗 token 且需要多步推理。V1.11 中需将这些高频操作封装为**结构化函数调用**——类似 OpenCode 内置工具的模式，一次调用完成一个语义完整的操作。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：Plugin tool hook | 通过 `Hooks.tool` 注册，插件进程内运行 | 零额外进程；Zod 校验；ToolContext 上下文 | TypeScript only |
| B：MCP Server | 独立 stdio 子进程，JSON-RPC | 进程隔离；任意语言 | 无 OpenCode 上下文；协议开销 |
| C：CLI 脚本 | bash 调用，已废弃 | — | 非工具模式 |

## 选择

**方案 A**（Plugin tool hook）

## 理由

1. `@opencode-ai/plugin` 的 `Hooks.tool` API（`index.d.ts:179`）原生支持
2. 零额外进程、Zod 自动校验、直接访问 `ToolContext`（directory/worktree/sessionID）
3. YAML 解析使用项目已有的 `yaml` 包，避免自实现解析器的维护负担

## 工具列表

`sw_task_list` / `sw_task_create` / `sw_task_read` / `sw_task_phase_update`

## 实现

在 `packages/installer/templates/plugin/self-workflow-session.ts` 中新增 `tool` hook。

> 修订记录：CLI→MCP Server（设计阶段）→Plugin tool hook（实现阶段，发现 Plugin API 原生支持）
