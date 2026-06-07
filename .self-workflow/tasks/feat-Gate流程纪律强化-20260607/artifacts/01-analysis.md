---
phase: 1
workflow: feat
description: 需求分析阶段产物（经 Gate 1 审查后修订）
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
revision: 2
revised-from: "Gate 1 审查反馈：解决目标-手段矛盾 + AC 可验证性问题"
---

# 需求分析 — V1.21：Gate + 流程纪律强化

> 工作流 ID：`feat-Gate流程纪律强化-20260607`
> 阶段状态：✅ 完成（修订版）
> 时间戳：2026-06-07T20:18:00+08:00

---

## 需求概述

当前 `/feat` 工作流的 Gate 审查机制已建立（5 阶段 4 Gate），但在多次会话评审中发现 Agent 存在系统性偏离：
- Gate 审查结果未返回即推进阶段（后台审查后跳过等待）
- 快轨化（weight=light/skip）时省略量化输出
- 程序化验证被静默跳过，不声明理由
- 产物提交审查前未经自查，一次正确率仅 33-36%
- 实现阶段跳过方案确认直接写代码

根据屡次评审的根因分析，偏离模式可分两类：

| 类别 | 根因 | 涉及的违规 |
|------|------|-----------|
| **步骤遗漏** | Gate 入口缺少显式的自检/量化步骤，Agent 可直接跳入审查 | AC-2、AC-3、AC-4、AC-6 |
| **顺序跳跃** | 缺少阻断式 MUST NOT 措辞，Agent 可在等待中继续推进 | AC-1、AC-5 |

本版本策略：
1. **步骤嵌入**：在每个 Gate 入口增加"前置检查"段——将量化输出、自检清单、程序化验证声明固化为 Gate 入口的显式步骤（Agent 阅读工作流指引时无法跳过这段文字）
2. **措辞升级**：将建议性措辞升级为 MUST/MUST NOT 阻断式表述——让 Agent 需要**主动违反显式否定指令**才能偏离
3. **审查兜底**：更新每个 Gate 的 review-agent 审查提示词（feat-workflow.md 中定义的提示词文本），增加对新增纪律项的行为合规检查——确保即使 Agent 在前端偏离，后端审查也能捕获

核心思路：三步防线——入口步骤让"跳过"变难、措辞让"偏离"有代价、审查让"遗漏"被捕获。

> **自指风险说明**：本任务修改的纪律规则仅影响未来新启动的工作流，不影响当前任务自身。当前任务按现有 Gate 规则执行（现有的 MUST 措辞已是"必须执行，不可跳过"），无死锁风险——审查不通过 → 返回修正，这是 Gate 机制的正常运作。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 修改目标 |
|--------|--------|------|---------|
| P0 | Gate 纪律强化 | Gate 未通过绝对不进入下一阶段；Agent 不得跳过对抗性审查步骤直接展示结果；后台审查≠跳过 Gate | feat-workflow.md：每个 Gate 增加 MUST NOT 阻断式指令 |
| P1 | 产物自查 | 提交 Gate 审查前，逐项对照设计文档/模板/规范检查一致性 | feat-workflow.md：每个 Gate 入口增加"前置检查"段（含自查步骤） |
| P1 | Gate 提交前自检清单 | Agent MUST 检查：task.yaml 已同步、ADR frontmatter/引用完整、产物 frontmatter 合规 | feat-workflow.md：自检清单作为前置检查段的三项固定检查项 |
| P0 | Gate 量化强制输出 | 即使 weight=light/skip，Agent MUST 输出量化行 | feat-workflow.md：量化输出移入前置检查段首位（先于审查步骤），确保 weight=skip 也可在进入前输出 |
| P1 | 实现阶段严控 | Agent 必须先展示方案设计再实现，禁止跳过方案确认直接写代码 | feat-workflow.md：Phase 3 入口增加 MUST 指令 + feat.md 系统约束同步 |
| P1 | Gate 程序化验证跳过显式声明 | 项目无编译/测试套件时，MUST 显式标注跳过理由 | feat-workflow.md：前置检查段增加程序化验证声明项 |
| — | review-agent 审查提示词更新 | 每个 Gate 的对抗性审查提示词增加行为合规检查项（对应上述新增纪律） | feat-workflow.md：4 个 Gate 的 review-agent 提示词各增加 1-2 条行为检查 |

> 注：第 7 项是守门人——确保前 6 项纪律有人检查。修改对象是 feat-workflow.md 中的提示词文本（非 review-agent 工具自身能力）。

---

## 约束条件

### 技术约束

- 修改范围为 Markdown + YAML 文件，无编译型代码
- 遵循模板源→安装器→同步的修改流程：
  - 先改 `packages/installer/templates/configs/guides/feat-workflow.md`
  - 再改 `packages/installer/templates/commands/feat.md`
  - 运行 `node packages/installer/index.js init --target . --force` 同步到 `.self-workflow/`
- 不可修改 `.opencode/` 中的文件
- 不可引入新的外部依赖
- 不可修改 task.yaml 的 schema 结构

### 业务约束

- 保持向后兼容：已有的 Gate 机制、phase 结构、task.yaml schema 不破坏
- 已有的 working workflow 实例不受影响——仅影响未来新启动的工作流
- 修改应增强而非替换现有机制：增加检查步骤、强化措辞，而非删除重建

### 框架约束

- 遵循 `specs/default/agent-reasoning.md`（委托优先原则）
- 遵循 `specs/default/interaction-protocol.md`（歧义时使用 question 工具）
- 遵循 `specs/default/decision-record.md`（决策捕捉与 ADR 创建）
- 遵循 `specs/default/doc-audience.md`（文档受众分类——feat-workflow.md 受众为 Agent，措辞须按 Agent 受众规范）
- 遵循 `specs/default/implementation-documentation.md`（检查 `docs/实现方案/gate-审查机制实现方案.md` 是否需要同步更新）
- 修改后需通过 Gate 审查

---

## 验收标准

> 本任务为流程文本修改任务，验收标准以文档内容检查为准。每条 AC 的验证方式是：打开修改后的目标文件，检查是否存在对应内容。

### 功能验收

- [ ] **AC-1 Gate 阻断指令**：Given 修改后的 `feat-workflow.md`，When 阅读任意 Gate 审查段，Then 文件中包含 MUST NOT 阻断式措辞——明确定义"以下行为不可接受"（如"不可在 review-agent 返回前推进至下一阶段"）。验证方式：grep `MUST NOT` 在 feat-workflow.md 的 Gate 段中出现。
- [ ] **AC-2 前置检查段**：Given 修改后的 `feat-workflow.md`，When 阅读任意 Gate 审查段，Then Gate 入口有一节名为"前置检查"的内容，包含：(a) 量化输出指令、(b) 产物自查指令、(c) 自检清单、(d) 程序化验证声明（Gate 1/2 标注"跳过（无代码产出）"字样）。验证方式：grep `前置检查` 在 feat-workflow.md 中出现 ≥4 次（每个 Gate 一次）。
- [ ] **AC-3 自检清单三项**：Given 修改后的 `feat-workflow.md`，When 阅读前置检查段的自检清单，Then 明确列出三项检查：(a) task.yaml phases 状态已同步、(b) ADR 文件存在且 frontmatter 完整、(c) 产物 frontmatter 合规。验证方式：每个 Gate 的前置检查段包含这三个关键词。
- [ ] **AC-4 量化输出前置**：Given 修改后的 `feat-workflow.md`，When 阅读 Gate 审查段，Then 量化公式和输出指令位于前置检查段首位（在任何审查步骤之前），且包含"即使 weight=skip 也不可省略"字样。验证方式：量化计算块在 `### Gate 重量量化` 或 `#### 前置检查` 标题下，不在 `#### 步骤` 子标题下。
- [ ] **AC-5 实现阶段入口方案确认**：Given 修改后的 `feat-workflow.md`，When 阅读 Phase 3 入口段，Then 包含 MUST 指令：必须先展示修改方案摘要（含修改文件列表和变更摘要），经用户确认后方可编码。验证方式：grep `用户确认` 在 Phase 3 入口段中出现。
- [ ] **AC-6 程序化验证跳过声明**：Given 修改后的 `feat-workflow.md`，When 阅读 Gate 3/4 的前置检查段，Then 程序化验证步骤旁有显式标注模板（如 `[x] 程序化验证执行` / `[_] 程序化验证跳过（理由：___）`）。验证方式：Gate 3/4 前置检查段包含"跳过"和"理由"字样。
- [ ] **AC-7 review-agent 提示词更新**：Given 修改后的 `feat-workflow.md`，When 阅读任意 Gate 的 review-agent 调用提示词，Then 提示词中包含至少 1 条针对本 Gate 新增纪律项的行为检查（如 Gate 3 提示词检查"是否执行了前置检查段的所有步骤"）。验证方式：diff 对比修改前后的 review-agent 提示词有新增检查项。

### 质量要求

- [ ] feat-workflow.md 中每个 Gate 入口均有显式的"前置检查"段（含自检清单 + 量化输出指令）
- [ ] feat-workflow.md 中 Gate 纪律措辞从前置建议升级为 MUST NOT 阻断式表述
- [ ] feat.md 中系统约束段同步更新，确保 Agent 入口即知纪律要求
- [ ] 修改后模板/命令经由安装器 `init --force` 同步到 `.self-workflow/` 确保一对一一致
- [ ] `docs/实现方案/gate-审查机制实现方案.md` 经过评估——如果 Gate 步骤结构发生变更，需同步更新

---

## 不纳入范围

- 不引入新的 Gate 或阶段——仅强化现有 4 Gate
- 不修改 review-agent 工具自身（skill 定义、MCP 配置等）——但更新 feat-workflow.md 中调用 review-agent 时使用的审查提示词文本（这属于 feat-workflow.md 修改范围）
- 不实现代码级自动化强制（如 lint rule 或 pre-commit hook）——本版本通过步骤嵌入 + 措辞升级 + 审查兜底三重机制提高合规率
- 不修改 `.self-workflow/tasks/` 已有实例的 task.yaml 结构

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 强化后的 MUST 措辞仍被 Agent 忽视 | 中 | 高——本版本目标未达成 | review-agent 提示词更新（AC-7）作为兜底检查；本版本"三重防线"设计将措施从一层增至三层 |
| 前置检查段增加 Gate 步骤复杂度 | 低 | 低——Agent 执行时多读几段文字 | 前置检查段控制在 3-5 项，不冗长 |
| feat-workflow.md 自身长度增长过多 | 中 | 低——上下文消耗增加 | 每个 Gate 前置检查段约 10-15 行，全局增长可控 |

---

## 决策捕捉

- [x] 本阶段无架构决策（需求分析阶段，尚未进入方案设计。Phase 2 将就"前置检查段嵌入位置 vs 独立段"做 trade-off 评估，届时创建 ADR。）
