---
title: "Spec 文档写法——规范而非步骤"
category: 参考模式
tags: [spec-writing, spec-style, rules-over-procedures, concise]
date: 2026-06-07
source: tasks/feat-specs结构奠基-20260606
quality: verified
---

# Spec 文档写法——规范而非步骤

## 问题

写 spec 容易陷入"复刻命令文档"的陷阱——把 `/adr` 命令的 7 步流程逐字搬进 `decision-record.md`。但 spec 是**规范**，不是操作手册。

## 规则

| 规范 | 不是 |
|------|------|
| 触发条件、存储规则、模板选择标准 | 编号递增算法、文件扫描逻辑 |
| MUST/SHOULD/MAY 分级 | Step 1→2→3→4 脚本 |
| Agent 看完知道"做什么" | Agent 需要跟着指令走 |

**好的 spec**：Agent 读完后理解规则，自行判断如何执行。
**差的 spec**：Agent 把 spec 当成脚本逐行执行，没有思考空间。

## 示例

❌ 差：`Step 1: 扫描 tasks/ 目录筛选 in_progress → Step 2: 取 max 编号 +1 → …`

✅ 好：`编号：任务内 001 递增，3 位补零。创建后同步更新 task.yaml。`

## 适用场景

撰写或修改 `specs/default/` 下任何规范文件时。
