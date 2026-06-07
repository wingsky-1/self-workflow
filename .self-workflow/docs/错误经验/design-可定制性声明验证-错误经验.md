---
title: "设计中可定制性声明验证"
category: 错误经验
tags: [design-review, installer, 自举, manifest]
date: 2026-06-06
source: tasks/feat-先做v1-5-2的需求-20260606
quality: verified
---

# 设计中"可定制性"声明验证 —— 踩坑记录

## 摘要

V1.5.2 的 ADR-002 声称 feat-workflow.md 让"用户可定制工作流"。对抗性审查指出：该文件位于 `.self-workflow/configs/guides/`，属于安装器管理的目录——用户直接编辑会在 `init --force` 时被覆盖。ADR 需要补上"定制方式为修改模板源→运行安装器同步"的限定条件才通过 Gate 2。

## 根因

设计阶段的"可定制性"声明仅从概念层面判断（"此文件与命令入口解耦 → 用户可独立修改"），未进入部署层面的验证（"修改后会不会被安装器覆盖？"）。

**更一般的问题**：在自举项目中，Agent 设计时容易将"逻辑上可定制"等同于"实际上可安全修改"，忽略了安装器 MANIFEST 这一层运行时约束。

## 正确做法

在设计中宣称某个文件"用户可编辑/可定制"之前，执行以下检查：

```
1. 该文件在 packages/installer/index.js 的 MANIFEST 中吗？
   ├─ 是 → 它的"部署副本"会被安装器覆盖
   │       └─ 定制方式 = 修改模板源 + 运行安装器
   └─ 否 → 可以直接编辑部署文件
2. 安装器是 init（覆盖）还是 init --force（强制覆盖）？
3. 是否存在 init --keep-user-config 之类的保护模式？
   └─ 本项目无 → 必须明确标注"修改模板源→安装器同步"
```

## 修正示例

修改前（ADR-002 初稿）：
> 用户可修改阶段定义、Gate 条件、Checkpoint 规则，而不影响命令入口逻辑

修改后：
> 用户可通过修改安装器模板源 `packages/installer/templates/configs/guides/feat-workflow.md` 定制工作流，运行 `init --force` 同步。直接编辑部署副本会被安装器覆盖。完全的热定制属于 V2+ 规划。

## 适用范围

任何涉及 `.self-workflow/configs/` 或 `.opencode/` 下文件的设计决策，如果需要承诺"用户可修改"，都必须先做此安装器管理状态检查。

此经验是 `installer-错误经验` 在设计阶段的延伸——前者关注 Agent 执行时的错误（直接改了部署文件），本经验关注 Agent 设计时的盲区（假设部署文件可自由修改）。
