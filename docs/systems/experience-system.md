# 经验管理系统 (Experience Management System)

> 所属模块：记忆层
> 文件位置：`.self-workflow/docs/` + `.opencode/skills/exp-governance/`
> 实现方案：`.self-workflow/docs/实现方案/exp-governance-技能实现方案.md`

---

## 功能概述

经验管理系统让 AI 在每次新会话中**自动获取过往经验**——通过 Session Plugin 注入经验库索引，Agent 按需匹配加载。5 个分类目录覆盖不同类型的经验资产，exp-governance skill 负责经验质量治理。

## 核心特性

### 1. 5 个经验分类

| 分类 | 目录 | 作用 | 受众 |
|------|------|------|------|
| **实施经验** | `实施经验/` | 实际开发中遇到的问题与解决方案 | Agent |
| **参考模式** | `参考模式/` | 跨任务复用的设计模式与约定 | Agent + Human |
| **错误经验** | `错误经验/` | 踩过的坑，错误根因和修复方式 | Agent |
| **关键决策** | `关键决策/` | 从任务 ADR 晋升的跨任务重大决策 | Agent + Human |
| **实现方案** | `实现方案/` | 项目核心特性的实现设计文档 | Agent |

### 2. 经验文档格式

每份文档以 YAML frontmatter 开头：

```yaml
---
title: "/feat 命令实施经验"
category: 实施经验
tags: [feat-command, 自举, gate]
date: 2026-06-06
source: tasks/feat-实现feat命令-20260606
quality: draft
---
```

### 3. 5 级生命周期

| 级别 | 含义 | 晋升条件 |
|------|------|---------|
| **draft** | 草稿——Phase 5 自动产出 | 工作流完成时自动标记 |
| **verified** | 已验证——经 Review Agent 审查通过 | exp-governance 审查通过 |
| **outdated** | 已过时——相关代码/设计已变更 | 关联任务完成后检测 |
| **refreshed** | 已刷新——outdated 文档已更新 | 手动/自动重新验证 |
| **archived** | 已归档——不再适用但保留记录 | 明确标记不再使用 |

### 4. exp-governance 技能

经验治理 skill 在 Phase 5 总结阶段被加载，执行：

- **去重检测**：语义级别判断新经验是否与已有文档重复（title 关键词 + tag 交集 ≥2）
- **质量评估**：frontmatter 完整性、tag 规范性（英文小写）、受众正确性
- **生命周期建议**：识别可晋升（draft→verified）、应标记过时（outdated）的文档
- **一致性审查**：中文 tag 检测、source 目录存在性校验

### 5. 双级经验模型

| 级别 | 存储位置 | 作用域 | 写入时机 |
|------|---------|--------|---------|
| **task 级** | `tasks/<id>/artifacts/05-summary.md` | 单次任务 | Phase 5 |
| **doc 级** | `.self-workflow/docs/` | 跨任务复用 | Phase 5（判断有跨任务价值时） |

### 6. 自动注入机制

Session Plugin 在 `session.created` 时扫描 `docs/` 目录，生成包含所有文档的索引（分类 + tag 列表），注入到 system prompt。Agent 在收到任务时按关键词匹配加载对应文档——**不加载全文，仅加载摘要索引**。

---

## 实现路径

### V1.5 — 双级经验模型
- task 级（05-summary.md）+ doc 级（docs/）

### V1.7 — 目录结构 + 索引注入
- 3 分类目录（实施经验/参考模式/错误经验）
- README.md 作为权威分类源
- Session Plugin 实现自动注入

### V1.16~V1.17 — 经验治理
- exp-governance skill 创建
- 5 级生命周期定义
- 去重 + 一致性审查

### V1.18 — 实现方案分类
- 新增 `实现方案/` 分类
- 9 份核心特性实现方案文档
- implementation-documentation spec

---

## 未来愿景

### V2.x — 经验复利闭环
- **Compound 自动晋升**：draft→verified 自动执行
- **经验→spec 晋升管道**：多次验证的模式自动发布为 spec/template
- **freshness 监控**：verified 文档在 source task 完成 30 天后自动标记"建议重审"
- **关系分析 Agent**：子 Agent 并行分析文档间引用/合并/互补关系

### V3.x — 平台化
- **老项目蒸馏**：已有文档转 .self-workflow/docs 格式
- **经验共享**：团队间共享经验库

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.self-workflow/docs/` | 经验库（5 个分类目录） |
| `.self-workflow/docs/README.md` | 分类定义（Plugin 自动解析） |
| `.opencode/skills/exp-governance/SKILL.md` | 经验治理技能 |
| `.self-workflow/specs/default/exp-governance.md` | 经验治理规范 |
