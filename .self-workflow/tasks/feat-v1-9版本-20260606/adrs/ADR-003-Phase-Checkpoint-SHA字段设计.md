---
phase: adr
type: simple
workflow: feat
description: 在 task.yaml 的 phase schema 中新增 checkpoint 字段，记录 Gate 通过时 git tag 对应的 commit SHA
---

# ADR-003：Phase Checkpoint SHA 字段设计

## 背景

当前 task.yaml 的 phase schema 有 8 个字段（id/name/status/gate/started/completed/artifact/errors）。Gate 通过时 Agent 创建 `git tag <workflow-id>-ph<N>-<name>-gate-passed`，但 commit SHA 仅存在于 git 对象库中，task.yaml 未记录。

这导致两个问题：
1. **不可恢复**：若 git tag 意外丢失，无法从 task.yaml 反查 commit SHA 补建 tag（当前 Compound 回退靠 `git log --grep` 按提交消息查找，不可靠）
2. **不可验证**：无法快速确认"task.yaml 记录的 gate passed 与 git 中的 tag 是否指向同一 commit"

## 决策

1. 在 phase schema 中新增 `checkpoint` 字段，类型为 `string | null`
2. 初始值为 `null`（明确表达"尚未设置"语义）
3. Gate 通过后 Agent 执行 `git rev-parse <tag>` 获取 SHA，写入该字段
4. Compound 回退时，若 git tag 缺失但有 `checkpoint` 值，可用 SHA 补建 tag

**Schema 变更**：
```yaml
phases:
  - id: 1
    name: 需求分析
    status: completed
    gate: passed
    started: "2026-06-06T22:20:00+08:00"
    completed: "2026-06-06T22:30:00+08:00"
    artifact: "01-analysis.md"
    errors: []
    checkpoint: "dc8df1f"  # ← 新增字段
```

## 理由

**方案 A（采纳）**：phase 级 `checkpoint: null` 字段
- 每个 phase 有独立 gate tag，"每 phase 一个 checkpoint"是自然的建模方式
- 直接嵌入 phase 对象内，读取和维护无需跨层查找
- `null` 初始值区分"尚未设置"与"设置但为空"（后者不可能）

**方案 B（放弃）**：顶层映射对象 `checkpoints: { ph1-analysis: "sha", ... }`
- 与 phase 数组分离，需同时维护数组和映射的一致性（同步负担）
- phase 数量少且固定（5 个），无必要引入额外的映射层级

## 关联

- 关联需求：V1.9 #3 "checkpoint tag/commit ID 关联到任务阶段"
- 涉及文件：`feat-task.yaml`（模板源）、`feat-workflow.md`（Checkpoint 章节、Compound 章节）
