# 方案设计：V1.8 — specs 结构奠基

> workflow-id: feat-specs结构奠基-20260606
> 阶段：2/5 — 方案设计
> 创建时间：2026-06-06
> 前置 ADR：ADR-001~005

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────┐
│              self-workflow-session.ts                │
│  (Plugin: session.created + system.transform)        │
│                                                     │
│  ┌─────────────────┐   ┌──────────────────────────┐ │
│  │ scanDocs()       │   │ scanSpecs()  [NEW]       │ │
│  │ → docs/README.md │   │ → specs/README.md        │ │
│  │ → 各分类/*.md    │   │ → default/*.md          │ │
│  │ inject marker:   │   │ inject marker:           │ │
│  │ DOCS_INDEX       │   │ SELF_WORKFLOW_SPECS      │ │
│  └────────┬────────┘   └──────────┬───────────────┘ │
│           │                       │                  │
└───────────┼───────────────────────┼──────────────────┘
            │                       │
            ▼                       ▼
     System Prompt            System Prompt
     (docs/ 索引摘要)         (specs/ default/ 摘要+
                              重点强调标记)
```

### 关键设计原则

1. **Spec ≠ Skill**：spec 通过插件注入 system prompt，Agent 自行读取，不依赖 OpenCode 的 `load_skills` 机制
2. **格式一致**：spec 文件格式与 docs/ 经验文档格式一致（YAML frontmatter + Markdown body）
3. **default/ 语义**：`specs/default/` 存放始终生效的关键规范，注入时重点强调
4. **渐进扩展**：README 分类定义模式允许未来添加新 spec 分类目录

---

## 2. Spec 目录结构（F1）

> 决策依据：ADR-003

```
.self-workflow/specs/
├── README.md           # 索引入口 + 分类定义段（Plugin 可解析）
└── default/            # 始终生效的关键规范
    ├── agent-reasoning.md      # 委托优先原则
    ├── interaction-protocol.md # 交互式问答优先
    ├── doc-audience.md         # 文档受众分类
    └── decision-record.md      # 关键决策记录
```

### README.md 结构设计

```markdown
# Self-Workflow 规范（Spec）

## 如何使用
（Agent 如何发现 spec：default/ 已注入 system prompt，其他分类按需 Read）

## Spec 格式
（frontmatter 字段规范，参考 ADR-001）

---

## 分类定义

> ⚠️ 以下 `### 目录名/` 条目被 Plugin 自动解析。

### default/
始终生效的关键规范——影响 /feat 工作流运行、Gate 审查、Agent 行为约束。
Agent 在每次会话中都必须遵守 default/ 下的规范。
```

---

## 3. Spec 文件格式（F1）

> 决策依据：ADR-001

### Frontmatter 字段

```yaml
---
title: "Agent 推理规范"
type: spec
level: default              # default（始终生效）/ situational（按需加载）
tags: [agent-reasoning, delegation, decision]
version: 1.0.0
summary: "委托优先原则——独立思考、精简上下文、合理委托、验证结果"
---
```

### Body 结构

自由 Markdown，规范条目使用 MUST/SHOULD/MAY 分类：

```markdown
## 核心原则
（一句话概述）

## MUST（必须遵守）
- **委托粒度判断**：子任务预计 >30 秒 → 委托给子 Agent；<5 秒 → 自己做
- ...

## SHOULD（建议遵守）
- ...

## MAY（可选参考）
- ...
```

### 与现有 README.md 骨架的关系

旧的 `specs/README.md` 骨架（纯 Markdown 的 MUST/SHOULD/MAY 列表）被重构为**索引入口**——不再直接包含规范内容，而是列出所有 spec 分类和文件列表。规范内容分散到各子目录的 `.md` 文件中。

---

## 4. Spec 注入方案（F1 + F3 依赖）

> 决策依据：ADR-002

### 4.1 插件扩展

在 `packages/installer/templates/plugin/self-workflow-session.ts` 中新增：

```typescript
// 新增常量
const SPECS_DIR = ".self-workflow/specs";
const SPECS_MARKER = "<!-- SELF_WORKFLOW_SPECS -->";

// 新增函数：scanSpecs()
function scanSpecs(directory: string): string | null {
  const specsDir = resolve(directory, SPECS_DIR);
  if (!existsSync(specsDir)) return null;

  const readmePath = join(specsDir, "README.md");
  const readmeContent = existsSync(readmePath)
    ? readFileSync(readmePath, "utf-8")
    : "";
  // 解析 README.md 中的分类定义段（### 目录名/）
  const categoryDescriptions = parseCategoryDescriptions(readmeContent);

  // 扫描 default/ 目录的关键 spec
  const defaultDir = join(specsDir, "default");
  if (!existsSync(defaultDir)) return null;

  const defaultFiles = readdirSync(defaultDir)
    .filter(f => f.endsWith(".md"))
    .sort();

  if (defaultFiles.length === 0) return null;

  const lines: string[] = [];
  lines.push(SPECS_MARKER);
  lines.push("");
  lines.push("## ⚠️ Self-Workflow 项目规范（必须遵守）");
  lines.push("");
  lines.push("specs/default/ 下的规范**始终生效**，Agent 在每次会话中都必须遵守：");
  lines.push("");

  for (const file of defaultFiles) {
    try {
      const content = readFileSync(join(defaultDir, file), "utf-8");
      const fm = parseFrontmatter(content);
      const title = fm.title || basename(file, ".md");
      const tags = fm.tags.length > 0 ? ` [${fm.tags.join(", ")}]` : "";
      const summary = fm.summary ? ` — ${fm.summary}` : "";
      lines.push(`- **${title}**${tags}${summary}`);
    } catch {
      lines.push(`- ${file}`);
    }
  }

  lines.push("");
  lines.push("**default/ 下的规范影响工作流运行**，Agent 必须遵守。");
  lines.push("用 Read 工具查看完整规范内容。其他分类的 spec 按需加载。");

  return lines.join("\n");
}

// 在 system.transform 中注入（docs 索引之后）
// ... 添加 specsContent 注入逻辑
```

### 4.2 注入到 System Prompt 的效果

Agent 在新会话启动时会看到 system prompt 末尾（以下格式来自 ADR-002 规范）：

```
<!-- SELF_WORKFLOW_SPECS -->

## ⚠️ Self-Workflow 项目规范（必须遵守）

specs/default/ 下的规范**始终生效**，Agent 在每次会话中都必须遵守。
读取每个 spec 文件的 frontmatter 和内容，按遵循执行。

### default/（始终生效）

- **agent-reasoning** [agent-reasoning, delegation, decision] — 委托优先原则：独立思考、精简上下文、合理委托、验证结果
- **interaction-protocol** [interaction-protocol, question, ui] — 交互式问答优先：涉及选项选择时使用 question 工具，总结先行再询问
- **doc-audience** [doc-audience, audience, classification] — Agent 如何判断 .self-workflow/ 下文档的受众
- **decision-record** [decision-record, adr, lifecycle] — 关键决策自动记录：何时必须创建 ADR，如何沉淀跨任务决策

### 如何使用

- default/ 下的 spec 始终生效，Agent 用 Read 工具查看完整内容
- 其他 spec 按需加载：根据任务关键词匹配 spec 的 tags
- 遇到不确定时主动查阅 spec 文件
```

---

## 5. Skill 迁移方案（F3）

> 决策依据：ADR-004（直接删除，不留包装器）

### 5.1 迁移步骤（含验证 checkpoint，来自 ADR-004）

```
Step 1: 创建 specs/default/agent-reasoning.md（完整内容，新格式）
Step 2: 创建 specs/default/interaction-protocol.md（完整内容，新格式）
Step 3: 新增 specs/default/ 条目到 MANIFEST → 运行 init --force 部署
Step 4: 🔴 验证：启动新会话 → 检查 system prompt 含 SPECS_MARKER
Step 5: 🔴 验证：task() 子 Agent 是否继承 spec 注入
        → 通过：继续 → 不通过：feat.md 嵌入 task() 强制 Read spec 指令
Step 6: 删除 .opencode/skills/agent-reasoning/SKILL.md
Step 7: 删除 .opencode/skills/interaction-protocol/SKILL.md
Step 8: MANIFEST 移除 skill 条目 + 运行 init --force
Step 9: 更新 feat.md → 移除 load_skills=['agent-reasoning', 'interaction-protocol'] 引用
       注意：通用 load_skills 委托规则保留（feat.md 第 137-138 行），仅移除特定 skill
Step 10: 更新验收标准 M0-1/M0-2 → 检查 specs/default/ 路径
```

### 5.2 内容平移对照

| 原 Skill 内容 | 新 Spec 位置 | 格式变化 |
|---|---|---|
| `agent-reasoning/SKILL.md` (38行) | `specs/default/agent-reasoning.md` | frontmatter YAML + MUST/SHOULD/MAY 分类 |
| 4 条 MUST 规则 | MUST 章节 | `- **委托粒度判断**：子任务预计 >30 秒 → 委托 ...` |
| 2 条 NOT MUST 规则 | 转为 SHOULD/MAY 补充说明 | 语义不变 |
| 委托决策流程图 | 保留为代码块 | ASCII art 保留 |
| `interaction-protocol/SKILL.md` (37行) | `specs/default/interaction-protocol.md` | 同上 |
| 6 条 MUST 规则 | MUST 章节 | 逐条列出 |
| 2 条 NOT MUST | 同上 | 语义不变 |
| 正确/错误示例 | 保留 | 代码块保留 |

### 5.3 子 Agent spec 继承

由于删除了 `load_skills` 机制，子 Agent（`task()` 委托）不再通过 skill 参数获取行为规范。保障方案：

- **插件注入**：主 Agent 的 system prompt 已含 spec 摘要，子 Agent 部分继承（取决于 OpenCode 实现）
- **显式指令**：在 `task()` 的 prompt 中要求子 Agent 先读取 `specs/default/`
- **兜底**：spec 文件在磁盘上，Agent 可随时 Read

### 5.4 需更新的关联文档

| 文档 | 变更 |
|------|------|
| `packages/installer/templates/commands/feat.md` | 移除 `load_skills=['agent-reasoning', 'interaction-protocol']` 引用，skill 加载规则章节改为指向 spec 注入 |
| `packages/installer/templates/configs/guides/feat-workflow.md` | 移除 skill 相关加载说明（如有） |
| `packages/installer/index.js` | MANIFEST 移除 skill 条目，新增 specs/default/ 条目 |
| `.self-workflow/docs/V1.5/验收标准.md` | M0-1/M0-2 检查路径改为 `specs/default/` |
| `.self-workflow/docs/V1.5-框架融入实施方案.md` | 如有 skill 路径引用则更新 |
| `.self-workflow/docs/功能特性清单.md` | 如有 skill 相关条目则更新 |

---

## 6. 文档受众分类 Spec 设计（F2）

> 产出：`specs/default/doc-audience.md`

### 6.1 Spec 内容框架

```markdown
---
title: "文档受众分类规范"
type: spec
level: default
tags: [doc-audience, audience, classification, docs, specs]
version: 1.0.0
summary: "Agent 如何分辨 .self-workflow/ 下各目录/文档的受众（Human/Agent/Both），以及如何按受众编写和评审文档"
---

# 文档受众分类规范

## 核心原则

Agent 在阅读、编写、评审 .self-workflow/ 下的文档时，需先判断文档的受众...

## 受众分类

### .self-workflow/ 目录受众映射表

| 目录 | 受众 | 说明 |
|------|------|------|
| `docs/` | Agent | 跨任务可复用的经验资产，供 Agent 在执行任务时按需查阅... |
| `specs/` | Agent | 约束 Agent 行为的规范，default/ 始终生效... |
| `tasks/<id>/` | Agent | 任务执行记录，供 Agent 查阅历史... |
| `todo.md` | Human + Agent | 项目 todo 列表... |

### 项目根目录文档受众

| 文件 | 受众 | 说明 |
|------|------|------|
| `AGENTS.md` | Agent | Agent 的行为指令和项目约定... |
| `README.md` | Human | 项目介绍和使用说明... |
| `docs/`（项目根） | Human | 项目文档、需求、路线图... |

## 按受众编写文档

### 面向 Agent 的文档

- frontmatter 规则：必须含 title, category, tags, source, quality
- 内容结构：背景→问题→方案→适用场景
- 语言风格：精确的技术术语，无需过度解释基础概念

### 面向 Human 的文档

- 内容结构：概述→使用方法→常见问题
- 语言风格：从使用者视角出发，解释"为什么"和"怎么用"
- 避免：过多的技术实现细节

### 面向 Both 的文档

- 兼顾双方需求
- 使用分段标记（如 `## 给 Agent` / `## 给 Human`）

## 按受众评审文档

| 受众 | 评审重点 |
|------|---------|
| Agent | frontmatter 完整性、tag 规范性、内容可检索性、建议的可执行性 |
| Human | 概念清晰度、使用指引完整性、示例充分性、避免技术黑话 |
| Both | 分段合理性、双方信息不冲突 |
```

### 6.2 关键澄清

- **不修改已有文档**：此 spec 仅告知 Agent 如何判断和分类，不做批量文档 frontmatter 更新
- **新文档指引**：Agent 在创建新文档时参照此 spec 编写，自然形成受众分类
- **Plugin 注入增强**：未来可在 docs 索引注入时附带受众标注（不在 V1.8 范围）

---

## 7. 决策记录 Spec 设计（F4）

> 产出：`specs/default/decision-record.md`
> 决策依据：ADR-005

### 7.1 Spec 内容框架

```markdown
---
title: "决策记录规范"
type: spec
level: default
tags: [decision-record, adr, lifecycle, governance]
version: 1.0.0
summary: "何时必须创建 ADR、决策记录的格式与模板、跨任务决策的沉淀与生命周期"
---

# 决策记录规范

## MUST（必须遵守）

### 何时必须创建 ADR

以下场景必须在当前任务 adrs/ 目录下创建 ADR：

1. **架构选择**：涉及多方案对比、trade-off 评估的架构决策
2. **方向性决策**：决定项目走向的设计选择
3. **流程性决策**：影响工作流或规范的设计选择
4. **反模式纠正**：发现并对现有设计做出重大修正

### ADR 存储位置

- 任务级：`.self-workflow/tasks/<workflow-id>/adrs/ADR-<编号>-<标题>.md`
- 跨任务沉淀：`docs/关键决策/ADR-<标题>.md`（见下方晋升规则）

## SHOULD（建议遵守）

### ADR 编号

- 同一任务内从 001 递增，编号独立
- 使用 `/adr` 命令自动编号

### ADR 模板选择

- **simple**：单一选项、理由明确 → 背景、决策、理由、关联
- **complex**：多方案对比、trade-off → 背景、备选方案（2+）、选择、理由、影响、反对意见、关联

## ADR 生命周期

### 创建
→ 任务执行中，触发 `/adr` 命令或手动创建

### 引用
→ 同一任务内 ADR 互相引用、Gate 审查时检查一致性

### 沉淀（晋升）
→ Phase 5（总结沉淀）时：
  1. Agent 扫描任务中所有 ADR，评估跨任务价值
  2. 使用 question 工具向 Human 提议晋升
  3. Human 确认后复制到 `docs/关键决策/ADR-<标题>.md`
  4. 在 frontmatter 中标注 `promoted-from: <workflow-id>`

### 废弃/更新
→ 当决策不再适用时：
  1. 在原 ADR frontmatter 中标注 `status: superseded`
  2. 如有替代决策，在 `superseded-by` 中引用新 ADR
```

---

## 8. 安装器变更清单

### 新增模板

```
packages/installer/templates/specs/
├── README.md          # 索引入口（重写）
└── default/           # 新增子目录
    ├── agent-reasoning.md
    ├── interaction-protocol.md
    ├── doc-audience.md
    └── decision-record.md

packages/installer/templates/docs/
└── 关键决策/
    └── .gitkeep       # 新增空目录（跨任务重要 ADR 沉淀）
```

### 修改模板

```
packages/installer/templates/plugin/
└── self-workflow-session.ts   → 新增 scanSpecs() + SPECS_MARKER

packages/installer/templates/configs/
└── guides/feat-workflow.md    → 决策捕捉检查清单更新 + Phase 5 checklist 增加"检查是否有可晋升的 ADR"步骤

packages/installer/templates/commands/
└── feat.md                    → 移除 load_skills=['agent-reasoning', 'interaction-protocol'] 引用

packages/installer/templates/docs/
└── README.md                  → 新增 ### 关键决策/ 分类定义段

packages/installer/index.js    → MANIFEST 移除 skill 条目，新增 specs/default/ + docs/关键决策/ 条目
```

### 删除模板

```
packages/installer/templates/skills/
├── agent-reasoning/SKILL.md   → 🗑️ 删除（内容已迁移至 specs/default/agent-reasoning.md）
└── interaction-protocol/SKILL.md → 🗑️ 删除（内容已迁移至 specs/default/interaction-protocol.md）
```

### MANIFEST 变更

```javascript
// 删除的条目（Skill → Spec 迁移）
// [".opencode/skills/agent-reasoning/SKILL.md", "skills/agent-reasoning/SKILL.md"],  // 🗑️ 移除
// [".opencode/skills/interaction-protocol/SKILL.md", "skills/interaction-protocol/SKILL.md"],  // 🗑️ 移除

// 新增条目 — specs/
[".self-workflow/specs/README.md", "specs/README.md"],
[".self-workflow/specs/default/agent-reasoning.md", "specs/default/agent-reasoning.md"],
[".self-workflow/specs/default/interaction-protocol.md", "specs/default/interaction-protocol.md"],
[".self-workflow/specs/default/doc-audience.md", "specs/default/doc-audience.md"],
[".self-workflow/specs/default/decision-record.md", "specs/default/decision-record.md"],

// 新增条目 — docs/关键决策/
[".self-workflow/docs/关键决策/.gitkeep", "docs/关键决策/.gitkeep"],

// EMPTY_DIRS 新增
".self-workflow/specs/default"
```

### docs/ 新增

```
.self-workflow/docs/
└── 关键决策/          # 新增目录（跨任务重要 ADR 沉淀）
    └── .gitkeep       # 初始化为空目录
```

`docs/README.md` 新增分类定义段：
```markdown
### 关键决策/
跨任务的重大决策记录——从任务 ADR 中晋升，供 Agent 持续查阅引用。
```

---

## 9. 接口定义

### 9.1 Spec Frontmatter 接口

```typescript
interface SpecFrontmatter {
  title: string;        // Spec 标题
  type: "spec";         // 固定值
  level: "default" | "situational";  // default=始终生效，situational=按需
  tags: string[];       // 关键词标签
  version: string;      // 语义化版本
  summary: string;      // 一句话摘要（注入 system prompt 时使用）
}
```

### 9.2 Plugin scanSpecs() 接口

```typescript
function scanSpecs(directory: string): string | null
// 输入：项目根目录
// 输出：格式化的 spec 索引文本（含 SPECS_MARKER），或 null（specs/ 目录不存在/为空）
// 副作用：无（只读）
```

### 9.3 错误处理

- `specs/` 目录不存在 → 静默跳过，不注入 spec 内容
- `specs/default/` 为空 → 静默跳过
- 单个 spec 文件读取失败 → 跳过该文件，其他 spec 正常注入
- Plugin 初始化失败 → 不影响 session 创建

---

## 10. 数据流

```
[开发者]
    │
    ▼
packages/installer/templates/specs/default/*.md
    │  init --force
    ▼
.self-workflow/specs/default/*.md
    │  session.created
    ▼
self-workflow-session.ts (scanSpecs)
    │  system.transform
    ▼
System Prompt (SPECS_MARKER 注入)
    │  Agent 解析
    ▼
Agent 行为约束生效
```

---

## 11. 决策捕捉

- [x] ADR-001：Spec 文件格式（YAML frontmatter + Markdown body）
- [x] ADR-002：Spec 加载机制（插件注入 system prompt）
- [x] ADR-003：Spec 目录结构（default/ + 扩展规则）
- [x] ADR-004：Skill → Spec 迁移方案（直接删除）
- [x] ADR-005：跨任务决策沉淀（docs/关键决策/ 目录 + 人工决策晋升）
