# Self-Workflow V1 执行计划

> 版本：v0.1
> 对应：ROADMAP.md V1 里程碑 M0 → M1 → M2
> 自举目标：V1 完成后，能用自身来开发 V2

---

## 总览

```
M0 [审计] ───→ M1 [最小内核] ───→ M2 [工程化] ───→ 自举验证
 1 周             3 周               2 周              持续
```

| 里程碑 | 周期 | 核心交付 | 完成标准 |
|--------|------|---------|---------|
| **M0** | 第 1 周 | OpenCode 能力审计报告 | 所有假设验证通过 or 降级方案明确 |
| **M1** | 第 2-4 周 | 手写最小工作流闭环 | 在 self-workflow 项目上跑通 `/feat` |
| **M2** | 第 5-6 周 | 工程化：Adapter + YAML 源 | 安装器可生成全部指引，替代手写 |
| **自举** | 持续 | 切换到用 V1 开发 V2 | 第一个 V2 功能用 `/feat` 完成 |

---

## M0：OpenCode 能力审计（第 1 周）

**目标**：验证架构假设是否成立，明确 Adapter 的能力边界。

### 审计清单

每项审计包含：测试方法 → 预期结果 → 实际结果 → 降级方案（若不支持）

#### 0.1 Hook 机制

| 项 | 内容 |
|----|------|
| **测试方法** | 创建 `.opencode/hooks/on-session-start.yaml`，写入一条简单 hook 定义（读取一个标记文件并输出到上下文），启动新会话观察是否触发 |
| **预期** | 新会话启动时 hook 自动执行，Agent 上下文包含标记文件内容 |
| **降级方案** | 不支持 → Session Catchup 改为 slash command `/catchup` 手动触发 |

需要同时测试：
- `on:session-start`
- `on:workflow-start`
- `on:phase-complete`
- `on:workflow-complete`

#### 0.2 Sub-agent 机制

| 项 | 内容 |
|----|------|
| **测试方法** | 创建 `.opencode/agents/review-agent.yaml`（只读权限，无代码变更能力），编写一条 prompt 让主 Agent 调用此子 Agent 审查一段代码，观察是否可跨 Agent 通信 |
| **预期** | 主 Agent 可派生子 Agent 执行审查任务，子 Agent 返回结构化结果 |
| **降级方案** | 不支持 → 同一 Agent 内角色切换模式（prompt 切换审查角色） |

#### 0.3 Slash Command

| 项 | 内容 |
|----|------|
| **测试方法** | 创建 `.opencode/commands/feat.yaml`，定义 `/feat` 命令，输入 `/feat 测试任务` 观察是否触发指定工作流 |
| **预期** | `/feat` 命令被识别并执行对应流程 |
| **降级方案** | 不支持 → 自然语言触发（"开始一个 feat 工作流"） |

需要测试：
- 命令参数传递（`/feat 实现用户登录` → 参数传到 Agent）
- 命令描述和触发条件

#### 0.4 Skill 系统

| 项 | 内容 |
|----|------|
| **测试方法** | 创建 `.opencode/skills/feat-phase-1.md`，编写需求分析阶段指引，启动 feat 工作流观察 Agent 是否自动加载 Skill |
| **预期** | Agent 在执行相关任务时自动加载匹配的 Skill |
| **降级方案** | 不支持 → 纯 Markdown 指引，Agent 自主读取 |

#### 0.5 文件读写权限

| 项 | 内容 |
|----|------|
| **测试方法** | Prompt Agent 在 `.self-workflow/artifacts/test.md` 写入内容并读取 |
| **预期** | Agent 可自由读写 `.self-workflow/` 目录下的文件 |
| **降级方案** | 受限 → 以 git 作为存储层 |

#### 0.6 自举场景（自引用项目）

| 项 | 内容 |
|----|------|
| **测试方法** | 在 self-workflow 项目目录下运行 `self-workflow init`，观察是否与项目自身文件冲突（`.opencode/` 目录内已有配置文件时是否覆盖） |
| **预期** | 安装器正确处理已存在的配置，不破坏已有文件 |
| **降级方案** | 冲突 → 安装器需增加 `--force` 和 `--dry-run` 模式 |

### 审计交付物

```
.self-workflow/
└── audits/
    └── opencode-capabilities.md    # 审计报告模板
```

审计报告结构：
```markdown
# OpenCode 能力审计报告

## 审计环境
- OpenCode 版本：
- 操作系统：
- 审计日期：

## 审计结果汇总
| 能力 | 支持? | 降级方案 | 影响范围 |
|------|-------|---------|---------|

## 逐项审计详情
### Hook 机制
- 测试方法：
- 预期：
- 实际：
- 结论：
```

---

## M1：最小可自举内核（第 2-4 周）

**核心策略**：先手写，再工程化。所有流程先手工跑通，再考虑自动化。

### M1.1 手写工作流指引（第 2 周）

#### 创建目录结构

```
.self-workflow/
├── guides/
│   └── feat-workflow.md     # feat 工作流 Markdown 指引（手写）
├── artifacts/                # 产物归档（工作流执行时写入）
└── errors/                   # 错误日志（工作流执行时写入）
```

#### 手写 `feat-workflow.md`

内容参考需求草案 §7.2，包含：

```
# Feat 工作流指引

## 阶段 1：需求分析
- 执行内容：理解需求、识别约束、明确验收标准
- 产出：`artifacts/<workflow-id>/01-analysis.md`
- 完成检查清单：
  [ ] 需求理解文档已写入
  [ ] 约束条件已识别
  [ ] 验收标准已定义
- Gate（分析审查）：`weight=light`
  - 程序化验证：无
  - 对抗性审查：Review Agent 检查需求完整性
  - 人工确认：需要用户确认

## 阶段 2：方案设计
...

## 阶段 3：代码实现
...

## 阶段 4：功能验证
...

## 阶段 5：总结沉淀
...
```

#### 验证

在 self-workflow 项目上，Prompt Agent 读取并执行这个指引，完成一次需求分析。

### M1.2 安装器实现（第 2 周）

#### 选择实现方式

优先选择 Node.js（跨平台、零依赖打包可选），备选 shell script。

#### `self-workflow init` 功能

```
Usage: self-workflow init [--target <dir>] [--dry-run]

行为：
1. 创建 .self-workflow/guides/ 并写入 feat-workflow.md
2. 创建 .self-workflow/artifacts/（空）
3. 创建 .self-workflow/errors/（空）
4. 创建 .opencode/agents/review-agent.yaml
5. 输出安装报告
```

#### 安装器项目结构

```
packages/installer/
├── index.js                  # 入口
├── templates/
│   ├── guides/
│   │   └── feat-workflow.md  # 同 M1.1
│   └── agents/
│       └── review-agent.yaml
└── package.json
```

#### 验收

- [ ] 在空目录运行 `init` 成功生成所有文件
- [ ] 在已有 `.self-workflow/` 的目录运行，不覆盖已有产物
- [ ] `--dry-run` 显示将要执行的操作但不写入
- [ ] 运行时间 < 1s

### M1.3 Review Agent 定义（第 3 周）

#### `.opencode/agents/review-agent.yaml`

```yaml
name: review-agent
description: 对抗性审查 Agent，在 Phase Gate 处审查产出质量
permissions:
  files: read-only          # 无代码变更权限
  execute: false
instructions: |
  你是一个独立的审查 Agent。你的职责是在 Phase Gate 处审查工作流产出。

  审查流程：
  1. 读取本阶段产出的 Artifact
  2. 逐项检查：
     - 设计正确性
     - Spec 合规性（如有 Spec）
     - 架构一致性
     - 测试覆盖
  3. 输出结构化审查报告（YAML 格式）

  审查报告格式：
  ```yaml
  review-report:
    workflow: <workflow-id>
    gate: <gate-name>
    summary: "..."
    findings:
      - severity: critical | warning | info
        location: "..."
        description: "..."
        suggestion: "..."
        status: blocking | non-blocking
    pass: true | false
  ```
```

#### 验收

- [ ] Agent 可以被主 Agent 调用
- [ ] 输出 YAML 格式的结构化报告
- [ ] 无代码变更权限（只读）
- [ ] 审查报告包含 critical/warning/info 三级

### M1.4 产物归档 + 错误日志（第 3 周）

#### 产物归档

Agent 在每个阶段完成时写入：

```
.self-workflow/artifacts/<workflow-id>/
├── workflow.yaml          # 工作流实例元数据
├── 01-analysis.md         # 需求分析
├── 02-design.md           # 方案设计
├── 03-implementation.md   # 代码实现
├── 04-verification.md     # 功能验证
└── 05-summary.md          # 总结沉淀
```

`workflow.yaml` 格式：
```yaml
workflow-id: feat-user-login-20260606
type: feat
status: in_progress | completed | cancelled | stuck
created: 2026-06-06T10:00:00
current-phase: 3
phases:
  - id: 1
    name: 需求分析
    status: completed
    gate: passed
```

#### 错误日志

错误即时记录，不等总结：

```
.self-workflow/errors/<workflow-id>/
├── errors.yaml            # 错误索引
├── 01-analysis-errors.md  # 阶段 1 错误详情
└── ...
```

`errors.yaml` 格式：
```yaml
errors:
  - id: err-001
    phase: 3
    description: "JWT 密钥硬编码"
    root-cause: "使用了字符串字面量而非环境变量"
    solution: "迁移到 process.env.JWT_SECRET"
    timestamp: 2026-06-06T14:30:00
    resolved: true
```

#### 验收

- [ ] 阶段完成时自动写入产物到对应目录
- [ ] 产物包含阶段关键决策和输出
- [ ] 错误即时记录到 `errors/` 目录
- [ ] 可通过自然语言查询历史产物

### M1.5 Session Catchup（第 4 周）

#### 实现方案

方式 A（理想）：`on:session-start` hook 自动触发
方式 B（降级）：`/catchup` slash command 手动触发

#### Catchup 逻辑

```
扫描 .self-workflow/artifacts/ → 检测工作流状态
扫描 .self-workflow/errors/   → 检测未解决错误
生成 Catchup 摘要 → 注入 Agent 上下文
```

#### Catchup 摘要模板

```
📋 Session Catchup — {date}

▶ 进行中的工作流：{workflow-id}
  阶段：{phase}
  状态：{status}
  建议："{恢复指令}" 恢复

⚠ 未解决的错误（来自上次 session）：
   - {error-description} → 见 {error-path}

✅ 上次完成的经验：
   - 无（V1 暂不支持经验系统）
```

#### 验收

- [ ] 新会话自动扫描 `.self-workflow/` 状态
- [ ] 检测 in_progress / cancelled / stuck 状态
- [ ] 生成可读的 Catchup 摘要
- [ ] 不阻塞用户操作（摘要仅作为上下文加载）

### M1.6 自举验证（第 4 周）

**这是 V1 能否交付的核心关卡。**

#### 验证场景

在 self-workflow 项目本身上，用 `/feat` 完成一个真实功能开发。建议选用：

> 实现 `self-workflow init --dry-run` 模式

这个功能足够小（1-3 文件），但又能验证完整工作流：

| 阶段 | 内容 | 验证点 |
|------|------|--------|
| 需求分析 | 理解 `--dry-run` 需求、与已有 `init` 功能的关系 | 产物写入 artifacts |
| 方案设计 | 决定实现方式（在 index.js 中新增 flag 处理） | ADR 写入 artifacts |
| 代码实现 | 编码 + 测试 | lint 通过 |
| 功能验证 | 运行 init --dry-run 验证 | 测试通过 |
| 总结沉淀 | 记录实现经验 | 总结写入 artifacts |

#### 验收标准

- [ ] `/feat` 工作流完整执行 5 个阶段
- [ ] 每个阶段产物正确写入 `.self-workflow/artifacts/`
- [ ] 错误即时记录到 `.self-workflow/errors/`
- [ ] Phase Gate 正确执行（Review Agent 出报告）
- [ ] 新会话启动时 Catchup 摘要包含该工作流进度

---

## M2：基础设施工程化（第 5-6 周）

M1 验证工作流可行后，将手写产物替换为工程化方案。

### M2.1 YAML 工作流定义源文件（第 5 周）

创建 `workflows/` 目录，编写 YAML 源定义：

```
packages/
└── adapter/
    └── workflows/
        ├── feat.yaml          # M2.1 优先
        ├── debug.yaml         # M2.3
        ├── doc.yaml           # M2.3
        └── review.yaml        # M2.3
```

feat.yaml 结构（参考需求草案 §7.2）：

```yaml
name: feat
version: 1.0.0
description: 需求/特性开发工作流

phases:
  - id: 1
    name: 需求分析
    description: 理解需求、识别约束、明确验收标准
    output: 01-analysis.md
    gate-weight: light

  - id: 2
    name: 方案设计
    description: 架构决策、接口设计、数据模型设计
    output: 02-design.md
    gate-weight: full
    review-required: true

  # ... 后续阶段

templates:
  analysis: templates/analysis.md
  design: templates/adr.md
```

### M2.2 Adapter V1（YAML → Markdown，第 5 周）

```
packages/adapter/
├── index.js              # 入口
├── renderers/
│   ├── guide-renderer.js # YAML → Markdown 指引
│   └── agent-renderer.js # → review-agent.yaml
└── templates/            # 产物模板
    ├── analysis.md
    ├── adr.md
    ├── review-report.md
    └── summary.md
```

**替换关系**：M1 手写的 `.self-workflow/guides/feat-workflow.md` → Adapter 从 feat.yaml 自动渲染生成。

### M2.3 其他工作流指引 + 动态 Gate 降级（第 6 周）

1. 编写 debug.yaml / doc.yaml / review.yaml 工作流定义
2. Adapter 支持渲染四种工作流指引
3. 实现动态 Gate 降级逻辑（`gate-weight` 自动判定）

---

## 依赖关系

```
M0 [审计]（无前置依赖）
 │
 ▼
M1.1 [手写指引]（前置：M0 完成）
 │
 ▼
M1.2 [安装器]（前置：M1.1，需要复制指引文件）
 │
 ▼
M1.3 [Review Agent]（可并行于 M1.2）
 │
 ▼
M1.4 [产物归档 + 错误日志]（前置：M1.1 验证了流程）
 │
 ▼
M1.5 [Session Catchup]（前置：M1.4，需要扫描产物和错误）
 │
 ▼
M1.6 [自举验证]（前置：M1.1-M1.5 全部完成）
 │
 ▼
M2 [工程化]（前置：M1.6 验证通过，证明流程值得工程化）
```

**可并行的任务**：
- M1.2（安装器）和 M1.3（Review Agent）可并行
- M2.2（Adapter）和 M2.3（其他工作流）可并行

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| OpenCode 不支持关键 hook | 中 | 高 | M0 提前暴露，降级方案已准备 |
| 手写指引 + 人工验证周期过长 | 中 | 中 | M1.1 聚焦最少可行阶段（先跑通 3 阶段而非 5 阶段） |
| 自举验证发现流程不可用 | 中 | 高 | 在 M1.6 预留缓冲时间；选择小型功能作为验证场景 |
| M2 工程化时发现手写方案有设计缺陷 | 低 | 中 | M1 本身已可用；M2 可基于实际使用反馈修正设计 |
| 安装器与项目已有配置冲突 | 低 | 中 | `--dry-run` 预览变更，init 不覆盖已有产物 |

---

## 附录：关键文件清单

### M1 要创建的文件

```
.self-workflow/
├── guides/
│   └── feat-workflow.md          # 手写，M1.1
├── artifacts/                     # 空目录，M1.4 开始写入
└── errors/                        # 空目录，M1.4 开始写入

.opencode/
└── agents/
    └── review-agent.yaml          # 手写，M1.3

packages/installer/
├── index.js                       # M1.2
└── templates/
    ├── guides/feat-workflow.md    # 同 M1.1
    └── agents/review-agent.yaml   # 同 M1.3
```

### M2 要创建的文件

```
packages/adapter/
├── index.js
├── renderers/
│   ├── guide-renderer.js
│   └── agent-renderer.js
├── workflows/
│   ├── feat.yaml
│   ├── debug.yaml
│   ├── doc.yaml
│   └── review.yaml
└── templates/
    ├── analysis.md
    ├── adr.md
    ├── review-report.md
    └── summary.md
```
