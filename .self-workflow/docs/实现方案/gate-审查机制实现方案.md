---
title: "Gate 审查机制实现方案"
category: 实现方案
tags: [gate, review-agent, adversarial-review, quantification, checkpoint]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# Gate 审查机制实现方案

> 最后更新：2026-06-07

## 模块定位

Gate 是 /feat 工作流的质量关口——每阶段完成后必须通过审查才能进入下一阶段。审查由 review-agent（`.opencode/agents/review-agent.md`）以对抗性立场执行。

**一句话**：在 Agent 进入下一阶段前，由独立审查 Agent 挑战当前产出。

## 架构概览

```
阶段 N 完成
    │
    ▼
Gate 入口：量化 scope+risk+user-signal → weight (skip/light/full)
    │
    ├── weight=skip ──→ 跳过所有审查，直接通过
    │
    ├── weight=light ──→ 仅程序化验证（lint/typecheck/test）
    │
    └── weight=full ──→ 完整审查：
         ├── 步骤 0：方向审查（仅 Gate 2）
         ├── 步骤 1：程序化验证
         ├── 步骤 2：对抗性审查（review-agent）
         └── 步骤 3：人工确认（Gate 1/2）
              │
              ▼
         通过 → Git tag checkpoint → 进入阶段 N+1
         不通过 → 返回阶段 N 修复
```

### 各 Gate 审查内容

| Gate | 方向审查 | 程序化验证 | 对抗性审查 | 人工确认 |
|------|---------|-----------|-----------|---------|
| Gate 1（分析） | — | 跳过 | ✅ 需求完整性 | ✅ 需要 |
| Gate 2（设计） | ✅ 架构一致性 | 跳过 | ✅ Grill 风格 + behavior | ⚠️ 可选 |
| Gate 3（实现） | — | ✅ lint/typecheck/test | ✅ 设计一致性 | ❌ |
| Gate 4（验证） | — | ✅ 完整测试套件 | ✅ 验证真实性 | ❌ |

## 关键数据流

### review-agent 调用流程

```
主 Agent 在 Gate 入口
    │
    ├── 计算 weight
    ├── 如 weight=full → 调用 review-agent
    │   task(subagent_type="review-agent", prompt="...")
    │
    ▼
review-agent 读取 artifacts/ + adrs/
    │
    ├── 审查（Grill 风格）
    ├── 输出 YAML 审查报告
    │
    ▼
主 Agent 根据报告决定：通过/修复
```

### review-agent 能力边界

- ✅ 读取项目文件（read/glob/grep）
- ❌ 不能编辑代码
- ❌ 不能执行 bash
- 输出 YAML 格式报告（含 severity + behavior 维度）

### non-blocking 检查

2026-06 新增的"实现方案文档决策"检查：
- 当 Gate 2/3 weight=full 时，review-agent 额外检查 Agent 是否对实现方案文档做了显式决策
- 非阻断（warning 级别）
- 当 Gate weight=skip 时，Compound 步骤 4.5 作为兜底

## 设计决策依据

- `docs/关键决策/对抗性审查提示词-Grill+COT策略.md`
- `docs/错误经验/gate-推理链一致性-错误经验.md`
- `docs/错误经验/phase-gate-验证不能形式化.md`

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；review-agent 新增实现方案文档决策检查维度 |
