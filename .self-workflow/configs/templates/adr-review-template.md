---
phase: adr
type: review
workflow: feat
description: ADR 评审结果决策模板——Review Agent 审查发现需升级为 ADR
validation:
  required-fields:
    - "背景"
    - "审查结论"
    - "决策"
    - "理由"
  required-format:
    "审查结论": "引用 Review Agent 的审查报告编号"
    "讨论记录": "至少包含 1 条讨论点"
---

# ADR-<编号>：<标题>

## 背景

<为什么需要此决策>

## 审查结论

<Review Agent 的审查发现摘要>
引用审查报告：`<审查报告文件路径>`

## 决策

<基于审查结论做出的决策>

## 理由

<决策的具体理由，引用审查报告中的发现>

## 讨论记录

- <讨论点 1>：<结论>
- <讨论点 2>：<结论>

## 影响

<决策后果>

## 关联

- 关联审查报告：<文件路径>
- 关联 ADR：<ADR-ID>
