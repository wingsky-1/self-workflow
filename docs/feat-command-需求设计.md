# /feat 命令需求设计

> 版本：v0.2
> 状态：已补全（已完成与 feat-workflow.md v0.2 的交叉对照审查）
> 最后更新：2026-06-06
> 关联：`V1.5-需求设计.md`、`feat-workflow.md`(v0.2)、`.self-workflow/todo.md` #1

---

## 1. 问题定义

**现状**：`feat-workflow.md` 是一份 570 行的指引文档，定义了完整的 5 阶段 + 4 Gate 流程。但它是"被动文档"——Agent 不会主动加载它，用户也无法通过 slash command 触发。触发完全依赖用户在对话中手动说"请按照 feat 工作流执行"，不可靠、不统一。

**目标**：提供一个确定性的入口 `/feat`，一键启动工作流，自动完成目录初始化、元数据创建、阶段推进。

---

## 2. 功能需求

| ID | 需求 | 优先级 |
|----|------|--------|
| F1 | `/feat <描述>` 启动一个完整的 feat 工作流 | P0 |
| F2 | 自动生成 workflow-id（`feat-<slug>-<YYYYMMDD>`），冲突时追加序号 | P0 |
| F3 | 自动创建 `task.yaml` + `workflow.yaml` + 子目录（adrs/logs/artifacts/errors） | P0 |
| F4 | 加载 `feat-workflow.md` 作为执行指引，进入阶段 1（需求分析） | P0 |
| F5 | `/feat --quick <描述>` 快速模式（user-signal = -1） | P1 |
| F6 | `/feat`（无参数）展示当前所有任务状态仪表盘 | P1 |
| F7 | 自动加载 `interaction-protocol` + `agent-reasoning` Skill | P1 |

---

## 3. 执行流程

```
/feat 实现用户登录模块
      │
      ▼
┌─ 步骤 1：参数解析 ───────────────────────────────────┐
│  extract: description="实现用户登录模块"               │
│  detect: quick=false                                  │
│  generate: id="feat-user-login-20260606"               │
│  check: 是否已有同名 task → 冲突追加 "-2"             │
└──────────────────────────────────────────────────────┘
      │
      ▼
┌─ 步骤 2：目录初始化 ─────────────────────────────────┐
│  mkdir: .self-workflow/tasks/feat-user-login-20260606/ │
│  mkdir: .../adrs/                                     │
│  mkdir: .../logs/                                     │
│  mkdir: .../artifacts/                                │
│  mkdir: .../errors/                                   │
└──────────────────────────────────────────────────────┘
      │
      ▼
┌─ 步骤 3：元数据创建 ─────────────────────────────────┐
│  write: task.yaml (based on existing format)          │
│  write: workflow.yaml (based on template)             │
│  write: errors/errors.yaml (empty skeleton)           │
└──────────────────────────────────────────────────────┘
      │
      ▼
┌─ 步骤 4：开始阶段 1 ─────────────────────────────────┐
│  load: .self-workflow/configs/guides/feat-workflow.md │
│  load: interaction-protocol Skill                     │
│  load: agent-reasoning Skill                          │
│  update: workflow.yaml phase[0].status = in_progress  │
│  execute: 阶段 1 需求分析                             │
└──────────────────────────────────────────────────────┘
```

---

## 4. 关键设计决策

### 决策 1：Command 而非 Skill

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Command（选用）** | 用户可用 `/feat` 显式触发；与现有 `/adr` `/catchup` 一致 | 只能手动触发，无法自动检测 |
| Skill | 可被 Agent 自动加载 | 缺乏用户触发入口，不符合"显式启动工作流"的定位 |

**选择理由**：工作流应该是用户主动决策的行为，而非 Agent 的自动行为。Command 提供明确的触发语义："我要开始一个新功能了"。

### 决策 2：workflow-id 生成规则

| 方案 | 示例 | 评价 |
|------|------|------|
| **slug + 日期（选用）** | `feat-user-login-20260606` | 可读、可排序、符合现有约定 |
| UUID | `feat-a1b2c3d4` | 无冲突但不可读，catchup 时无法辨认 |
| 纯日期 | `feat-20260606-001` | 可排序但不可读 |

**冲突处理**：同名 slug 同日启动 → 追加 `-2`, `-3`。例：`feat-user-login-20260606-2`。

### 决策 3：初始化 vs 加载分离

`/feat` 命令只负责**启动**（步骤 1-4），不负责执行各阶段。阶段执行由 `feat-workflow.md` 指引驱动。这是关注点分离：

```
/feat 命令          →  启动（一次性）        →  目录 + 元数据
feat-workflow.md    →  执行（持续）          →  5 阶段 + 4 Gate
```

### 决策 4：Skills 加载策略

不硬编码加载哪些 Skill。命令指令中写明：**加载 `feat-workflow.md` 后，按指引加载相应 Skill**。当前为 `interaction-protocol` + `agent-reasoning`，未来可在指引中扩展。

### 决策 5：`--quick` 模式与 Gate 重量量化

`feat-workflow.md` v0.2 定义了 Gate 重量三维量化公式：

```
总分 = scope + risk + user-signal
```

| 总分 | Gate weight | 行为 |
|------|------------|------|
| ≤ -1 | skip | 跳过所有审查 |
| = 0 | light | 仅程序化验证，跳过对抗性审查 |
| ≥ 1 | full | 完整审查（程序化 + 对抗性） |

`/feat --quick` 将 `user-signal` 设为 -1，目的是让**典型的快速任务**（如 typo 修复、配置修改）自动落入 skip/light 区间：

| 任务类型 | scope | risk | user-signal | 总分 | Gate weight |
|---------|-------|------|-------------|------|-------------|
| typo 修复 | -1 (single-file) | -1 (typo-config) | -1 (quick) | **-3** | **skip** |
| 配置值修改 | -1 (single-file) | -1 (typo-config) | -1 (quick) | **-3** | **skip** |
| 单文件逻辑改动 | -1 (single-file) | 0 (logic-change) | -1 (quick) | **-2** | **skip** |
| 多文件小改动 | 0 (multi-file) | 0 (logic-change) | -1 (quick) | **-1** | **skip** |
| 多文件功能新增 | 0 (multi-file) | +1 (architecture) | -1 (quick) | **0** | **light** |

> **关键约束**：user-signal 仅是三维之一。即使 `--quick`，若 scope 和 risk 分值高（如跨模块架构变更），Gate weight 仍可能为 full。`--quick` 不会"强制跳过"，只降低门槛。

**与 `--quick` 不适用场景的关系**：`feat-workflow.md` 定义 `--quick` 适用于"单文件 typo 修复、配置值修改、快速原型（< 30 行代码）"。范围外任务不应使用 `--quick`，否则可能因审查不足引入风险。

---

## 5. 产出物清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `.opencode/commands/feat.md` | **新增** | Command 定义 |
| `packages/installer/templates/commands/feat.md` | **新增** | 安装器模板源 |
| `packages/installer/index.js` | **修改** | MANIFEST 新增 1 行 |
| `packages/installer/package.json` | **修改** | 版本升 0.1.0 → 0.2.0 |

---

## 6. Command 定义（完整内容）

```markdown
---
description: 启动特性开发工作流 — 5 阶段 + 4 Gate，自动创建任务目录与元数据
argument-hint: [--quick] <特性描述>
---

# /feat 命令

## 用法

```
/feat 实现用户登录模块                    # 标准模式
/feat --quick 修复 README 中的拼写错误    # 快速模式
/feat                                     # 查看当前任务状态
```

## 参数

| 参数 | 说明 |
|------|------|
| `--quick` | 快速模式，Gate 重量量化的 user-signal = -1 |
| `<描述>` | 特性/任务的简短描述，用于生成 workflow-id slug |

## 执行流程

### 步骤 0：前置检查（Pre-flight）

在创建目录和文件之前，先执行以下检查：

1. **目录存在性**：确认 `.self-workflow/` 目录存在，不存在则提示先运行 `self-workflow init`
2. **模板可用性**：确认 `.self-workflow/configs/templates/workflow-metadata-template.yaml` 存在
3. **并发保护**：扫描 `.self-workflow/tasks/*/task.yaml`，检查是否有 `status: in_progress` 的任务
   - 无冲突 → 继续
   - 已有进行中任务 → 提示用户：
     > "已有进行中任务 `feat-xxx-YYYYMMDD`（阶段 N/5）。不建议并发执行多个工作流。是否继续？"
   - 用户确认后继续（此时不强制阻止，仅警告）

### 步骤 1：参数解析

- 提取 `<描述>`，生成 slug：
  - Unicode 中文字符（U+4E00–U+9FFF, U+3400–U+4DBF）保留原文
  - ASCII 字母/数字保留
  - 空格、标点、特殊符号替换为 `-`
  - 连续多个 `-` 压缩为一个
  - 首尾 `-` 去除
  - 截断至 40 字符，在单词边界处截断（如有）
  - 示例：`"实现用户登录模块（含OAuth2.0）"` → `"实现用户登录模块-含OAuth2-0"`
- 检测 `--quick` 标志
- 生成 workflow-id：`feat-<slug>-<YYYYMMDD>`
- 检查 `.self-workflow/tasks/` 中是否已有以相同前缀开头的目录（同日同 slug）
  - 无冲突 → 使用
  - 有冲突 → 追加 `-2`, `-3`...（最多 10 次，超出则报错）

### 步骤 2：目录初始化

在 `.self-workflow/tasks/<workflow-id>/` 下创建：

```
.self-workflow/tasks/<workflow-id>/
├── task.yaml
├── workflow.yaml
├── adrs/           # 决策记录
├── logs/           # 实施记录
├── artifacts/      # 阶段产物
└── errors/         # 错误日志
    └── errors.yaml
```

### 步骤 3：写入 task.yaml

基于以下模板写入，填充具体值：

```yaml
name: <slug>
title: <描述>
status: in_progress
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
tags: []
description: >
  <描述原文>

structure:
  root:
    - "task.yaml"
    - "workflow.yaml"
  adrs: []
  logs: []
  artifacts: []

milestones: []

artifacts:
  - "workflow.yaml"
```

**字段说明**：
- `name`/`title`：slug 和原始描述，用于 dashboard 展示
- `description`：使用 YAML 折叠块标量 `>`（自动换行），保留用户原始描述全文
- `structure`：记录目录结构。子项（adrs/logs/artifacts）在对应文件创建时增量更新
- `milestones`：空数组，工作流推进时由 Agent 按阶段追加
- `tags`：初始为空，可由 Agent 在工作流中补充

### 步骤 4：写入 workflow.yaml

从 `.self-workflow/configs/templates/workflow-metadata-template.yaml` 读取模板，填充以下字段：

| 字段 | 填充值 |
|------|--------|
| `workflow-id` | `<生成的 workflow-id>` |
| `type` | `feat`（固定值） |
| `status` | `in_progress` |
| `created` | `<当前时间 ISO 8601 格式：YYYY-MM-DDTHH:mm:ss±HH:MM>` |
| `updated` | 同 `created` |
| `description` | `<描述原文>` |

所有 `phases[0..4]` 保持模板默认值：
- `status: pending`, `gate: pending`
- `started: null`, `completed: null`, `errors: []`

**注意**：时间戳格式为 `YYYY-MM-DDTHH:mm:ss±HH:MM`（含时区，如 `2026-06-06T16:12:00+08:00`），与模板约定一致。`updated` 字段在每次工作流状态变更时同步更新。

### 步骤 5：写入 errors.yaml

```yaml
errors: []
```

### 步骤 6：进入阶段 1 — 需求分析

1. 加载 `.self-workflow/configs/guides/feat-workflow.md` 作为执行指引
2. 按指引加载 `interaction-protocol` Skill（涉及选项选择时使用 question 工具）
3. 按指引加载 `agent-reasoning` Skill（委托优先、质疑方向、决策捕捉）
4. 更新 `workflow.yaml`：
   - `phases[0].status` → `in_progress`
   - `phases[0].started` → `<当前时间 ISO 8601>`
   - 顶层 `updated` → `<当前时间 ISO 8601>`
5. 按 `feat-workflow.md` **阶段 1：需求分析** 的检查清单和输出要求执行：
   - 理解需求 → 识别约束 → 定义验收标准
   - 产出 `artifacts/01-analysis.md`
   - 执行决策捕捉（阶段内如有架构选择需触发 `/adr`）

**生命周期移交**：此步骤完成后，命令启动阶段结束。后续所有阶段推进（Gate 审查、阶段 2-5、Checkpoint 创建）由 `feat-workflow.md` 指引驱动。Agent 必须在每个阶段结束时按指引更新 `workflow.yaml`（阶段 status/gate、时间戳），并在每个 Gate 通过后创建 Git tag checkpoint。

### 步骤 7：输出启动报告

```yaml
workflow-started:
  id: "<workflow-id>"
  title: "<描述>"
  mode: "<standard | quick>"
  path: ".self-workflow/tasks/<workflow-id>/"
  next: "阶段 1 — 需求分析"
```

---

## 无参数模式（`/feat`）

扫描 `.self-workflow/tasks/` 下所有 task，输出任务仪表盘：

```
📊 任务状态

▶ 进行中 (1)：
  feat-quality-v15-20260606  V1.5 质量加固  [阶段 5/5 完成]

✅ 已完成 (1)：
  20260606-V1实现  V1 里程碑实现

⚠ 卡住 (0)：
  (无)

❌ 已取消 (0)：
  (无)
```

## 错误处理

| 场景 | 行为 |
|------|------|
| 缺少 `<描述>` 且非无参数模式 | 提示"请提供特性描述，例如：/feat 实现用户登录" |
| workspace-id 冲突（追加后仍冲突 > 10 次） | 提示"slug 冲突过多，请使用更具体的描述" |
| `.self-workflow/` 目录不存在 | 提示先运行 `self-workflow init` 安装 |
| `templates/workflow-metadata-template.yaml` 不存在 | 提示模板缺失，建议重新安装 |
```

---

## 7. 安装器变更

`packages/installer/index.js` 的 MANIFEST 数组新增一行：

```javascript
[".opencode/commands/feat.md", "commands/feat.md"],
```

---

## 8. 与现有 V1.5 能力的集成验证

| V1.5 能力 | `/feat` 集成点 | 验证方式 |
|-----------|---------------|---------|
| Gate 重量量化 | `--quick` → user-signal = -1 | 快速模式任务，验证 Gate 是否降为 skip/light |
| 决策捕捉 | 每阶段末尾，feat-workflow 指引驱动 | 检查 ADR 是否被自动创建 |
| Checkpoint 回溯 | Git tag 创建，feat-workflow 指引驱动 | 回溯阶段后检查 tag 是否存在 |
| Review Agent | 每 Gate 处调用，feat-workflow 指引驱动 | 检查审查报告是否含 behavior 维度 |
| task.yaml 强制 | 步骤 3 自动创建 | Gate 审查时 Review Agent 检查 task.yaml 存在 |
| Skills 加载 | 步骤 6 加载两个 Skill | Agent 行为：question 工具使用、委托决策 |
| `/adr` 命令 | 阶段内决策捕捉时自动调用 | ADR 文件创建，task.yaml 自动更新 |

---

## 9. 验收标准

- [ ] **AC1**：`/feat 实现测试功能` 创建完整目录结构（adrs/ logs/ artifacts/ errors/），task.yaml + workflow.yaml + errors.yaml 内容符合模板格式
- [ ] **AC2**：workflow.yaml 中的时间戳为 ISO 8601 含时区格式（`YYYY-MM-DDTHH:mm:ss±HH:MM`）
- [ ] **AC3**：`/feat --quick 修复typo` 标记为快速模式，后续执行阶段时 Gate 重量计算含 user-signal = -1
- [ ] **AC4**：`/feat`（无参数）展示已有任务状态仪表盘，计数与 `.self-workflow/tasks/` 实际目录数一致
- [ ] **AC5**：同名 slug 同日冲突时，workflow-id 自动追加 `-2`（如 `feat-user-login-20260606-2`）
- [ ] **AC6**：slug 冲突超过 10 次时报错提示，不创建目录
- [ ] **AC7**：已有 in_progress 任务时，提示用户确认后再继续（防并发）
- [ ] **AC8**：`.self-workflow/` 目录不存在时，提示先运行 `self-workflow init`
- [ ] **AC9**：`self-workflow init` 新项目后，`.opencode/commands/feat.md` 文件存在且内容完整
- [ ] **AC10（自举验证）**：在 self-workflow 项目上执行 `/feat 实现测试功能`，完成后检查：
  - `artifacts/01-analysis.md` 包含功能清单、约束、验收标准（Given-When-Then 格式）
  - `workflow.yaml` 至少 phases[0] 的状态推进到 completed、gate 为 passed
  - Git tag `feat-实现测试功能-<YYYYMMDD>-ph1-analysis-gate-passed` 存在

---

## 10. 不在本次范围

| 排除项 | 原因 |
|--------|------|
| `/feat resume <id>` 恢复已暂停任务 | 由 `/catchup` 命令覆盖 |
| 阶段专用 Skill 自动切换 | V2 范围，需 Adapter 编译能力 |
| 多工作流并发执行 | 不支持。本命令仅做并发检测警告（步骤 0），不提供工作流级别的隔离或冲突解决 |
| 模板引擎渲染 | 当前直接读写 YAML/Markdown，够用 |
| 工作流暂停/恢复机制 | 当前仅支持「取消」状态（cancelled），无暂停-恢复语义 |

---

## 附：关联问题（来自 .self-workflow/todo.md）

| # | 问题 | 本设计覆盖 |
|---|------|-----------|
| 1 | feat-workflow 触发机制 | ✅ `/feat` 命令提供 |
| 2 | 命名规则约束 | ✅ workflow-id 自动生成，强制格式 |
| 3 | ADR 编号 per-task | — 需单独修复 `/adr` 命令 |
| 4 | Checkpoint Git-based | — 已在 feat-workflow.md v0.2 中实现 |
| 5 | adr 去类型参数 | — 需单独修复 `/adr` 命令 |
| 6 | 每阶段指导增强 | — V2 范围 |
