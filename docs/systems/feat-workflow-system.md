# /feat 工作流系统 (Feat Workflow System)

> 所属模块：执行层
> 文件位置：`.opencode/commands/feat.md` + `.self-workflow/configs/guides/feat-workflow.md`
> 实现方案：`.self-workflow/docs/实现方案/feat-工作流实现方案.md`

---

## 功能概述

`/feat` 是 Self-Workflow 的核心工作流命令。它将一个开发任务分解为 **5 个阶段 + 4 个 Gate** 的结构化流程，每个 Gate 前由 Review Agent 进行对抗性审查。

## 核心特性

### 1. 5 阶段工作流

```
需求分析 → [Gate/量化] → 方案设计 → [Gate/量化] → 代码实现 → [Gate/量化] → 功能验证 → [Gate/量化] → 总结沉淀 → Compound
```

| 阶段 | 目标 | 产物 |
|------|------|------|
| **Phase 1：需求分析** | 理解需求、识别约束、定义验收标准 | `01-analysis.md` |
| **Phase 2：方案设计** | 架构决策、接口设计、数据模型 | `02-design.md` |
| **Phase 3：代码实现** | 编码 + 单元测试 + lint/typecheck | `03-implementation.md` |
| **Phase 4：功能验证** | 完整测试 + 边界检查 + 验收对照 | `04-verification.md` |
| **Phase 5：总结沉淀** | 提炼经验 + 文档补充 + ADR 晋升 | `05-summary.md` |

### 2. Gate 重量量化机制

每个 Gate 入口必须显式计算三维分值，决定审查深度：

| 维度 | 条件 | 分值 |
|------|------|------|
| **scope**（范围） | single-file / multi-file / cross-module | -1 / 0 / +1 |
| **risk**（风险） | typo-config / logic-change / architecture | -1 / 0 / +1 |
| **user-signal**（信号） | quick-mode / default / full-review | -1 / 0 / +1 |

**总分 → 行为**：
- ≤ -1 → **skip**：跳过所有审查
- = 0 → **light**：仅程序化验证
- ≥ 1 → **full**：完整审查（程序化 + 对抗性）

> Human 可覆盖量化结果。

### 3. 4 个 Gate 审查

| Gate | 方向审查 | 程序化验证 | 对抗性审查 | 人工确认 |
|------|---------|-----------|-----------|---------|
| Gate 1：分析审查 | — | 跳过 | ✅ Review Agent | ✅ 需要 |
| Gate 2：设计审查 | ✅ 方向审查 | 跳过 | ✅ Grill 风格 + behavior | ⚠️ 可选 |
| Gate 3：实现审查 | — | ✅ lint/typecheck/test | ✅ Review Agent | ❌ |
| Gate 4：验证审查 | — | ✅ 完整测试套件 | ✅ Review Agent | ❌ |

### 4. Compound（自动归档）

工作流完成后自动执行：
1. 确认 5 个阶段产物完整性
2. 缺失 Git tag 补建
3. 交叉引用检查（产物 ↔ task.yaml ↔ ADR）
4. 文档变更审查（docs/ + configs/ + specs/ 规范性）
5. 实现方案文档决策审计
6. Todo 状态自动更新
7. 元数据更新 → completed

### 5. 决策捕捉

每个阶段结束时必须显式声明：
- `[x] ADR 已创建，见 adrs/ADR-XXX-xxx.md`
- 或 `[ ] 本阶段无架构决策`

涉及架构选择的阶段，adrs/ 下必须有对应的 ADR 文件（非空、含来源引用+决策理由）。

### 6. Checkpoint（Git tag）

每 Gate 通过后创建 Git tag：
```
<workflow-id>-ph<N>-<阶段英文名>-gate-passed
```
支持回溯到任意 Gate 通过状态，通过 `git worktree` 实现多会话并行开发。

### 7. 无参数模式

`/feat` 不带参数时：
- 读取 `.self-workflow/todo.md` 获取版本段
- 检查进行中任务
- 自动认领第一个未认领版本 → 启动工作流
- 无未认领版本 → 展示任务仪表盘

---

## 实现路径

### V1.0 — 手写指引
- Markdown 格式的工作流指引文件
- 阶段定义 + Gate 检查清单

### V1.5 — 命令化
- `/feat` 作为 OpenCode Slash Command
- Gate 强制步骤（Git tag + ADR 文件 + 重量量化）
- 双级经验模型

### V1.10 — Grill+COT 审查
- 对抗性审查提示词升级
- 文档变更纳入审查范围

### V1.11 — 智能启动
- 无参数模式：自动分析/认领任务
- Compound 自动更新 todo.md

### V1.19 — 流程修补（进行中）
- Phase 4→5 增加文档更新步骤
- 文档编辑类任务的产物规则

---

## 未来愿景

### V2.x — 多 Agent 并行
- **子 Agent 执行拆分**：各阶段委托给专用 Agent 并行执行
- **多种工作流类型**：debug/doc/review 工作流
- **每阶段专用 Agent/Skill**：Adapter 编译能力
- **并行开发**：子 Agent 并行架构 + 上下文管理优化

### V3.x — 智能化
- **无人值守模式**：Agent 自主完成全流程，用户事后评审
- **自然语言触发**：普通对话中识别工作流意图
- **评审自动决策**：高置信度场景自动抉择，减少打断

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.opencode/commands/feat.md` | 命令入口、参数解析、系统约束 |
| `.self-workflow/configs/guides/feat-workflow.md` | 工作流指引（5阶段+4Gate+Compound） |
| `.self-workflow/configs/tasks/feat-task.yaml` | 任务模板（phases 段定义） |
