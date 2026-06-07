---
title: "ADR-001：Spec 文件定位 — 独立 spec vs 嵌入已有 spec"
type: adr
status: decided
date: 2026-06-07
task: "feat-todowrite-可视化-20260607"
tags: [spec, todowrite, file-structure, separation-of-concerns]
---

# ADR-001：Spec 文件定位

## 背景

todowrite 使用规范需要沉淀为项目规范。现有 `specs/default/` 下已有 `agent-reasoning.md`（委托决策）和 `interaction-protocol.md`（交互模式）两份与 todowrite 相关的 spec。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **独立 spec**：新建 `specs/default/todowrite-display.md` | 职责单一，易检索；独立版本管理 | default/ 下文件数 +1 |
| B | **嵌入 agent-reasoning** | 减少文件数 | 关注点混合，降低可读性 |
| C | **分散嵌入**：触发→agent-reasoning，展示→interaction-protocol | 规则靠近相关 spec | 需跨 3 个文件拼凑完整规则 |

## 决策

选择 **方案 A** — 独立 spec（`specs/default/todowrite-display.md`）

## 理由

- 一致原则：已有 `doc-audience`、`decision-record` 等独立 spec，符合项目模式
- 检索效率：Agent 搜 todowrite 直接命中独立文件
- 关注点分离：todowrite 行为规范自成体系

## 后果

- 正面：清晰所有权边界，未来扩展不污染其他 spec
- 负面：spec 数量 +1，Agent 多加载一份 frontmatter

## 来源

- 需求分析 `artifacts/01-analysis.md`：P0"触发时机规则"、P0"展示粒度规范"
