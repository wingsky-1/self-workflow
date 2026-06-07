---
phase: 1
workflow: feat
description: 需求分析阶段产物模板
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — todowrite 可视化

> 工作流 ID：`feat-todowrite-可视化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T12:38:00+08:00

---

## 需求概述

OpenCode 提供了内置 `todowrite` 工具，用于在对话中实时展示任务执行步骤。Self-Workflow 项目目前**没有**关于该工具何时使用、如何使用、展示粒度的任何规范——项目内仅有 6 处引用（全部在任务元数据和评审记录中），无功能定义或 spec。

### 三层待办体系（核心区分）

本项目涉及三种"待办"机制，职责不同、不可混淆：

| 机制 | 层级 | 受众 | 生命周期 | 示例 |
|------|------|------|---------|------|
| **todo.md** | 项目级 | Human + Agent | 跨版本、跨 Agent | "V1.16：经验检测" |
| **task.yaml** | 任务级 | Agent | 跨会话、持久化 | `phases[2].status: completed` |
| **todowrite** | Agent 级 | Human（主） | 当前会话、实时 | "正在审阅设计文档" |

**todowrite 的定位**：它是**当前 Agent 的待办**——反映此 Agent 在此次会话中正在做什么。不是项目排期（todo.md）、不是状态归档（task.yaml）。

### 现有可见性体系

- `task.yaml` phases 是跨会话的权威状态记录
- Agent 推理规范（`agent-reasoning.md`）规定委托后"不需要中间状态更新"（SHOULD 级），即：子 Agent 执行期间不轮询、不反复更新状态
- 交互协议使用"总结先行"模式作为人类可见性界面
- 缺少**会话内实时进度展示**的标准机制——这正是 todowrite 应填补的空白

### 项目的 todowrite 现有用法（6 处引用分析）

| 位置 | 类型 | 内容摘要 |
|------|------|---------|
| `todo.md` L15-23 | 任务规划 | V1.15 版本段，定义本任务目标 |
| `tasks/feat-todowrite-可视化-20260607/task.yaml` | 任务元数据 | 标签含 `todowrite`，当前任务自身 |
| `docs/迭代报告/V1.11会话评审.md` L55 | 纠偏记录 | 一次混淆 `todo.md` 与 `todowrite` 的误用 |
| `docs/迭代报告/V1.11会话评审.md` L66 | 纠偏记录 | 同上——"记录问题到 todo（应为 todowrite）" |
| `docs/迭代报告/V1.11会话评审.md` L74 | 亮点 | "todowrite 实时追踪"被标注为正面案例 |
| `docs/迭代报告/feat会话评审标准.md` L99 | 评审标准 | "todowrite 正确反映工程进度，每步标记"列为工具善用度检查项 |

**从中可提取的经验**：
1. **正确用法**：实现阶段每步标记进度（评审亮点）
2. **错误用法**：将设计约束/问题记到 `todo.md` 而非 `todowrite`（需在 spec 中明确职责边界）
3. **质量判据**：无 todo 或批量标记 = 差；每步标记 = 好

### "可视化"的含义

"todowrite 可视化"的核心不是改变工具 UI（OpenCode 平台内置），而是让 Agent 的**使用行为**使 Human 能直观理解当前进度：
- **条目结构**：每条 todowrite item 包含状态标记（进行中/已完成）、描述文本、优先级
- **状态区分**：通过 `in_progress` vs `completed` 标记让 Human 一眼看到"正在做什么"和"做了什么"
- **信息密度**：条目不宜过粗（一条"做 Phase 1"无用）也不宜过细（每条工具调用浪费 token）
- **生命周期**：条目从创建→in_progress→completed 的完整生命周期反映真实执行步骤

### 目标

设计 `todowrite` 的使用模式——明确何时展示、展示粒度、与 `todo.md` 和 `task.yaml` 的协作关系——并沉淀为 `specs/default/` 下的规范，使 Agent 在所有 `/feat` 工作流中能一致地使用该工具。

---

## 功能清单

> **优先级说明**：此任务在 todo.md 中整体标记为 P2（愿景），但内部功能点按自身对框架成熟度的影响分级：
> - P0 = 最少可行规范（触发时机 + 粒度 + 职责划分），缺少则 spec 不成立
> - P1 = 补充规范，提升一致性
> - P2 = 增强项，可后续迭代

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P0 | **触发时机规则** | 定义 Agent 在什么情况下必须/可以/不应使用 `todowrite` | 核心规范，决定工具的应用边界 |
| P0 | **展示粒度规范** | 定义 todo 条目的拆分粒度——每阶段、每 Gate、每子 Agent 委托、每文件编辑 | 过细浪费 token，过粗无意义 |
| P0 | **与 task.yaml 的职责划分** | 明确 `todowrite`（会话内实时展示）和 `task.yaml`（跨会话持久状态）的分工，避免重复 | 防止两种机制内容冲突 |
| P1 | **与 todo.md 的职责划分** | 明确 `todowrite`（执行追踪）和 `todo.md`（项目排期）的分工，防止混淆 | V1.11 已发生混淆事件 |
| P1 | **子 Agent 协调中的 todowrite** | 定义主 Agent 委托子 Agent 时，todowrite 如何反映"正在等待" vs "已完成" | 应遵守 agent-reasoning 的"不轮询"约束 |
| P1 | **"总结先行"与 todowrite 的对齐** | 交互协议要求的"已完成/下一步"模式与 todowrite 条目保持一致 | 人类界面的连贯性 |
| P2 | **跨会话恢复时的 todowrite** | 定义新会话中 Agent 是否应基于 task.yaml 重建 todowrite | Catchup 命令已读取 task.yaml，todowrite 重建可能冗余 |

---

## 约束条件

### 技术约束

- `todowrite` 是 OpenCode 平台内置工具，非本项目定义——规范只能约束其使用方式，不能修改工具行为
- todowrite 条目是**会话本地**的——重启会话后不保留（与 `task.yaml` 的跨会话持久化形成对比）
- `task.yaml` 的 `phases` 段是唯一的跨会话权威进度源，任何 todowrite 规范不得与之冲突
- agent-reasoning spec 明确禁止子 Agent 中间状态轮询——todowrite 不能用于轮询子 Agent 进度
- spec 文件格式需遵循 `specs/README.md` 定义的 frontmatter 规范（type/level/tags/version/summary）

### 业务约束

- todowrite 条目的主要受众是 **Human**（让其了解 Agent 正在做什么），次要受众是 **Agent**（自我追踪）
- 规范必须用中文编写（项目约定），技术术语可保留英文
- 新增 spec 必须放入 `specs/default/` 目录（始终生效的默认规范）。由于 `default/` 目录已存在于 `specs/README.md` 的"分类定义"段中，本次新增文件不需额外注册分类条目；如果是未来新增分类目录（如 `docs/` 或 `workflow/`），则必须在 `specs/README.md` 添加对应条目
- 规范条目使用 MUST/SHOULD/MAY 分类（`specs/README.md` 约定）

---

## 验收标准

### 功能验收

- [ ] **AC-1**：Given Agent 启动 `/feat` 工作流，When 进入任意阶段（1-5），Then Agent 创建至少一条 todowrite 条目，描述当前阶段名称和核心目标（不少于 10 字，如"Phase 2：设计 todowrite 使用模式——含触发条件、粒度、职责划分"）
- [ ] **AC-2**：Given Agent 完成一个阶段的 Gate 审查，When Gate 通过，Then todowrite 中该阶段条目标记为 completed，并创建下阶段条目
- [ ] **AC-3**：Given Agent 委托子 Agent 执行任务（预计耗时 > 30 秒），When 委托发出后，Then todowrite 中存在一条条目描述该委托任务（如"调用 Review Agent 审查设计文档"），状态为 in_progress；子 Agent 返回后，主 Agent 将该条目标记为 completed。此模式仅创建一次条目、在返回时更新一次——不轮询、不反复修改，与 agent-reasoning.md 的 SHOULD 规则（委托后不需要中间状态更新）一致
- [ ] **AC-4**：Given Human 查看对话中的 todowrite 条目，When 对照 `task.yaml` phases，Then 两者描述的进度状态一致（无冲突），但 todowrite 粒度更细（子步骤展示）
- [ ] **AC-5**：Given Agent 在执行过程中，When 涉及 todo.md 版本段中的具体任务项，Then todowrite 条目以 `[<todo项描述>]` 格式引用该任务项（如 `[todowrite 使用模式设计]`），引用文本与 todo.md 中该项描述一致，而非直接修改 todo.md 内容
- [ ] **AC-6**：Given Agent 执行"总结先行"交互，When 输出"已完成"列表，Then todowrite 中至少有一条 completed 条目的描述文本包含"已完成"列表中的首项关键词；When 输出"下一步"，Then todowrite 的 in_progress 条目与"下一步"描述语义一致（通过关键词匹配验证：in_progress 条目标题中的核心名词出现在"下一步"描述中）

### 质量要求

- [ ] **Q-1**：生成的 `specs/default/todowrite-display.md` 通过 Compound 文档审查（frontmatter 完整、tags 英文小写、summary 非空）
- [ ] **Q-2**：规范中每条 MUST 条目均可通过静态检查验证（非模糊建议）
- [ ] **Q-3**：规范覆盖了 V1.11 会话评审中发现的混淆场景（todo.md vs todowrite）

---

## 不纳入范围

- **不实现** todowrite 工具的 OpenCode 平台级定制（仅定义使用规范，不修改工具本身）
- **不实现** todowrite 条目的跨会话持久化（这是 task.yaml 的职责，todowrite 仅会话内使用）
- **不实现** 子 Agent 的 todowrite 自动更新（子 Agent 不直接操作 todowrite，主 Agent 在委托返回后更新）
- **不设计** todowrite 条目与外部 CI/CD 系统的集成（超出当前范围）
- **不修改** OpenCode 内置的 todowrite 行为（如条目保留策略、UI 展示样式）

---

## 决策捕捉

- [x] 本阶段无架构决策。检查 `decision-record.md` 触发条件：
  - 无多方案对比 — 需求分析阶段不做方案选择
  - 无方向性决策 — 不决定实现方向
  - 无流程性决策 — 不定义工作流规则
  - 无反模式纠正 — 无现存设计需推翻
  - → 不需要创建 ADR。架构决策将在 Phase 2 方案设计阶段产生。

## 待定关系

以下跨领域问题已识别但留待方案设计阶段确定：

- **todowrite 条目与 artifact 产物报告的引用关系**：todowrite 是会话内实时追踪，artifact 是阶段正式交付物，两者可能有内容重叠。是否需要相互引用（如 todowrite 条目引用 artifact 编号），留待 Phase 2 确定。
- **todowrite 条目内容与 task.yaml 的冗余边界**：两者都描述进度，但粒度不同。具体哪些信息仅存于 task.yaml、哪些可同时存在于 todowrite，需在设计阶段明确。
