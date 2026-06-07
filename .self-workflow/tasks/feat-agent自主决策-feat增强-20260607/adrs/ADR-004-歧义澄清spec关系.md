---
id: ADR-004
status: 已选择
date: 2026-06-07
decision-makers: [Agent, Human]
workflow: feat-agent自主决策-feat增强-20260607
---

# ADR-004：歧义澄清 spec 与 interaction-protocol 的关系

## 背景

新增 `ambiguity-clarification` spec 要求 Agent 遇到歧义时使用 question 工具。但现有的 `interaction-protocol.md` 已有 question 使用规则。需决策：新 spec 是补充还是覆盖？

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：互补 | ambiguity-clarification 定义"何时必须问"的触发条件，interaction-protocol 定义"如何问"的执行格式 | 职责清晰；无冲突；渐进增强 | 两个 spec 同在 default/，可能有碎片化感知 |
| B：合并 | 将歧义澄清规则写入 interaction-protocol | 单文件维护 | 改动既有 spec 风险大；interaction-protocol 膨胀 |

## 选择

**方案 A**（互补）

## 理由

1. **关注点分离**：歧义检测是"何时触发"的语义问题，interaction-protocol 是"用什么工具/格式"的实现问题
2. **最小侵入**：不动已有 spec，新 spec 作为 default/ 下独立文件追加
3. **显式引用链**：ambiguity-clarification 的 frontmatter 中使用 `extends: interaction-protocol.md` 声明关系，正文首段引用块明确"执行格式遵守 interaction-protocol.md 的 question 使用规则"

## 歧义澄清 spec 的触发条件

> 补充 interaction-protocol.md 的触发条件。执行格式遵守 `interaction-protocol.md` 的 question 使用规则。

- Agent 遇到输入存在 **≥2 种合理解释** 且会导致 **≥2x 工作量差异** → **MUST** 使用 question 工具澄清，不可选择默认解释
- question 的选项应包含 2~4 个合理方案，标注工作量差异和推荐

## 后果

- 新增 `specs/default/ambiguity-clarification.md`，自动被 Plugin 注入
- 与 interaction-protocol.md 互补——不修改、不覆盖现有规则
- 两个 spec 同在 default/ 下各自维护，需注意 drift

## 关联

- 关联 spec：`interaction-protocol.md`（extends）
- 关联需求：歧义澄清 spec
- 被引用：02-design.md
