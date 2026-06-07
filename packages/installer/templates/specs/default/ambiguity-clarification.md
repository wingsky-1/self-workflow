---
title: "歧义澄清"
type: spec
level: default
tags: [ambiguity, question, clarification, interaction]
version: 1.0.0
summary: "遇到歧义输入时必须使用 question 工具澄清，不可自作主张"
extends: interaction-protocol.md
---

# 歧义澄清

> 补充 interaction-protocol.md 的触发条件。执行格式遵守 interaction-protocol.md 的 question 使用规则。

## 触发条件

Agent 遇到满足以下全部条件的输入时，**MUST** 使用 question 工具向 Human 寻求澄清：

- 输入存在 **≥2 种合理解释**
- 任何一种解释可能导致 **≥2x 工作量差异**

Agent **MUST NOT** 在满足上述条件时自行选择默认解释或假设 Human 意图。

## 示例

| 歧义输入 | 解释 A | 解释 B | 工作量差异 |
|---------|--------|--------|-----------|
| "修改配置文件" | 编辑现有 config.yaml | 创建新配置系统 | ≥3x |
| "更新用户模块" | 修改现有 UserService | 重构整个 auth 流程 | ≥5x |

## 边界

以下情况 **MAY** 不触发 question：
- 差异 <2x 且默认解释为最常见用法
- 上下文已提供足够信息消除歧义
- 用户已在近期消息中明确过偏好

## 关联

- 执行格式遵守 `interaction-protocol.md`
- 处置原则遵守 `agent-reasoning.md`
