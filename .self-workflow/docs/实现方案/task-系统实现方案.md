---
title: "Task 系统与工作流状态机实现方案"
category: 实现方案
tags: [task-system, state-machine, task-yaml, phase-lifecycle, sw-task-tools]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# Task 系统与工作流状态机实现方案

> 最后更新：2026-06-07

## 模块定位

Task 系统是 Self-Workflow 工作流执行的核心数据层。它定义了工作流实例的**状态记录格式**（task.yaml schema）、**阶段生命周期**（phase lifecycle）和**编程接口**（4 个 sw_task_* 内置工具），是 `/feat` 命令与 Compound 归档之间的数据桥梁。

**一句话**：记录"任务到哪了、每个阶段什么状态、下一步该做什么"。

### 在系统中的角色

```
用户 → /feat 命令 → sw_task_create (task.yaml + 目录结构)
                        │
                        ▼
                   阶段执行 → sw_task_phase_update (推进状态)
                        │
                        ▼
                   Gate 通过 → checkpoint (git tag + SHA 记录)
                        │
                        ▼
                   Compound → sw_task_phase_update (终结状态)
```

### 职责边界

| 模块 | 职责 |
|------|------|
| `/feat` 命令（`commands/feat.md`） | 工作流编排：引导 5 阶段 + Gate 执行 |
| **Task 系统（本文）** | 状态持久化：提供 schema 定义、状态机规则、读写工具 |
| Plugin 注入（`self-workflow-session.ts`） | 运行时注入：将 sw_task_* 工具注册到 Agent 上下文 |
| Compound 归档 | 最终检视：交叉引用检查、文档审查、Todo 更新 |

## 架构概览

### 文件布局

```
.self-workflow/tasks/<workflow-id>/
├── task.yaml              # 任务元数据 + 阶段状态数组（权威源）
├── adrs/                  # 决策记录（per-task 编号）
├── logs/                  # 实施日志
├── artifacts/             # 阶段产物文件（01-analysis.md ~ 05-summary.md）
└── errors/                # 错误日志
    ├── errors.yaml        # 错误索引
    └── 01-analysis-errors.md  # 按阶段错误详情
```

### task.yaml Schema

```yaml
name: <slug>                 # 步骤 1 生成的 slug（如 "V1.9版本"）
title: <描述>                 # 用户输入原始描述（Human 可读）
status: in_progress           # 顶层状态：pending / in_progress / completed / cancelled
created: <YYYY-MM-DD>         # 创建日期
updated: <ISO 8601>           # 最后更新时间
tags: []                      # 标签列表，可由 Agent 补充
description: >                # 用户输入原文（YAML folded scalar）

workflow-id: feat-<slug>-<YYYYMMDD>  # 全局唯一工作流标识
type: feat                     # 工作流类型（当前仅 feat，未来可扩展 fix/refactor 等）

phases:                        # 阶段数组（5 个元素，顺序固定）
  - id: 1
    name: 需求分析
    status: in_progress        # pending | in_progress | completed | failed | skipped
    gate: pending              # pending | passed | failed
    started: <ISO 8601>        # 阶段开始时间
    completed: null            # 阶段完成时间
    artifact: "01-analysis.md" # 对应的阶段产物文件名
    errors: []                 # 错误记录列表
    checkpoint: null           # Gate 通过后填充 git commit SHA
  - id: 2
    name: 方案设计
    # ...（同上模式，共 5 阶段）

experience-draft: false        # 是否产出了经验草稿（Compound 步骤 8 设置）

structure:                     # 目录结构快照
  root: ["task.yaml"]
  adrs: []
  logs: []
  artifacts: []

milestones: []                 # 里程碑列表（V2 扩展用）

cross-refs: []                 # 交叉引用列表
```

### 4 个内置工具

所有工具通过 Plugin `self-workflow-session.ts` 的 `tool` 钩子注册，Agent 可在对话中直接调用：

| 工具 | 作用 | 关键输入 | 关键输出 |
|------|------|---------|---------|
| `sw_task_list` | 扫描所有任务，返回任务状态摘要列表 | `status?`（可选过滤） | `[{workflowId, title, status, currentPhase, ...}]` |
| `sw_task_create` | 从模板创建完整任务目录 + task.yaml | `slug`, `title`, `description?` | `{workflowId, path, created}` |
| `sw_task_read` | 读取指定 task.yaml 返回结构化 JSON | `workflowId` | 完整的 task.yaml 解析结果 |
| `sw_task_phase_update` | 更新指定阶段的 status/gate/时间戳/checkpoint | `workflowId`, `phaseId`, `status`, `gate?`, `checkpoint?` | `{updated, phase, warning?}` |

工具设计原则：
- **轻量读写**：不包含业务逻辑，只做文件 I/O 和状态字段更新
- **文本替换**：`sw_task_phase_update` 使用正则文本替换而非完整 YAML 重写，避免破坏格式和注释
- **模板驱动**：`sw_task_create` 从 `configs/tasks/feat-task.yaml` 模板生成，模板由安装器管理

**`sw_task_phase_update` started 字段的幂等保护**（V1.19）：当 `status === "in_progress"` 但 `started` 已有有效值（非 null），工具不覆盖 `started` 时间戳。仅在 `started: null` 或字段缺失时才写入当前时间。这确保 Agent 多次调用推进到 `in_progress` 时不会丢失初始开始时间。

## 关键数据流

### Phase 状态机生命周期

每个 phase 实例经历以下状态转换：

```
                     ┌──────────────────┐
                     │     pending      │  ← 初始状态（阶段 2-5）
                     └────────┬─────────┘
                              │ 阶段开始
                              ▼
                     ┌──────────────────┐
                     │   in_progress    │  ← 当前阶段 status，设 started 时间戳
                     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
               Gate 通过           Gate 不通过
                    │                   │
                    ▼                   ▼
           ┌──────────────┐    ┌──────────────┐
           │  completed   │    │    failed    │  ← Ralph Loop 耗尽
           │  gate:passed │    │  gate:failed │
           └──────────────┘    └──────────────┘
                    │
                    │ 推进到下一 phase →
                    ▼
           下一 phase → in_progress

特殊情况：
  - cancelled：工作流被取消（顶层 status，保留所有产物快照）
  - skipped：回溯时跳过中间 Gate（phase.status = skipped）
```

### 与 /feat 工作流的交互时序

```
/feat 命令启动
    │
    ├── 步骤 2（目录初始化）
    │   └── sw_task_create(slug, title, description)
    │       ├── 创建 tasks/<workflow-id>/ 目录
    │       ├── 填充 task.yaml（Phase 1 状态 = in_progress）
    │       └── 创建 errors.yaml
    │
    ├── 阶段 N 开始
    │   └── sw_task_phase_update(workflowId, phaseId, "in_progress")
    │       └── 设 status=in_progress, started=now
    │
    ├── Gate N 通过
    │   ├── git tag <workflow-id>-ph<N>-<name>-gate-passed
    │   ├── git rev-parse <tag> → checkpoint SHA
    │   ├── 写入 checkpoint SHA 到 task.yaml phase[N].checkpoint
    │   └── sw_task_phase_update(workflowId, phaseId, "completed", "passed")
    │       ├── 设 status=completed, gate=passed, completed=now
    │       └── 推进下一 phase → in_progress
    │
    ├── Gate N 不通过
    │   └── gate 保持 pending，不推进，返回当前阶段修复
    │
    ├── Compound 执行
    │   ├── 最后阶段 → sw_task_phase_update(5, "completed", "passed")
    │   │   └── 同时更新顶层 status=completed, updated=now
    │   └── git tag <workflow-id>-ph5-summary-completed
    │
    └── 经验产出 → task.yaml experience-draft = true
```

### Checkpoint 字段的数据流

```
Gate 通过
    │
    ├── 1. git add .self-workflow/tasks/<workflow-id>/task.yaml
    ├── 2. git commit -m "<workflow-id>: phase-<N> <阶段名> — <模块摘要>"
    ├── 3. git tag <workflow-id>-ph<N>-<name>-gate-passed
    ├── 4. git rev-parse <workflow-id>-ph<N>-<name>-gate-passed → <SHA>
    └── 5. sw_task_phase_update(workflowId, phaseId, "completed", "passed", checkpoint=<SHA>)
            ├── 工具写入 phase[N].checkpoint = <SHA>（文本替换）
            └── 若 gate=passed 但 checkpoint 缺失 → 返回 warning（不阻断）

回溯场景：
    git checkout <workflow-id>-ph<M>-<name>-gate-passed
    → 更新 task.yaml：M+1 到 N 的 gate 标记为 skipped
    → 新建分支 git checkout -b <workflow-id>-revised

Compound 补建 tag 场景：
    若 gate=passed 但缺少 tag：
    → 先读取 task.yaml phase[N].checkpoint
    → 若非 null：git tag <name> <sha> 补建
    → 若 null：git log --oneline --grep 搜索 commit 消息
```

## 设计决策依据

- `docs/关键决策/spec上下文注入架构.md`：Plugin 双钩子架构的设计——sw_task_* 工具通过 Plugin 的 `tool` 钩子注册，不依赖外部 Agent 框架
- `docs/实现方案/feat-工作流实现方案.md`：5 阶段 + 4 Gate + Compound 编排规则，task.yaml 是其状态持久化载体
- `docs/实现方案/plugin-注入机制实现方案.md`：`self-workflow-session.ts` 的架构，sw_task_* 工具是其 `tool` 钩子的核心注册内容

### 关键决策摘要

1. **模板驱动创建**：`sw_task_create` 不从代码硬编码 schema，而是读取 `configs/tasks/feat-task.yaml` 模板文件，确保 task.yaml 结构与安装器管理的一致
2. **文本替换更新**：`sw_task_phase_update` 使用正则匹配替换而非 YAML 解析再序列化，避免破坏 task.yaml 的手动编辑格式和注释
3. **checkpoint 字段 ⇔ Git 引用**：checkpoint 只存 git commit SHA，不存文件快照——利用 Git 本身的版本管理能力，避免重复存储
4. **无独立 workflow.yaml**：V1.5.2 起不再使用独立的 `workflow.yaml`，所有状态合并到 `task.yaml` 的 phases 段（单一权威源）
5. **4 工具而非 1 个大工具**：拆分为 list/create/read/phase_update 四个独立工具，降低每个工具的复杂度，便于 Agent 理解和调用

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本 |
| 2026-06-07 | feat-feat流程修补-todo整理-20260607 | sw_task_phase_update 新增 checkpoint 参数（外部传入）、started 幂等保护、gate=passed 时 checkpoint 缺失 warning |
