---
title: "决策记录规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance]
version: 1.0.0
summary: "何时必须创建 ADR、决策记录的格式与模板、跨任务决策的沉淀与生命周期"
---

# 决策记录规范

## 核心原则

Agent 在执行任务时做出的关键决策必须记录为 ADR（Architecture Decision Record），确保执行过程可追溯。跨任务的重大决策需沉淀到 `docs/关键决策/` 供后续任务复用。

## MUST（必须遵守）

### 何时必须创建 ADR

以下场景必须在当前任务 `adrs/` 目录下创建 ADR：

1. **架构选择**：涉及多方案对比、trade-off 评估的架构决策
2. **方向性决策**：决定项目走向的设计选择
3. **流程性决策**：影响工作流或规范的设计选择
4. **反模式纠正**：发现并对现有设计做出重大修正

### ADR 存储位置

- 任务级：`.self-workflow/tasks/<workflow-id>/adrs/ADR-<编号>-<标题>.md`
- 跨任务沉淀：`.self-workflow/docs/关键决策/ADR-<标题>.md`（见下方晋升规则）

### ADR 编号

- 同一任务内从 001 递增，编号独立
- 使用 `/adr` 命令自动编号

## SHOULD（建议遵守）

### ADR 模板选择

- **simple**：单一选项、理由明确 → 背景、决策、理由、关联
- **complex**：多方案对比、trade-off → 背景、备选方案（至少 2 个）、选择、理由、影响、反对意见、关联

## ADR 生命周期

### 创建
→ 任务执行中，触发 `/adr` 命令或 Agent 主动识别后创建

### 引用
→ 同一任务内 ADR 互相引用、Gate 审查时检查一致性

### 沉淀（晋升到 docs/关键决策/）
→ Phase 5（总结沉淀）时：
1. Agent 扫描任务中所有 ADR，按以下标准评估跨任务价值：
   - **跨任务性**：被 ≥2 个独立任务引用或显式依赖
   - **框架级**：修改了 `.self-workflow/configs/` 或 `packages/installer/` 的架构
   - **持久性**：非 hotfix/workaround 类临时决策
   - **可引用性**：其他任务需要此决策上下文
2. 使用 `question` 工具向 Human 提议晋升
3. Human 确认后，将 ADR 复制到 `docs/关键决策/ADR-<标题>.md`
4. 在 frontmatter 中标注 `promoted-from: <workflow-id>`

### 废弃/更新
→ 当决策不再适用时：
1. 在原 ADR frontmatter 中标注 `status: superseded`
2. 如有替代决策，在 `superseded-by` 中引用新 ADR

## 相关工具

- `/adr` 命令：自动创建 ADR，默认 auto 模式（Agent 自主归档），内容不足时降级为交互模式
- `feat-workflow.md`：每阶段完成检查清单包含"决策捕捉"和"决策声明"
