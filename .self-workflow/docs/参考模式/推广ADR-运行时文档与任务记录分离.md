---
title: "推广 ADR 的写法——运行时文档与任务记录的分离"
category: 参考模式
tags: [adr-promotion, docs-governance, runtime-docs, separation-of-concerns]
date: 2026-06-07
source: tasks/feat-specs结构奠基-20260606
quality: verified
---

# 推广 ADR 的写法——运行时文档与任务记录的分离

## 问题

ADL 从 `tasks/<id>/adrs/` 晋升到 `docs/关键决策/` 时，容易直接复制原文——保留"V1.8 需要…""此决策超驰 ADR-008…""`/adr` 命令已废弃…"等历史语境。但 `docs/` 是**持续服务项目**的运行时文档，不需要历史叙事。

## 规则

### 推广文档的写法

- **面向未来**：描述当前规则是什么，不描述规则是怎么来的
- **精炼**：任务 ADR 可能有背景、备选方案、反对意见等完整决策过程；推广版只保留决策结论 + 适用规则
- **不提历史**：不出现"已废弃""超驰 ADR-xxx""V1 移入""从 Skill 迁移"等历史语境——这些留在任务 ADR 中

### 命名

推广文档按内容命名（如 `spec文件格式标准.md`），而非保留 `ADR-001-` 前缀。

### 前言

必须遵循 `docs/README.md` 的前言格式：`title`、`category`、`tags`、`date`、`source`、`quality`。

## 适用场景

每次 Phase 5 晋升 ADR 到 `docs/关键决策/` 时。
