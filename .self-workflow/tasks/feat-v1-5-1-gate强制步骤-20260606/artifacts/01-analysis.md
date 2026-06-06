# 01-analysis：V1.5.1 Gate强制步骤 — 需求分析

> **workflow-id**: feat-v1-5-1-gate强制步骤-20260606
> **来源**: `.self-workflow/todo.md` §V1.5.1（P0）
> **上游任务**: feat-v1.5剩余问题修复-20260606（完成率 71%，4❌）

## 1. 需求来源与背景

V1.5 剩余问题修复工作流完成后，验收评审暴露了 3 个 P0 问题——这些问题的共同特征是：**feat-workflow.md 写了规则，但 Agent 在执行时未遵守**。V1.5.1 的目标是将这些"软指南"升级为"强制步骤"，阻断 Agent 跳过关键操作。

| # | 来源 | 严重度 | 问题描述 |
|---|------|--------|---------|
| 1 | V1.5剩余问题修复 P1 ❌ | 3/5 Gate 的 Git tag 缺失 | Agent 在 Gate 通过后没有创建 checkpoint tag |
| 2 | V1.5剩余问题修复 P3 ❌ + V1-3 ❌ | Agent 写了"应创建 ADR"但不创建文件 | 检查清单中说"决策已记录"，但 adrs/ 目录为空 |
| 3 | V1.5剩余问题修复 P4 ⚠️ + V15-6 ⚠️ | Gate 3/4 未执行三维量化 | 量化公式存在但 Gate 入口没有显式计算输出 |

## 2. 修改目标

**唯一修改对象**：安装器模板源 `packages/installer/templates/configs/guides/feat-workflow.md`（当前行数 600，版本 0.2）

修改后通过安装器同步：`node packages/installer/index.js init --target . --force`

## 3. 功能清单

### F1：Git tag 强制检查 + Compound 补建

**当前状态**：Checkpoint 章节（L449-495）描述了创建流程，Compound 章节（L499-517）未提 tag 检查。各 Gate 的"通过条件"中无 tag 检查项。

**需增加**：
- **每个 Gate 的"通过条件"** 中增加 `[ ] Git tag 已创建（格式：<workflow-id>-ph<N>-<name>-gate-passed）` 强制检查项
- **Compound 章节** 增加"补建逻辑"：Compound 执行时，先扫描所有 Gate 对应的 tag 是否存在；缺失的 tag 从 commit 历史反查后补建
- **工作流状态管理** 章节的"执行流程"步骤 c 中强调 tag 创建不可跳过

### F2：ADR 文件必须存在（非空）

**当前状态**：每个阶段的"完成检查清单"有 `决策捕捉` 项，但措辞是"阶段中有没有需要记录的决策？（…→ 需要 ADR）"——这是一个**提示性问题**，Agent 回答"是"后就认为完成了，不会实际创建文件。

**需修改**：每个阶段（1-5）的"完成检查清单"中：
- 将 `决策捕捉：判断本阶段是否有需要记录的决策` 改为 `决策捕捉：检查adrs/目录——如果本阶段有决策，adrs/下必须有对应的ADR文件（非空，含来源引用+决策理由）`
- 措辞从"提示性问题"改为"存在性断言"——Agent 必须验证文件存在而非仅回答"需要"

受影响位置（5处）：
- L81: 阶段1 检查清单
- L171: 阶段2 检查清单
- L270: 阶段3 检查清单
- L380: 阶段4 检查清单
- L442: 阶段5 检查清单

### F3：Gate 入口强制显式输出三维分值

**当前状态**："Gate 重量量化"章节（L321-346）定义了三维量化公式和分值映射，但仅出现在"实现审查 Gate"（Gate 3）中。Gate 1、2、4 只有声明性 weight（light/full），没有要求显式计算输出。这导致 Agent 不执行计算。

**需修改**：
- **每个 Gate 入口**（Gate 分析审查 L91、Gate 设计审查 L180、Gate 实现审查 L283、Gate 验证审查 L384）增加强制步骤：计算并显式输出 `scope + risk + user-signal` 三维分值 → 确定 weight → 执行对应审查强度
- Gate 实现审查 L321-346 的"Gate 重量量化"表提升为**共享定义块**，在所有 Gate 中引用（或复制到每个 Gate 入口，避免 Agent 跳转）
- 附录 Gate 重量速查表（L523-532）更新为显式引用量化公式，而非静态 weight 声明

## 4. 约束条件

| 约束 | 说明 |
|------|------|
| **不可直接修改** `.self-workflow/configs/` | 必须修改安装器模板源，再通过安装器同步。防止被 `init --force` 覆盖。 |
| **不可修改** `.opencode/commands/feat.md` | 部署副本也不直接改——同样改安装器模板 `packages/installer/templates/commands/feat.md` |
| **版本号规则** | 模板源 `feat-workflow.md` 版本号从 `0.2` 升到 `0.3` |
| **Git 操作约束** | Compound 补建 tag 需在 commit 历史中找到对应的 commit SHA |

## 5. 不纳入范围

| 排除项 | 理由 |
|--------|------|
| 修改 `/feat` 命令自身 | 命令框架不在此次需求范围内 |
| 修改 Review Agent | Review Agent 审查规则不涉及此 3 项 |
| 修改 todo.md 之外的其他文件 | 本次只改 feat-workflow.md 模板源 |
| 自动化 tag 验证脚本 | V2 实现，V1.5.1 只做文档规范约束 |
| 验收标准修订 | 那是 V1.5.3 的内容 |

## 6. 验收标准

### AC1：Git tag 强制检查（对应 F1）

**Given** 工作流执行到任意 Gate，且 Gate 通过  
**When** Agent 更新 task.yaml 的阶段状态  
**Then** agent 必须在 feat-workflow.md 指引下执行 `git tag <workflow-id>-ph<N>-<name>-gate-passed`  
**And** Gate 的"通过条件"清单中显式包含此检查项

**Given** 工作流完成后执行 Compound  
**When** Compound 扫描发现 Gate 对应的 Git tag 缺失  
**Then** Agent 必须通过 commit 历史反查补建 tag  
**And** 补建后记录在 errors.yaml（类型：compound-recovery，severity：minor）

### AC2：ADR 文件强制存在（对应 F2）

**Given** 某阶段产生了架构决策（方向性选择/多方案对比/trade-off 评估）  
**When** 该阶段的完成检查清单被勾选  
**Then** `adrs/` 目录下必须存在对应的 .md 文件（非空，含来源引用+决策理由）  
**And** 检查清单措辞为存在性断言（"文件必须存在"），而非提示性问题（"是否需要"）

### AC3：Gate 入口强制三维量化（对应 F3）

**Given** 工作流进入任意 Gate  
**When** Gate 审查开始前  
**Then** Agent 必须显式输出 `scope = [score] ([condition]), risk = [score] ([condition]), user-signal = [score] ([condition]) → total = [sum] → weight = [skip/light/full]`  
**And** 输出格式在 feat-workflow.md 中有明确模板

## 7. 影响范围

| 文件 | 变更类型 | 影响行 |
|------|----------|--------|
| `packages/installer/templates/configs/guides/feat-workflow.md` | 修改 | ~30处（5阶段检查清单 + 4Gate入口 + Compound + Checkpoint + 附录速查表） |
| `.self-workflow/configs/guides/feat-workflow.md` | 自动同步 | （由安装器生成，不直接编辑） |

## 8. 风险与开放问题

| 风险 | 缓解措施 |
|------|---------|
| Agent 仍然忽略强制检查项（写了规则但不遵守） | 措辞从软性提示改为硬性"必须执行"；同时纳入 V1.5.3 验收标准 P3（检查 adrs/ 目录实际文件） |
| Compound 补建 tag 需要找到正确 commit | 补建逻辑需明确：用 `git tag <tag-name> <commit-sha>`，commit SHA 从 task.yaml 的 completed 时间戳反查 |
| 三维量化公式已被"复制"到 4 个 Gate，后续修改需同步 4 处 | 接受此 trade-off——粘贴比引用更容易被 Agent 执行（Agent 可能不会跳转读取共享定义块） |
