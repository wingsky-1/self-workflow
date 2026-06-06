---
phase: 2
workflow: feat
description: V1.9 方案设计——4 项重构的架构设计、接口定义与数据模型
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — V1.9 重构收尾

> 工作流 ID：`feat-v1-9版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T23:00:00+08:00

---

## 架构决策记录

> 4 项决策已记录为独立 ADR 文件（`adrs/ADR-00X-*.md`），此处做摘要引用。详细方案对比与选择理由见各 ADR 文件。

| ADR | 决策 | 核心选择 |
|-----|------|---------|
| [ADR-001](adrs/ADR-001-feat-task模板提取与目录结构.md) | 任务模板提取 | 新建 `templates/tasks/feat-task.yaml`，命名含 `feat-` 前缀支持未来多工作流类型 |
| [ADR-002](adrs/ADR-002-Slug生成算法优化.md) | Slug 算法优化 | 数字间点号保留（`V1.9`→`V1.9`），大小写保留；超驰原 ADR-002 部分规则 |
| [ADR-003](adrs/ADR-003-Phase-Checkpoint-SHA字段设计.md) | Phase Checkpoint SHA | Phase schema 新增 `checkpoint: null` 字段，Gate 通过后 `git rev-parse` 填充 |
| [ADR-004](adrs/ADR-004-安装器三层目录清理.md) | 三层目录清理 | 删除 `installer/.opencode/` 和 `.self-workflow/` 死代码，新增 `installer/README.md` |

### 实施依赖图

```
#4 (目录清理)
  ├─ 前置：搜索确认无外部引用
  └─ 无其他依赖

#1 (模板提取)
  ├─ 前置：#4 清理后才清晰的模板目录结构
  └─ 被依赖：#3 checkpoint 字段需写入 feat-task.yaml

#2 (命名优化)
  └─ 无依赖，可与 #1 #4 并行

#3 (Checkpoint SHA)
  ├─ 依赖：#1 feat-task.yaml 模板文件存在
  └─ 无其他依赖
```

**推荐实施顺序**：`#4 → #1/#2(并行) → #3 → init --force → 验证`

---

## 接口设计

> 所有变更是**指令文件（.md/.yaml）**的修改，不涉及 JS/TS 运行时接口。以下"接口"指文件级变更范围和引用关系。

### 1. feat-task.yaml 模板

**新建文件**：`packages/installer/templates/tasks/feat-task.yaml`

```
输入：无（静态模板文件，定义 task.yaml 的默认结构）
输出：被 feat.md 步骤 3 读取，Agent 填充占位符后写入目标 task.yaml
```

**MANIFEST 新增条目**（`packages/installer/index.js`）：
```js
[".self-workflow/configs/tasks/feat-task.yaml", "tasks/feat-task.yaml"],
```

**feat.md 步骤 3 变更**：从内联 YAML 块 → 引用模板文件：
```markdown
### 步骤 3：写入 task.yaml

从 `.self-workflow/configs/tasks/feat-task.yaml` 加载模板结构，
填充以下占位符后写入 `.self-workflow/tasks/<workflow-id>/task.yaml`：
- `<slug>` → 步骤 1 生成的 slug
- `<描述>` → 用户输入的原始描述
- `<当前时间 ISO 8601>` → 当前时间
- ...（其余占位符按模板约定填充）

若模板文件不存在（如未运行过 `init`），Agent 应提示用户先运行 
`node packages/installer/index.js init --target . --force`，
并以警告方式使用内联 fallback 模板继续创建 task.yaml。
```

### 2. Slug 语义生成 + 描述精炼

**修改文件**：`packages/installer/templates/commands/feat.md` 步骤 1（第 51-65 行）

```
输入：用户输入的描述字符串（如 "V1.9版本"）+ todo.md 中关联的 todo 项
输出：有辨识度的 slug + 精炼的 title/description
```

**核心变更**：从机械规则变换改为 Agent 语义理解。Agent 读取 todo 项理解实际工作内容，提炼关键词生成 slug。机械规则保留仅为安全网（清理路径非法字符）。

**feat.md 步骤 1 改写**（替换原 slug 生成规则段落）：

```markdown
- 从 <描述> + todo.md 中理解任务的实际工作内容（而非字面转换）
- 提炼 2-4 个核心关键词/短语，用 `-` 连接，生成语义 slug
  - 中文项目使用中文关键词（如 `安装器重构-模板提取`）
  - 英文术语/版本号保持原样
  - 辨识度要求：人类通过 slug 即可辨别任务内容
- 安全网清理（机械规则）：
  - 空格/标点替换为 `-`
  - 连续多个 `-` 压缩为一个
  - 首尾 `-` 去除
  - 截断至 40 字符
- **name 字段** = 语义 slug；**title 字段** = Agent 精炼的一句话标题（含版本号+工作要点）
- **description 字段** = Agent 生成的任务摘要（含 todo 项列表）
```

**示例**：

| 用户输入 | todo 项 | 新 slug | 新 title |
|----------|---------|---------|----------|
| `V1.9版本` | 4项：模板提取/命名优化/SHA关联/目录清理 | `安装器重构-模板清理` | `V1.9 安装器重构与模板清理` |
| `实现用户登录（含OAuth2.0）` | 无额外 todo | `用户登录-OAuth2` | `用户登录模块（含 OAuth2.0）` |
| `修复 README 拼写` | 无额外 todo | `readme-typo-fix` | `修复 README 拼写错误` |

### 3. Commit Message 模板

**修改文件**：`packages/installer/templates/configs/guides/feat-workflow.md` 第 517 行

```
输入：workflow-id, phase 编号, 阶段英文名, 本次变更涉及的文件列表（Agent 从上下文提取）
输出：commit message 字符串
变更：
  - 原模板：git commit -m "<workflow-id>: phase-<N> gate passed"
  - 新模板：git commit -m "<workflow-id>: phase-<N> <阶段英文名> — <涉及模块摘要>"
```

修改位置：Checkpoint 章节"创建 Checkpoint"小节中的 `git commit` 命令。

**Agent 行为指引**（在 commit message 模板旁添加备注）：
> 涉及模块摘要由 Agent 自主提取本次 Gate 期间变更涉及的目录/文件名（如 `installer/templates, feat.md, feat-workflow.md`）。用 `, ` 分隔多个模块。

### 4. Checkpoint SHA 记录

**修改文件 1**：`packages/installer/templates/configs/guides/feat-workflow.md` 第 515-518 行

```
输入：git tag 名称（如 feat-v1-9版本-20260606-ph1-analysis-gate-passed）
输出：task.yaml phase[N].checkpoint 字段写入该 tag 的 commit SHA
```

在 `git tag <tag-name>` 后追加：
```bash
git tag <workflow-id>-ph<N>-<name>-gate-passed
# 新增：记录 checkpoint SHA 到 task.yaml phase[N].checkpoint
git rev-parse <workflow-id>-ph<N>-<name>-gate-passed
# Agent 将输出写入 task.yaml 对应 phase 的 checkpoint 字段
```

**修改文件 2**：Compound 回退步骤（feat-workflow.md 第 562-567 行）
> 若 `git log --grep` 返回空结果：读取 task.yaml phase[N].checkpoint 字段，若非 null 则用 `git tag <name> <sha>` 补建。

### 5. 三层目录清理

**删除**：
- `packages/installer/.opencode/`（整个目录）
- `packages/installer/.self-workflow/`（整个目录）

**新建**：`packages/installer/README.md`

```
输入：无
输出：说明三层目录架构的 README 文件
内容：模板源 → 安装器分发 → 运行时部署的职责说明
```

---

## 数据模型

### feat-task.yaml 模板结构

```yaml
# packages/installer/templates/tasks/feat-task.yaml
# feit 工作流的 task.yaml 默认模板
# 占位符由 /feat 命令执行时 Agent 填充

name: <slug>                 # 步骤 1 生成的 slug（如 "V1.9版本"）
title: <描述>                 # 用户输入原始描述
status: in_progress           # 初始状态
created: <YYYY-MM-DD>         # 创建日期
updated: <ISO 8601>           # 最后更新时间
tags: []                      # 可由 Agent 补充
description: >                # 用户输入原文（YAML folded scalar）
  <描述原文>

workflow-id: <feat-<slug>-<YYYYMMDD>>
type: feat                     # 工作流类型（未来可扩展 fix/refactor 等）

phases:
  - id: 1
    name: 需求分析
    status: in_progress        # pending | in_progress | completed | failed | skipped
    gate: pending              # pending | passed | failed
    started: <ISO 8601>
    completed: null
    artifact: "01-analysis.md"
    errors: []
    checkpoint: null           # ← 新增：Gate 通过后填充 git tag 的 commit SHA
  - id: 2
    name: 方案设计
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "02-design.md"
    errors: []
    checkpoint: null
  - id: 3
    name: 代码实现
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "03-implementation.md"
    errors: []
    checkpoint: null
  - id: 4
    name: 功能验证
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "04-verification.md"
    errors: []
    checkpoint: null
  - id: 5
    name: 总结沉淀
    status: pending
    gate: pending
    started: null
    completed: null
    artifact: "05-summary.md"
    errors: []
    checkpoint: null

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

### Phase Schema 变更对比

```diff
  phases:
    - id: 1
      name: 需求分析
      status: completed
      gate: passed
      started: "2026-06-06T22:20:00+08:00"
      completed: "2026-06-06T22:30:00+08:00"
      artifact: "01-analysis.md"
      errors: []
+     checkpoint: null        # string | null，Gate 通过后为 commit SHA
```

### MANIFEST 变更

```diff
  // packages/installer/index.js
  const MANIFEST = [
+   [".self-workflow/configs/tasks/feat-task.yaml", "tasks/feat-task.yaml"],
    // ... existing 26 entries ...
  ];

  const EMPTY_DIRS = [
+   ".self-workflow/configs/tasks",   // 新增：任务模板目录
    // ... existing entries ...
  ];
```

### 文件变更总览

| 操作 | 文件 | 描述 |
|------|------|------|
| ✨ 新建 | `packages/installer/templates/tasks/feat-task.yaml` | 任务模板源文件 |
| ✨ 新建 | `packages/installer/README.md` | 三层架构说明 |
| 🗑 删除 | `packages/installer/.opencode/` | 废弃副本（整个目录） |
| 🗑 删除 | `packages/installer/.self-workflow/` | 废弃副本（整个目录） |
| ✏️ 修改 | `packages/installer/index.js` | MANIFEST +1 条目 + EMPTY_DIRS +1 条目 |
| ✏️ 修改 | `packages/installer/templates/commands/feat.md` | 步骤 1 slug 语义生成 + 步骤 3 引用模板（含 fallback） |
| ✏️ 修改 | `packages/installer/templates/configs/guides/feat-workflow.md` | checkpoint commit msg + SHA 记录 + Compound 回退 |
| 🔄 同步 | `node packages/installer/index.js init --target . --force` | 将所有变更同步到运行时目录 |

---

## 实施步骤排序

```
Step 1: #4 目录清理
  ├── 1a. grep 确认 installer/.opencode/ 和 .self-workflow/ 无外部引用
  ├── 1b. 删除两个废弃目录
  ├── 1c. 创建 installer/README.md
  └── 1d. 提交

Step 2: #1 模板提取 (可与 Step 3 并行)
  ├── 2a. 创建 templates/tasks/feat-task.yaml（含 checkpoint: null）    ← 注意：先含 #3 的字段
  ├── 2b. 在 index.js MANIFEST 添加条目
  └── 2c. 修改 feat.md 步骤 3，从内联 YAML 改为引用模板文件

Step 3: #2 命名优化 (可与 Step 2 并行)
  ├── 3a. 修改 feat.md 步骤 1 slug 规则（数字间点号保留 + 大小写保留）
  └── 3b. 修改 feat-workflow.md checkpoint commit message 模板

Step 4: #3 Checkpoint SHA
  ├── 4a. 修改 feat-workflow.md checkpoint 创建步骤（git rev-parse + 写 checkpoint）
  └── 4b. 修改 feat-workflow.md Compound 回退步骤（引用 checkpoint 字段补建 tag）

Step 5: 同步 & 验证
  ├── 5a. node packages/installer/index.js init --target . --force
  ├── 5b. 验证 .opencode/commands/feat.md 包含 slug 语义生成 + 模板引用
  ├── 5c. 验证 .self-workflow/configs/tasks/feat-task.yaml 存在且内容正确
  └── 5d. 验证 installer/.opencode/ 和 .self-workflow/ 已删除
```

---

## 决策声明

- [x] ADR 已创建：ADR-001 ~ ADR-004，见 `adrs/` 目录
- [x] 本阶段无新增架构决策（所有决策在阶段 1 已完成并归档为 ADR）
