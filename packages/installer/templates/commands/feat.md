<!--
  安装器模板 — 执行 self-workflow init 时复制到 .opencode/commands/feat.md。
  变更此文件后请运行安装器同步，或手动复制到 .opencode/commands/feat.md。
-->
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

扫描 `.self-workflow/tasks/` 下所有 task，读取每个 `task.yaml` 的 status，输出任务仪表盘：

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
| `templates/workflow-metadata-template.yaml` 不存在 | 提示模板缺失，建议重新安装 |
| 已有 in_progress 任务 | 提示用户确认后再继续 |

## 参考

- 工作流指引：`.self-workflow/configs/guides/feat-workflow.md`
- 模板文件：`.self-workflow/configs/templates/workflow-metadata-template.yaml`
- 命令源码（安装器模板）：`packages/installer/templates/commands/feat.md`
