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
3. **Todo 上下文**：读取 `.self-workflow/todo.md` 获取当前版本任务列表。后续"无参数模式"依赖此上下文实现自动认领。

### 步骤 1：参数解析

- 提取 `<描述>`，生成 slug：
  - 从 `<描述>` 和 todo.md 关联的 todo 项理解任务的实际工作内容（而非字面变换）
  - 提炼 2-4 个核心关键词/短语，用 `-` 连接，生成语义 slug：
    - 中文项目使用中文关键词（如 `安装器重构-模板清理`）
    - 英文术语/版本号保持原样
    - 辨识度要求：人类通过 slug 即可大致辨别任务内容
  - 安全网清理（机械规则，对提炼后的关键词短语执行）：
    - 空格/标点替换为 `-`
    - 连续多个 `-` 压缩为一个
    - 首尾 `-` 去除
    - 截断至 40 字符
    - 若结果为空 → 使用 `task`
  - `name` 字段 = 语义 slug；`title` 字段 = Agent 精炼的一句话标题（含版本号+工作要点）
  - `description` 字段 = Agent 生成的任务摘要（含关联 todo 项列表）
  - 示例：`"/feat V1.9版本"`（结合 todo 中 4 项重构任务）→ slug `"安装器重构-模板清理"`
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

从 `.self-workflow/configs/tasks/feat-task.yaml` 加载模板结构，填充占位符（`<slug>`、`<描述>`、`<当前时间 ISO 8601>` 等）后写入 `.self-workflow/tasks/<workflow-id>/task.yaml`。

> 若模板文件不存在，中止并提示用户运行 `node packages/installer/index.js init --target . --force` 安装模板。

### 步骤 4：阶段追踪初始化

`task.yaml` 已包含 `phases` 段（步骤 3），无需额外创建 `workflow.yaml`。所有阶段状态更新直接写入 `task.yaml` 的 `phases[*]` 字段。

### 步骤 5：写入 errors.yaml

```yaml
errors: []
```

### 步骤 6：进入阶段 1 — 需求分析

1. 加载 `.self-workflow/configs/guides/feat-workflow.md` 作为执行指引
2. 读取 `.self-workflow/specs/default/` 下的规范——agent-reasoning 和 interaction-protocol 已通过插件自动注入 system prompt，Agent 需遵守
4. 更新 `task.yaml`：
   - `phases[0].status` → `in_progress`
   - `phases[0].started` → `<当前时间 ISO 8601>`
   - 顶层 `updated` → `<当前时间 ISO 8601>`
5. 按 `feat-workflow.md` **阶段 1：需求分析** 的检查清单和输出要求执行，产出 `artifacts/01-analysis.md`

**生命周期移交**：此步骤完成后，命令启动阶段结束。后续所有阶段推进（Gate 审查、阶段 2-5、Checkpoint 创建）由 `feat-workflow.md` 指引驱动。

### 步骤 6：输出启动报告

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

#### spec 规范
- `specs/default/` 下的规范（agent-reasoning、interaction-protocol 等）通过 `self-workflow-session` 插件自动注入 system prompt，Agent 在所有会话中必须遵守
- 委托子 Agent 时，同样需确保子 Agent 遵守 `specs/default/` 规范（插件应在所有 Agent 中生效）
- 通用 `load_skills` 委托规则保留——委托时始终携带 `load_skills` 参数，评估可用 skills 后选择合适的

#### Gate 量化公式
每个 Gate 入口必须显式计算 scope+risk+user-signal 三维分值以确定 weight（skip/light/full）。
公式和分值映射见 `feat-workflow.md` 的"Gate 重量量化"章节。示例：`scope=+1(cross-module), risk=+1(architecture), user-signal=0(default) → total=+2 → full`

#### 决策捕捉
阶段中有架构选择（方向性决策、多方案对比、trade-off 评估）→ 按 `specs/default/decision-record.md` 规范创建 ADR。

---

## 无参数模式（`/feat`）

当 `/feat` 不带参数时，Agent 执行以下逻辑：

### 步骤 1：读取 Todo

读取 `.self-workflow/todo.md`，提取所有 `## Vx.y.z` 格式的版本段标题（跳过 `## 已关闭` 和 `## 新增`）。

### 步骤 2：检查进行中任务

扫描 `.self-workflow/tasks/*/task.yaml`，收集所有 `status: in_progress` 的任务。

### 步骤 3：匹配未认领版本

对每个版本段：
- 从标题用正则 `/V\d+\.\d+(?:\.\d+)?/` 提取版本号
- 检查是否有 in_progress 任务的 task.yaml description 首行包含相同版本号（精确匹配，大小写敏感）
- 第一个无匹配的版本段 = 未认领

### 步骤 4：自动启动或展示仪表盘

- **有未认领版本** → 以该版本段标题作为 `<描述>`，按正常 `/feat <描述>` 流程启动工作流（生成 slug → 创建目录 → 进入阶段 1）
- **无未认领版本** → 展示任务仪表盘（保持现有行为）：
  ```
  📊 任务状态
  ▶ 进行中 (N)：...
  ✅ 已完成 (N)：...
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
