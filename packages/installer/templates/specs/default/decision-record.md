---
title: "决策记录与治理规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance, promotion]
version: 1.2.0
summary: "何时创建 ADR、模板选择、存储与编号规则、跨任务沉淀晋升与生命周期管理。"
---

# 决策记录与治理规范

## 核心原则

关键决策必须记录为 ADR，贯穿完整生命周期。

---

## MUST

### 触发条件

以下任一场景必须创建 ADR：

- **架构选择** — 多方案对比、trade-off
- **方向性决策** — 决定项目走向
- **流程性决策** — 影响工作流或规范的规则
- **反模式纠正** — 对现有设计做大修正

### 存储结构

```
tasks/<workflow-id>/adrs/ADR-<编号>-<标题>.md  →  任务级
docs/关键决策/<标题>.md                          →  晋升后跨任务级
```

编号：任务内 001 递增，3 位补零。创建后同步更新 `task.yaml`（`structure.adrs` + `artifacts`）。

---

## 模板

`/adr` 命令已废弃。Agent 按场景自行判断，读取模板填充：

| 场景 | 模板 |
|------|------|
| 单一选项、理由明确 | `configs/templates/adr-simple-template.md` |
| 多方案对比、trade-off | `configs/templates/adr-complex-template.md` |

默认 auto 模式（自主填入），上下文不足时降级为 `question` 交互。

---

## 生命周期

```
创建 → 引用（同任务互引 + Gate 审查） → 沉淀（Phase 5 晋升） → 废弃/更新
```

- **晋升**：Phase 5 时 Agent 按标准评估，`question` 提议，Human 确认后写入 `docs/关键决策/`
- **晋升标准**：跨任务（≥2 引用）、框架级（涉及 configs/installer）、持久（非临时）、可引用
- **废弃**：标注 `status: superseded` + `superseded-by`

---

## 相关

- `feat-workflow.md` — 每阶段决策捕捉 + Phase 5 晋升触发
- `docs/关键决策/` — 晋升目标
- 模板：`configs/templates/adr-*-template.md`
