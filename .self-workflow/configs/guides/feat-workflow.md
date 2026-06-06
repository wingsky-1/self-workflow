---
name: feat-workflow
description: 特性开发工作流指引 — 多步骤特性开发的完整流程，包含 5 阶段 + Phase Gate 审查
version: 0.2
---

> **角色**：本文件定义 `/feat` 工作流的 5 阶段和 4 Gate 审查规则，由 `/feat` 命令引用。
> 如需定制工作流（修改阶段定义、Gate 条件、Checkpoint 规则），请修改安装器模板源
> `packages/installer/templates/configs/guides/feat-workflow.md`，运行 `node packages/installer/index.js init --target . --force` 同步。
> 直接编辑部署副本 `.self-workflow/configs/guides/feat-workflow.md` 会在安装器同步时被覆盖。

# Feat 工作流指引

## 工作流总览

```
需求分析 → [Gate/light] → 方案设计 → [Gate/full] → 代码实现 → [Gate/full] → 功能验证 → [Gate/light] → 总结沉淀 → Compound
```

**适用场景**：多步骤特性开发（3+ 阶段）、架构决策、重构
**不适用场景**：单文件 typo 修复、配置值修改、快速原型（< 30 行代码）— 请使用 `--quick` 模式

### 工作流标识

每次工作流执行需要一个唯一 ID，格式：`<type>-<feature-name>-<YYYYMMDD>`
例如：`feat-user-login-20260606`

### 产物目录结构

```
.self-workflow/tasks/<workflow-id>/
├── task.yaml              # 任务元数据（含 phases 段）
├── adrs/                  # 决策记录
├── logs/                  # 实施记录
├── artifacts/             # 各阶段产物
│   ├── 01-analysis.md
│   ├── 02-design.md
│   ├── 03-implementation.md
│   ├── 04-verification.md
│   └── 05-summary.md
└── errors/                # 错误日志
    ├── errors.yaml
    ├── 01-analysis-errors.md
    └── ...
```

---

## 阶段 1：需求分析

**目标**：理解需求、识别约束、明确验收标准。

### 执行内容

1. **理解需求**
   - 阅读并分析用户提供的特性描述
   - 识别核心功能需求和边缘情况
   - 明确"做什么"和"不做什么"

2. **识别约束**
   - 技术约束（语言、框架、现有架构）
   - 业务约束（性能、安全、合规）
   - 时间/资源约束

3. **定义验收标准**
   - 每个功能点对应一条验收标准
   - 验收标准应可测试（Given-When-Then 格式优先）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/01-analysis.md`
格式参考：`.self-workflow/configs/templates/analysis-template.md`

### 完成检查清单

- [ ] 需求理解文档已写入 `01-analysis.md`
- [ ] 功能清单覆盖所有核心需求
- [ ] 约束条件已识别
- [ ] 验收标准已定义且可测试（Given-When-Then 格式优先）
- [ ] 不纳入范围已明确标注
- [ ] **决策捕捉**：阶段中有没有需要记录的决策？（架构选择/约束发现 → 需要 ADR）

### 错误日志

如果在此阶段遇到问题（需求不明确、约束冲突等），立即记录到：
`.self-workflow/tasks/<workflow-id>/errors/01-analysis-errors.md`
格式参考：`.self-workflow/configs/templates/error-log-template.md`

---

## Gate：分析审查（weight: light）

### 审查步骤

#### 步骤 1：程序化验证

本阶段无代码产出，跳过程序化验证。

#### 步骤 2：对抗性审查

调用 Review Agent 审查需求分析文档的完整性和一致性。

**审查要点**：
- 需求理解是否与用户输入一致？
- 功能清单是否覆盖了所有需求？
- 验收标准是否可测试？
- 约束条件是否被合理识别？

**执行指令**（必须执行，不可跳过）：

task(subagent_type="review-agent", prompt="审查需求分析文档 <artifacts/01-analysis.md>。检查：需求理解是否与用户输入一致？功能清单是否覆盖全部需求？验收标准是否可测试(Given-When-Then)？约束条件是否合理？不纳入范围是否明确？输出：pass/fail，如 fail 列出具体问题。")

如果 Review Agent 不可用，主 Agent 自行完成上述检查。

#### 步骤 3：人工确认

✅ **需要用户确认** — 展示需求分析文档给用户，确认理解正确。

**确认话术**：
> 我已经完成了需求分析，请确认以下理解是否正确：
> - 功能清单：<简要列出>
> - 验收标准：<简要列出>
>
> 如果没问题，输入"确认"继续；如有调整，请说明。

### 通过条件

- [ ] 需求分析文档完整
- [ ] 用户已确认需求理解正确
- [ ] 所有 blocker 已关闭

**不通过** → 返回阶段 1 修正需求分析。

---

## 阶段 2：方案设计

**目标**：架构决策、接口设计、数据模型设计。

### 入口：强制质疑节点

进入方案设计前，必须先输出质疑报告：

**质疑内容**：
1. **方向质疑**：方案方向是否合理？如果合理说明理由，不合理则提出替代方案。
2. **约束检查**：可能被遗漏的技术/业务约束。
3. **风险提示**：需要关注的风险点。

质疑报告提交给 Human 确认后，方可进入方案设计。

### 执行内容

- [ ] 输出质疑报告，确认方案方向合理
- [ ] **架构决策**：识别决策关键点，每个决策至少列出 2 个备选方案，评估 trade-off
- [ ] **接口设计**：定义模块/组件间接口，含输入输出格式、错误处理策略
- [ ] **数据模型设计**：新增/修改的数据结构，与现有模型的关系
- [ ] **决策捕捉**：阶段中有没有需要记录的决策？（架构选择/陷阱解决/设计偏离 → 需要 ADR）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/02-design.md`
格式参考：`.self-workflow/configs/templates/design-template.md`

### 完成检查清单

- [ ] 质疑报告已提交并经 Human 确认
- [ ] 关键架构决策已记录（含 trade-off 评估）
- [ ] 接口设计已定义
- [ ] 数据模型已设计
- [ ] 备选方案至少 2 个
- [ ] 决策捕捉已执行

### 错误日志

如果遇到问题，记录到：
`.self-workflow/tasks/<workflow-id>/errors/02-design-errors.md`

---

## Gate：设计审查（weight: full）

### 审查步骤

#### 步骤 0：方向审查（新增）

在程序化验证之前执行方向审查。

**执行指令**（必须执行，不可跳过）：

task(subagent_type="review-agent", prompt="执行方向审查。阅读设计文档 <artifacts/02-design.md>，回答：1)方案与项目现有ADR是否一致？2)有没有更简单的替代方案？3)有没有遗漏的约束条件？4)这个方案的影响范围是什么？输出：pass/fail，如 fail 列出具体问题和建议。")

如果 Review Agent 不可用，主 Agent 自行回答以下问题：

1. **架构一致性**：方案与项目现有 ADR 是否一致？
2. **替代方案**：有没有更简单的替代方案？
3. **约束检查**：有没有遗漏的约束条件？
4. **影响范围**：这个方案的影响范围是什么？

方向审查不通过 → 返回方案设计阶段修正，不进入后续步骤。

#### 步骤 1：程序化验证

本阶段无代码产出，跳过程序化验证。

#### 步骤 2：对抗性审查（Grill 风格）

调用 Review Agent 执行对抗性设计评审。

**执行指令**（必须执行，不可跳过）：

task(subagent_type="review-agent", prompt="执行对抗性设计评审(Grill风格)。对设计文档 <artifacts/02-design.md> 的每个架构决策：分析备选方案是否充分评估、检查选择的理由是否成立、挑战隐含假设、确认trade-off被明确记录。输出审查报告(YAML格式)，每个决策 passed/warning/failed，含 behavior 维度评估。")

**审查流程**（Grill 风格）：
1. 读取设计文档中的每个架构决策
2. 对每个决策：
   - 分析备选方案是否被充分评估
   - 检查选择的理由是否成立
   - 挑战隐含假设
   - 确认 trade-off 被明确记录
3. 输出审查报告

审查报告格式参考：`.self-workflow/configs/templates/review-report-template.md`

审查报告新增 **behavior** 维度：
```
behavior: passed | warning | failed
```
- passed：主 Agent 行为规范（执行了决策捕捉、使用了 question 工具、质疑报告充分）
- warning：行为有轻微偏离
- failed：行为严重偏离（如未执行决策捕捉、未使用 question 工具）


#### 步骤 3：人工确认

✅ **可选** — 复杂设计需要用户确认。简单设计可跳过。

### 通过条件

- [ ] 方向审查通过（无架构不一致问题）
- [ ] 设计文档完成
- [ ] 对抗性审查通过（无 critical 问题）
- [ ] behavior 维度非 failed
- [ ] （可选）用户已确认设计

**不通过** → 返回阶段 2 修正设计。

---

## 阶段 3：代码实现

**目标**：按设计进行编码、单元测试。

### 执行内容

- [ ] **编码**：对照设计文档逐项检查所有接口是否实现
- [ ] **单元测试**：新增代码必须有对应的单元测试，覆盖核心逻辑路径和边界条件
- [ ] **检查依赖**：是否引入了不必要的依赖？
- [ ] **自检**：lint 检查通过（0 error, 0 warning）
- [ ] **自检**：typecheck 通过
- [ ] **决策捕捉**：阶段中有没有需要记录的决策？（实现中遇到的设计偏离/架构调整 → 需要 ADR）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/03-implementation.md`
格式参考：`.self-workflow/configs/templates/implementation-template.md`

### 完成检查清单

- [ ] 所有功能点的代码已实现
- [ ] 单元测试已编写并通过
- [ ] lint 检查通过（0 error, 0 warning）
- [ ] typecheck 通过
- [ ] 未引入不必要的依赖
- [ ] 决策捕捉已执行

### 错误日志

如果遇到实现问题，记录到：
`.self-workflow/tasks/<workflow-id>/errors/03-implementation-errors.md`

---

## Gate：实现审查（weight: full）

### 审查步骤

#### 步骤 1：程序化验证

运行以下验证命令，全部通过后方可进入下一步：

```bash
# 示例（根据项目实际调整）：
npm run lint          # 代码风格检查
npm run typecheck     # 类型检查
npm run test          # 单元测试
```

**失败处理**（Ralph Loop）：
- 最多重试 3 次
- 每次修复后重新触发验证
- 3 次均失败 → 标记为 `auto-fix-failed`，通知用户手动处理

#### 步骤 2：对抗性审查

调用 Review Agent 审查代码实现。

**执行指令**（必须执行，不可跳过）：

task(subagent_type="review-agent", prompt="审查代码实现。对照设计文档 <artifacts/02-design.md> 检查：实现是否与设计一致？代码质量(命名、结构)？测试覆盖是否充分？是否引入安全漏洞？输出：passed/warning/failed，如非 passed 列出具体问题。")

**审查要点**：
- 实现是否与设计文档一致？
- 代码质量（命名、结构、注释）
- 测试覆盖是否充分
- 是否引入安全漏洞

#### 步骤 3：人工确认

❌ 不需要用户确认。

### Gate 重量量化

Gate weight 由三个维度量化计算，取代主观判断：

| 维度 | 条件 | 分值 |
|------|------|------|
| scope（范围） | single-file / multi-file / cross-module | -1 / 0 / +1 |
| risk（风险） | typo-config / logic-change / architecture | -1 / 0 / +1 |
| user-signal（信号） | quick-mode / default / full-review | -1 / 0 / +1 |

**总分计算**：各维度分值相加

| 总分 | Gate weight | 行为 |
|------|------------|------|
| ≤ -1 | skip | 跳过所有审查 |
| = 0 | light | 仅程序化验证，跳过对抗性审查 |
| ≥ 1 | full | 完整审查（程序化 + 对抗性） |

**示例**：
- typo 修复：scope=-1 + risk=-1 + user-signal=-1 → 总分 -3 → skip
- 新增独立功能：scope=0 + risk=0 + user-signal=0 → 总分 0 → light
- 核心架构重构：scope=+1 + risk=+1 + user-signal=+1 → 总分 3 → full

> Human 可覆盖量化结果：如果 Human 明确要求全量审查，即使计算结果为 skip/light，也按 full 执行。
>
> **优先级声明**：量化结果覆盖声明权重。附录 Gate 速查表中的 weight 列仅为"典型场景默认值"。实际执行以 scope + risk + user-signal 三维量化公式计算结果为准。

### 通过条件

- [ ] 程序化验证全部通过（lint + typecheck + test）
- [ ] 对抗性审查无 critical 问题
- [ ] 代码与设计一致

**不通过** → 返回阶段 3 修复。

---

## 阶段 4：功能验证

**目标**：运行完整测试、边界检查、确认功能可用。

### 执行内容

- [ ] **完整测试套件**：所有单元测试、集成测试（如有）、E2E 测试（如有）
- [ ] **边界条件检查**：空值/边界值处理、错误路径覆盖
- [ ] **验收标准逐条验证**：用实际场景验证功能是否满足验收标准
- [ ] **决策捕捉**：阶段中有没有需要记录的决策？（测试中发现的架构问题 → 需要 ADR）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/04-verification.md`
格式参考：`.self-workflow/configs/templates/verification-template.md`

### 完成检查清单

- [ ] 完整测试套件运行通过
- [ ] 验收标准全部满足
- [ ] 边界条件已覆盖
- [ ] 无已知严重问题
- [ ] 决策捕捉已执行

---

## Gate：验证审查（weight: light）

### 审查步骤

#### 步骤 1：程序化验证

运行完整测试套件。

#### 步骤 2：对抗性审查

Review Agent 简要检查：

**执行指令**（必须执行，不可跳过）：

task(subagent_type="review-agent", prompt="审查验证结果文档 <artifacts/04-verification.md>。检查：测试覆盖是否充分？边界条件是否处理？是否引入回归问题？验收标准是否全部满足？输出：passed/warning/failed。")
- 测试覆盖是否充分
- 边界条件是否处理
- 是否引入回归问题

#### 步骤 3：人工确认

❌ 不需要用户确认。但如果程序化验证失败，需要用户介入。

### 通过条件

- [ ] 完整测试套件通过
- [ ] 验收标准全部满足
- [ ] 对抗性审查通过

**不通过** → 返回阶段 3 修复 → 重新进入 Gate 验证。

---

## 阶段 5：总结沉淀

**目标**：提炼经验、补充文档，让下一次同类任务更简单。

### 执行内容

- [ ] **编写总结**：回顾本次工作流的得与失，记录有价值的经验和教训
- [ ] **经验草稿**：提取可复用的解决方案，标记为 `draft` 等级
- [ ] **文档补充**：更新 README 或相关文档（如果代码变更涉及公共接口）
- [ ] **决策捕捉**：总结阶段中是否有需要记录的流程性决策？

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/05-summary.md`
格式参考：`.self-workflow/configs/templates/summary-template.md`

### 完成检查清单

- [ ] **task 级经验**：`artifacts/05-summary.md` 含本次得与失
- [ ] **doc 级经验**：判断是否有跨任务可复用经验（遇到框架缺陷？发现可推广模式？验证新机制？）→ 有则写入 `.self-workflow/docs/`
- [ ] 文档已更新（如代码变更涉及公共接口）
- [ ] 决策捕捉已执行

**双级经验说明**：
- **task 级**：记录在 `05-summary.md`，是本任务的执行总结，供后续查看本次工作流过程
- **doc 级**：写入 `.self-workflow/docs/`，是跨任务可复用的经验。判断标准：
  - 是否遇到了框架缺陷？（→ `*-实施经验.md`）
  - 是否发现了可推广的解决方案模式？（→ `*-参考模式.md`）
  - 是否踩了坑？（→ `*-错误经验.md`）

---

## Checkpoint 回溯（Git-based）

**原理**：利用 Git 的 tag/commit 机制作为 checkpoint，`git worktree` 支持多会话开发。

### 创建 Checkpoint

每 Gate 通过后，Agent 执行：

```bash
git add .self-workflow/tasks/<workflow-id>/task.yaml
git commit -m "<workflow-id>: phase-<N> gate passed"
git tag <workflow-id>-ph<N>-<name>-gate-passed
```

**Tag 命名规范**：`<workflow-id>-ph<阶段号>-<阶段英文名>-gate-passed`

示例：`feat-user-login-20260606-ph1-analysis-gate-passed`

### 回溯操作

从阶段 N 回到阶段 M（M < N）时：

```bash
# 1. 恢复到目标阶段的 checkpoint
git checkout <workflow-id>-ph<M>-<name>-gate-passed

# 2. 更新 task.yaml：M+1 到 N 的 gate 标记为 skipped
# 3. 新建分支继续工作（避免覆盖原分支）
git checkout -b <workflow-id>-revised
```

### 多会话开发（git worktree）

```bash
# 在主分支开发的同时，开另一个会话处理紧急事项
git worktree add ../<worktree-name> <branch-name>

# 在新 worktree 中独立工作、提交
# 完成后清理
git worktree remove ../<worktree-name>
```

### 回溯规则

- 跳过 M 到 N-1 之间已通过的 Gate（在 task.yaml 中记录为 `skipped`）
- 涉及 ADR 变更的回溯 → 必须重新经过方向审查 Gate（设计审查 Gate 的步骤 0）
- 只验证：M 阶段被修改的产物 + 受修改影响的下游阶段

---

## Compound（自动执行）

工作流完成后，执行以下操作：

1. **确认产物完整性**：所有 5 个阶段产物已写入 `.self-workflow/tasks/<workflow-id>/artifacts/`
2. **交叉引用检查**：执行产物引用一致性检查：
   - task.yaml 中 artifacts 列出的文件都存在？
   - milestones 的 ref 指向存在？
   - ADR 互相引用的文件都存在？
   - 新增文件被 task.yaml 记录？
   - 删除文件从引用中移除？
   - 不通过时提示修复，但不阻断
3. **更新元数据**：在 `task.yaml` 中：
   - 最后阶段 `status: completed`, `gate: passed`, `completed: <当前时间>`
   - 顶层 `status: completed`, `updated: <当前时间>`
4. **经验草稿**：如果阶段 5 产出了经验，在 `task.yaml` 中添加 `experience-draft: true`
5. **Compound 标记**：完成后不再修改任何 `tasks/<workflow-id>/` 下的文件

> **注意**：完整的 Compound（经验自动晋升、检索）将在 V2 实现。V1 仅做基础归档和草稿收集。

---

## 附录：快速参考

### Gate 重量速查

| Gate | weight | 方向审查 | 程序化验证 | 对抗性审查（含行为审查） | 人工确认 |
|------|--------|---------|-----------|------------------------|---------|
| 分析审查 | `light` | — | 跳过 | ✅ Review Agent | ✅ 需要 |
| 设计审查 | `full` | ✅ 新增 | 跳过 | ✅ Grill 风格 + behavior | ⚠️ 可选 |
| 实现审查 | `full` | — | ✅ lint/typecheck/test | ✅ Review Agent | ❌ |
| 验证审查 | `light` | — | ✅ 完整测试套件 | ✅ Review Agent | ❌ |

**重量量化**：`full`/`light`/`skip` 由 scope + risk + user-signal 三维分值计算决定（见"Gate 重量量化"）。

### 产物清单

| 阶段 | 文件路径 |
|------|---------|
| 需求分析 | `tasks/<workflow-id>/artifacts/01-analysis.md` |
| 方案设计 | `tasks/<workflow-id>/artifacts/02-design.md` |
| 代码实现 | `tasks/<workflow-id>/artifacts/03-implementation.md` |
| 功能验证 | `tasks/<workflow-id>/artifacts/04-verification.md` |
| 总结沉淀 | `tasks/<workflow-id>/artifacts/05-summary.md` |
| 任务元数据 | `tasks/<workflow-id>/task.yaml` |

### 错误日志路径

| 阶段 | 文件路径 |
|------|---------|
| 阶段 1 错误 | `tasks/<workflow-id>/errors/01-analysis-errors.md` |
| 阶段 2 错误 | `tasks/<workflow-id>/errors/02-design-errors.md` |
| 阶段 3 错误 | `tasks/<workflow-id>/errors/03-implementation-errors.md` |
| 错误索引 | `tasks/<workflow-id>/errors/errors.yaml` |

### 工作流状态管理（task.yaml phases 生命周期）

工作流执行过程中需要持续维护 `task.yaml` 的 `phases` 段，它是工作流实例的权威状态记录。
创建模板参考：`.self-workflow/configs/templates/workflow-metadata-template.yaml`（⚠️ 已废弃，V1.5.2 起新任务不再使用独立 workflow.yaml）

#### 执行流程

1. **启动**：在 `task.yaml` 中初始化 `phases` 段（5 个阶段的初始状态），第 1 阶段 `status: in_progress`
2. **每阶段开始**：更新对应 phase 的 `status: in_progress`，设 `started`
3. **每 Gate 通过**：更新当前 phase 的 `status: completed, gate: passed, completed`，设下一 phase 为 `in_progress`
4. **特殊情况**：
   - Gate 失败返回修复：gate 保持 `pending`，不推进
   - 工作流取消：状态 `cancelled`，保留产物快照
   - Ralph Loop 耗尽：gate `failed`，状态 `stuck`
5. **Checkpoint**：每 Gate 通过后，创建 Git tag（见"Checkpoint 回溯"）

### 历史产物查询

Agent 可以通过读取 `tasks/` 目录来回答用户的问题：

| 用户问法 | Agent 行为 |
|---------|-----------|
| "上次用户登录模块的开发记录在哪？" | 扫描 `tasks/` 目录，按关键词匹配 workflow-id |
| "之前遇到过类似的数据库问题吗？" | 扫描 `tasks/<workflow-id>/errors/` 目录，按关键词匹配错误描述 |
| "我们项目对 API 设计有什么规范？" | 读取 `.self-workflow/specs/`（V2 功能，V1 返回"尚未定义"） |
| "这个工作流当前进展到哪了？" | 读取 `tasks/<workflow-id>/task.yaml` 的 status 和 phases |

### 快速入门（Agent 指引）

执行工作流时，按此顺序操作：

1. 解析用户输入，确定需求描述
2. 创建工作流 ID：`feat-<简述>-<日期>`
3. 按阶段 1 → Gate → 阶段 2 → Gate → ... 顺序执行
4. 每个阶段完成后：
   a. 执行决策捕捉：判断本阶段是否有需要记录的决策
   b. 执行 Gate 检查
   c. **Gate 通过**：创建 Git tag checkpoint，更新 `task.yaml` 中当前 phase 的 status 和 gate，推进到下一阶段
   d. **Gate 不通过**：返回当前阶段修复，gate 保持 pending
5. 所有阶段完成后，执行 Git tag + Compound 归档（交叉引用检查 + 更新 status → completed）

### 错误管理

- **错误详细日志**：写入 `tasks/<workflow-id>/errors/` 下（按阶段如 `01-analysis-errors.md`）
- **错误索引**：同步更新 `tasks/<workflow-id>/errors/errors.yaml`
- **severity 说明**：`blocking`（阻碍推进） / `minor`（非阻塞但值得记录）
- 错误详细上下文记录在阶段错误日志中，索引文件仅做摘要
