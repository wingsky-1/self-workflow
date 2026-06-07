---
title: "ADR-003：子 Agent todowrite 隔离策略"
type: adr
status: decided
date: 2026-06-07
task: "feat-todowrite-可视化-20260607"
tags: [todowrite, subagent, isolation, delegation]
---

# ADR-003：子 Agent todowrite 隔离策略

## 背景

OpenCode 平台中每个 Agent 拥有独立的 todowrite 空间——子 Agent 的条目不会影响主 Agent。需要确定 spec 如何约束双方行为。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **禁止子 Agent 使用** | 主 Agent 完全可控 | 过度限制，与平台能力矛盾 |
| B | **子 Agent 自由使用** | 尊重平台隔离 | 格式可能不一致 |
| C | **主 Agent 标记委托**：主 Agent 创建委托条目（in_progress→completed），子 Agent 不受本 spec 约束 | 职责清晰，与 agent-reasoning 一致 | 主 Agent 不知子 Agent 中间进度 |

## 决策

选择 **方案 C** — 主 Agent 标记委托

## 理由

- 与 `agent-reasoning.md` 一致："委托后等结果即可，不需要中间状态更新"
- 平台事实：子 Agent 的 todowrite 空间独立，主 Agent 无法读取
- Human 可见性：主 Agent 条目中"等 Review Agent 返回"比空白更有信息量
- Human 确认：用户明确"子Agent有自己的todo 不会影响主Agent"

## 后果

- 正面：主 Agent todowrite 始终反映"我当前的状态"，无子 Agent 干扰
- 负面：子 Agent 的 todowrite 行为无规范约束，留待 V2.x 子 Agent 架构统一

## 来源

- 需求分析：P1"子 Agent 协调中的 todowrite"
- agent-reasoning spec：委托后不轮询原则
- Human 确认：Phase 2 质疑报告后的方向确认
