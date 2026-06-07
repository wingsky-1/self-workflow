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
