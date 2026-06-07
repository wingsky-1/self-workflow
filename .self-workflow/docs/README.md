# Self-Workflow 经验文档

本目录存放跨任务可复用的经验资产。Agent 在新会话启动时自动获取本目录的文档索引（目录用途 + 各文件 tag 列表），根据任务关键词按需匹配加载。

## 如何使用

### 查找经验

根据任务主题在下方"分类定义"段中查找对应标签，用 Read 工具查看具体文档。

### 沉淀经验

在任务总结阶段（Phase 5），如果产出了跨任务可复用的经验：

1. 在对应分类目录下创建新文件，命名：`{领域}-{分类}.md`
2. 填写 YAML frontmatter（见下方"文档格式"）
3. 内容建议包含：背景、问题、方案、适用场景

### 创建实现方案文档

实现方案文档描述项目的关键特性设计（而非事后经验）。创建时机在**设计阶段（Phase 2-3）**：
- 当设计中定义了 ≥2 个模块的接口或数据流时
- 当 Agent 不确定是否需要创建时，应使用 question 工具询问 Human
- 格式见 `configs/templates/implementation-plan-template.md`
- 详细引导见 `specs/default/implementation-documentation.md`

### 新增分类

如需新增经验分类：

1. 在 `docs/` 下创建新目录，放入 `.gitkeep` 或文档
2. 在本文件底部的"分类定义"段中新增 `### 新分类名/` 条目，并写一行描述
3. Agent 会在下次会话自动识别新分类

## 文档格式

每份文档以 YAML frontmatter 开头：

```
---
title: "/feat 命令实施经验"
category: 实施经验
tags: [feat-command, 自举, gate]
date: 2026-06-06
source: tasks/feat-实现feat命令-20260606
quality: draft
---
```

| 字段 | 说明 |
|------|------|
| `title` | 文档标题（可选，缺失则用文件名） |
| `category` | 所属分类，与所在目录对应 |
| `tags` | 关键词标签，Agent 用于匹配。英文小写优先，3-5 个为佳 |
| `date` | 创建日期 |
| `source` | 来源任务 workflow-id |
| `quality` | 成熟度（draft / verified / outdated / refreshed / archived） |

## Tag 约定

- 统一英文小写（`feat-command` 而非 `Feat-Command`）
- 技术术语用英文（`gate`, `installer`, `plugin`），中文仅用于领域特有名詞（`自举`）
- 同类概念使用同一 tag，避免歧义（不要同时用 `V1.5` 和 `v1.5`）
- 涉及特定命令/模块的，使用 `领域:主题` 格式（如 `feat-command`）

---

## 分类定义

> ⚠️ 以下 `### 目录名/` 条目被 Plugin 自动解析。新增分类目录后在此处添加对应条目。

### 实施经验/
实际开发中遇到的问题与解决方案，来自特定任务的执行记录。

### 参考模式/
跨任务复用的设计模式与约定，不止于某一任务的通用经验。

### 错误经验/
踩过的坑，记录错误根因和修复方式，避免重复犯错。

### 关键决策/
跨任务的重大决策记录——从任务 ADR 中晋升，供 Agent 持续查阅引用。

### 实现方案/
项目核心特性的实现设计文档——模块架构、数据流、设计决策依据。创建于设计阶段（Phase 2-3），随代码变更同步更新。详细引导见 `specs/default/implementation-documentation.md`。
