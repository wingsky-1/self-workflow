---
phase: 1
workflow: feat
description: V1.22：文档/工具规范修补 — 流程纪律与工具使用惯例的规范级修补
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.22：文档/工具规范修补（P1/P2）

> 工作流 ID：`feat-文档工具规范修补-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T21:53:00+08:00

---

## 需求概述

V1.22 是 V1.x 系列的倒数第二个版本，定位为 **规范级修补**——不添加新功能，而是修复已有流程和工具使用惯例中反复出现的执行偏差。需求来源于多轮会话评审累计的共性失败模式：

### 根因分析

四项需求虽然都表现为"规范措辞不够强硬"，但需逐项诊断根因是否仅在于措辞：

1. **ADR 内联问题**：`decision-record.md` 当前措辞为"架构选择→必须创建 ADR"，但未明确"独立文件、先于产物"的时间约束。V1.19 会话评审再现此问题（3 个 ADR 嵌入 design.md），Gate 2 审查发现后修复——说明 Gate 审查机制本身是有效的，问题出在规范措辞未提供足够的先验约束。**根因定位**：规范措辞缺陷（非 Agent 未读规范、非注入机制失效）。

2. **todowrite 延迟启动**：`todowrite-display.md` M-1 当前措辞为"阶段入口创建条目"，未强调 Phase 1 入口即时性。**根因定位**：规范措辞缺少时间约束（非 Gate 审查遗漏——因为此行为发生在 Gate 之前）。

3. **忽视内置工具**：V1.15 会话评审中 Agent 未使用 `sw_task_create` 而手工创建目录。当前无规范明确要求 Agent 在执行操作前检查内置工具。**根因定位**：规范缺失（`agent-reasoning.md` 的"委托优先"原则未延伸到工具选择层面）。

4. **session 辨识度低**：多个 `/feat` 工作流 session 名称相同。当前 `feat.md` 未包含 session 重命名步骤。**根因定位**：命令流程缺失。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P1 | ADR 先于产物 — 规范措辞强化 | 修改 `decision-record.md`：在触发条件段明确"Phase 2 产物编写前 MUST 先创建独立 ADR 文件"的时间约束；`feat-workflow.md` Phase 2 checklist 增加 adrs/ 目录非空检查 | 来源：V1.16+V1.17 评审 #4 + V1.19 评审再现 |
| P1 | todowrite 即时启动 — 规范措辞强化 | 修改 `todowrite-display.md`：M-1 强化为"Phase 1 入口第一个产出操作即创建 todowrite 条目"（允许准备性读取如读取分析模板）；S-1 关键节点表中同步更新 Phase 1 触发描述 | 来源：V1.16+V1.17 评审 #3 |
| P2 | 内置工具优先 — 扩展现有 spec | 扩展 `agent-reasoning.md`：新增工具选择优先规则——Agent 执行操作前 MUST 检查项目是否有匹配的内置工具（如 `sw_task_*` 系列、`task()` 等），避免手工重复实现 | 来源：V1.15 评审 #1 |
| P2 | /feat 启动时 session 重命名 — feat.md 新增步骤 | 修改 `feat.md`：在步骤 0 前置检查中新增 session 重命名为 `feat-<slug>-<YYYYMMDD>` 的步骤。若 OpenCode 平台不支持 session 重命名 API，回退方案：在阶段开始时的第一条输出中包含 session 标识信息 | 来源：原 V1.20 #2 |
| wontfix | doc-audience 术语检查 | 不纳入——已在 todo.md 标记 wontfix | 拒绝理由：待 V1.23 完成后整体经验治理时再统一处理 |

---

## 约束条件

### 技术约束

- 所有修改必须通过安装器模板源进行（`packages/installer/templates/`），修改后运行 `node packages/installer/index.js init --target . --force` 同步
- OpenCode session 重命名机制是否存在待验证（需确认 OpenCode 平台是否支持）——如不支持则使用回退方案（输出 session 标识信息替代）
- `decision-record.md` 的 MUST 措辞强化后需确保不会与现有 ADR 产生冲突

### 业务约束

- 修改范围限定于：`specs/default/decision-record.md`、`specs/default/todowrite-display.md`、`specs/default/agent-reasoning.md`、`configs/guides/feat-workflow.md`、`packages/installer/templates/commands/feat.md`
- P2 内置工具优先方案选择扩展现有 `agent-reasoning.md`（不新建独立 spec 文件——避免碎片化）
- 不修改安装器代码逻辑
- 不修改 OPencode 插件/agent/skill 定义

### 时间/资源约束

- V1.22 是 V1.x 系列倒数第二个版本，V1.23 为最后一个 V1.x 版本——V1.22 延期会压缩 V1.23 和后续 V2.0 的可用时间
- P1 项需在本次工作流中完成；P2 项如遇到阻塞可降级为延后（在总结沉淀中记录）
- 延后版本（V1.12/V1.13/V1.14）已在 V1.8 后取消，其需求已合并/废弃/延至 V2.0——本任务不需处理

---

## 验收标准

### 功能验收：P1 — ADR 先于产物

- [ ] **AC-1.1**：Given `decision-record.md` 规范，When Agent 阅读规范的"触发条件"段，Then 规范文本明确包含以下约束："当 Phase 2 产出涉及 decision-record.md 定义的任一触发场景（架构选择/方向性决策/流程性决策/反模式纠正）时，Agent MUST 在编写 `02-design.md` 前先在 `adrs/` 创建独立 ADR 文件"
- [ ] **AC-1.2**：Given `decision-record.md` 规范，When Agent 阅读规范，Then MUST 措辞明确包含"先于产物创建独立文件"的时间约束（而非仅"必须记录"）
- [ ] **AC-1.3**：Given `feat-workflow.md` Phase 2 checklist，When Agent 执行 Phase 2 完成检查，Then checklist 中"决策捕捉"项要求检查 adrs/ 目录——若本阶段触及触发场景，adrs/ 目录必须非空；若未触及，需显式标注"本阶段无架构决策"

### 功能验收：P1 — todowrite 即时启动

- [ ] **AC-2.1**：Given `todowrite-display.md` 规范，When Agent 阅读 M-1 段，Then 规范文本明确包含"Phase 1 入口第一个产出操作即创建 todowrite 条目"的 MUST 约束（准备性读取如读取分析模板不视为产出操作）
- [ ] **AC-2.2**：Given `todowrite-display.md` 规范，When Agent 阅读规范，Then S-1"关键节点粒度"表中 Phase 1 的触发描述更新为"进入新 Phase（入口即时）"，与 M-1 强化保持一致

### 功能验收：P2 — 内置工具优先

- [ ] **AC-3.1**：Given `agent-reasoning.md` 规范，When Agent 阅读规范，Then 规范包含工具选择优先规则：Agent 在执行文件操作（创建目录/写入文件等）前 MUST 先检查项目是否提供匹配的内置工具（优先检查 `sw_task_*` 系列，其次 `task()`），存在匹配工具则 MUST 使用内置工具
- [ ] **AC-3.2**：Given `agent-reasoning.md` 规范，When Agent 阅读规范，Then 规范明确列出需优先检查的内置工具名或类别（至少包含 `sw_task_create`、`sw_task_list`、`sw_task_read`、`sw_task_phase_update`）

### 功能验收：P2 — session 重命名

- [ ] **AC-4.1**：Given `feat.md` 命令指引，When Agent 阅读步骤 0（前置检查），Then 步骤 0 包含 session 重命名操作——优先使用 OpenCode session 重命名 API（如存在）将 session 重命名为 `feat-<slug>-<YYYYMMDD>`；若 API 不可用，则在下一步骤的输出中包含 session 标识信息作为回退
- [ ] **AC-4.2**：Given `feat.md` 模板源已修改并运行 `init --force`，When 对比模板源与部署副本，Then 两文件内容一致

### 质量要求

- [ ] **Q-1**：所有修改文件通过 YAML frontmatter 格式检查
- [ ] **Q-2**：修改后运行 `init --force` 同步无报错
- [ ] **Q-3**：spec 文件 MUST/SHOULD/MAY 层级清晰，不引入矛盾
- [ ] **Q-4**：`feat.md` 模板源与部署副本一致性（`init --force` 后）

---

## 不纳入范围

- ❌ doc-audience 术语检查（已标记 wontfix，待 V1.23 后续处理）
- ❌ 新增 OPencode agent/skill/plugin
- ❌ 修改安装器核心逻辑（`packages/installer/index.js`）
- ❌ 修改 OPencode 平台配置（`.opencode/` 下的 agent/skill 定义）
- ❌ 新增经验文档或 spec 模板
- ❌ 跨任务经验治理（属于 V2.0 范围）
- ❌ 新增独立 spec 文件（P2 内置工具优先选择扩展现有 `agent-reasoning.md`，避免 spec 碎片化）
- ❌ 更新 `docs/实现方案/` 文档（本次任务修改规范文本措辞和命令步骤，不涉及模块接口/数据流/架构变更）

---

## 决策捕捉

- [x] 本阶段无架构决策
