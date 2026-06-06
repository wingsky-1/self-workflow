---
title: ADR 与设计文档交叉一致性审查
category: 参考模式
tags: [adr, gate, 审查, 一致性, design-review]
created: 2026-06-06
related: [mem:.self-workflow/configs/guides/feat-workflow.md]
---

# ADR 与设计文档交叉一致性审查

## 问题

ADR（Architecture Decision Record）和设计文档（02-design.md）通常由同一 Agent 在不同阶段编写，容易产生 **声明层与实施层不一致**——ADR 声明了某个原则，但设计文档的实施细节违背了该原则。

## 示例（V1.9 实际案例）

ADR-001 的方案分析中明确拒绝了方案 C：

> 放入 `configs/templates/` 与阶段产物模板混放——任务模板与产物模板是不同层次的抽象

但 MANIFEST 部署路径恰好指向 `configs/templates/`，与声明矛盾。在 Gate 2 方向审查中被发现，修正为 `configs/tasks/`。

## 审查模式

设计审查时应执行 **三层交叉验证**：

| 层次 | 文件 | 检查 |
|------|------|------|
| 声明层 | `adrs/ADR-XXX-*.md` | ADR 做出了什么承诺/约束？ |
| 设计层 | `artifacts/02-design.md` | 设计是否实现了 ADR 的承诺？ |
| 实施层 | 实际代码/模板变更 | 实施是否与设计一致？ |

**关键检查点**：
- MANIFEST 条目是否与 ADR 的部署路径声明一致？
- 新增字段是否与 ADR 的 schema 定义一致？
- 删除/修改操作是否违背了 ADR 的约束（如"不覆盖定制文件"）?

## 触发条件

- Gate 2 设计审查（方向审查步骤）
- 任何涉及 ADR 变更的回溯操作
- 多人协作或跨会话的开发场景
