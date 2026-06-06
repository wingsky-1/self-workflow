---
title: "决策记录与治理规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance, promotion]
version: 1.1.0
summary: "何时创建 ADR、如何创建 ADR、模板选择、跨任务沉淀晋升与生命周期管理。整合原 /adr 命令的全部逻辑。"
---

# 决策记录与治理规范

## 核心原则

Agent 在执行任务时做出的**每一个关键决策**都必须记录为 ADR。决策有完整的生命周期：创建 → 引用 → 沉淀 → 废弃/更新。

---

## MUST（必须遵守）

### 何时必须创建 ADR

以下四类场景**强制**创建 ADR：

1. **架构选择**：多方案对比、trade-off 评估
2. **方向性决策**：决定项目走向的设计选择
3. **流程性决策**：影响工作流或规范的设计选择
4. **反模式纠正**：发现并对现有设计做出重大修正

---

## ADR 创建流程

Agent 按以下步骤创建 ADR，**默认 auto 模式**（自主归档），内容不足时降级为交互模式。

### Step 1：识别当前 task

扫描 `.self-workflow/tasks/` 下 `status: in_progress` 的 task，取 `started` 最近的那个。无进行中 task 则提示。

### Step 2：确定编号

扫描 `tasks/<task-id>/adrs/` 目录，取最大编号 +1，格式化为 3 位（001、002…）。目录不存在则自动创建。

### Step 3：选择模板

Agent 根据决策复杂度自行判断：

| 判断依据 | 模板文件 |
|---------|---------|
| 单一选项、理由明确 | `.self-workflow/configs/templates/adr-simple-template.md` |
| 多方案对比、trade-off | `.self-workflow/configs/templates/adr-complex-template.md` |

用 Read 工具加载对应模板，填充占位符（`<编号>`、`<标题>`、`<YYYY-MM-DD>`）。

### Step 4：填充内容

**默认 auto 模式**：Agent 自主准备完整内容（背景、决策、理由等），直接填入模板。

若上下文不足以填充必需字段 → **降级交互**：通过 `question` 工具向 Human 收集缺失字段。

### Step 5：写入文件

写入 `tasks/<task-id>/adrs/ADR-<编号>-<标题>.md`。模板中未填写的可选字段可省略。

### Step 6：更新 task.yaml

在 `structure.adrs` 列表中添加新 ADR 文件名。若 `artifacts` 不含 `adrs/`，添加该条目。

---

## ADR 生命周期

```
创建              引用              沉淀              废弃/更新
  │                 │                 │                  │
tasks/<id>/adrs/   同任务 ADR 互引    docs/关键决策/     status: superseded
                    Gate 审查一致性    Phase 5 晋升       superseded-by: 新ADR
```

### Phase 5 晋升

1. Agent 扫描本任务所有 ADR
2. 按晋升标准评估
3. `question` 工具向 Human 提议
4. Human 确认 → 写入 `docs/关键决策/`，标注 `promoted-from`

### 晋升标准

| 标准 | 门槛 |
|------|------|
| 跨任务性 | ≥2 个独立任务引用或依赖 |
| 框架级 | 涉及 `configs/` 或 `installer/` |
| 持久性 | 非临时方案 |
| 可引用性 | 其他任务需要此上下文 |

---

## 相关

- `feat-workflow.md` Phase 5 checklist — 晋升触发点 + 决策捕捉检查
- `docs/关键决策/` — 晋升目标目录
- 模板：`.self-workflow/configs/templates/adr-*-template.md`
