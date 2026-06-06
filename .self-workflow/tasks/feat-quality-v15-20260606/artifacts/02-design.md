---
phase: 2
workflow: feat
description: V1.5 质量加固——方案设计
---

# 方案设计 — V1.5 质量加固

> 工作流 ID：`feat-quality-v15-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T16:20:00+08:00
> 参考文档：`docs/V1.5-需求设计.md`、`tasks/feat-quality-v15-20260606/artifacts/01-analysis.md`

---

## 强制质疑（M2 节点）

在进入正式方案设计前，按 M2 要求，先输出质疑报告：

### 方向质疑

**方案方向是否合理？**
- ✅ 合理。V1.5 的核心思路是"不新增功能，先加固流程"，符合"质量先于功能"的四专家评审结论
- 修补 8 个已知缺陷的方向明确，且 V1 的实现经验已经验证了缺陷的真实存在

**约束检查**
- ✅ V1.5 需求设计文档已识别了 6 个未解决问题，设计阶段需逐一给出明确方案
- ⚠️ OpenCode 环境的不确定性（Skills 自动加载、Command 的行为）——建议在实现阶段先做小验证再全面实施

**风险提示**
- 1. feat-workflow.md 是本项目工作流指引，修改后需与安装器模板同步（`packages/installer/templates/configs/guides/feat-workflow.md`）
- 2. 安装器 MANIFEST 修改后需重新运行安装器以验证
- 3. Self-Workflow 开发本身就是"自举"场景——实现中可能发现设计盲区，需要回溯修正（正好验证 Checkpoint 回溯）

---

## 架构决策记录

### ADR-009：Skills 的目录结构与安装方式

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-009 |
| 状态 | 已选择 |
| 决策者 | Sisyphus |
| 日期 | 2026-06-06 |

**背景**

V1.5 需要新增 2 个 Skill（`interaction-protocol` 和 `agent-reasoning`）部署到 `.opencode/skills/`。现有安装器 MANIFEST 只涵盖 `agents/`、`commands/`、`configs/`、`specs/`，没有 `skills/` 的注册条目。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | 安装器模板新增 `skills/<name>/SKILL.md`，MANIFEST 添加对应条目 | 统一入口，沿用已有模式 | 需确认 Skill 自动加载机制 |
| B | 手动直接创建 `.opencode/skills/<name>/SKILL.md`，绕过安装器 | 实现最快 | 违反 ADR-002/004（安装器是唯一入口） |

**选择**：方案 A

**理由**

- 遵循已有 ADR（ADR-002 安装器职责边界、ADR-004 目录职责划分）
- 延续 `templates/` → 安装器 → 目标目录的流程，保持一致性
- 安装器 MANIFEST 本来就是列表驱动的，新增条目成本极低

**关于 Skill 自动加载的待验证问题**

根据 V1 实施记录，Skill 系统要求 `name` frontmatter 才能加载。但 `.opencode/skills/<name>/SKILL.md` 是否自动生效仍待验证。设计在此预留适配空间：

1. 如果**自动生效** → Skill 文件安装后即可使用
2. 如果**需要 `opencode.json` 注册** → 安装器需新增生成/修改 `opencode.json` 的能力（当前无此能力，需降级提醒）
3. 临时降级：在 `feat-workflow.md` 中注明"使用前运行 `skill(name="...")` 加载"

**后果**

- 安装器模板新增 `skills/interaction-protocol/SKILL.md` 和 `skills/agent-reasoning/SKILL.md`
- MANIFEST 新增 2 条记录
- 实现阶段需先验证 Skill 自动加载机制

---

### ADR-010：`/adr` Command 的设计方案

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-010 |
| 状态 | 已选择 |
| 决策者 | Sisyphus |
| 日期 | 2026-06-06 |

**背景**

需要一个备用触发方式创建 ADR。当 Agent 自主决策捕捉遗漏或 Human 需要手动记录时，通过 `/adr` 命令快速创建标准格式的 ADR。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | OpenCode Slash Command（`.opencode/commands/adr.md`），用 Markdown 指引 Agent 执行 ADR 创建流程 | 与现有 `/catchup` 模式一致，无代码依赖 | 依赖 Agent 理解并执行命令指引，不是真正的"自动化" |
| B | 安装器新增 node.js 脚本 `adr.js`，直接操作文件系统 | 真正的自动化 | 需要在安装器中维护额外脚本，复杂度提升 |
| C | 纯靠 Agent 自主决策捕捉，不提供 `/adr` 命令 | 最简 | 没有备用触发方式，Human 想记录时无入口 |

**选择**：方案 A（Slash Command）

**理由**

- 与现有 `/catchup` 命令采用相同模式（Markdown 指引 + Agent 执行）
- 不引入额外的 Node.js 脚本，保持安装器简洁
- 命令指引中可以要求 Agent 读取 task 目录、自动编号、写入文件、更新 task.yaml
- 符合 V1 已验证的 OpenCode Command 机制

**命令执行流程**

```
Human: /adr <标题>
   ↓
Agent 读取命令定义（.opencode/commands/adr.md）
   ↓
1. 识别当前 in_progress 的 task（读取 task.yaml）
   ↓
2. 扫描 task 目录的 adrs/，确定下一个编号
   ↓
3. 从模板创建 ADR 文件
   ↓
4. 更新 task.yaml 的 artifacts/structure 列表
   ↓
5. 输出创建结果，提交 Human 确认
```

**多 task in_progress 时的处理**

取**最近启动**的 in_progress task（读取阶段 `.started` 字段比较）。

**ADR 三类模板**

用户要求 `/adr` 命令支持三种模板类型，覆盖不同粒度的决策记录。模板存放在 `.self-workflow/configs/templates/` 下：

| 模板文件 | 适用场景 | 内容 |
|---------|---------|------|
| `adr-simple-template.md` | 简单决策——无争议、少选项、影响范围明确 | ID、标题、日期、背景、决策、理由、关联 |
| `adr-complex-template.md` | 复杂决策——多备选方案、有 trade-off 分析 | 在上述基础上增加：备选方案表、trade-off 评估、影响分析、反对意见 |
| `adr-review-template.md` | 评审结果统一决策——Review Agent 审查发现需升级为 ADR | 在上述基础上增加：审查结论、Review Agent 引用、讨论记录 |

**命令执行逻辑变更**：

```diff
- /adr <标题>
+ /adr <simple|complex|review> <标题>
```

模板选择机制：
- 如果 Agent 在决策捕捉阶段判定"简单决策"，自选 `simple` 模板
- 涉及架构权衡的决策 → `complex` 模板
- Review Agent 审查报告中需要固化决策 → `review` 模板
- Human 手动触发时可选模板类型

**后果**

- 创建 `.opencode/commands/adr.md`
- 新建 3 个 ADR 模板文件（`adr-simple-template.md`、`adr-complex-template.md`、`adr-review-template.md`）
- 安装器 MANIFEST 新增 3 个模板条目
- 命令指引中包含 task 识别、ADR 编号、**三类模板选择**、task.yaml 更新的详细流程

---

### ADR-011：Gate 重量量化——替换策略

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-011 |
| 状态 | 已选择 |
| 决策者 | Sisyphus |
| 日期 | 2026-06-06 |

**背景**

现有 `feat-workflow.md` 的 "Gate 自动降级" 描述为模糊的"≤ 3 个文件，不涉及架构决策"，Agent 自行判断。V1.5 要求替换为三维量化标准。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | 替换原有模糊描述为量化计算表，公式写进 featu-workflow.md | 清晰可计算，Agent 独立判断 | 增加的规则需要 Agent 正确理解 |
| B | 保留原描述，在 Gate 审查中引入 Review Agent 判断 | 不修改已有文档 | 仍然依赖主观判断，与 V1.5 目标矛盾 |

**选择**：方案 A

**理由**

V1.5 的核心诉求就是"可量化"，方案 A 满足要求。替换区域在 feat-workflow.md 的"实现审查 Gate"下的 "Gate 自动降级"段落。

**替换位置**

`feat-workflow.md` §Gate：实现审查 → 当前"如果变更确实很小（≤ 3 个文件...）"→ 替换为三维量化表

**后果**

- feat-workflow.md 需要修改一个段落
- 安装器模板中对应的 `packages/installer/templates/configs/guides/feat-workflow.md` 同步修改

---

### ADR-012：Git-based Checkpoint 回溯

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-012 |
| 状态 | 已选择 |
| 决策者 | Sisyphus（根据用户评审意见修正） |
| 日期 | 2026-06-06 |

**背景**

V1.5 要求支持从阶段 N 回溯到阶段 M（M < N），跳过已通过的中间 Gate。原设计为文件级 YAML Checkpoint，但用户提出可用 **Git commit + tag** 天然作为 checkpoint，同时用 `git worktree` 解决多会话开发问题。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **Git-based**：每 Gate 通过后 `git tag`，回溯时 `git checkout`，多会话用 `git worktree` | 零新数据结构、天然版本控制、与现有开发流程无缝集成 | 需 Agent 理解 Git 操作；跨会话工作流依赖 Human 管理 worktree |
| B | 文件级 Checkpoint：`checkpoints/` 目录 YAML 快照 | 纯文件方案，不依赖 Git | 自造数据结构、与真实代码状态可能不同步、多会话无解 |
| C | 混合方案：Git tag 做 checkpoint + checkpoints/ 存元数据（gate 状态、artifacts 清单） | 兼顾版本控制和工作流元数据 | 复杂度最高，两套系统需保持同步 |

**选择**：方案 A（Git-based），辅以最小元数据

**理由**

对文件级方案的批判性分析：

| 文件级缺陷 | 后果 | Git 方案如何解决 |
|-----------|------|----------------|
| YAML 中的 artifacts 列表可能和实际代码不一致 | 回溯时人工排查差异 | `git checkout` 精确恢复到 commit 时的代码状态 |
| 无法处理"修改一半"的状态 | 文件级快照不可靠 | commit 天然是原子快照 |
| `checkpoints/` 目录本身需要被 Git 追踪 | 自我引用 | Git 本身就是版本系统 |
| 多会话开发无解 | 无法并行 | `git worktree` 原生支持并行工作副本 |
| Agent 需要写 YAML | 额外的文件 I/O | `git tag` 一条命令即可 |

**Git Checkpoint 机制**

```
Gate 通过 → Agent 执行:
  git tag feat-quality-v15-ph1-analysis-done
  (或: feat-quality-v15-ph1-analysis-gate-passed)

需要回到阶段 1 → Agent 执行:
  git checkout feat-quality-v15-ph1-analysis-done
  # 代码精确回到阶段 1 完成时的状态
  # 阶段 2 和阶段 3 的 Gate 标记为 skipped（在 workflow.yaml 中）

继续工作 → 创建新分支:
  git checkout -b feat-quality-v15-continued
```

**Tag 命名规范**

```
<workflow-id>-ph<阶段号>-<阶段英文名>-<状态>

示例:
  feat-quality-v15-ph1-analysis-gate-passed
  feat-quality-v15-ph2-design-gate-passed
  feat-quality-v15-ph3-implement-gate-passed
```

**Gate 状态元数据**

纯 Git 无法记录"Gate passed/failed/skipped"等状态。这些元数据仍通过 `workflow.yaml` 管理——每次 phase 状态变更时 commit：

```
Agent 提交（Gate 通过后）:
  git add .self-workflow/tasks/<workflow-id>/workflow.yaml
  git commit -m "phase-1: gate passed"
  git tag feat-quality-v15-ph1-analysis-gate-passed
```

**多会话开发（`git worktree`）**

```
场景：开发 V1.5 同时处理一个紧急 bug 修复

主会话（V1.5 开发）:
  工作目录: ./
  分支: feat-quality-v15

紧急修复会话:
  git worktree add ../hotfix-bug hotfix-bug-branch
  工作目录: ../hotfix-bug/
  分支: hotfix-bug-branch

优势：
  - 两个工作目录互不干扰
  - 共享同一 Git 仓库（不重复 clone）
  - 每个 worktree 可以独立 commit、push
```

**回溯规则**

- 从阶段 N 回到阶段 M → `git checkout <ph-M-tag>`，中间 Gate 在 `workflow.yaml` 中标记 `skipped`
- 涉及 ADR 变更的回溯 → 必须重新经过方向审查 Gate（设计 Gate）
- 回溯后继续工作 → 建议开新分支（`git checkout -b <workflow-id>-revised`）

**后果**

- `feat-workflow.md` 新增 Checkpoint 回溯章节（基于 Git tag + worktree）
- 不需要 `checkpoints/` 目录
- Gate 通过后 Agent 需执行 `git tag` + `git commit`（workflow.yaml）
- 需要确认：当前项目是否已有 `.gitignore` 规则会阻塞这些操作？
- `git worktree` 需要 Git 2.5+（2015 年的版本，几乎所有环境都满足）

---

## 接口设计

### 模块间交互关系

```
┌─────────────────┐    引用     ┌──────────────────────┐
│  feat-workflow.md │◄──────────│  templates/*.md      │
│  (工作流指引)      │           │  (产物模板)           │
└────────┬─────────┘           └──────────────────────┘
         │ 执行指引
         ▼
┌─────────────────────────────────────────────────┐
│  Skills (.opencode/skills/)                     │
│  ├─ interaction-protocol/SKILL.md               │
│  │    ├─ 主 Agent 调用 question 工具             │
│  │    └─ 主 Agent 总结先行再询问                  │
│  └─ agent-reasoning/SKILL.md                    │
│       ├─ 主 Agent 独立思考再执行                  │
│       ├─ 上下文精简（决策链路 vs 执行细节）        │
│       └─ 委托粒度判断 + 结果验证                  │
└────────────────────┬────────────────────────────┘
                     │ 加载
                     ▼
┌─────────────────────────────────────────────────┐
│  主 Agent（执行工作流）                           │
│  在 Gate 中调用 Review Agent 审查                │
│  在阶段末尾执行决策捕捉（/adr 或自主记录）          │
│  在阶段切换时创建 Checkpoint                      │
└────────┬──────────────┬─────────────────────────┘
         │ 审查          │ 记录
         ▼               ▼
┌─────────────────┐  ┌──────────────────────────┐
│ Review Agent    │  │ task.yaml + adrs/ + logs/ │
│ (.opencode/     │  │ (.self-workflow/tasks/)   │
│  agents/        │  │                          │
│  review-agent   │  │  Checkpoint 回溯时读取    │
│  .md)           │  │  checkpoint/ 目录         │
└─────────────────┘  └──────────────────────────┘
```

### 主 Agent ↔ Skills 接口

```
Skill 加载：
  入口：skill(name="interaction-protocol")
  效果：SKILL.md 内容注入当前对话上下文
  验证：frontmatter 中 name 字段必须存在

Skill 约束行为：
  interaction-protocol 影响：
    - Agent 的提问方式（必须用 question 工具）
    - 无需加载也可行为（指令写入 skill，但 Agent 自主遵守）
  
  agent-reasoning 影响：
    - Agent 在收到 Human 方向后先自主思考
    - 委托粒度决策（>30s→委托，<5s→自做）
    - 委托后必须验证结果
```

### 主 Agent ↔ `/adr` Command 接口

```
输入：/adr <ADR 标题文字>
触发方式：Human 键入 或 Agent 在决策捕捉时引用

命令文件响应：
  1. 扫描 tasks/ 下所有 in_progress 的 task
     - 如果是多个，取最近启动的
  2. 读取该 task 目录下的 adrs/，计算下一个编号
  3. 使用 ADR 标准格式（参考 ADR-003 的模板结构和已部署的 ADR 文件）创建 ADR 文件
  4. 写入 `.self-workflow/tasks/<task-id>/adrs/ADR-<编号>-<标题>.md`
  5. 更新 task.yaml 的 structure.adrs 列表
  6. 输出结果

错误处理：
  - 无 in_progress task → 提示"没有进行中的任务，无法创建 ADR"
  - adrs/ 目录不存在 → 创建该目录
```

### 主 Agent ↔ Git Checkpoint 接口

```
Gate 通过 → Agent 执行:
  git add .self-workflow/tasks/<workflow-id>/workflow.yaml
  git commit -m "<workflow-id>: phase-<N> gate passed"
  git tag <workflow-id>-ph<N>-<name>-gate-passed

需要回到阶段 M → Agent 执行:
  git checkout <workflow-id>-ph<M>-<name>-gate-passed
  # 更新 workflow.yaml: 当前为 phase M, M+1~N 的 gate=skipped

继续前进（创建新分支）:
  git checkout -b <workflow-id>-revised

多会话（git worktree）:
  git worktree add ../<worktree-name> <branch-name>
  在另一个窗口中独立工作
  完成后 git worktree remove ../<worktree-name>
```

---

## 数据模型

### 新增结构

#### ADR 三类模板

模板存放于 `.self-workflow/configs/templates/`，命名规则：`adr-<type>-template.md`

**模板 A：简单决策（`adr-simple-template.md`）**

```markdown
---
id: <编号>
title: <标题>
type: simple
date: <YYYY-MM-DD>
status: 已采纳
---

# ADR-<编号>：<标题>

## 背景
<为什么需要这个决策>

## 决策
<具体的决策内容>

## 理由
<为什么选择这个方案>

## 关联
- 关联需求：<功能点>
```

**模板 B：复杂决策（`adr-complex-template.md`）**

```markdown
---
id: <编号>
title: <标题>
type: complex
date: <YYYY-MM-DD>
status: 已采纳
---

# ADR-<编号>：<标题>

## 背景
<需要做此决策的原因和上下文>

## 备选方案
| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | <描述> | <优点> | <缺点> |
| B | <描述> | <优点> | <缺点> |

## 选择
方案 <A/B>

## 理由
<选择此方案的具体理由>

## 影响
<选择此方案带来的正面和负面影响>

## 关联
- 关联 ADR：<ADR-ID>
- 关联需求：<功能点>
```

**模板 C：评审结果统一决策（`adr-review-template.md`）**

```markdown
---
id: <编号>
title: <标题>
type: review
date: <YYYY-MM-DD>
status: 已采纳
review-agent: <Review Agent ID>
review-report: <审查报告引用>
---

# ADR-<编号>：<标题>

## 背景
<为什么需要此决策>

## 审查结论
<Review Agent 的审查发现摘要>

## 决策
<基于审查结论做出的决策>

## 理由
<决策的具体理由，引用审查报告>

## 讨论记录
- <讨论点 1>：<结论>
- <讨论点 2>：<结论>

## 影响
<决策后果>

## 关联
- 关联审查报告：<文件路径>
- 关联 ADR：<ADR-ID>
```

#### Skill 目录结构

```
.opencode/skills/<skill-name>/SKILL.md
  格式：Markdown + frontmatter
  frontmatter:
    name: <skill-name>
    description: <简要描述>
```

#### ADR 简化格式（用于 `/adr` 命令）

```yaml
---
id: <编号>
title: <标题>
date: <YYYY-MM-DD>
status: 已采纳
---
```

### 变更结构

| 原结构 | 新结构 | 变更原因 |
|--------|--------|---------|
| `feat-workflow.md` Gate 降级：模糊文字 | 三维量化表（scope/risk/user-signal） | M1 Gate 重量量化 |
| `feat-workflow.md` 阶段：自然语言描述 | 检查清单驱动 | M2 检查清单驱动执行 |
| `feat-workflow.md` Gate 设计：程序化→对抗性 | 方向审查→程序化→对抗性→行为审查 | M1 方向审查 + M2 行为审查 |
| `feat-workflow.md` 阶段入口：直接进入 | 质疑节点→确认→进入 | M2 强制质疑流程 |
| `feat-workflow.md` 阶段末尾：直通 Gate | 决策捕捉→Gate | M1 决策捕捉嵌入 |
| `feat-workflow.md` 缺失回溯机制 | 新增 Git-based Checkpoint 回溯章节（git tag + git worktree） | M1 Checkpoint 回溯 |
| `feat-workflow.md` Compound：仅归档 | 新增交叉引用检查 | M3 交叉引用 |
| 缺失 ADR 分类模板 | 新增 `adr-simple-template.md`、`adr-complex-template.md`、`adr-review-template.md` | M0 决策记录 |
| `review-agent.md`：基础审查 | 新增 behavior 维度 + 行为审查 | M2 行为审查 |
| 产物模板：纯结构 | 新增 validation frontmatter | M3 结构化验证 |
| 安装器 MANIFEST | 新增 skills/ 条目 | M0 Skills 部署 |

---

## 实现策略

### 实施顺序

```
M0（基础框架融入）→ M1（流程防错）→ M2（Agent 约束）→ M3（产物验证）
```

每个阶段涉及的文件变更清单：

#### M0：框架融入

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/installer/templates/skills/interaction-protocol/SKILL.md` | 新增 | 交互式问答 Skill |
| `packages/installer/templates/skills/agent-reasoning/SKILL.md` | 新增 | Agent 推理 Skill |
| `.opencode/commands/adr.md` | 新增 | /adr 命令 |
| `packages/installer/templates/configs/templates/adr-simple-template.md` | 新增 | ADR 简单决策模板 |
| `packages/installer/templates/configs/templates/adr-complex-template.md` | 新增 | ADR 复杂决策模板 |
| `packages/installer/templates/configs/templates/adr-review-template.md` | 新增 | ADR 评审结果模板 |
| `packages/installer/index.js` | 修改 | MANIFEST 新增 3 个 skills 条目 + 3 个 adr 模板条目 + EMPTY_DIRS 新增 skills/ |
| `.self-workflow/configs/guides/feat-workflow.md` | 修改 | 快速入门增加 task.yaml 创建步骤 |
| `.opencode/agents/review-agent.md` | 修改 | Gate 检查增加 task.yaml 存在检查 |

#### M1：流程防错

| 文件 | 操作 | 说明 |
|------|------|------|
| `.self-workflow/configs/guides/feat-workflow.md` | 修改 | 方向审查 Gate、Checkpoint、决策捕捉、Gate 量化 |
| `packages/installer/templates/configs/guides/feat-workflow.md` | 同步 | 与上相同 |

#### M2：Agent 约束

| 文件 | 操作 | 说明 |
|------|------|------|
| `.self-workflow/configs/guides/feat-workflow.md` | 修改 | 质疑节点、检查清单 |
| `packages/installer/templates/configs/guides/feat-workflow.md` | 同步 | 同上 |
| `.opencode/agents/review-agent.md` | 修改 | 新增 behavior 维度 |

#### M3：产物验证

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/installer/templates/configs/templates/*.md` | 修改 | 新增 validation frontmatter |
| `.self-workflow/configs/templates/*.md` | 同步 | 同上 |
| `.self-workflow/configs/guides/feat-workflow.md` | 修改 | Compound 增加交叉引用检查 |

### 自举验证计划

V1.5 完成后，在 Self-Workflow 项目上完成一个真实功能来验证：
- 新建一个 task 并按 V1.5 流程执行
- 验证方向审查 Gate 生效
- 验证决策捕捉启动
- 验证产物模板强制执行
