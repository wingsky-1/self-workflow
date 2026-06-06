# 方案设计 — V1.5.2 Todo 体系优化

> 工作流 ID：`feat-先做v1-5-2的需求-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T18:40:37+08:00

---

## 设计总览

V1.5.2 经讨论后形成三个设计决策，分别对应 F4/F5（Todo 模块合并）、F6（单一 task.yaml）、F7（feat.md 作为系统提示词框架）。

```
┌──────────────────────────────────────────────────┐
│                  V1.5.2 改动范围                    │
├──────────────┬──────────────┬────────────────────┤
│  F4/F5       │     F6       │        F7          │
│  Todo 模块    │  单 task.yaml │   feat.md 重定位    │
│  合并到       │   废弃         │   作为系统提示词      │
│  .self-workflow│  workflow.yaml│   引用 feat-workflow │
├──────────────┼──────────────┼────────────────────┤
│ 涉及 8 个文件  │ 涉及 3 个文件  │  涉及 2 个核心文件     │
│ 新建 1 文件   │ 修改 schema   │  重写命令结构          │
└──────────────┴──────────────┴────────────────────┘
```

---

## 设计 1：Todo 模块合并到 .self-workflow/（F4/F5）

### 1.1 文件移动

| 操作 | 路径 | 说明 |
|------|------|------|
| **新建** | `.self-workflow/todo.md` | todo.md 的新主位置 |
| **修改** | `docs/todo.md` | 替换为指向新位置的 stub（3 行） |

### 1.2 新 todo.md 格式优化

当前已有机制保持不动（P0/P1/P2 标签、V1.x 版本分组、`<details>` 折叠归档、`→ 来源：` 交叉引用），仅做两项补充：

**补充 A：`<wontfix>` 使用规则**

在文件头部归档规则行增加 `<wontfix>` 的使用说明：

```markdown
> 归档规则：已完成项保留但折叠（`[done]`），已拒绝项标注 `[wontfix]` 并附拒绝理由
```

在 `## 已关闭` 区域增加 `<wontfix>` 示例（如有实际拒绝项则放实际内容；如无则放一个注释示例）：

```markdown
<!-- wontfix 示例格式：
- [wontfix] 自动归档脚本 → 拒绝理由：V1.5.2 只定义约定，不自制工具 (todo #16)
-->
```

**补充 B：约定文档化**

在 AGENTS.md 中增加一段 todo 体系说明，使 Agent 能感知 todo.md 的优先级/版本标记含义：

```markdown
## Todo 体系
项目 todo 列表位于 `.self-workflow/todo.md`。
- P0 = 阻断框架成熟度（必须在本迭代完成）
- P1 = 质量改善（应在近期完成）
- P2 = 愿景（远期规划）
- 版本分组：`## Vx.y.z：标题（优先级）`
- 已完成项移入 `## 已关闭` 区域，使用 `<details>` 折叠
```

### 1.3 引用更新

| # | 文件 | 变更内容 |
|---|------|---------|
| 1 | `docs/todo.md` | 全文替换为 stub：`> Todo 列表已迁移至 [.self-workflow/todo.md](../.self-workflow/todo.md)` |
| 2 | `docs/ROADMAP.md` | 将 `docs/todo.md` 引用更新为 `.self-workflow/todo.md` |
| 3 | `.self-workflow/docs/经验分级与加载指引.md` | 将 `docs/todo.md` #9 更新为 `.self-workflow/todo.md` #9 |
| 4 | AGENTS.md | 新增"Todo 体系"章节（见补充 B） |
| 5~7 | `docs/V1.5/迭代需求/*.md`、`docs/feat-command-需求设计.md` | **不更新**（历史规划文档，保留原有引用作为历史快照） |

> 设计原则：只更新活跃使用的引用文件。历史任务 artifacts 和迭代需求文档保持不变。

### 1.4 不纳入范围（F4/F5）

- ❌ 不修改 `AGENTS.md` 以外的 agent 配置文件
- ❌ 不创建独立的 `.self-workflow/specs/todo-convention.md`（约定足够简单，无需单独 spec）
- ❌ 不改变 todo.md 的内容结构（只移动位置 + 补充 wontfix）

---

## 设计 2：合并为单一 task.yaml（F6）

### 2.1 决策理由

| 问题 | 当前（双文件） | 新设计（单文件） |
|------|-------------|----------------|
| status 真值源 | 两个独立副本，无同步保证 | 单一真值源 |
| description 重复 | 两份内容，详略不同 | 一份 |
| created/updated 格式 | 两个格式（date / datetime） | 统一 ISO 8601 |
| Agent 认知负荷 | 需读两个文件交叉比对 | 只读一个 |
| 仪表盘性能 | 两次文件 I/O | 一次 |

### 2.2 新 task.yaml Schema

```yaml
# ── 任务标识 ──
name: <slug>                          # 短标识名
title: <人类可读标题>                    # 仪表盘展示用
status: in_progress | completed | cancelled | stuck
created: <YYYY-MM-DD>
updated: <YYYY-MM-DDTHH:mm:ss+HH:MM>   # 统一 ISO 8601
tags: [<标签>]

description: >                         # 完整描述（唯一）
  <多行描述>

# ── 工作流实例 ──
workflow-id: <feat-xxx-YYYYMMDD>      # 目录名
type: feat                             # 工作流类型

# ── 阶段追踪（原 workflow.yaml 核心内容） ──
phases:
  - id: 1
    name: 需求分析
    status: pending | in_progress | completed | failed
    gate: pending | passed | failed | skipped
    started: <ISO 8601 | null>
    completed: <ISO 8601 | null>
    artifact: <产物文件名>
    errors: []
  # ... id: 2~5

experience-draft: true | false         # 是否产出经验草稿

# ── 目录结构 ──
structure:
  root: ["task.yaml"]
  adrs: [<adr 文件名>]
  logs: [<log 文件名>]
  artifacts: [<产物文件名>]

# ── 里程碑 ──
milestones:
  - id: <M0>
    name: <里程碑名>
    status: completed | in_progress | pending
    completed: <YYYY-MM-DD>

# ── 交叉引用 ──
cross-refs:
  - source: <引用源路径>
    reason: <引用原因>
```

### 2.3 字段对照（新 vs 旧）

| 新 task.yaml 字段 | 旧来源 | 说明 |
|-------------------|--------|------|
| `name`, `title`, `tags` | task.yaml | 不变 |
| `status` | task.yaml (权威源) | workflow.yaml 的 status 废弃 |
| `created`, `updated` | task.yaml 日期 + workflow.yaml 时间 | 统一为 ISO 8601 |
| `description` | task.yaml (完整版) | workflow.yaml 的 description 废弃 |
| `workflow-id`, `type` | workflow.yaml | 迁入 |
| `phases` | workflow.yaml | 迁入，含每阶段 status/gate/时间戳/errors |
| `experience-draft` | workflow.yaml | 迁入 |
| `structure` | task.yaml | 不变 |
| `milestones` | task.yaml | 不变 |
| `cross-refs` | task.yaml | 不变 |

### 2.4 /feat 命令修改

**当前**（步骤 4）：从 `workflow-metadata-template.yaml` 读取模板，写入 `workflow.yaml`

**修改后**（步骤 4）：task.yaml 写入时直接包含 phases 段（5 个阶段的初始状态），不再创建 workflow.yaml。

```yaml
# /feat 命令在写入 task.yaml 时，增加 phases 初始块：
phases:
  - id: 1
    name: 需求分析
    status: in_progress
    gate: pending
    started: <当前时间>
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
  # ... id: 3~5 类推
```

### 2.5 feat-workflow.md Gate 逻辑修改

所有 Gate 中引用 `workflow.yaml` 的代码改为 `task.yaml`：

| 位置 | 旧代码 | 新代码 |
|------|--------|--------|
| Phase 1 步骤 6 | `更新 workflow.yaml：phases[0].status → in_progress` | `更新 task.yaml：phases[0].status → in_progress` |
| Gate 通过后 | `workflow.yaml 中当前 phase 的 status: completed, gate: passed` | `task.yaml 中当前 phase 的 status: completed, gate: passed` |
| Checkpoint 创建 | `git add workflow.yaml` | `git add task.yaml` |
| Compound | `workflow.yaml 中 status: completed` | `task.yaml 顶层 status: completed` |
| 错误管理 | `errors/<workflow-id>/errors.yaml` (独立文件不变) | 不变（errors.yaml 是独立错误索引，不在 task.yaml 中） |

### 2.6 已有任务迁移

**策略：向前兼容，不强制迁移已有任务。**

| 任务 | 处理方式 |
|------|---------|
| 新任务 (2026-06-06 起) | /feat 命令只创建 task.yaml（含 phases） |
| 已有 completed 任务 (4 个) | 保留现有 task.yaml + workflow.yaml，不做迁移 |
| 已有 in_progress 任务 (如有) | 不做迁移，让它们按旧模式完成 |

### 2.7 安装器模板影响

`packages/installer/templates/configs/templates/workflow-metadata-template.yaml` — 新任务不再需要此模板（但保留在仓库中作为历史参考）。`/feat` 命令的模板源 `packages/installer/templates/commands/feat.md` 需同步更新。

---

## 设计 3：feat.md 重定位为系统提示词框架（F7）

### 3.1 新角色定义

```
之前：feat.md (启动器) ──移交──→ feat-workflow.md (执行器)
                          ↑ 两个独立文件，关系模糊

之后：feat.md (系统提示词框架) ──引用──→ feat-workflow.md (工作流定义模板)
         ↓ 包含：                          ↓ 包含：
         • 入口 + 初始化                    • 阶段定义
         • 工作流阶段（引用指引）              • Gate 定义
         • 系统级约束                       • Checkpoint
         • 仪表盘                          • Compound
         • 错误处理                        • 附录
```

### 3.2 feat.md 新结构

```markdown
---
description: 启动特性开发工作流 — 5 阶段 + 4 Gate
argument-hint: [--quick] <特性描述>
---

# /feat 命令

## 角色定位

本命令是 `/feat` 工作流的用户交互入口。
工作流的阶段定义和 Gate 审查规则由 `feat-workflow.md` 定义，
本命令在此基础上增加系统级约束和特定执行规则。

## 用法
（不变）

## 前置检查
（不变）

## 目录初始化

在 `.self-workflow/tasks/<workflow-id>/` 下创建：
...（简化：只列 task.yaml + 子目录，删除 workflow.yaml）

## 工作流执行

按 `feat-workflow.md` 定义的阶段顺序执行。详见指引文件。

**快捷引用**：
| 阶段 | Gate 重量 | 详见 |
|------|----------|------|
| 需求分析 | light | feat-workflow.md#阶段-1需求分析 |
| 方案设计 | full | feat-workflow.md#阶段-2方案设计 |
| ...

## 系统约束

### task() 调用规范
（新增：从现有经验中提取的 task() 调用约束）

### skill 加载规则
（新增：interaction-protocol、agent-reasoning 的加载时机）

### Gate 量化公式
scope + risk + user-signal → Gate weight
（引用 feat-workflow.md 中的量化表）

### 决策捕捉
阶段中有架构选择 → 触发 `/adr`

## 仪表盘
（无参数模式，不变）

## 错误处理
（不变）

## 参考
- 工作流指引：feat-workflow.md
- task.yaml schema：见本命令"目录初始化"章节
```

### 3.3 feat-workflow.md 修改

```markdown
---
name: feat-workflow
description: 特性开发工作流阶段定义和 Gate 审查规则。由 /feat 命令引用，用户可定制。
---

# Feat 工作流指引

> **角色**：本文件定义 `/feat` 工作流的 5 阶段和 4 Gate。
> 命令入口和系统级约束参见 `/feat` 命令。
> 用户可修改本文件定制阶段定义和 Gate 条件。

（其余内容保持，但将所有 `workflow.yaml` 引用改为 `task.yaml`）
```

### 3.4 重叠消除

| 重叠内容 | feat.md 处理 | feat-workflow.md 处理 |
|---------|-------------|---------------------|
| 目录结构 | **简化**：只列 task.yaml + 子目录名，引用 feat-workflow 获取详细产物路径 | **保留完整版**（含 artifacts 子文件列表） |
| workflow.yaml 处理 | **删除**（不再创建此文件） | **改为 task.yaml phases 更新规则** |
| 阶段 1 内容 | **删除详细执行步骤**（替换为 "按 feat-workflow.md 阶段 1 执行"） | **保留完整版** |
| Gate 量化 | **引用** feat-workflow 的量化表 | **保留完整量化表** |

**原则**：feat-workflow.md 是阶段+Gate 的**权威定义源**，feat.md 只做引用，不复制内容。

### 3.5 不纳入范围（F7）

- ❌ 不修改 feat-workflow.md 的 Gate 执行逻辑（那是 V1.5.3 实测验证的范畴）
- ❌ 不删除 feat-workflow.md 附录中的任何内容（用户可能需要参考）

---

## 实施顺序

```
步骤 1 ── F4/F5: Todo 模块合并
  ├── 1a: 创建 .self-workflow/todo.md
  ├── 1b: 修改 docs/todo.md → stub
  ├── 1c: 更新引用文件（ROADMAP.md + 经验分级指引 + AGENTS.md）
  └── 1d: 在已关闭区域添加 wontfix 规则

步骤 2 ── F6: 合并 task.yaml
  ├── 2a: 定义新 task.yaml schema（本文档已定义）
  ├── 2b: 修改 feat-workflow.md 模板源（packages/installer/templates/configs/guides/feat-workflow.md）
  │       → 所有 workflow.yaml → task.yaml 引用
  │       → 运行 node packages/installer/index.js init --target . --force 同步
  ├── 2c: 修改 /feat 命令模板源（packages/installer/templates/commands/feat.md）
  │       → 步骤 4 改为写入 task.yaml 含 phases，移除 workflow.yaml 创建
  │       → 运行安装器同步
  ├── 2d: 更新 Review Agent 模板源（packages/installer/templates/agents/review-agent.md）
  │       → 增加 task.yaml phases 字段存在性校验
  │       → 运行安装器同步
  └── 2e: 处理 workflow-metadata-template.yaml
          → 从安装器 MANIFEST 中移除 OR 在文件顶部添加"[⚠️ 已废弃]"注释并保留在 MANIFEST 中

步骤 3 ── F7: feat.md 重定位
  ├── 3a: 重写 packages/installer/templates/commands/feat.md
  │       → 增加角色定位、系统约束章节
  │       → 删除与 feat-workflow 重复的内容，改为引用
  │       → 快捷引用表使用阶段 ID 锚点（如 `#阶段-1`）避免硬编码中文标题
  │       → 运行安装器同步
  ├── 3b: 修改 feat-workflow.md 模板源（packages/installer/templates/configs/guides/feat-workflow.md）
  │       → 开头加角色声明"本文件由 /feat 命令引用，通过安装器模板源定制"
  │       → 运行安装器同步
  └── 3c: 验证交叉引用完整性
```

---

## 风险评估

| 风险 | 缓解措施 |
|------|---------|
| `/feat` 命令修改后安装器同步失败 | 先在模板源修改，验证 YAML 格式正确后运行 `init --force` |
| feat-workflow.md Gate 引用遗漏 | 全局搜索 `workflow\.yaml` 确保全部替换 |
| todo.md 路径迁移导致死链 | 更新后运行 `grep -r "docs/todo.md"` 确认无残留引用 |
| 新 task.yaml schema 与老 task.yaml 不兼容 | 新 schema 是超集（所有旧字段保留），/feat 仪表盘需适配两种格式 |
| 仪表盘新旧格式并存 | `/feat`（无参数模式）先检查 task.yaml 是否有 `phases` 段，有则按新格式；无则回退读 workflow.yaml |
| feat-workflow.md 被安装器覆盖 | 定制流程为"修改模板源→运行安装器同步"，文档中明确标注。完全热定制为 V2+ 规划 |
| 快捷引用表锚点失效 | 使用阶段数字 ID 锚点（如 `#阶段-1`）而非中文标题锚点 |

---

## 审查后修订记录（Gate 2 审查）

| 修订项 | 来源 | 变更 |
|--------|------|------|
| ADR-001 增加"与阶段 1 分析结论的反转说明" | 对抗性审查 critical | 解释为何推翻分析阶段"分开优于合并"的结论 |
| ADR-002 明确 feat-workflow.md 安装器管理状态 | 对抗性审查 warning→blocking | 定制方式为"修改模板源→安装器同步"，完全热定制为 V2+ |
| 实施步骤增加 Review Agent 适配（步骤 2d） | 方向审查 warning | 新增 Review Agent 模板源 phases 校验更新 |
| 实施步骤增加 workflow-metadata-template.yaml MANIFEST 处理（步骤 2e） | 方向审查 warning | 明确废弃模板的处理方式 |
| 实施步骤修正模板源路径（步骤 2b/3b） | 方向审查 info | 将 `feat-workflow.md` 改为显式的模板源路径 |
| 风险表增加仪表盘双格式兼容 | 对抗性审查 info | 新增"phases 段检测→回退读 workflow.yaml"策略 |
| 风险表增加 feat-workflow.md 安装器覆盖 | 对抗性审查 warning | 标注定制流程 |
| 风险表增加快捷引用锚点策略 | 对抗性审查 info | 使用数字 ID 锚点 |
