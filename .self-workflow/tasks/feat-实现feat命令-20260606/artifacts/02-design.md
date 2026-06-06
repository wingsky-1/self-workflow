---
phase: 2
workflow: feat
description: 方案设计阶段产物 — /feat 命令架构、接口、数据模型
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — 实现 /feat 命令

> 工作流 ID：`feat-实现feat命令-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T17:00:00+08:00
> 质疑报告：已通过（方向确认：合理，无补充异议）

---

## 架构决策记录

### ADR-001：Command 文件分发策略

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-001 |
| 状态 | 已选择 |
| 决策者 | Agent (Sisyphus) |
| 日期 | 2026-06-06 |

**背景**

`/feat` 命令定义需要在两个位置存在：(1) 开发时使用的 `.opencode/commands/feat.md`；(2) 安装器模板 `packages/installer/templates/commands/feat.md`。两个文件内容完全一致，但分别维护会导致漂移。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A — 单一源 + 复制脚本 | `.opencode/commands/feat.md` 是唯一源，安装器中通过构建脚本复制 | 单一真相源，不会漂移 | 需要额外构建步骤；当前项目无构建流程 |
| B — 安装器直接读源 | 安装器直接读取 `.opencode/commands/feat.md` 复制到目标项目 | 单一源，无需构建 | 安装器需处理源路径（`../../.opencode/commands/`），相对路径脆弱 |
| **C — 保留两份，注释互引（选用）** | 两份文件内容完全一致，每份顶部注释指向另一份位置 | 与现有 `adr.md`/`catchup.md` 模式一致；无需构建 | 需手动同步，但变更频率极低（命令定义稳定后极少修改） |

**选择**：方案 C

**理由**

1. 与现有命令 `/adr` 和 `/catchup` 的分发模式完全一致——它们也是两份文件手动同步
2. `/feat` 命令定义一旦稳定，后续变更频率极低（类似 `/adr` 上线后很少修改）
3. 零额外构建依赖——项目当前无构建流程，方案 A/B 引入不必要的复杂度
4. 安装器 MANIFEST 新增一行即可完成分发

**后果**

- 正面：实现简单，与现有模式一致，零构建依赖
- 负面：两份文件需手动同步。缓解：在文件顶部添加互引注释；未来如需频繁变更可切换到方案 A

**关联**

- 关联需求：F3（目录 + 元数据初始化 → 安装器集成）

---

### ADR-002：Slug 生成算法

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-002 |
| 状态 | 已选择 |
| 决策者 | Agent (Sisyphus) |
| 日期 | 2026-06-06 |

**背景**

workflow-id 格式为 `feat-<slug>-<YYYYMMDD>`，slug 由用户输入的中文描述生成。需要处理 Unicode 字符、特殊符号、长度限制和冲突。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A — 纯 ASCII 拼音 | 中文转拼音（如 `shixianfeatmingling`） | 无 Unicode 兼容问题 | 不可读；拼音转换依赖外部库；多音字歧义 |
| B — 仅保留 ASCII 字母数字 | 中文直接删除，只保留英文/数字 | 简单、无歧义 | "实现用户登录"→"feat-20260606"，完全丢失语义 |
| **C — 保留 CJK 基本区，替换其余（选用）** | 中文字符保留，其余特殊符→`-`，压缩连续分隔符 | 可读、可排序；中文用户友好 | Windows 路径含 Unicode 需 `-LiteralPath`；某些工具可能不兼容 |
| D — hash-based | slug = 描述的前 8 位 SHA256（如 `a1b2c3d4`） | 无冲突、纯 ASCII | 完全不可读，catchup 时无法由 id 辨认内容 |

**选择**：方案 C

**理由**

1. 中文是项目主要语言——转换为拼音或删除中文会让 workflow-id 丧失可读性
2. 产物目录仅在 `.self-workflow/tasks/` 内部使用，不暴露给 CI/CD 等外部系统
3. 已有项目目录 `feat-quality-v15-20260606` 和 `20260606-V1实现` 使用了相似约定
4. PowerShell 完全支持 Unicode 文件名（需 `-LiteralPath` 参数）

**算法细节**

```
输入：用户原始描述字符串
输出：slug 字符串 (≤ 40 字符)

步骤：
1. 遍历每个字符：
   a. CJK Unified (U+4E00–U+9FFF, U+3400–U+4DBF) → 保留
   b. ASCII a-z, A-Z, 0-9 → 保留（大写转小写）
   c. 其余（空格、标点、符号）→ 替换为 '-'
2. 压缩连续 '-' → 单个 '-'
3. 去除首尾 '-'
4. 截断至 40 字符（优先在 '-' 处截断，否则在 40 字符处）
5. 若结果为空 → 使用 "task"
```

**后果**

- 正面：中文用户可读；可排序（日期在后）
- 负面：外部工具可能不兼容 Unicode 路径。缓解：限制 slug 在内部目录使用

**关联**

- 关联需求：F2（workflow-id 生成）

---

### ADR-003：元数据模板填充策略

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-003 |
| 状态 | 已选择 |
| 决策者 | Agent (Sisyphus) |
| 日期 | 2026-06-06 |

**背景**

`/feat` 步骤 4 需要从 `workflow-metadata-template.yaml` 读取模板，填充字段后写入 `workflow.yaml`。填充方式有两种：逐字段替换 vs 直接写入。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A — 模板驱动填充（选用）** | 读取模板 YAML → 修改特定字段值 → 写入新文件 | 模板变更时自动跟随新字段；字段名集中管理 | 需要 YAML 解析能力；需要识别哪些字段是"模板固定值"vs"需填充值" |
| B — 硬编码完整内容 | 命令中直接写入完整的 workflow.yaml 内容（不读模板） | 简单、快速 | 模板字段变更时命令代码不同步（漂移风险）；与模板存在两份"真相" |

**选择**：方案 A

**理由**

1. `workflow.yaml` 的 phases 结构可能在未来版本变更（如 v0.3 新增 phase 6），方案 B 会导致命令中的硬编码内容过时
2. YAML 解析在 OpenCode 环境中可用（已用于读取 task.yaml）
3. 模板中需填充的字段是明确且有限的：`workflow-id`, `type`, `status`, `created`, `updated`, `description`——其余字段（phases 结构、字段名）应原样保留

**填充规则**

| 模板字段 | 操作 | 值来源 |
|---------|------|--------|
| `workflow-id` | 替换 | 步骤 1 生成 |
| `type` | 设置 | `feat`（固定） |
| `status` | 设置 | `in_progress` |
| `created` | 替换 | 当前时间 ISO 8601 含时区 |
| `updated` | 替换 | 同 `created` |
| `description` | 替换 | 用户原始描述 |
| 所有 `phases[*]` | **保留模板原值** | 模板定义的标准结构 |

**后果**

- 正面：模板是单一真相源；字段变更自动传播
- 负面：依赖 YAML 解析。缓解：`task.yaml` 已在多处被读写，证明 YAML 解析可用

**关联**

- 关联需求：F3（元数据创建）
- 关联模板：`.self-workflow/configs/templates/workflow-metadata-template.yaml`

---

### ADR-004：命令内部步骤编排

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-004 |
| 状态 | 已选择 |
| 决策者 | Agent (Sisyphus) |
| 日期 | 2026-06-06 |

**背景**

`/feat` 命令定义包含 7 个步骤（0-6），需要在 OpenCode 环境中按顺序执行。有两种编排方式。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A — 声明式步骤清单（选用）** | 命令文件中以 Markdown 列出步骤，Agent 逐步骤读取并执行 | 人类可读；与现有 `/adr`、`/catchup` 命令风格一致 | 依赖 Agent 正确解释自然语言指令 |
| B — 脚本化执行 | 用 JavaScript/PowerShell 脚本封装所有步骤，命令直接调用脚本 | 确定性高；无解释歧义 | 命令文件变为薄包装器；脚本与 Markdown 文档分离维护 |

**选择**：方案 A

**理由**

1. 与现有命令 (`/adr`, `/catchup`) 一致——它们都使用声明式的 Markdown 步骤清单
2. OpenCode 的 slash command 机制原本设计为 "Agent 读取并执行 Markdown 指令"
3. `/feat` 的步骤涉及文件读写、模板填充、Skill 加载等操作，这些在 Agent 执行时自然可用，无需额外脚本
4. 方案 B 引入的脚本与项目现有风格不一致（项目以 Markdown/YAML 为主，无 build script）

**后果**

- 正面：人类可读、可维护、与现有命令一致
- 负面：步骤间状态共享依赖 Agent 记忆（而非程序状态）。缓解：各步骤有明确的输入/输出产物（文件），步骤间通过文件系统交接状态

**关联**

- 关联命令：`.opencode/commands/adr.md`（相同模式）
- 关联需求：F4（进入阶段 1）

---

## 接口设计

### 接口 1：命令参数解析

```
输入：用户原始输入字符串，格式为 "[--quick] <特性描述>"
输出：
  - mode: "standard" | "quick"
  - description: string（原始描述文本）
  - slug: string（≤ 40 字符，CJK+ASCII 字母数字）
  - workflow_id: "feat-<slug>-<YYYYMMDD>"
错误处理：
  - 缺少描述 → 提示用法（非无参数模式时）
  - slug 冲突 > 10 次 → 终止并提示
```

**解析规则**：
1. 检测 `--quick` 前缀标志 → `mode = "quick"`，否则 `mode = "standard"`
2. 剩余部分 → `description`（去除前导空格）
3. 对 description 执行 ADR-002 算法 → `slug`
4. 组合日期 → `workflow_id`

---

### 接口 2：模板读取与填充

```
输入：
  - template_path: ".self-workflow/configs/templates/workflow-metadata-template.yaml"
  - fill_values: { workflow-id, description, created }
输出：
  - filled_yaml: string（合法的 YAML 文本）
错误处理：
  - 模板文件不存在 → 终止，提示"模板缺失"
  - YAML 解析失败 → 终止，提示"模板格式错误"
```

**填充操作**（按 ADR-003）：

| 字段路径 | 操作 |
|---------|------|
| `$.workflow-id` | 替换 |
| `$.type` | 确保为 `feat` |
| `$.status` | 设置为 `in_progress` |
| `$.created` | 替换 |
| `$.updated` | 替换（同 created） |
| `$.description` | 替换 |
| `$.phases[*]` | 保留所有原值 |

---

### 接口 3：目录初始化

```
输入：
  - base_path: ".self-workflow/tasks/<workflow-id>/"
输出：
  - 创建的目录列表
错误处理：
  - base_path 已存在 → 视为冲突（应在步骤 1 检测）
  - 父目录 (.self-workflow/tasks/) 不存在 → 终止
  - 权限不足 → 终止
```

**创建清单**：
- `adrs/` — 决策记录目录
- `logs/` — 实施记录目录
- `artifacts/` — 阶段产物目录
- `errors/` — 错误日志目录

---

### 接口 4：阶段移交

```
输入：
  - workflow_id: string
  - guide_path: ".self-workflow/configs/guides/feat-workflow.md"
  - skills: ["interaction-protocol", "agent-reasoning"]
输出：
  - workflow.yaml 中 phases[0].status = "in_progress"
  - phases[0].started = 当前时间 ISO 8601
  - 启动报告（YAML 格式）
错误处理：
  - guide 文件不存在 → 终止，提示"指引文件缺失"
```

**移交后行为**：命令停止执行，Agent 切换至 `feat-workflow.md` 指引驱动模式，按阶段 1 检查清单执行。

---

## 数据模型

### task.yaml 初始结构

```yaml
# 字段定义（类型约束）
name: string             # slug（与 workflow-id 的 slug 部分一致）
title: string            # 用户原始描述
status: "in_progress"    # 固定初始值
created: date            # YYYY-MM-DD
updated: date            # YYYY-MM-DD（初始同 created）
tags: string[]           # 初始 []，后续补充
description: string      # 用户原始描述（YAML > 折叠块标量）

structure:
  root:
    - "task.yaml"        # 固定
    - "workflow.yaml"    # 固定
  adrs: string[]         # 初始 []，创建 ADR 时追加文件名
  logs: string[]         # 初始 []，创建日志时追加文件名
  artifacts: string[]    # 初始 []，产出阶段产物时追加文件名

milestones: []           # 初始 []，后续追加 {id, name, status, completed}

artifacts:
  - "workflow.yaml"      # 固定初始值（最基础的产物）
```

与现有 `feat-quality-v15-20260606/task.yaml` 的兼容：
- ✅ 所有字段名称一致
- ✅ `description` 使用 YAML `>` 标量（与现有格式一致）
- ⚠️  `cross-refs` 字段在初始 task.yaml 中不存在（工作流完成后由 Compound 添加）

---

### workflow.yaml 结构（不变更，仅填充）

`workflow.yaml` 结构由 `workflow-metadata-template.yaml` 定义，`/feat` 命令不修改其结构，仅填充字段值。参见 ADR-003 的填充规则表。

**工作流生命周期状态机**：

```
[命令启动] → status: in_progress
               phases[0].status: in_progress
                     │
               [阶段 1 完成 + Gate 通过]
                     │
                     ▼
               phases[0].status: completed, gate: passed
               phases[1].status: in_progress
                     │
               ... （重复阶段 2-5）
                     │
               [阶段 5 完成 + Gate 通过 + Compound]
                     │
                     ▼
               status: completed
               updated: <当前时间>
```

---

### Slug 生成算法数据流

```
输入: "实现用户登录模块（含OAuth2.0）"

CJK 保留: 实 现 用 户 登 录 模 块 (OAuth2.0)
          ↓
ASCII 保留, 大写转小写: 实现用户登录模块(oauth2.0)
          ↓
特殊符→'-': 实现用户登录模块-oauth2-0-
          ↓
压缩 '-': 实现用户登录模块-oauth2-0
          ↓
去首尾 '-': 实现用户登录模块-oauth2-0
          ↓
截断 40 字符: 实现用户登录模块-oauth2-0  (16 chars, 未触发)

输出: "实现用户登录模块-oauth2-0"
workflow-id: "feat-实现用户登录模块-oauth2-0-20260606"
```

---

## 决策捕捉检查

本阶段新增 4 个 ADR，将在设计审查 Gate 通过后正式创建为独立 ADR 文件：

| ADR | 标题 | 决策 |
|-----|------|------|
| ADR-001 | Command 文件分发策略 | 保留两份，手动同步（与现有模式一致） |
| ADR-002 | Slug 生成算法 | 保留 CJK 基本区，其余替换为 `-` |
| ADR-003 | 元数据模板填充策略 | 读模板→替换字段→写入（模板是单一真相源） |
| ADR-004 | 命令内部步骤编排 | 声明式步骤清单（与 `/adr` 模式一致） |

> **实现阶段**将触发 `/adr` 命令为以上 ADR 创建正式文件。

---

## 与需求分析的对齐检查

| 需求 ID | 本设计覆盖 | 对应 ADR/接口 |
|---------|-----------|--------------|
| F1 — 启动工作流 | ✅ | 接口 4（阶段移交） |
| F2 — workflow-id 生成 | ✅ | ADR-002（Slug 算法）+ 接口 1 |
| F3 — 目录 + 元数据 | ✅ | ADR-003（模板填充）+ 接口 2、3 |
| F4 — 进入阶段 1 | ✅ | 接口 4 |
| F5 — 快速模式 | ✅ | 接口 1（参数解析：mode=quick） |
| F6 — 任务仪表盘 | ⏳ | 设计见需求文档 §6 无参数模式——实现阶段处理 |
| F7 — Skills 加载 | ✅ | 接口 4（skills 参数列表） |
