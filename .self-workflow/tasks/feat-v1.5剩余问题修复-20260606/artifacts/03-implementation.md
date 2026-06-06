---
phase: 3
workflow: feat
description: 代码实现阶段产物 — V1.5 剩余问题修复
---

# 代码实现 — V1.5 剩余问题修复

> 工作流 ID：`feat-v1.5剩余问题修复-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T18:00:00+08:00

---

## 变更清单

### M0：feat-workflow.md 修复（F1+F2+F3）

| 变更 | 行 | 内容 |
|------|-----|------|
| F1 | Gate 重量量化章节 | 新增优先级声明：量化结果覆盖声明权重 |
| F2-G1 | 分析审查 Gate 步骤2 | 新增 task() 强制调用代码块，删除逃生舱 |
| F2-G2 | 设计审查 Gate 步骤0 | 新增 task() 方向审查代码块 |
| F2-G2 | 设计审查 Gate 步骤2 | 新增 task() 对抗性审查代码块，删除逃生舱 |
| F2-G3 | 实现审查 Gate 步骤2 | 新增 task() 强制调用代码块 |
| F2-G4 | 验证审查 Gate 步骤2 | 新增 task() 强制调用代码块 |
| F3 | Phase 5 检查清单 | 拆分为 task 级/doc 级双级经验 + 双级经验说明 |

**文件**：`.self-workflow/configs/guides/feat-workflow.md`（+42 行，-28 行）

### M1：/adr 命令重构（F4+T1+T2）

| 变更 | 内容 |
|------|------|
| 用法 | `/adr <simple\|complex\|review> <标题>` → `/adr <标题>`，无类型参数 |
| 步骤3 | "根据用户指定的模板类型" → "Agent 根据决策复杂度自行判断" |
| 步骤4 | 新增默认 auto + 降级交互模式（Human 审查后修正，替代原 --auto flag 设计） |
| 输出 | `type` 字段 → `mode` 字段（auto / interactive） |

**文件**：
- `packages/installer/templates/commands/adr.md`（安装器模板源）
- `.opencode/commands/adr.md`（由安装器同步，不直接修改）

### M2：经验分级设计（T3）

**新文件**：`.self-workflow/docs/经验分级与加载指引.md`
- 三种分类定义：实施经验、参考模式、错误经验
- 渐进式披露机制：任务启动/设计阶段/遇到错误三时机的加载策略
- 文件命名约定：`<领域>-<分类>.md`
- 与 task 级经验的区分标准

### 设计修正

Human 审查后指出 `/adr` 的 `--auto` flag 设计不合理——auto 应该是默认行为（"Agent 自主归档为主路径，/adr 为兜底"）。修正为默认 auto + 内容不足时降级交互。

---

## 实现决策

无新增 ADR——3 个架构决策（AD-1 混合方案、AD-2 默认auto+降级、AD-3 文件名约定）已在设计阶段记录。

AD-2 的设计修正已在 `02-design.md` 中更新。

---

## 验证状态

| 检查项 | 状态 |
|--------|------|
| feat-workflow.md YAML 格式 | ✅ (无 YAML 内容) |
| /adr 命令参数简化 | ✅ 去掉类型参数 |
| 安装器模板同步 | ✅ 已同步 |
| T4 新会话实测 | ⏳ 阶段 4 执行（当前会话无法验证） |
