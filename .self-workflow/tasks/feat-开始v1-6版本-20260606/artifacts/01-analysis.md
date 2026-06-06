# 需求分析 — V1.6 质量收尾

> 工作流 ID：`feat-开始v1-6版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T20:37:00+08:00

---

## 需求概述

V1.6 是 V1.5 五轮迭代后的**质量审计收尾版本**。V1.5 系列暴露了若干遗留问题——主要是文档引用未更新、模板已弃用但检查未移除、经验文档命名不规范等。本轮目标是修复这些非功能性缺陷，让框架进入稳定态。

共 9 项任务，分三级优先级：P0（2 项阻断成熟度）、P1（4 项质量改善）、P2（3 项低成本改进）。

---

## 功能清单

| 优先级 | # | 功能点 | 描述 | 来源 |
|--------|---|--------|------|------|
| P0 🔴 | 1 | feat.md 移除已弃用模板检查 | `feat.md` 步骤 0 仍检查 `workflow-metadata-template.yaml` 存在性，但该模板已在 V1.5.2 废弃（phases 内联到 task.yaml） | 质量审计 |
| P0 🔴 | 2 | 经验文档命名符合 ADR-003 约定 | 3 个 docs/ 下的经验文档文件名不符合 `<领域>-<分类>.md` 约定，需重命名并更新引用 | 质量审计 |
| ~~P1 🟡~~ | ~~3~~ | ~~workflow.yaml 引用更新~~ | **[removed]** 用户决定不再处理 workflow.yaml 旧引用 | — |
| P1 🟡 | 4 | docs/todo.md 路径更新 | 3 份根级文档仍引用旧路径 `docs/todo.md`，需更新为 `.self-workflow/todo.md` | 质量审计 |
| P1 🟡 | 5 | catchup.md 修复 plan.md 引用 | catchup.md 第 20 行引用 `plan.md`，但该文件已在 V1.5.2 废弃，应改为读 task.yaml phases | 质量审计 |
| P1 🟡 | 6 | 修复 task.yaml 重复 artifacts 键 | `feat-先做v1-5-2的需求-20260606/task.yaml` 第 29-32 行有与 `structure.artifacts` 重复的顶层 `artifacts` 键 | 质量审计 |
| ~~P2 🟢~~ | ~~7~~ | ~~文档受众分类~~ | **[移入 V1.8]** 非简单标注——需形成 spec 指导 Agent 识别受众并据此编写/评审 | — |
| P2 🟢 | 8 | ADR-003 标记"被超驰" | `feat-实现feat命令-20260606/adrs/ADR-003`（元数据模板填充策略）因 workflow.yaml 已废弃而失效，需标记 superseded | 质量审计 |
| P2 🟢 | 9 | 删除 adr-review-template.md | 删除该模板文件（3 处副本），更新 `.self-workflow/todo.md` 引用 | 新增待评审 |

---

## 约束条件

### 技术约束

- **安装器同步规则**：修改 `.self-workflow/configs/` 和 `.self-workflow/specs/` 的文件前，必须先改 `packages/installer/templates/` 中的模板源，再运行 `node packages/installer/index.js init --target . --force` 同步
- **不可修改 .opencode/ 文件**：opencode 配置需通过安装器导入，不可直接编辑
- **任务历史产物不可修改**：`.self-workflow/tasks/<old-workflow-id>/` 下的历史 artifacts/adrs 是已完成任务的记录快照，不应回改（除 #6 修复重复键外）
- **文件重命名需更新引用**：重命名经验文档后需更新所有引用该文件名的文档

### 业务约束

- **P0 项完成前不推进版本**：按 V1.5.2 确立的优先级体系，P0 阻断项必须先完成
- **检查清单驱动**：每个子任务修改后需验证（lint/typecheck 不适用时改为手动验证）

---

## 验收标准

### P0 项

- [ ] **AC-1**：Given 执行 `/feat` 命令，When 步骤 0 前置检查，Then 不再检查 `workflow-metadata-template.yaml` 是否存在
- [ ] **AC-2**：Given `.self-workflow/docs/` 目录，When 列出所有经验文档文件名，Then 所有文件名符合 `<领域>-<分类>.md` 格式（`Gate强制步骤实施经验.md` → `gate-强制步骤-实施经验.md` 等）
- [ ] **AC-3**：Given 重命名后的文档，When `grep` 搜索旧文件名，Then 无残留引用（除任务历史产物外）

### P1 项

- [ ] **AC-4**：Given `.self-workflow/` 下文档（除 tasks/ 历史产物），When `grep "workflow\.yaml"`，Then 仅在 ADR-001（合并说明）中出现，其余文档已更新为 `task.yaml`
- [ ] **AC-5**：Given 根级 `docs/` 目录（非 .self-workflow/），When `grep "docs/todo\.md"`，Then 全部 3 份文档已更新为 `.self-workflow/todo.md`
- [ ] **AC-6**：Given catchup.md 模板源，When 读取其内容，Then 不再引用 `plan.md`，改为引用 `task.yaml` 的 phases 段
- [ ] **AC-7**：Given `feat-先做v1-5-2的需求-20260606/task.yaml`，When 读取该文件，Then 无重复的顶层 `artifacts` 键，仅保留 `structure.artifacts`

### P2 项

- [ ] **AC-8**：Given `.self-workflow/docs/` 下每份文档，When 读取其 frontmatter 或首段，Then 明确标注受众（`audience: human` / `agent` / `both`）
- [ ] **AC-9**：Given `feat-实现feat命令-20260606/adrs/ADR-003-元数据模板填充策略.md`，When 读取其状态，Then 状态为 `superseded`（被超驰），并说明超驰原因（workflow.yaml 已废弃）
- [ ] **AC-10**：Given 项目目录，When `glob **/adr-review-template*`，Then 返回 0 结果；且 `.self-workflow/todo.md` 中该项标记为 `[done]`

---

## 不纳入范围

- ❌ 修改任何 `.self-workflow/tasks/<old-task>/` 下的历史 artifacts（除 #6 外）
- ❌ ~~#3 workflow.yaml 引用更新~~ — 用户决定不再处理
- ❌ ~~#7 文档受众分类~~ — 移入 V1.8（需 spec 级设计）
- ❌ V1.7 的 docs/ 目录结构梳理（已排入 V1.7）
- ❌ V1.7 的 docs 索引自动注入机制（已排入 V1.7）
- ❌ 经验去重检测、一致性审查命令（已排入 V1.8）
- ❌ 子 Agent 执行拆分、Review Agent 增强（已排入 Vx）
- [x] 本阶段无架构决策
