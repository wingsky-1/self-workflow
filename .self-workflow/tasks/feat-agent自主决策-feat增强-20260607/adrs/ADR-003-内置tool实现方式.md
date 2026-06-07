---
id: ADR-003
status: 已选择
date: 2026-06-07
decision-makers: [Agent, Human]
workflow: feat-agent自主决策-feat增强-20260607
---

# ADR-003：内置 tool 实现方式

## 背景

当前 Agent 通过逐个工具调用执行确定性操作（`grep` 扫描任务列表、`read` 读 task.yaml、`glob` 找文件），每次消耗 token 且需要多步推理。V1.11 中需将这些高频操作封装为**结构化函数调用**——类似 OpenCode 内置工具（`read`/`grep`/`glob`）的模式，一次调用完成一个语义完整的操作。

> 修订：原设计为 CLI 脚本（`node task-cli.js list`），经 Human 指出应参考 OpenCode 内置 tool 的模式——工具应是类型化参数 + 结构化返回值的函数调用，而非 shell 子进程。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：结构化工具（MCP Server） | 实现为 OpenCode MCP Server，注册后作为一等工具被 Agent 调用 | 与 OpenCode 工具模式一致；类型安全；独立可测 | 需实现 MCP 协议；需注册 |
| B：Plugin 扩展 | 在 self-workflow-session.ts 中通过 `tool.execute.before` 拦截增强 | 无额外进程 | 无法新增工具，只能拦截；职责混杂 |
| C：CLI 脚本（原方案，已废弃） | Node.js CLI，通过 `bash` 调用 | — | ❌ 不符合 OpenCode 工具模式 |

## 选择

**方案 A**（结构化工具——MCP Server）

## 理由

1. **模式一致**：与 OpenCode 的 `read`/`grep`/`glob`/`edit` 等工具遵循相同的函数调用模式
2. **类型安全**：参数有 JSON Schema 定义，错误处理结构化
3. **一等公民**：Agent 直接调用工具（非 `bash node ...`），无需 shell 解析
4. **可测试**：MCP Server 可独立测试

## 工具接口设计

参照 OpenCode 内置工具的参数格式：

### sw_task_list
- 描述：扫描 `tasks/*/task.yaml`，返回所有任务状态
- 参数：`status` (string, optional) — in_progress/pending/completed/cancelled
- 返回：`[{workflowId, title, status, currentPhase, created, updated}]`

### sw_task_create
- 描述：从 feat-task.yaml 模板创建完整 task 目录结构
- 参数：`slug` (required), `title` (required), `description` (optional)
- 返回：`{workflowId, path, created}`

### sw_task_read
- 描述：读取指定 task.yaml，返回结构化数据
- 参数：`workflowId` (required)
- 返回：完整 task.yaml 解析结果

### sw_task_phase_update
- 描述：更新 task.yaml 中指定 phase 的状态
- 参数：`workflowId` (required), `phaseId` (1-5, required), `status` (required), `gate` (optional)
- 返回：`{updated}`

## 实现路径

1. 创建 `packages/installer/mcp/task-server.js`
2. 注册到 OpenCode 工具系统
3. Agent 直接通过工具名调用

## 后果

- 新增 MCP Server 实现
- 部署路径待定（通过 installer 部署 MCP Server + 注册配置）

## 关联

- 关联需求：内置 tool 化
- 被引用：02-design.md
- 被取代：原 CLI 脚本方案（已废弃）
