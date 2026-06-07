---
title: "决策记录与治理规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance, promotion]
version: 1.3.0
summary: "何时创建 ADR、模板选择、存储与编号规则、跨任务沉淀晋升与生命周期管理。含时间约束——Phase 2 产出涉及触发场景时，MUST 先于产物创建独立 ADR 文件。"
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

**时间约束**：当 `/feat` 工作流的 Phase 2（方案设计）产出涉及上述任一触发场景时，Agent **MUST** 在编写 `02-design.md` 前先在 `tasks/<workflow-id>/adrs/` 创建独立 ADR 文件（按下方模板选择规则）。ADR 的完整内容 MUST 在独立文件中；产物文档可保留含对比摘要的引用章节，但禁止将完整 ADR 替换产物文档的独立决策记录段。

判断流程：
1. Phase 2 产出中是否包含触发场景（架构选择/方向性决策/流程性决策/反模式纠正）？→ 是 → MUST 创建独立 ADR 文件
2. 不确定？→ 使用 `question` 工具向 Human 确认
3. 明确不涉及？→ 在 Phase 2 checklist 中显式标注"本阶段无架构决策"

### 存储结构

```
tasks/<workflow-id>/adrs/ADR-<编号>-<标题>.md  →  任务级
docs/关键决策/<标题>.md                          →  晋升后跨任务级
```

编号：任务内 001 递增，3 位补零。创建后同步更新 `task.yaml`（`structure.adrs` + `artifacts`）。

---

## 模板

Agent 按场景自行判断，读取模板填充：

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
