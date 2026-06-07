---
title: "Todowrite 可视化规范"
type: spec
level: default
tags: [todowrite, visualization, progress-tracking, agent-display]
version: 1.0.0
summary: "定义 Agent 何时及如何使用 OpenCode todowrite 工具展示执行进度——三层待办区分、触发时机、条目粒度、与 task.yaml/todo.md 的职责划分。"
extends: agent-reasoning.md
---

# Todowrite 可视化规范

> 定义 Agent 使用 OpenCode 内置 `todowrite` 工具的规范。todowrite 是**当前 Agent 的待办**——会话内实时追踪，不替代项目排期（`todo.md`）或跨会话状态（`task.yaml`）。

## 核心原则

本项目有三层待办机制，职责不同、不可混淆：

| 机制 | 层级 | 受众 | 生命周期 |
|------|------|------|---------|
| `todo.md` | 项目级 | Human + Agent | 跨版本、跨 Agent |
| `task.yaml` | 任务级 | Agent | 跨会话、持久化 |
| `todowrite` | Agent 级 | Human（主） | 当前会话、实时 |

**适用范围**：本规范约束 Agent 在执行 `/feat` 工作流时的 todowrite 使用行为。非 `/feat` 场景（如普通问答）建议性遵循 SHOULD 规则。已进行中的 `/feat` 任务从当前阶段起遵循，不追回创建已过阶段的条目。

## MUST（必须遵守）

### M-1：阶段入口创建条目

Agent 进入 `/feat` 工作流的任意阶段时，**MUST** 创建一条 todowrite 条目。

条目内容格式：`Phase N：[阶段名称] — [核心目标]`

示例：
- `Phase 1：需求分析 — 理解需求、识别约束、定义验收标准`
- `Phase 3：代码实现 — 编写 spec 文件并通过 lint/typecheck`

### M-2：Gate 完成更新状态

当 Gate 审查通过且 checkpoint tag 已创建后，Agent **MUST** 将当前阶段条目标记为 `completed`，并创建下一条目（即将进入的阶段）。

如果 Gate 失败（返回修复），Agent **MUST NOT** 更新条目状态——保持 `in_progress`，修复完成后 Gate 再次通过时再标记 `completed`。

### M-3：子 Agent 委托标记

主 Agent 委托子 Agent 执行预计耗时 >30 秒的任务时，**MUST** 在 todowrite 中创建一条条目：

- 委托发出时：创建条目，状态 `in_progress`，内容描述委托任务（如 `调用 Review Agent 审查设计文档`）
- 子 Agent 返回成功：条目状态更新为 `completed`
- 子 Agent 返回失败：条目状态更新为 `cancelled`，内容补充失败原因

此模式仅创建一次条目、在子 Agent 返回时更新一次——**MUST NOT** 轮询子 Agent 中间进度或反复修改条目内容。遵守 `agent-reasoning.md` 的委托规则。

注意：OpenCode 平台中每个 Agent 拥有独立的 todowrite 空间，子 Agent 的条目不影响主 Agent。本规范仅约束主 Agent 的行为。

#### M-3.1：子 Agent 返回多事项处理

当子 Agent 返回的结果包含多项待处理事项（如 Review Agent 返回 1 个 critical + 3 个 warning）时，主 Agent **MUST** 在 todowrite 中逐项创建条目，展示处理进度：

- 首先将原委托条目标记为 `completed`
- 为每个待处理的 actionable item 创建一条条目（状态 `pending`）
- 逐项处理时标记 `in_progress` → `completed`

示例：
```
completed: 调用 Review Agent 审查设计文档
completed: 修复 critical：task.yaml structure.adrs 同步
in_progress: 修复 warning：ADR-002 补充 trade-off
pending: 修复 warning：ADR-003 补充失败场景
```

此规则确保 Human 能看到"审查结果正在被逐项处理"而不仅仅是"审查完成"。

### M-4：不混淆 todo.md

Agent **MUST NOT** 将 todowrite 用于项目排期管理。以下行为禁止：

- ❌ 将 todowrite 条目直接复制到 `todo.md`
- ❌ 在 todowrite 中规划未来版本的待办项
- ❌ 用 todowrite 替代 `todo.md` 的"新增（待评审排期）"章节

### M-5：总结对齐

当 Agent 按 `interaction-protocol.md` 执行"总结先行"时，todowrite 条目状态 **MUST** 与总结内容一致：

- "已完成"列表中的任务项 → todowrite 中对应条目为 `completed`
- "下一步"描述的任务 → todowrite 中有一条 `in_progress` 条目与之对应

## SHOULD（建议遵守）

### S-1：关键节点粒度

Agent **SHOULD** 仅在流程转折点创建条目，而非每次工具调用。建议创建条目的节点：

| 触发事件 | 创建条目？ |
|---------|-----------|
| 进入新 Phase | ✅ MUST |
| Gate 审查启动 | ✅ MUST |
| 子 Agent 委托（>30s） | ✅ MUST |
| 子 Agent 返回（更新状态） | ✅ MUST（详见 M-3） |
| 子 Agent 返回失败 | ✅ MUST — 标记 cancelled，注明原因 |
| 子 Agent 返回多事项（详见 M-3.1） | ✅ MUST — 逐项创建条目 |
| 阶段内长时间无进展（>10 分钟） | ✅ SHOULD（创建"阻塞中"条目） |
| Gate 内多轮修复（同 Gate 回溯修复） | MAY — 首次创建，后续不重复 |
| 每次文件编辑 | ❌ 过细 |
| 中间工具调用（read/grep） | ❌ 属子 Agent 内部操作 |

### S-2：条目信息量

每条 todowrite 条目 **SHOULD** 包含足够信息量（≥10 字），让 Human 无需额外解释即可理解当前进度。避免无信息的条目如"做 Phase 1"。

### S-3：引用 todo.md 项

当 todowrite 条目涉及 `todo.md` 中的具体版本任务项时，**SHOULD** 以 `[<todo项描述>]` 格式引用，使关联可追溯。

示例：`已完成 [todowrite 使用模式设计] — 触发时机、粒度、职责划分规则已写入 spec`

## MAY（可选）

### MAY-1：跨会话重建

新会话中，Agent **MAY** 基于 `task.yaml` 的 phases 状态重建 todowrite 条目。重建规则：

- 跳过 status=completed 的 phase → 不创建条目
- 当前 in_progress 的 phase → 创建条目（内容参考 phase.name 和 artifact）
- 后续 pending 的 phase → 创建条目（状态 pending）

### MAY-2：批次更新

Gate 通过后，Agent **MAY** 将关联的多条子条目批量标记为 `completed`（而非逐条更新）。

## 反模式

| ❌ 错误做法 | ✅ 正确做法 |
|---|---|
| 一条 todo "做 Phase 3" 持续 30 分钟 | 创建有意义的条目："Phase 3：编写 spec 文件 — 含 triggering/granularity/isolation 规则" |
| Gate 失败后标记 completed | 保持 in_progress，修复后 Gate 通过再标记 |
| 把 todowrite 条目内容复制到 todo.md 的新增章 | 两套机制独立：todowrite 追踪执行，todo.md 管理排期 |
| 不创建 todowrite，等最后批量补齐 | 实时创建，每步标记——批量补齐等同于没有 todowrite |

## 关联

- 委托规则遵守 `agent-reasoning.md`
- 交互格式遵守 `interaction-protocol.md`
- 决策记录遵守 `decision-record.md`
