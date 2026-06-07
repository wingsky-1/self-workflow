---
title: "exp-governance 技能实现方案"
category: 实现方案
tags: [exp-governance, skill, quality, lifecycle, dedup]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# exp-governance 技能实现方案

> 最后更新：2026-06-07

## 模块定位

exp-governance 是 Self-Workflow 的经验治理技能，负责审查 .self-workflow/docs/ 下所有经验文档的一致性、去重、质量和生命周期状态。

**一句话**：一套由 Skill（执行指令） + Spec（审查标准）双层构成的治理机制，确保经验库保持高质量、低冗余、可复利。

核心职责：
- 在每次 /feat 工作流的 Phase 5（总结沉淀）中，作为前置步骤审查现有经验库，防止新经验与旧经验重复
- 响应用户自然语言指令（如"审查经验"、"经验治理"），独立执行治理审查
- 输出结构化审查报告，给出晋升/降级/归档等生命周期建议，但不自动修改文档（仅建议）

## 架构概览

### 两层架构

Skill（执行指令层） + Spec（规范标准层）双层设计：

| 层次 | 文件 | 职责 | 受众 |
|------|------|------|------|
| Skill（执行指令） | .opencode/skills/exp-governance/SKILL.md | 定义 Agent 执行治理的 6 步骤流程 | Agent |
| Spec（规范标准） | .self-workflow/specs/default/exp-governance.md | 定义审查规则与标准：检查维度、判定标准、生命周期状态机 | Agent + Human |

两层的关系：Skill 引用 Spec——执行步骤中"按什么标准判断"参考 Spec。Agent 执行时需同时加载两者。

### 文件结构

`
.self-workflow/
├── docs/                                    # 受治理的经验文档库
│   ├── 实施经验/
│   ├── 参考模式/
│   ├── 错误经验/
│   ├── 关键决策/
│   └── 实现方案/
│
.opencode/skills/exp-governance/
│   └── SKILL.md                             # 治理 skill 执行指令
│
.self-workflow/specs/default/
│   └── exp-governance.md                    # 治理规范
│
.self-workflow/configs/guides/
    └── feat-workflow.md                     # Phase 5 触发点
`

### 触发入口

两种触发方式：

1. **工作流触发（Phase 5）**：/feat 工作流进入 Phase 5 时，按 feat-workflow 第 520 行引导，Agent 加载 skill(name="exp-governance") 执行治理。
2. **用户指令触发**：用户通过自然语言说"审查经验"、"经验治理"、"exp-review"等，Agent 识别意图后加载执行。

## 关键数据流

### 6 步执行流程

SKILL.md 定义 6 个连续步骤，执行顺序固定，每步产出供下一步使用：

#### 步骤 1：收集文档

扫描 .self-workflow/docs/ 下除 .gitkeep 和 README.md 外的所有 .md 文件。对每份文件解析 YAML frontmatter（title, category, tags, date, source, quality）。

输入：docs/ 目录 → 输出：文档清单（含每份文档的 frontmatter 元数据）

#### 步骤 2：一致性审查

逐项检查每份文档的 frontmatter 质量，四个维度：

| 维度 | 检查项 | 判定标准 |
|------|--------|---------|
| frontmatter 完整性 | 6 个字段全部存在且非空 | 缺失字段列出 |
| tag 规范性 | 英文小写、无同义词重复 | 与 docs/README.md 约定一致 |
| category 一致性 | category 值与所在目录名 | 完全匹配 |
| source 有效性 | source 引用的 task 目录 | 目录存在且含有效 task.yaml |

输入：文档清单 → 输出：问题清单（路径 + 问题描述 + 严重度）

#### 步骤 3：去重检测

语义判断驱动，非机械匹配。Agent 通读所有文档后，基于标题相似性、主题重叠、内容重复程度判断疑似重复对。

特别关注：无 frontmatter 的原始 ADR 副本与有 frontmatter 推广版的关系。

**关键约束**（exp-governance.md #43）：MUST NOT 依赖预定义算法阈值——去重是语义判断。

输入：全部文档内容 → 输出：疑似重复对清单（含判断维度和理由）

#### 步骤 4：质量评估

对照 Spec 定义的生命周期状态，评估每份文档的 quality 值是否合理：

| 当前 quality | 检查问题 |
|-------------|---------|
| draft | 是否已达到 verified 条件？ |
| verified | 是否已过时应降级为 outdated？ |
| outdated | 是否可刷新（→refreshed）或归档（→archived）？ |
| 缺失 quality | 应协助补充 |

输入：文档清单 + 一致性结果 → 输出：每份文档的质量评估

#### 步骤 5：生命周期建议

汇总三类建议操作：
- 建议晋升（draft → verified）：路径 + 理由
- 建议降级（verified → outdated）：路径 + 理由
- 建议归档（outdated → archived）：路径 + 理由

输入：质量评估 → 输出：可执行操作清单

#### 步骤 6：输出报告

按 Markdown 表格格式输出结构化审查报告，含：审查范围、一致性审查、去重检测、质量分布、生命周期建议、治理结论。

### 在 /feat 工作流中的位置

`
Phase 5: 总结沉淀
  ├── 编写总结（05-summary.md）
  ├── 经验治理 ←── exp-governance skill
  │     ├── 审查现有 docs/ 质量
  │     ├── 检测与新经验重复
  │     ├── 识别可晋升/过时文档
  │     └── 结果写入 05-summary.md
  ├── 经验草稿（doc 级）
  ├── 文档补充
  ├── 决策捕捉（ADR 检查）
  └── Compound 归档
`

治理排在"经验草稿"之前（feat-workflow.md #544），确保先审查已有、再写新的。

### 审查结果写入规范

按 exp-governance.md #65，审查结果 MUST 写入 Phase 5 的 05-summary.md，包含：覆盖文档数、发现的不一致项、疑似重复对及理由、建议状态变更及理由。

## 设计决策依据

### 架构层：Skill + Spec 双层设计（ADR-001）

ADR-001（feat-经验检测-沉淀质量-20260607）：经验审查采用"仅 Skill"方案，不创建独立命令。Skill 提供执行指令，Spec 提供判断标准，两者解耦。

参考：docs/实现方案/Plugin 注入机制实现方案.md——Spec 通过 Plugin 自动注入到 system prompt。

### 审查维度：单一 Skill 分节输出（ADR-002）

ADR-002（feat-经验检测-沉淀质量-20260607）：不拆分为多个子 skill，单一 exp-governance skill 按审查维度分节输出。一次扫描覆盖所有维度。

### 去重策略：Agent 语义判断（ADR-003）

ADR-003（feat-经验检测-沉淀质量-20260607）：去重依赖 Agent 语义理解，非算法阈值。Agent MUST 输出判断维度和具体理由。

与此决策对齐：docs/参考模式/ADR推广——位置与写法.md——去重特别关注原始 ADR 副本与推广版的关系。

### 生命周期与 ADR 治理对齐

经验文档生命周期（draft → verified → outdated → refreshed → archived）与 ADR 治理框架对齐。参考 specs/default/decision-record.md 的 ADR 生命周期模型以及 docs/关键决策/跨任务决策沉淀与 ADR 治理.md。

### 触发时机：Phase 5 前置检查

exp-governance 在 Phase 5 的"编写经验草稿"之前执行（feat-workflow.md #544），确保"先审查已有、再写新的"。

## 关联模块

| 模块 | 关系 | 说明 |
|------|------|------|
| /feat 工作流 | 触发者 | Phase 5 通过 skill(name="exp-governance") 调用 |
| specs/default/exp-governance.md | 规范标准 | 提供审查维度和生命周期定义 |
| docs/README.md | 格式定义 | Tag 约定、frontmatter 格式 |
| docs/关键决策/跨任务决策沉淀与 ADR 治理.md | 参考 | 晋升流程与 ADR 生命周期模型 |
| docs/参考模式/ADR推广——位置与写法.md | 参考 | ADR 推广格式规范 |
| docs/实现方案/feat-工作流实现方案.md | 同级 | /feat 工作流架构 |
| docs/实现方案/Plugin 注入机制实现方案.md | 同级 | Spec 自动注入机制 |

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；文档化 exp-governance skill 的两层架构、6 步执行流程、设计决策 |
