---
title: "文档受众分类规范"
type: spec
level: default
tags: [doc-audience, audience, classification, docs]
version: 1.0.0
summary: "Agent 如何分辨 .self-workflow/ 下文档的受众（Human/Agent/Both），以及按受众编写和评审文档"
---

# 文档受众分类规范

## 核心原则

Agent 在阅读、编写、评审 `.self-workflow/` 下的文档时，需先判断文档的受众——是为 Human 写的、为 Agent 写的，还是两者共读的。

## .self-workflow/ 目录受众映射表

| 目录 | 受众 | 说明 |
|------|------|------|
| `docs/` | Agent | 跨任务可复用的经验资产。Agent 在执行任务时按需查阅，通过插件注入索引到 system prompt。 |
| `specs/` | Agent | 约束 Agent 行为的规范。`default/` 下的 spec 始终生效，注入 system prompt。 |
| `tasks/<id>/` | Agent | 任务执行记录（产物、ADR、错误日志），供 Agent 查阅历史。 |
| `todo.md` | Human + Agent | 项目 todo 列表。Human 管理排期，Agent 读取并新增待办。 |

## 项目根目录文档受众

| 文件 | 受众 | 说明 |
|------|------|------|
| `AGENTS.md` | Agent | Agent 的行为指令、项目约定、Todo 体系说明。系统级上下文。 |
| `README.md` | Human | 项目介绍、设计哲学、路线图。Human 阅读了解项目。 |
| `docs/`（项目根） | Human | 项目需求、路线图、设计文档。Human 撰写和阅读。 |

## MUST（必须遵守）

### 按受众编写文档

- **面向 Agent 的文档**（`.self-workflow/docs/`、`specs/`）：
  - 必须包含 YAML frontmatter（title, category/type, tags, date/source）
  - 内容结构：背景 → 问题 → 方案 → 适用场景
  - 使用精确的技术术语，无需过度解释基础概念
- **面向 Human 的文档**（根目录 `docs/`、`README.md`）：
  - 内容结构：概述 → 使用方法 → 常见问题
  - 从使用者视角出发，解释"为什么"和"怎么用"
  - 避免过多的技术实现细节
- **面向 Both 的文档**（`todo.md`、`AGENTS.md`）：
  - 兼顾双方需求
  - 如需要，使用分段标记区分

### 按受众评审文档

| 受众 | 评审重点 |
|------|---------|
| Agent | frontmatter 完整性、tag 规范性、内容可检索性、建议的可执行性 |
| Human | 概念清晰度、使用指引完整性、示例充分性、避免技术黑话 |
| Both | 分段合理性、双方信息不冲突 |

## SHOULD（建议遵守）

- 新文档创建时，参照此规范选择正确的目录和格式
- 评审已有文档时，发现受众不匹配可提出改进建议
