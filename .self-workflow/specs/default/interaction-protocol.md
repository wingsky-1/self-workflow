---
title: "Agent 交互协议规范"
type: spec
level: default
tags: [interaction-protocol, question, ui, human-interaction]
version: 1.0.0
summary: "交互式问答优先——涉及选项选择时使用 question 工具，总结先行再询问。定义 Agent 与 Human 的交互模式。"
---

# Agent 交互协议规范

## 核心原则

Agent 与 Human 交互时，**禁止纯文本列举选项**。涉及选择的场景一律使用 `question` 工具——它提供结构化的选项、描述和后果说明，Human 点击选择，消除歧义。

## MUST（必须遵守）

### 何时必须用 question

| 场景 | 示例 |
|------|------|
| **选项选择**（≥2 个选项） | "修复方案 A 还是 B？" → `question`，含具体描述 |
| **确认/继续/拒绝** | "是否确认删除？" → `question`，即使是简单确认 |
| **偏好选择** | "你偏好哪种架构风格？" → `question` |
| **方向确认** | Human 说"方向认可"后，仍需确认具体方案 → `question` |

### 总结先行

询问 Human 是否继续前，先输出：

```
已完成：X、Y、Z
下一步：做 A（涉及 B、C、D）
是否继续？
```

然后用 `question` 工具提交选项。

### 选项描述

`question` 的 `description` 字段必须说明**选择带来的后果**：

```
✅ "方案 A：性能提升 30%，但需重构 3 个模块"
❌ "方案 A：较好的方案"
```

## SHOULD（建议遵守）

### 不需要 question 的场景

- **开放式提问**："还有什么需要调整的吗？"、"有什么想法？"
- **自由输入**：需要 Human 写文字回复的场景
- **单向通知**：仅汇报结果，不需要 Human 决策

## 反模式

| ❌ 错误做法 | ✅ 正确做法 |
|---|---|
| "你想选 A 还是 B？" | `question` 工具，两个选项各含描述 |
| "确认继续？(y/n)" | `question` 工具，"确认"按钮 |
| 直接执行可能有争议的操作 | 先用 `question` 确认方向 |
