---
title: "决策记录与治理规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance, promotion]
version: 1.0.0
summary: "何时必须创建 ADR、决策记录格式与模板、跨任务决策的沉淀晋升与生命周期管理。"
---

# 决策记录与治理规范

## 核心原则

Agent 在执行任务时做出的**每一个关键决策**都必须记录为 ADR。决策不是一次性的——它有完整的生命周期：创建 → 引用 → 沉淀 → 废弃/更新。

## MUST（必须遵守）

### 何时必须创建 ADR

以下四类场景**强制**创建 ADR（在 `tasks/<id>/adrs/` 下）：

1. **架构选择**：涉及多方案对比、trade-off 评估
2. **方向性决策**：决定项目走向的设计选择
3. **流程性决策**：影响工作流或规范的设计选择
4. **反模式纠正**：发现并对现有设计做出重大修正

### ADR 存储

- **任务级**：`tasks/<workflow-id>/adrs/ADR-<编号>-<标题>.md`（编号从 001 递增）
- **跨任务级**：`docs/关键决策/`（Phase 5 晋升后）

使用 `/adr` 命令自动编号和创建。

## ADR 模板

模板文件位于 `.self-workflow/configs/templates/`，使用 `/adr` 命令时自动选择：

- **simple** — 单一选项、理由明确 → `adr-simple-template.md`
- **complex** — 多方案对比、trade-off → `adr-complex-template.md`

Agent 创建 ADR 时用 Read 工具加载对应模板，而非手动拼写格式。

## ADR 生命周期

```
创建              引用              沉淀              废弃/更新
  │                 │                 │                  │
tasks/<id>/adrs/   同任务 ADR 互引    docs/关键决策/     status: superseded
                    Gate 审查一致性    Phase 5 晋升       superseded-by: 新ADR
```

### Phase 5 晋升流程

每个任务的总结阶段自动触发：

1. Agent 扫描本任务所有 ADR
2. 按晋升标准评估（见下方）
3. 使用 `question` 工具向 Human 提议
4. Human 确认 → 写入 `docs/关键决策/`，标注 `promoted-from`

### 晋升标准

| 标准 | 门槛 |
|------|------|
| **跨任务性** | ≥2 个独立任务引用或依赖 |
| **框架级** | 涉及 `configs/` 或 `installer/` 的架构 |
| **持久性** | 非 hotfix/workaround 临时方案 |
| **可引用性** | 其他任务需要此上下文 |

## 相关工具

- `/adr` 命令 — 自动创建 ADR（默认 auto 模式，内容不足时降级交互）
- `feat-workflow.md` Phase 5 checklist — 晋升触发点
- `docs/关键决策/` — 晋升目标目录
