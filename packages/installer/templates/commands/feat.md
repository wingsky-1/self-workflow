<!--
  安装器模板 — 执行 self-workflow init 时复制到 .opencode/commands/feat.md。
  变更此文件后请运行安装器同步，或手动复制到 .opencode/commands/feat.md。
-->
---
description: 启动特性开发工作流 — 5 阶段 + 4 Gate，自动创建任务目录与元数据
argument-hint: [--quick] <特性描述>
---

# /feat 命令

## 角色定位

本命令是 `/feat` 工作流的系统级提示词框架，负责：
- 入口交互、参数解析、目录初始化
- 系统级约束定义（task() 调用规范、skill 加载规则、Gate 量化公式）
- 任务仪表盘展示

工作流的阶段定义、Gate 审查规则、Checkpoint 机制由 `.self-workflow/configs/guides/feat-workflow.md` 定义，本命令通过引用该文件驱动工作流执行。用户可通过修改安装器模板源 `packages/installer/templates/configs/guides/feat-workflow.md` 定制工作流（运行 `init --force` 同步）。

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
2. **并发保护**：扫描 `.self-workflow/tasks/*/task.yaml`，检查是否有 `status: in_progress` 的任务
   - 无冲突 → 继续
   - 已有进行中任务 → 提示用户：
     > "已有进行中任务 `feat-xxx-YYYYMMDD`（阶段 N/5）。不建议并发执行多个工作流。是否继续？"
   - 用户确认后继续（此时不强制阻止，仅警告）

### 步骤 1：参数解析

- 提取 `<描述>`，生成 slug：
  - Unicode 中文字符（U+4E00–U+9FFF, U+3400–U+4DBF）保留原文
  - ASCII 字母/数字保留，大写转小写
  - 空格、标点、特殊符号替换为 `-`
  - 连续多个 `-` 压缩为一个
  - 首尾 `-` 去除
  - 截断至 40 字符，在单词边界处截断（如有）
  - 若结果为空 → 使用 `task`
  - 示例：`"实现用户登录模块（含OAuth2.0）"` → `"实现用户登录模块-含oauth2-0"`
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
updated: <YYYY-MM-DDTHH:mm:ss+HH:MM>
tags: []
description: >
  <描述原文>

workflow-id: <feat-<slug>-<YYYYMMDD>>
type: feat

phases:
  - id: 1
    name: 需求分析
    status: in_progress
    gate: pending
    started: <当前时间 ISO 8601>
    completed: null
    artifact: "01-analysis.md"
    errors: []
  - id: 2
    name: 方案设计
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "02-design.md"
    errors: []
  - id: 3
    name: 代码实现
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "03-implementation.md"
    errors: []
  - id: 4
    name: 功能验证
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "04-verification.md"
    errors: []
  - id: 5
    name: 总结沉淀
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "05-summary.md"
    errors: []

experience-draft: false

structure:
  root:
    - "task.yaml"
  adrs: []
  logs: []
  artifacts: []

milestones: []

cross-refs: []
```

**字段说明**：
- `name`/`title`：slug 和原始描述，用于 dashboard 展示
- `description`：使用 YAML 折叠块标量 `>`（自动换行），保留用户原始描述全文
- `phases` — 5 阶段运行态追踪，含每阶段 status/gate/时间戳/errors。所有新任务从此 schema 初始化
- `workflow-id` / `type` — 工作流标识
- `experience-draft` — 布尔值，标记是否产出经验草稿
- `cross-refs` — 交叉引用列表，关联需求文档和外部资源
- `structure`：记录目录结构。`root` 只含 `task.yaml`（不再含 `workflow.yaml`）。子项（adrs/logs/artifacts）在对应文件创建时增量更新
- `milestones`：空数组，工作流推进时由 Agent 按阶段追加
- `tags`：初始为空，可由 Agent 在工作流中补充

### 步骤 4：阶段追踪初始化

`task.yaml` 已包含 `phases` 段（步骤 3），无需额外创建 `workflow.yaml`。所有阶段状态更新直接写入 `task.yaml` 的 `phases[*]` 字段。

### 步骤 5：写入 errors.yaml

```yaml
errors: []
```

### 步骤 6：进入阶段 1 — 需求分析

1. 加载 `.self-workflow/configs/guides/feat-workflow.md` 作为执行指引
2. 按指引加载 `interaction-protocol` Skill（涉及选项选择时使用 question 工具）
3. 按指引加载 `agent-reasoning` Skill（委托优先、质疑方向、决策捕捉）
4. 更新 `task.yaml`：
   - `phases[0].status` → `in_progress`
   - `phases[0].started` → `<当前时间 ISO 8601>`
   - 顶层 `updated` → `<当前时间 ISO 8601>`
5. 按 `feat-workflow.md` **阶段 1：需求分析** 的检查清单和输出要求执行，产出 `artifacts/01-analysis.md`

**生命周期移交**：此步骤完成后，命令启动阶段结束。后续所有阶段推进（Gate 审查、阶段 2-5、Checkpoint 创建）由 `feat-workflow.md` 指引驱动。

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

## 工作流执行

启动完成后，按 `.self-workflow/configs/guides/feat-workflow.md` 定义的阶段和 Gate 顺序执行。Gate 重量速查和完整流程见指引文件附录。

每个阶段结束时更新 `task.yaml` 中对应 phase 的 `status`/`gate`/时间戳。
每个 Gate 通过后创建 Git tag checkpoint（见 feat-workflow.md 的 Checkpoint 章节）。

### 系统约束

#### task() 调用规范
- 委托时始终携带 `load_skills` 参数，评估可用 skills 后选择合适的
- 优先使用 `category` 参数匹配任务领域（visual-engineering/ultrabrain/deep/quick）
- 子 Agent 返回后必须验证结果

#### skill 加载规则
- `interaction-protocol`：涉及 2+ 选项供用户选择时加载
- `agent-reasoning`：委托优先、质疑方向、决策捕捉场景加载

#### Gate 量化公式
每个 Gate 入口必须显式计算 scope+risk+user-signal 三维分值以确定 weight（skip/light/full）。
公式和分值映射见 `feat-workflow.md` 的"Gate 重量量化"章节。示例：`scope=+1(cross-module), risk=+1(architecture), user-signal=0(default) → total=+2 → full`

#### 决策捕捉
阶段中有架构选择（方向性决策、多方案对比、trade-off 评估）→ 触发 `/adr` 命令。

---

## 无参数模式（`/feat`）

扫描 `.self-workflow/tasks/` 下所有 task，读取每个 `task.yaml`：
- 优先检查 `phases` 段是否存在 → 按新 schema 读取，遍历 phases 找到第一个 status != completed 的作为当前阶段
- 无 `phases` 段 → 按旧 schema，读取 task.yaml 的顶层 status，再尝试读取同目录的 `workflow.yaml` 获取阶段信息

输出任务仪表盘：

```
📊 任务状态

▶ 进行中 (N)：
  <workflow-id>  <title>  [阶段 X/5]

✅ 已完成 (N)：
  <workflow-id>  <title>

⚠ 卡住 (N)：
  <workflow-id>  <title>

❌ 已取消 (N)：
  <workflow-id>  <title>
```

## 错误处理

| 场景 | 行为 |
|------|------|
| 缺少 `<描述>` 且非无参数模式 | 提示"请提供特性描述，例如：/feat 实现用户登录" |
| workflow-id 冲突（追加后仍冲突 > 10 次） | 提示"slug 冲突过多，请使用更具体的描述" |
| `.self-workflow/` 目录不存在 | 提示先运行 `self-workflow init` 安装 |
| 已有 in_progress 任务 | 提示用户确认后再继续 |

## 参考

- 工作流指引：`.self-workflow/configs/guides/feat-workflow.md`
- 命令源码（安装器模板）：`packages/installer/templates/commands/feat.md`
