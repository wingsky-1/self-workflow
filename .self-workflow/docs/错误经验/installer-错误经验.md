---
title: "安装器模板源 vs 运行时文件"
category: 错误经验
tags: [installer, 目录职责, 自举, 三层架构]
date: 2026-06-06
source: tasks/feat-v1.5剩余问题修复-20260606
quality: draft
---

# 安装器模板源 vs 运行时文件 —— 踩坑记录

## 摘要

在修改 `feat-workflow.md` 时，Agent 直接编辑了 `.self-workflow/configs/guides/feat-workflow.md`（运行时文件），后续运行 `node packages/installer/index.js init --force` 时被 `packages/installer/templates/configs/guides/feat-workflow.md`（模板源）覆盖，修改全部丢失。

## 根因

不是安装器设计缺陷，而是 **Agent 在自举项目中未能区分"开发层"和"运行时层"**。

按 ADR-004 的三层架构：

| 层 | 目录 | 修改方式 |
|----|------|---------|
| 开发层 | `docs/`、`packages/` | 直接编辑 |
| 平台集成层 | `.opencode/` | **仅安装器** |
| 运行时层 — configs | `.self-workflow/configs/` | **仅安装器**（模板源在 `packages/installer/templates/configs/`） |
| 运行时层 — 数据 | `.self-workflow/tasks/`、`.self-workflow/docs/` | 直接编辑 |

Agent 在运行时层直接修改了安装器管理的文件——相当于改了编译产物而非源码。

## 正确做法

```
需改 .self-workflow/configs/guides/feat-workflow.md
  ↓
先改 packages/installer/templates/configs/guides/feat-workflow.md  ← 模板源
  ↓
运行 node packages/installer/index.js init --target . --force       ← 安装器同步
  ↓
验证 .self-workflow/configs/guides/feat-workflow.md 内容正确        ← 运行时文件
```

## 判断标准

修改前问自己：这个文件在 `packages/installer/templates/` 下有对应的模板源吗？

- **有** → 改模板源 → 运行安装器
- **无** → 直接改

当前 MANIFEST 覆盖的文件（参见 `packages/installer/index.js`）：
- `.opencode/agents/*` → `packages/installer/templates/agents/`
- `.opencode/commands/*` → `packages/installer/templates/commands/`
- `.opencode/skills/*` → `packages/installer/templates/skills/`
- `.self-workflow/configs/*` → `packages/installer/templates/configs/`
- `.self-workflow/specs/*` → `packages/installer/templates/specs/`

## 为什么 agent-reasoning Skill 不是放这个规则的地方

本次曾尝试在 `agent-reasoning` Skill 的 MUST 规则中加入此约束，后被纠正。

`agent-reasoning` 是通用 Skill（委托优先、上下文管理、验证结果），承载的是 **Agent 行为模式**，不应包含 **项目特定的目录结构约束**。项目约束应放在 `AGENTS.md` 或 `.self-workflow/docs/` 中。

## 自举项目的特殊性

本项目（Self-Workflow）既是开发项目又是使用项目——Agent 同时扮演开发者和用户两个角色。这意味着：

- 修改 `packages/installer/` 源码时 → 开发者角色
- 执行工作流、写经验文档时 → 用户角色
- **修改 `.self-workflow/configs/` 时 → 开发者角色**（因为它是安装器的模板产物）

Agent 容易混淆这两种角色——看到 `.self-workflow/` 就认为是"用户运行时数据"可以随意改，但 `configs/` 子目录实际上是安装器管理的"编译产物"。这是自举项目特有的认知陷阱。
