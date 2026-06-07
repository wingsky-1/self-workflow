---
phase: 2
workflow: feat
description: 方案设计阶段产物
validation:
  required-fields:
    - "架构决策"
    - "接口设计"
    - "数据模型"
    - "实现计划"
---

# 方案设计 — V1.18：核心特性实现方案

> 工作流 ID：`feat-核心特性-实现方案-文档化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T23:40:00+08:00

---

## 架构决策

### ADR-001：独立 spec 而非嵌入 feat-workflow

见 `adrs/ADR-001-独立spec-而非嵌入feat-workflow.md`。
**结论**：创建独立 spec，Plugin 注入到所有 Agent。

---

## 总体设计

```
┌──────────────────────────────────────────────────┐
│  specs/default/implementation-documentation.md   │ ← 新建 spec（权威引导源）
│  "何时创建/更新实现方案文档"规则                     │    Plugin 注入所有 Agent
└─────────────────────┬────────────────────────────┘
                      │ 引用
┌─────────────────────▼────────────────────────────┐
│  feat-workflow.md (Phase 2/3/5 检查清单)          │ ← 微调（3 处各 +1 行引用）
│  "详见 specs/default/implementation-documentation" │
└─────────────────────┬────────────────────────────┘
                      │ 兜底检查
┌─────────────────────▼────────────────────────────┐
│  review-agent.md (Phase 2/3 Gate prompt)          │ ← 微调（non-blocking 检查）
│  "审查 Agent 是否对实现方案文档做了显式决策"         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  docs/实现方案/                                    │ ← 新建目录 + 示范文档
│  ├── installer-系统实现方案.md                      │    + .gitkeep (installer 模板)
│  ├── plugin-注入机制实现方案.md                     │
│  ├── feat-工作流实现方案.md  (P1)                   │
│  └── gate-审查机制实现方案.md (P1)                  │
│                                                   │
│  configs/templates/implementation-plan-template.md │ ← 新建文档模板
│  docs/README.md (分类 + 使用指南更新)               │ ← 微调
└──────────────────────────────────────────────────┘
```

---

## 各组件详细设计

### 1. 新 spec：`implementation-documentation.md`

**位置**：`packages/installer/templates/specs/default/implementation-documentation.md`
**部署到**：`.self-workflow/specs/default/implementation-documentation.md`
**level**：`default`（始终注入所有 Agent session）

**内容结构**：

```markdown
---
title: "实现方案文档引导"
type: spec
level: default
tags: [implementation-documentation, design-docs, agent-guidance, doc-lifecycle]
version: 1.0.0
summary: >
  定义 Agent 何时应创建/更新 docs/实现方案/ 下的文档——
  记录时机、更新时机、判断标准、决策输出格式。
---

# 实现方案文档引导

## MUST（必须遵守）

- **MUST-1**：当 Phase 2 设计中定义了 ≥2 个模块的接口或数据流时，必须评估是否需要创建实现方案文档。评估结论必须显式输出（创建/跳过+理由）
- **MUST-2**：当 Phase 3 实现修改了已有模块的对外接口时，必须检查 `docs/实现方案/` 中是否有对应文档需要同步更新。决策必须显式输出（更新/跳过+理由）
- **MUST-3**：决策输出必须出现在阶段产物（artifact）或对话中，确保 Gate 审查和 Compound 审计可追溯

## SHOULD（建议遵守）

- **SHOULD-1**：判断是否为"关键特性"的信号：影响范围 ≥2 个模块、定义了新接口或契约、后续 Agent 开发类似功能时会需要理解该设计
- **SHOULD-2**：无法判断时，使用 question 工具询问 Human——"我认为 XXX 可能涉及关键特性，是否需要在 `docs/实现方案/` 中创建/更新对应文档？"

## 与其他文档分类的关系

- **实现方案 vs 实施经验**：方案描述"当前设计"，经验记录"开发过程中学到的东西"
- **实现方案 vs ADR**：方案的设计决策依据节引用 ADR 路径，不重复 ADR 内容
- **变更记录 vs 实施经验**：变更记录仅记"改了什么"（日期+任务+变更摘要），设计理由写入 ADR

## 实现方案文档模板

见 `configs/templates/implementation-plan-template.md`。
```

**注入方式**：Plugin 的 session.inject 机制将 `specs/default/*.md` 的**索引摘要**（文件名 + tags + summary）注入 system prompt。Agent 通过索引发现 spec 后，按需要 Read 全文。引导机制的实际工作路径为：`Phase 2/3/5 检查清单引用 spec → Agent Read 全文 → 执行引导`。无需修改 Plugin 代码逻辑。

---

### 2. feat-workflow.md 微调

在 3 个阶段的检查清单中各增加 1 行引用（不增加大段文字，避免清单疲劳）：

**Phase 2 完成检查清单**（行 190 附近）新增：
```markdown
- [ ] **实现方案文档**：本阶段是否涉及关键特性新设计？如是，按 `specs/default/implementation-documentation.md` 引导创建或更新 `docs/实现方案/` 文档
```

**Phase 3 完成检查清单**（行 308 附近）新增：
```markdown
- [ ] **实现方案文档**：本次修改是否影响已有实现方案文档？如是，按 `specs/default/implementation-documentation.md` 同步更新
```

**Phase 5 完成检查清单**（行 530 附近）新增：
```markdown
- [ ] **实现方案文档**：确认本次任务引入/修改的关键特性已在 `docs/实现方案/` 中记录或更新
```

---

### 3. review-agent.md 微调

在 Phase 2 Gate 审查 prompt（设计审查）和 Phase 3 Gate 审查 prompt（实现审查）中增加 non-blocking 检查项：

**Phase 2 Gate prompt 新增**：
```
6. 实现方案文档决策：Agent 是否对实现方案文档（创建/跳过/询问用户）做了显式输出？
   - 如未输出任何决策 → warning
   - 如输出"跳过"，但 artifacts/02-design.md 中明确列出了 ≥2 个模块/组件的接口设计 → warning
```

**Phase 3 Gate prompt 新增**：
```
6. 实现方案文档决策：Agent 是否对实现方案文档（更新/跳过/询问用户）做了显式输出？
   - 如修改了已有模块的接口但未更新对应实现方案文档 → warning
```

---

### 4. docs/README.md 更新

1. **分类定义段**新增：
```markdown
### 实现方案/
项目核心特性的实现设计文档——模块架构、数据流、设计决策依据。创建于设计阶段（Phase 2），随代码变更同步更新。
```

2. **"沉淀经验"段**新增实现方案文档的创建时机说明（≥ 3 句）。

---

### 5. 实现方案文档模板

**位置**：`packages/installer/templates/configs/templates/implementation-plan-template.md`
**部署到**：`.self-workflow/configs/templates/implementation-plan-template.md`

```markdown
---
title: "<模块名> 系统实现方案"
category: 实现方案
tags: []
date: <YYYY-MM-DD>
source: tasks/<workflow-id>
quality: draft
---

# <模块名> 系统实现方案

> 最后更新：<YYYY-MM-DD>

## 模块定位

<此模块在系统中的角色和职责>

## 架构概览

<模块内部结构、与其他模块的关系>

## 关键数据流

<数据如何在模块间流转>

## 设计决策依据

<引用的 ADR 路径，不重复 ADR 内容>

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| - | - | 初始版本 |
```

---

### 6. installer 变更清单

| 操作 | 文件 | 类型 |
|------|------|------|
| 新建 | `templates/specs/default/implementation-documentation.md` | spec |
| 新建 | `templates/docs/实现方案/.gitkeep` | 目录骨架 |
| 新建 | `templates/configs/templates/implementation-plan-template.md` | 模板 |
| 更新 | `templates/docs/README.md` | 分类 + 使用指南 |
| 更新 | `templates/configs/guides/feat-workflow.md` | 3 处引用 |
| 更新 | `templates/agents/review-agent.md` | 2 处 non-blocking 检查 |
| 更新 | `installer/index.js` (MANIFEST + EMPTY_DIRS) | 部署条目 |

---

## 实现计划

### 阶段 3a：模板源修改（先改 templates/）

1. 新建 `templates/specs/default/implementation-documentation.md`
2. 新建 `templates/docs/实现方案/.gitkeep`
3. 新建 `templates/configs/templates/implementation-plan-template.md`
4. 更新 `templates/docs/README.md`
5. 更新 `templates/configs/guides/feat-workflow.md`
6. 更新 `templates/agents/review-agent.md`
7. 更新 `installer/index.js`（MANIFEST + EMPTY_DIRS）

### 阶段 3b：运行同步

```
node packages/installer/index.js init --target . --force
```

### 阶段 3c：自举示范文档（直接写入 .self-workflow/docs/）

8. 创建 `docs/实现方案/installer-系统实现方案.md`
9. 创建 `docs/实现方案/plugin-注入机制实现方案.md`
10. 创建 `docs/实现方案/feat-工作流实现方案.md`（P1）
11. 创建 `docs/实现方案/gate-审查机制实现方案.md`（P1）

### 阶段 3d：Compound 兜底

在 Compound 步骤 4（文档变更审查）中增加兜底检查项，覆盖 Gate weight=skip 时 review-agent 未被调用的盲区：

```markdown
- [ ] 实现方案文档决策审计：扫描本任务 artifacts/ 和 adrs/，检查是否有涉及关键特性新设计/修改的场景，确认 Agent 是否做了显式决策（创建/更新/跳过+理由）。如未发现决策输出，记录为 error（minor, compound-recovery）
```

---

## 设计约束说明

### 接口设计

本任务不涉及新接口定义。各组件间的交互方式：
- spec ↔ Plugin：通过文件系统（spec 写入 `specs/default/`，Plugin 读取并注入索引）
- feat-workflow.md ↔ spec：通过文件路径引用（检查清单 → Read spec 全文）
- review-agent ↔ Agent 决策：通过 artifacts 文件中的显式决策输出文本

### 数据模型

本任务不涉及新数据结构。所有变更均为文件级操作（新建/编辑 .md、.yaml、.js 文件）。

### docs/README.md 管理方式说明

`docs/README.md` 在 installer MANIFEST 中（index.js:60）作为模板文件管理。`init --force` 会用模板内容覆盖目标文件。本设计仅更新模板源（`templates/docs/README.md`），同步后覆盖部署副本。如需自定义 README.md 分类定义，建议修改模板源后同步——遵循 installer 的"模板源是唯一权威源"原则。

---

## 决策声明

- [x] ADR 已创建，见 `adrs/ADR-001-独立spec-而非嵌入feat-workflow.md`
