---
title: "/feat 工作流实现方案"
category: 实现方案
tags: [feat-command, workflow, phase-gate, compound, checkpoint]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: verified
---

# /feat 工作流实现方案

> 最后更新：2026-06-07

## 模块定位

`/feat` 命令（`commands/feat.md`）是 Self-Workflow 的核心工作流引擎。工作流规则定义在 `configs/guides/feat-workflow.md`。

**一句话**：6 阶段(含 Phase 4.5) + 4 Gate + Compound 归档——引导 Agent 从需求到总结走完完整开发周期。

## 架构概览

```
/feat <描述>
    │
    ├── 步骤 0-5：前置检查 → 参数解析 → 目录初始化 → task.yaml → errors.yaml
    │
    ▼
阶段 1: 需求分析 ──→ [Gate/量化] ──→ 阶段 2: 方案设计 ──→ [Gate/量化] ──→
阶段 3: 代码实现 ──→ [Gate/量化] ──→ 阶段 4: 功能验证 ──→ [Gate/量化] ──→
阶段 4.5: 相关文档同步 ──→ 阶段 5: 总结沉淀 ──→ Compound（自动归档）
```

### 文件结构

```
.self-workflow/tasks/<workflow-id>/
├── task.yaml              # 任务元数据（含 phases 段 + status）
├── adrs/                  # 决策记录（per-task 编号）
├── logs/                  # 实施记录
├── artifacts/             # 阶段产物（01~05）
├── errors/                # 错误日志（errors.yaml + 阶段错误）
```

## 关键数据流

### Gate 重量量化

每个 Gate 入口计算三维分值决定审查强度：

| 维度 | 条件 | 分值 |
|------|------|------|
| scope | single-file / multi-file / cross-module | -1 / 0 / +1 |
| risk | typo-config / logic-change / architecture | -1 / 0 / +1 |
| user-signal | quick-mode / default / full-review | -1 / 0 / +1 |

总分 → weight：≤-1=skip, 0=light, ≥1=full

### Checkpoint 机制

每 Gate 通过后创建 Git tag：
```
<workflow-id>-ph<N>-<name>-gate-passed
```

支持回溯：`git checkout <tag>` 回到任意已通过的 Gate。

### Git-based 多会话开发

`git worktree` 支持不同 worktree 处理不同任务。

## 设计决策依据

- ADR-001（本次任务）：实现方案文档引导选择独立 spec 而非嵌入工作流
- `docs/关键决策/spec上下文注入架构.md`：Plugin 注入 spec/docs 的架构决策

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；Phase 2/3/5 各增 1 行实现方案文档检查项 |
| 2026-06-07 | feat-feat流程修补-todo整理-20260607 | v0.5: Phase 4.5 added (Gate 4→Phase 5 doc sync step), Compound step 5 upgraded to MUST |
