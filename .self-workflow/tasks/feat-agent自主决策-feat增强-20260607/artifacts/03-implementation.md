---
phase: 3
workflow: feat
---

# 代码实现 — V1.11：/feat 增强 + todo 管理 + 内置工具

> 工作流 ID：`feat-agent自主决策-feat增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T11:55:00+08:00

---

## 实现清单

| # | 需求 | 文件 | 变更类型 | 状态 |
|---|------|------|---------|------|
| 6 | 内置 tool 化 | `packages/installer/templates/plugin/self-workflow-session.ts` | 修改——新增 `tool` hook，注册 4 个工具 | ✅ |
| 4 | todo 注入 | `packages/installer/templates/commands/feat.md` | 修改——步骤 0 新增 todo 上下文读取 | ✅ |
| 1 | /feat 无参数认领 | `packages/installer/templates/commands/feat.md` | 修改——无参数模式改为自动认领逻辑 | ✅ |
| 2 | /feat 完成后更新 todo | `packages/installer/templates/configs/guides/feat-workflow.md` | 修改——Compound 新增 Todo 状态更新步骤 | ✅ |
| 5 | 歧义澄清 spec | `packages/installer/templates/specs/default/ambiguity-clarification.md` | 新增 | ✅ |
| 3 | todo 整理命令 | `packages/installer/templates/commands/todo-organize.md` | 新增 | ✅ |
| — | MANIFEST 注册 | `packages/installer/index.js` | 修改——新增 2 项部署条目 | ✅ |

---

## 各变更详解

### #6 内置 tool（Plugin tool hook）

**文件**：`packages/installer/templates/plugin/self-workflow-session.ts`

从 `@opencode-ai/plugin` 导入 `tool` 函数，通过 Plugin API 的 `tool` hook 注册 4 个一等工具：

| 工具名 | 参数 | 功能 |
|--------|------|------|
| `sw_task_list` | `status?` | 扫描 `tasks/*/task.yaml`，返回任务数组 |
| `sw_task_create` | `slug`, `title`, `description?` | 创建 task 目录+task.yaml+errors.yaml |
| `sw_task_read` | `workflowId` | 读取 task.yaml，返回解析后 JSON |
| `sw_task_phase_update` | `workflowId`, `phaseId`, `status`, `gate?` | 更新指定 phase 状态和时间戳 |

每个工具使用 Zod schema 进行参数校验，`execute` 函数接收 `ToolContext`（含 `directory`、`sessionID`、`abort`）。

**核心技术决策**：放弃 MCP Server 方案，采用 Plugin tool hook——零额外进程、Zod 自动校验、直接访问 OpenCode 会话上下文。

**依赖**：Node.js 内建模块（fs, path），无外部依赖。内建简易 YAML 解析器处理 task.yaml 格式。

### #4 + #1 /feat 增强

**文件**：`packages/installer/templates/commands/feat.md`

- **#4（todo 注入）**：步骤 0 新增第 3 项"Todo 上下文"，Agent 在 `/feat` 启动时读取 `.self-workflow/todo.md`
- **#1（无参数认领）**：无参数模式从"展示仪表盘"改为 4 步自动认领：
  1. 读取 todo.md，提取版本段
  2. 扫描进行中任务
  3. 正则 `/V\d+\.\d+(?:\.\d+)?/` 提取+精确匹配版本号
  4. 有未认领版本→启动工作流；无→展示仪表盘（兜底）

### #2 /feat 完成后更新 todo

**文件**：`packages/installer/templates/configs/guides/feat-workflow.md`

Compound 阶段新增第 5 步"Todo 状态更新"，原步骤 5-8 重新编号为 6-9：

- 从 task.yaml description 首行提取版本号
- 定位 todo.md 对应版本段，标记 `[done]`
- 全部完成后移入"已关闭"（`<details>` 折叠）
- 保留"新增"章节不变
- 匹配失败→记录到 errors.yaml（severity: minor）

### #5 歧义澄清 spec

**文件**：`packages/installer/templates/specs/default/ambiguity-clarification.md`

新 default 级 spec，定义 Agent 遇到歧义输入时的行为：
- MUST：≥2 种解释 + ≥2x 工作量差异 → 使用 question 工具
- MAY：差异 <2x 且最常见用法 → 可不触发
- frontmatter 中 `extends: interaction-protocol.md`

### #3 todo 整理命令

**文件**：`packages/installer/templates/commands/todo-organize.md`

新命令 `/todo-organize [--dry-run]`：
- 合并重复、调整优先级、归档已完成版本、重排序
- **CRITICAL**：保留"新增"章节不变
- `--dry-run` 仅预览；无参数则 diff 确认后写入

---

## 安装器 MANIFEST 更新

`packages/installer/index.js` 新增 2 条目：

```javascript
[".opencode/commands/todo-organize.md",     "commands/todo-organize.md"],
[".self-workflow/specs/default/ambiguity-clarification.md", "specs/default/ambiguity-clarification.md"],
```

## 运行时部署

通过 `node packages/installer/index.js init --target . --force` 同步，5 个运行时文件已验证：

| 运行时文件 | 大小 |
|-----------|------|
| `.opencode/commands/feat.md` | 8,610 B |
| `.opencode/commands/todo-organize.md` | 1,429 B |
| `.opencode/plugins/self-workflow-session.ts` | 22,029 B |
| `.self-workflow/configs/guides/feat-workflow.md` | 32,591 B |
| `.self-workflow/specs/default/ambiguity-clarification.md` | 1,283 B |

---

## 决策捕捉

- [x] **本阶段无新增架构决策** — 所有架构决策已在阶段 2 产出 ADR-001~004
- 技术选择变更：MCP Server → Plugin tool hook（记录于本文件 #6 节，不影响 ADR-003 的"结构化工具"方向——仍是 OpenCode 一等工具，仅实现机制从 MCP 协议切换到 Plugin API）
