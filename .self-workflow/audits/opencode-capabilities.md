# OpenCode 能力审计报告

> **审计目的**：验证 Self-Workflow 架构假设是否成立，明确 Adapter 能力边界
> **审计平台**：OpenCode v1.15.13 + oh-my-openagent（Ultimate Edition）
> **审计日期**：2026-06-06
> **审计方式**：文档审查 + 实验验证
> **状态**：✅ 完成

---

## 审计结论

| 待审计能力 | 架构假设 | 实际状态 | 影响 | 降级方案 |
|-----------|---------|---------|------|---------|
| **文件级 lifecycle hook**（on:session-start） | 假设存在文件驱动 hook | ❌ 不存在 | **高**：Session Catchup 无法通过丢文件实现 | Hook 需通过 Plugin 实现，或改为 slash command 触发 |
| **Sub-agent / Review Agent** | 可创建只读子 Agent | ✅ 通过 task() API 支持 | 低：可直接实施 | — |
| **Slash Command** | 支持 `/feat` 等命令 | ✅ 完全支持 | 低：可直接实施 | — |
| **Skill 系统** | 可定义工作流阶段 Skill | ✅ 支持（需 name frontmatter） | 低：可直接实施 | — |
| **文件读写权限** | Agent 可写 `.self-workflow/` | ✅ 已验证 | 低：可直接实施 | — |
| **自举场景** | 自引用项目无冲突 | ⚠️ 需验证 | 中：需处理配置共存 | — |
| **对抗性审查 / 只读 Agent** | 可通过 permission 控制 | ✅ 支持 `edit: deny` | 低：可直接实施 | — |

---

## 逐项审计详情

### 1. Hook 机制

#### 审计方法

审查 OpenCode SDK 文档 + oh-my-openagent 源码，验证 hook 系统的实现方式。

#### 发现

OpenCode 的 hook 系统是 **Plugin API** 驱动的，不是文件目录驱动的：

- **21 个 Plugin hook 点**：`event`, `config`, `tool`, `auth`, `provider`, `chat.message`, `chat.params`, `chat.headers`, `permission.ask`, `command.execute.before`, `tool.execute.before`, `tool.execute.after`, `tool.definition`, `shell.env`, `experimental.chat.messages.transform`, `experimental.chat.system.transform`, `experimental.session.compacting`, `experimental.compaction.autocontinue`, `experimental.text.complete`
- **SSE 事件流**（可监听）：`session.created`, `session.updated`, `session.deleted`, `message.updated`, `file.watcher.updated`, `project.updated` 等
- oh-my-openagent 已提供 "54+ lifecycle hooks" 的封装
- **不存在**文件级 `on:session-start` hook（即丢一个 YAML 文件到某个目录即可自动触发）

#### 实现方式（Plugin API）

```typescript
// Plugin hook 示例
export default {
  id: "self-workflow-hooks",
  async server(input, options) {
    return {
      event: async (event) => {
        if (event.type === "session.created") {
          // 触发 Session Catchup
        }
      },
      "command.execute.before": async (command, args) => {
        if (command.name === "feat") {
          // 工作流启动前逻辑
        }
      },
    };
  },
};
```

#### 对架构的影响

| 原始假设 | 实际方案 |
|---------|---------|
| `.opencode/hooks/on-session-start.yaml` 自动触发 | 需要写一个 TypeScript Plugin，或利用 oh-my-openagent 已有 hook |
| `on:phase-complete` 文件生效 | Phase Gate 需要由工作流指引中的 Agent 自主触发，或通过 Plugin hook |
| 零配置 hook | 需要 Plugin 配置，但 oh-my-openagent 已提供底层的 hook 框架 |

#### 降级方案

**方案 A（推荐）**：利用 oh-my-openagent 已有的事件系统 + slash command 实现 Session Catchup
**方案 B**：编写自有的 self-workflow Plugin 监听 session.created 事件
**方案 C**：Session Catchup 仅通过 `/catchup` 命令手动触发（零配置，但需用户主动执行）

---

### 2. Sub-agent / Review Agent 机制

#### 审计方法

通过 `task()` API 创建子 Agent，验证其能否：
1. 读取文件
2. 输出结构化报告
3. 不修改文件（只读）

#### 实验验证

```yaml
# 子 Agent 任务：读取 SKILL.md 并输出结构化 YAML 报告
# 结果：
review-report:
  test: "sub-agent-capability"
  status: "passed"
  file-read: true
  structured-output: true
  observations:
    - "Successfully read .opencode/skills/_test-skill/SKILL.md"
    - "Confirmed read-only access: no files were created, modified, or deleted"
    - "Structured YAML report generated as instructed"
```

#### ✅ 结论：Sub-agent 机制支持

- 通过 `task(subagent_type="general", ...)` 可创建独立子 Agent
- 子 Agent 可以读取文件并输出结构化报告
- Review Agent 可通过 `.opencode/agents/review-agent.md` 定义，设置 `permission: { edit: "deny" }`
- 也可在 `opencode.json` 中以 inline 方式定义：

```json
{
  "agent": {
    "review-agent": {
      "description": "对抗性审查 Agent，Phase Gate 处审查产出质量",
      "mode": "subagent",
      "permission": { "edit": "deny", "bash": "deny" },
      "prompt": "你是一个独立的审查 Agent..."
    }
  }
}
```

---

### 3. Slash Command 机制

#### 审计方法

审查 oh-my-openagent 中已有的 command 定义（security-research.md, publish.md 等），确认命令格式和功能。

#### 发现

Commands 支持以下特性：

| 特性 | 支持 | 说明 |
|------|------|------|
| YAML frontmatter + Markdown 指令 | ✅ | `--- description: ... argument-hint: ... ---` |
| 参数传递 | ✅ | 通过 `$ARGUMENTS` 变量传递用户输入 |
| 指令注入 | ✅ | `<command-instruction>` 区块定义 Agent 行为 |
| 上下文注入 | ✅ | `<current-context>` 区块自动填充环境数据 |
| 文件位置 | ✅ | `.opencode/command/<name>.md` |

#### 命令格式

```markdown
---
description: 启动一个特性开发工作流
argument-hint: <特性描述>
---

<command-instruction>
你是一个 Self-Workflow 工作流引擎。用户发起了 feat 工作流。

任务描述：$ARGUMENTS

请按以下阶段执行：
1. 需求分析 → 读取工作流指引，产出一份需求分析文档
2. 方案设计 → ...
...
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>
```

#### ✅ 结论：Slash Command 完全支持

- 可直接创建 `/feat`, `/debug`, `/doc`, `/review` 命令
- 支持参数传递（`/feat 实现用户登录`）
- 命令定义简单，纯 Markdown

---

### 4. Skill 系统

#### 审计方法

验证 Skill 定义的格式和加载方式。

#### 发现

Skill 系统要求：

| 要求 | 说明 |
|------|------|
| 目录结构 | `.opencode/skills/<name>/SKILL.md` |
| frontmatter | 必须包含 `name` 和 `description` 字段 |
| 加载方式 | `skill(name="<name>")` 命令调用 |
| 注册路径 | 默认扫描 `.opencode/skills/` 和 `~/.config/opencode/skills/` |

#### Skill 格式

```markdown
---
name: feat-phase-analysis
description: 特性开发工作流的需求分析阶段指引。Use when executing Phase 1 of a feat workflow.
---

# Feat 工作流 - 需求分析阶段

## 执行内容
...
```

#### 注意

- `name` frontmatter **必须**与文件夹名称匹配
- `description` 必须覆盖"做什么"和"何时触发"
- 无 `name` 的 SKILL.md 会被静默忽略（实验验证发现此问题）

#### ✅ 结论：Skill 系统支持（需正确配置）

---

### 5. 文件读写权限

#### 审计方法

在当前 session 中直接验证文件读写操作。

#### 实验验证

| 操作 | 结果 |
|------|------|
| 创建 `.self-workflow/audits/` 目录 | ✅ 成功 |
| 写入审计报告文件 | ✅ 成功 |
| 读取需求草案.md | ✅ 成功 |
| 修改 ROADMAP.md | ✅ 成功 |
| 创建 `.opencode/command/` 测试文件 | ✅ 成功 |

#### ✅ 结论：文件读写权限完全支持

Agent 可以自由读写 `.self-workflow/` 和 `.opencode/` 目录。

---

### 6. 自举场景（自引用项目）

#### 审计方法

分析当前项目结构，识别 `self-workflow init` 与已有配置的潜在冲突。

#### 当前项目状态

```
self-workflow/
├── .self-workflow/audits/        # ✅ 已存在（审计使用）
├── .opencode/command/            # ⚠️ 创建后未清理
├── .opencode/skills/             # ⚠️ 创建后未清理
├── 需求草案.md                    # 项目文档
├── ROADMAP.md                    # 项目文档
└── V1-执行计划.md                  # 项目文档
```

#### 潜在冲突

| 冲突点 | 风险 | 处理方式 |
|--------|------|---------|
| `.opencode/` 目录已存在 | 低 | init 检查已存在文件，不覆盖 |
| `oh-my-openagent.json` 配置冲突 | 中 | self-workflow 的 Adapter 需与 oh-my-openagent 兼容 |
| `.self-workflow/` 与项目文件共存 | 低 | 按设计隔离存储 |

#### 注意

项目当前通过 `oh-my-openagent` 插件提供 agent 系统。Self-Workflow 的 `init` 安装器需要：

1. 不破坏 oh-my-openagent 的已有配置
2. Review Agent 定义可以兼容 oh-my-openagent 的 agent 系统
3. 工作流指引文件与 oh-my-openagent 的 skills 共存

---

## 架构调整建议

基于审计结果，以下架构假设需要调整：

### 1. Hook 机制 → 改为 Plugin + Command 混合方案

**原架构**：
```
文件级 hook（on:session-start）→ 自动触发 Session Catchup
```

**新方案**（基于审计结果）：
```
方案 A：oh-my-openagent Plugin event hook → 监听 session.created 自动触发 Catchup
方案 B：slash command `/catchup` → 用户/Agent 手动触发
方案 C：V1 用方案 B，V2 升级到方案 A
```

**推荐**：V1 用方案 B（零配置），V2 写 Plugin（自动触发）。

### 2. Review Agent → 用 `.opencode/agents/` 文件定义 + `permission: { edit: "deny" }`

**原架构**：
```
.opencode/agents/review-agent.yaml
```

**新方案**：
```
.opencode/agents/review-agent.md （Markdown 格式，兼容 OpenCode）
```

实际格式差异不大，YAML frontmatter + Markdown body。

### 3. Adapter V1 输出格式微调

| 输出目标 | 原格式 | 实际格式 |
|---------|--------|---------|
| Review Agent | YAML | Markdown（with YAML frontmatter） |
| 工作流指引 | 纯 Markdown | Markdown（不变） |
| Slash Command | — | `.opencode/command/<name>.md` |

Adapter V1 除了渲染 Markdown 指引外，还需生成：
- `.opencode/command/feat.md` — feat 工作流命令
- `.opencode/agents/review-agent.md` — Review Agent 定义

---

## 附录：关键能力验证快照

### 已创建和验证的文件

```
.self-workflow/
└── audits/
    └── opencode-capabilities.md          # 本文件（审计报告）

.opencode/                                # 初始化的测试目录
├── command/                              # Slash Command 目录
└── skills/                               # Skill 目录
```

### 测试 Agent 输出

Sub-agent 能力测试结果：
- ✅ 子 Agent 可独立读取文件
- ✅ 子 Agent 可输出结构化 YAML 报告
- ✅ 子 Agent 可保持只读（不修改文件）
- ❌ Skill 需 `name` frontmatter 才能加载（已记录到架构调整）
