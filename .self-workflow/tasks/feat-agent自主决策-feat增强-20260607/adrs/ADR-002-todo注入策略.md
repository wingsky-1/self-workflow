---
id: ADR-002
status: 已选择
date: 2026-06-07
decision-makers: [Agent, Human]
workflow: feat-agent自主决策-feat增强-20260607
---

# ADR-002：todo 注入策略

## 背景

当前 todo.md 不会自动注入到 Agent 上下文。V1.11 需要在 `/feat` 工作流中让 Agent 感知 todo，但不应在普通对话中污染系统提示词。需决策注入范围和时机。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：仅 /feat command prompt 中注入 | 在 feat.md prompt 内嵌入 todo.md 读取指令 | 零侵入 Plugin；普通对话无感知 | 需 Agent 额外 Read；子 Agent 需手动传递 |
| B：Plugin 全量注入 | 在 self-workflow-session 插件中新增 scanTodo() | Agent 无需额外 Read | ❌ 普通对话中出现 todo 上下文；增加所有会话 token 开销 |
| C：Plugin 注入 + feat 条件触发 | Plugin 注入但仅在 /feat 触发时生效 | 理论上最优 | 实现复杂——Plugin 无法感知用户即将使用的命令 |

## 选择

**方案 A**（仅 /feat command prompt 中注入）

## 理由

1. Human 明确要求：普通对话不感知 todo
2. 最小改动：不修改 Plugin 代码
3. /feat command 触发时 Agent 自然获得 todo 上下文
4. 子 Agent 通过 task() 的 prompt 参数显式传递 todo 摘要

## 注入规则

| 场景 | 注入方式 | 内容 |
|------|---------|------|
| 主 Agent（普通对话） | ❌ 不注入 | — |
| /feat command 启动 | feat.md prompt 中嵌入 `Read todo.md` 指令 | Agent 按需读取 |
| /feat 工作流中的子 Agent | 主 Agent 在 task() prompt 中显式传递 | 版本号 + 未完成项编号列表（≤100 tokens） |

## 后果

- 不修改 self-workflow-session.ts Plugin
- 主 Agent 须确保 Gate 审查时子 Agent（Review Agent）获得版本 todo 上下文
- feat-workflow.md Gate 审查指令需增加"传递 todo 上下文"要求

## 关联

- 关联需求：todo 系统注入机制
- 被引用：02-design.md

> 修订记录：原设计为 Plugin 注入，经 Human 反馈改为仅 /feat 上下文注入。
