---
title: "/catchup 命令实现方案"
category: 实现方案
tags: [catchup, command, session-recovery, task-status]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# /catchup 命令实现方案

> 最后更新：2026-06-07

## 模块定位

`/catchup` 命令（`.opencode/commands/catchup.md`）是 Self-Workflow 的**会话恢复引擎**。它在新对话启动时扫描 `.self-workflow/tasks/` 中的进行中任务和未解决错误，生成结构化摘要并询问用户是否恢复某个任务。

**一句话**：让 Agent 在新会话中知道"上一次干到哪了"，中断后无需从头翻阅文件。

### 与 /feat 的关系

| 命令 | 角色 | 触发时机 |
|------|------|---------|
| `/feat` | 启动新任务的工作流引擎 | 用户输入 `/feat <描述>` |
| `/catchup` | 恢复进行中任务的上下文桥 | 用户输入 `/catchup` 或新会话自动注入 |

两者互补：`/feat` 创建任务状态，`/catchup` 读取任务状态——形成完整的"创建 → 中断 → 恢复"闭环。

## 架构概览

```
/catchup
    │
    ├── 步骤 1：扫描 tasks/ 目录
    │     ├── 遍历 .self-workflow/tasks/<task-id>/ 下每个子目录
    │     ├── 读取每个 task.yaml 的 status 字段
    │     └── 按 status 分类：in_progress / stuck / cancelled / completed
    │
    ├── 步骤 2：检查 in_progress 任务的进度
    │     ├── 读取 milestones 段 → 找出 pending / in_progress 的里程碑
    │     ├── 读取 phases 段 → 确定当前阶段
    │     └── 合并为进度摘要
    │
    ├── 步骤 3：扫描未解决错误
    │     ├── 读取 .self-workflow/tasks/<task-id>/errors/errors.yaml
    │     ├── 过滤 resolved: false 的错误
    │     └── 汇总到错误清单
    │
    ├── 步骤 4：生成 Catchup 摘要
    │     ├── 按固定格式输出结构化摘要
    │     └── 摘要包含：进行中任务、未解决错误、已完成任务
    │
    └── 步骤 5：询问用户
          ├── 输出摘要后询问是否恢复某个任务
          └── 用户确认后读取对应 task.yaml 的 phases 状态继续推进
```

### 文件扫描范围

```
.self-workflow/tasks/
├── <task-id-1>/
│   ├── task.yaml              # 必读：status, phases, milestones
│   └── errors/
│       └── errors.yaml        # 必读：未解决错误
├── <task-id-2>/
│   ├── task.yaml
│   └── errors/
│       └── errors.yaml
└── ...
```

### 命令文件结构

`.opencode/commands/catchup.md` 是一个 command-instruction 文件，结构如下：

```
---
description: Session Catchup — 扫描 .self-workflow/ 中的进行中任务和未解决错误，生成恢复摘要
---

<command-instruction>
  ... 五步流程指令 ...
</command-instruction>

<user-request>
  $ARGUMENTS
</user-request>
```

- `$ARGUMENTS` 占位符被替换为用户实际输入参数
- instruction 段指定 Agent 以何种思维流程执行
- 不依赖外部 Agent 或工具——全部由主 Agent 内联完成

## 关键数据流

### 1. task.yaml 状态读取

task.yaml 是每个任务的元数据入口。`/catchup` 关注以下字段：

| 字段路径 | 用途 | 扫描规则 |
|----------|------|---------|
| `status` | 任务整体状态 | 分类到进行中/卡住/已完成/已取消 |
| `phases[].status` | 各阶段进度 | 找到最后一个 `completed` 的阶段，确定当前进度 |
| `milestones[].status` | 里程碑完成情况 | 找出 `pending` / `in_progress` 的里程碑 |
| `name` / `title` | 任务展示名 | 用于摘要 |
| `updated` | 最后更新时间 | 辅助判断时效性 |

状态映射逻辑：

```
task.status 值          → 分类
──────────────────────────────────
in_progress             → ▶ 进行中的任务
stuck                   → ▶ 进行中的任务（标注卡住）
cancelled               → ⚪ 已取消的任务
completed               → ✅ 已完成的任务
```

### 2. errors.yaml 解析

errors.yaml 位于 `.self-workflow/tasks/<task-id>/errors/errors.yaml`，结构：

```yaml
errors:
  - id: <int>             # 错误编号
    description: <str>    # 错误描述
    resolved: false       # 是否已解决
    phase: <int>          # 关联阶段
    file: <path>          # 关联文件
```

`/catchup` 过滤 `resolved: false` 的错误，汇总到摘要的"未解决错误"区段。

### 3. 输出格式

摘要按以下结构化格式输出：

```
📋 Session Catchup — {当前日期}

▶ 进行中的任务
   - {task-name}：{当前阶段/总里程碑数}，当前状态：{status}
    建议：继续 {task-name}

⚠ 未解决的错误
   - {task-id}：{错误描述} → {错误文件路径}

✅ 已完成的任务
   - {task-name}（{完成日期}）
```

### 4. 任务恢复流程

用户确认恢复某个任务后，Agent 行为：

1. 读取该任务的 `task.yaml` 的 `phases` 段，找到最后一个 `status: completed` 的阶段
2. 下一个未完成的阶段作为恢复起点
3. 读取该阶段的 artifact 文件（如 `artifacts/02-design.md`）获取上下文
4. 继续执行 `/feat` 工作流中对应 Gate 审查后的下一阶段

## 设计决策依据

### 内联执行而非独立 Agent

`/catchup` 由主 Agent 直接执行，而非调用子 Agent。原因：
- 操作单纯（只读扫描 + 格式化输出），无需独立审查链路
- 延迟敏感——用户期望快速得到摘要，不应等待 Agent 启动开销
- 无需写权限——不创建/修改任何文件

### 基于 task.yaml + errors.yaml 而非实时文件扫描

采用 task.yaml 的显式状态字段而非推断性扫描（如 git diff / 文件时间戳）：
- **确定性强**：status 字段是 Agent 在上次会话中明确写入的，不受文件修改影响
- **性能好**：只需读少量 YAML，不需遍历全部文件
- **与 /feat 共享状态**：/feat 写入的 phases 段直接被 /catchup 消费

### 摘要格式选择

结构化模板 + emoji 前缀：
- **确定性**：Agent 按格式填空，输出一致
- **可解析性**：未来可扩展为程序化解析

### 与 /feat 会话连续性

参见 `docs/实现方案/feat-工作流实现方案.md` 的"Checkpoint 机制"。

/feat 工作流的 Git tag checkpoint（`<workflow-id>-ph<N>-<name>-gate-passed`）与 /catchup 互补：
- `/catchup` 提供**逻辑层恢复**——告诉 Agent 当前 Task 的 phases 进度
- Checkpoint 提供**物理层回溯**——`git checkout <tag>` 回到任意已通过 Gate 的代码状态

两者结合：先用 `/catchup` 确定在哪里继续，再用 Checkpoint 恢复代码现场。

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本 |
