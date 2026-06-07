# 任务管理系统 (Task Management System)

> 所属模块：追踪层
> 文件位置：`.self-workflow/tasks/` + 4 个 `sw_task_*` 内置工具
> 实现方案：`.self-workflow/docs/实现方案/task-系统实现方案.md`

---

## 功能概述

任务管理系统负责 /feat 工作流实例的**全生命周期追踪**——从创建到归档。核心是 `task.yaml`（任务元数据）+ Git tag checkpoint（状态快照）+ Compound（完成归档）。

## 核心特性

### 1. task.yaml — 任务权威状态

每个工作流实例对应一个 `task.yaml`，包含：

```yaml
name: <slug>                    # 任务标识
title: <描述>                    # 人类可读标题
status: in_progress             # 顶层状态
workflow-id: feat-<slug>-<YYYYMMDD>
type: feat
phases:                         # 5 阶段状态追踪
  - id: 1
    name: 需求分析
    status: in_progress         # pending | in_progress | completed | failed | skipped
    gate: pending               # pending | passed | failed
    started: <ISO 8601>
    completed: null
    artifact: "01-analysis.md"
    checkpoint: null            # Git tag 的 commit SHA
  # ... phase 2-5 ...
experience-draft: false
milestones: []
cross-refs: []
```

### 2. 4 个内置工具（sw_task_*）

| 工具 | 功能 | 触发场景 |
|------|------|---------|
| `sw_task_list` | 扫描所有 task.yaml，返回任务状态列表 | /feat 前置检查、/catchup |
| `sw_task_create` | 从 feat-task.yaml 模板创建完整目录结构 | /feat 步骤 2-3 |
| `sw_task_read` | 读取指定 task.yaml，返回结构化 JSON | 需要查询任务状态时 |
| `sw_task_phase_update` | 更新 phase 的 status/gate，自动设时间戳 | 每阶段开始/结束、Gate 通过/失败 |

**设计原则**：确定性操作（创建目录、更新状态）由内置工具实现（TypeScript，精确），避免 Agent 手工操作导致的 token 浪费和格式错误。

### 3. 任务目录结构

```
.self-workflow/tasks/<workflow-id>/
├── task.yaml              # 任务元数据
├── adrs/                  # 决策记录（ADR）
├── logs/                  # 实施记录
├── artifacts/             # 阶段产物
│   ├── 01-analysis.md
│   ├── 02-design.md
│   ├── 03-implementation.md
│   ├── 04-verification.md
│   └── 05-summary.md
└── errors/                # 错误日志
    ├── errors.yaml
    └── 01-analysis-errors.md ...
```

### 4. Git tag Checkpoint

每 Gate 通过后创建 Git tag：
```
<workflow-id>-ph<N>-<阶段英文名>-gate-passed
```

tag 指向当时的 commit SHA，存储在 `task.yaml` 对应 phase 的 `checkpoint` 字段。

**回溯能力**：
```bash
git checkout <workflow-id>-ph2-design-gate-passed  # 回到设计审查通过时的状态
```

### 5. Compound 归档

工作流完成后（Phase 5 通过后）自动执行：
1. 产物完整性确认
2. 缺失 Git tag 补建（从 git log 定位或使用 checkpoint 字段）
3. 交叉引用检查
4. 文档变更审查
5. 实现方案文档决策审计
6. Todo 状态自动更新
7. 元数据更新（status → completed）
8. 创建 Compound tag

---

## 实现路径

### V1.0 — 基础结构
- task.yaml + workflow.yaml（后废弃）
- 手动创建目录结构

### V1.5.1 — Gate 强制步骤
- Git tag checkpoint 从"建议"提升为"强制"
- Compound 补建逻辑

### V1.9 — Schema 优化
- workflow.yaml 废弃，phases 段移入 task.yaml
- checkpoint 字段新增
- 语义 slug 生成

### V1.11 — 内置工具化
- 4 个 sw_task_* 工具由 Session Plugin 注册
- 通过 OpenCode tool hook 暴露给 Agent

---

## 未来愿景

### V2.x — 多会话并行
- git worktree 支持同一项目多任务并行
- task.yaml 跨 worktree 状态同步
- 任务间依赖关系声明

### V3.x — 智能化
- 任务状态自动推进（无人值守模式）
- logs/errors 重新定位为有价值的结构化数据
- 跨任务趋势分析

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.self-workflow/tasks/*/task.yaml` | 各任务实例的权威状态 |
| `.self-workflow/configs/tasks/feat-task.yaml` | 任务模板（占位符由 Agent 填充） |
| `.opencode/plugins/self-workflow-session.ts` | sw_task_* 4 个内置工具的实现 |
