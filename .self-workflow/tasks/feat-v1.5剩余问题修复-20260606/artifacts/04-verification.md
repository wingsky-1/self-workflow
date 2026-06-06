---
phase: 4
workflow: feat
description: 功能验证阶段产物 — V1.5 剩余问题修复
---

# 功能验证 — V1.5 剩余问题修复

> 工作流 ID：`feat-v1.5剩余问题修复-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T18:15:00+08:00

---

## 验收标准逐条验证

### F1：Gate 权重优先级声明

| AC | 描述 | 结果 |
|----|------|------|
| AC-F1-1 | feat-workflow.md 包含优先级声明 | ✅ 第 342 行："量化结果覆盖声明权重。附录 Gate 速查表中的 weight 列仅为典型场景默认值" |
| AC-F1-2 | Agent 按量化结果执行而非声明权重 | ✅ 本次工作流中设计审查 Gate scope=+1, risk=0, user-signal=0 → 总分=1 → full，正确按量化执行 |

### F2：Review Agent 强制调用

| AC | 描述 | 结果 |
|----|------|------|
| AC-F2-1 | Gate 1 含 task() 调用 | ✅ 分析审查步骤 2 含 `task(subagent_type="review-agent", prompt="审查需求分析文档...")` |
| AC-F2-2 | Gate 2 步骤 0+2 含 task() 调用 | ✅ 方向审查 + 对抗性审查两处各含 task() 调用 |
| AC-F2-3 | Gate 3 含 task() 调用 | ✅ 实现审查步骤 2 含 task() 调用 |
| AC-F2-4 | Gate 4 含 task() 调用 | ✅ 验证审查步骤 2 含 task() 调用 |
| 计数 | 共 5 处 task() 调用 | ✅ grep 确认为 5 处 |

### F3：双级经验模型

| AC | 描述 | 结果 |
|----|------|------|
| AC-F3-1 | task 级经验检查项 | ✅ Phase 5 清单："task 级经验：artifacts/05-summary.md 含本次得与失" |
| AC-F3-2 | doc 级经验检查项 | ✅ Phase 5 清单：含判断标准（框架缺陷？推广模式？新机制？）→ 写入 .self-workflow/docs/ |

### F4+T1+T2：/adr 命令重构

| AC | 描述 | 结果 |
|----|------|------|
| AC-F4-1 | 无 simple\|complex\|review 类型参数 | ✅ grep 确认安装器模板中"simple\|complex\|review"已移除 |
| AC-F4-2 | 默认 auto + 降级交互 | ✅ 步骤 4："默认模式：Agent 自主归档...内容不足 → 降级为交互模式" |
| AC-F4-3 | per-task 编号 | ✅ 步骤 2 未变更：max(existing IDs) + 1，三位格式 |
| AC-F4-4 | 安装器模板同步 | ✅ packages/installer/templates/commands/adr.md 已更新 |

### T3：经验分级设计

| AC | 描述 | 结果 |
|----|------|------|
| AC-T3-1 | 三种分类文档 | ✅ `.self-workflow/docs/经验分级与加载指引.md` 含实施经验/参考模式/错误经验定义 |
| AC-T3-2 | Agent 加载时机定义 | ✅ 任务启动扫描文件名、设计阶段检索参考模式、遇到错误检索错误经验 |

### T4：/feat 新会话实测

| AC | 描述 | 结果 |
|----|------|------|
| AC-T4-1 | 新会话 /feat 完整流程 | ⏳ 当前会话无法验证——需新会话 |
| AC-T4-2 | 产物完整 | ⏳ 依赖新会话实测 |

---

## 边界条件检查

| 场景 | 结果 |
|------|------|
| feat-workflow.md YAML 格式 | ✅ 文件不含 YAML，无语法问题 |
| /adr 命令降级路径 | ✅ 人类调用 /adr 时无上下文 ADR 内容 → 自动降级 question 交互 |
| 安装器模板与运行时一致性 | ✅ 模板已更新，`.opencode/` 由安装器管理 |
| 逃生舱删除后主 Agent 仍可自审 | ✅ "如果 Review Agent 不可用"降级路径保留 |

---

## 遗留项

| 项目 | 状态 | 说明 |
|------|------|------|
| T4 /feat 新会话实测 | ⏳ 待执行 | 需在新会话中验证 `/feat` 启动→阶段 1→Gate 的完整流程，包括 Review Agent 新调用机制 |
| `.opencode/commands/adr.md` 同步 | ⏳ 待安装器 | 安装器模板已更新，下次运行 `self-workflow init` 或手动运行安装器时同步 |
