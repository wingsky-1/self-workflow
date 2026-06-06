---
title: "文档受众分类与编写规范"
type: spec
level: default
tags: [doc-audience, audience, classification, docs, writing]
version: 1.0.0
summary: "Agent 如何分辨 .self-workflow/ 下文档的受众（Human/Agent/Both），以及按受众编写和评审文档的规范。"
---

# 文档受众分类与编写规范

## 核心原则

`.self-workflow/` 下的每份文档都有明确的受众。Agent 在**阅读、编写、评审**文档时，必须先判断受众，再按受众视角行事。

## MUST（必须遵守）

### 受众识别

拿到 `.self-workflow/` 下任意文档时，按以下规则判断受众：

| 位置 | 受众 | 判断依据 |
|------|------|---------|
| `.self-workflow/docs/` | Agent | 跨任务经验资产，通过 Plugin 索引注入 system prompt |
| `.self-workflow/specs/` | Agent | 行为约束规范，`default/` 始终生效并注入 system prompt |
| `.self-workflow/tasks/<id>/` | Agent | 任务执行记录（产物、ADR、错误日志） |
| `.self-workflow/todo.md` | Both | Human 管理排期，Agent 读取并新增待办 |
| 项目根 `AGENTS.md` | Agent | Agent 系统级上下文指令 |
| 项目根 `README.md` | Human | 项目介绍和使用说明 |
| 项目根 `docs/` | Human | 需求文档、设计文档、路线图 |

### 按受众编写

**面向 Agent**（`.self-workflow/docs/`、`specs/`）：

docs/ 下文档的 YAML frontmatter 必须包含：

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 文档标题 | `"Spec 文件格式标准"` |
| `category` | 所属分类，与所在目录对应 | `关键决策` |
| `tags` | 英文小写，3-5 个 | `[spec-format, frontmatter]` |
| `date` | 创建日期 | `2026-06-07` |
| `source` | 来源任务 workflow-id | `tasks/feat-specs结构奠基-20260606` |
| `quality` | 成熟度 | `draft` / `verified` |

specs/ 下文档的 YAML frontmatter 使用不同字段集（`type: spec`、`level`、`version`、`summary`），见 `specs/README.md` 的格式章节。

内容结构：背景 → 问题 → 方案 → 适用场景。精确的技术术语，建议可执行。

**面向 Human**（根目录 `docs/`、`README.md`）：

- 内容结构：概述 → 使用方法 → 常见问题
- 从使用者视角出发，解释"为什么"和"怎么用"
- 避免过多的技术实现细节和内部架构描述

**面向 Both**（`todo.md`、`AGENTS.md`）：

- 兼顾双方需求
- 需要时用分段标记区分（如 `## 给 Agent` / `## 给 Human`）

### 按受众评审

| 受众 | 检查重点 |
|------|---------|
| **Agent** | frontmatter 完整？tags 规范？建议可执行？能通过关键词检索到？ |
| **Human** | 概念清晰？有使用示例？避免了技术黑话？ |
| **Both** | 分段合理？双方信息不冲突？ |

## SHOULD（建议遵守）

- 新文档创建时，按此规范的受众→目录映射选择正确的位置
- 评审已有文档时，发现受众不匹配可提出改进建议
- 不要修改已有文档的 frontmatter 来做批量受众标注——此规范是给 Agent 的**判断指引**，不是数据迁移任务
