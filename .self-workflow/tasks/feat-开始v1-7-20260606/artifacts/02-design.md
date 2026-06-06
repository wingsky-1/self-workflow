# 方案设计 — V1.7：docs 结构 + 索引注入

> 工作流 ID：`feat-开始v1-7-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T22:00:00+08:00

---

## 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    OpenCode Session                      │
│                                                          │
│  ① session.created 事件 (最佳情况)                        │
│     └→ scanDocs() 预计算注入内容                          │
│                                                          │
│  ② chat.system.transform (每次 LLM 调用)                  │
│     ├─ 检查 output.system 是否含 marker → 有则跳过        │
│     ├─ 无 marker → 注入(预计算内容 或 实时scanDocs)       │
│     └─ 合并到 output.system[last]                        │
│                                                          │
│  覆盖场景：                                              │
│  • 新会话 + session.created 触发  → 预计算→注入           │
│  • 新会话 + session.created bug  → 实时scanDocs→注入      │
│  • TUI重开(同会话)                 → marker已存在→跳过     │
└─────────────────────────────────────────────────────────┘

.self-workflow/docs/                  ← 框架管理的经验目录
├── README.md                          ← 元文档：解释 docs/ 用途、分类含义、文档格式约定
├── 实施经验/                          ← 分类子目录
│   ├── feat-command-实施经验.md
│   ├── gate-强制步骤-实施经验.md
│   ├── V1.5-实施经验.md
│   └── V1-实施经验.md
├── 参考模式/
│   └── 产物权威来源唯一-ADR引用而非内联.md
└── 错误经验/
    ├── gate-推理链一致性-错误经验.md
    ├── design-可定制性声明验证-错误经验.md
    └── installer-错误经验.md
```

---

## 模块一：Plugin 设计

### Plugin 注册

OpenCode Plugin 通过配置注册。在项目根目录 `opencode.json` 中：

```json
{
  "plugin": [
    ".opencode/plugin/self-workflow-session.ts"
  ]
}
```

### Plugin 实现（session.created 信号 + marker 检测兜底）

```typescript
// .opencode/plugin/self-workflow-session.ts
import type { PluginInput, Hooks } from "@opencode-ai/plugin";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { resolve, join, basename } from "path";

const DOCS_DIR = ".self-workflow/docs";
const MARKER = "<!-- SELF_WORKFLOW_DOCS_INDEX -->";

let docsContent: string | null = null;

/** 从 README.md 解析分类→描述映射 */
function parseCategoryDescriptions(content: string): Record<string, string> {
  const map: Record<string, string> = {};
  const regex = /###\s+(.+?)\s*\/\s*\n+([^\n#]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    const desc = match[2].trim();
    if (name && desc) map[name] = desc;
  }
  if (Object.keys(map).length < 2) {
    console.warn("[self-workflow] README.md 分类条目少于 2 个，请检查 `### 分类名/` 格式");
  }
  return map;
}

/** 解析 YAML frontmatter */
function parseFrontmatter(content: string): { title?: string; tags: string[] } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { tags: [] };
  const lines = match[1].split("\n");
  const result: { title?: string; tags: string[] } = { tags: [] };
  for (const line of lines) {
    if (line.startsWith("title:")) result.title = line.replace("title:", "").trim().replace(/^["']|["']$/g, "");
    if (line.startsWith("tags:")) {
      const tagStr = line.replace("tags:", "").trim();
      result.tags = tagStr.replace(/[\[\]]/g, "").split(",").map(t => t.trim()).filter(Boolean);
    }
  }
  return result;
}

/** 扫描 docs/ 目录，生成注入文本（含 marker） */
function scanDocs(directory: string): string | null {
  const docsDir = resolve(directory, DOCS_DIR);
  if (!existsSync(docsDir)) return null;

  try {
    const readmePath = join(docsDir, "README.md");
    const readmeContent = existsSync(readmePath) ? readFileSync(readmePath, "utf-8") : "";
    const categoryDescriptions = parseCategoryDescriptions(readmeContent);
    if (Object.keys(categoryDescriptions).length === 0) return null;

    const categories = Object.keys(categoryDescriptions).filter(cat => {
      const full = join(docsDir, cat);
      return existsSync(full) && statSync(full).isDirectory();
    });
    if (categories.length === 0) return null;

    const lines: string[] = [];
    lines.push(MARKER);
    lines.push("");
    lines.push("## Self-Workflow 经验文档索引");
    lines.push("");
    lines.push("docs/ 下的分类目录及其作用：");
    for (const cat of categories) {
      lines.push(`- ${cat}/ — ${categoryDescriptions[cat]}`);
    }
    lines.push("");

    for (const cat of categories) {
      const catDir = join(docsDir, cat);
      const files = readdirSync(catDir).filter(f => f.endsWith(".md"));
      if (files.length === 0) continue;

      lines.push(`### ${cat}/`);
      for (const file of files) {
        try {
          const content = readFileSync(join(catDir, file), "utf-8");
          const fm = parseFrontmatter(content);
          const displayName = fm.title || basename(file, ".md");
          const tagStr = fm.tags.length > 0 ? ` [${fm.tags.join(", ")}]` : "";
          lines.push(`  ${displayName}${tagStr}`);
        } catch {
          lines.push(`  ${file}`);
        }
      }
      lines.push("");
    }

    lines.push("遇到相关主题时，用 Read 工具查看对应文档。无需加载全文到上下文。");

    return lines.join("\n");
  } catch {
    return null;
  }
}

export const server = async (input: PluginInput): Promise<Hooks> => {
  const directory = input.directory;

  return {
    // ─── 信号：session.created 事件 ───
    // 新会话时预计算注入内容。即使此事件因 bug 未触发，
    // chat.system.transform 的 marker 检测作为兜底。
    event: async ({ event }) => {
      if (event.type === "session.created") {
        docsContent = scanDocs(directory);
      }
    },

    // ─── 注入 + 去重：chat.system.transform ───
    // 业界验证的最佳实践：用 marker 实现内容级去重。
    // - TUI 重开：system prompt 已含 marker → 跳过
    // - session.created bug 未触发：docsContent 为空 → 实时 scanDocs
    // - 正常新会话：docsContent 已预计算 → 直接使用
    "experimental.chat.system.transform": async (_input, output) => {
      if (!Array.isArray(output?.system)) return;

      // 1. marker 检测：已注入则跳过
      for (const entry of output.system) {
        if (entry.includes(MARKER)) return;
      }

      // 2. 获取注入内容（预计算 或 实时扫描）
      const content = docsContent ?? scanDocs(directory);
      if (!content) return;

      // 3. 合并到 system prompt（不 push 新 entry，兼容单 system message 后端）
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += "\n\n" + content;
      } else {
        output.system.push(content);
      }
    },
  };
};
```

### 注入格式设计

按照用户方向——**只暴露目录用途 + 文件头 tag 列表**：

```
## Self-Workflow 经验文档索引

docs/ 下的分类目录及其作用：
- 实施经验/ — 实际开发中遇到的问题与解决方案
- 参考模式/ — 跨任务复用的设计模式与约定
- 错误经验/ — 踩过的坑，避免重复

各文件 tag 索引：
实施经验/
  feat-command-实施经验.md         [feat-command, 自举, Gate量化, V1.5]
  gate-强制步骤-实施经验.md        [Gate, 框架规范, 三管齐下]
  V1.5-实施经验.md                 [V1.5, 质量加固, ADR三档]
  V1-实施经验.md                   [V1, 奠基, 线性模型]
参考模式/
  产物权威来源唯一-ADR引用而非内联.md [ADR, 产物引用, 去重]
错误经验/
  gate-推理链一致性-错误经验.md    [Gate, 推理链, 阶段一致性]
  design-可定制性声明验证-错误经验.md [安装器, 自举, MANIFEST]
  installer-错误经验.md             [安装器, 目录职责, 三层架构]

遇到相关主题时，用 Read 工具查看对应文档。无需加载全文到上下文。
```

**估算 token 量**：当前 9 文档 × 约 20 tokens（文件名 + 3~5 个 tag）= ~180 tokens。即使扩展到 50 文档也仅 ~1000 tokens，非常安全。

### 降级/容错

- Plugin 加载失败 → 静默，不影响 Agent 正常启动
- docs/ 目录不存在 → 空注入（新项目可能还没有经验文档）
- 单个文件 frontmatter 解析失败 → 降级为仅显示文件名，不影响其他文件
- `session.created` 事件未触发（已知 bug [#14808](https://github.com/sst/opencode/issues/14808)）→ 不注入，用户可通过 `/docs` 命令手动获取
- **后端兼容性**：合并到 `output.system[0]` 而非 `push`（兼容单 system message 后端）
- `experimental.chat.system.transform` 移除 → 降级为 Slash Command `/docs`

### 已知限制

- `parseFrontmatter` 使用行级字符串匹配解析 YAML，不支持跨行 tag 和 YAML 复杂格式。当前文档的 frontmatter 均为简单单行格式，此限制暂不影响功能。未来可升级为轻量 YAML 解析器
- Windows：硬编码路径 `".self-workflow/docs"` 使用 POSIX 风格分隔符，Node.js `path.resolve/join` 会自动转换。中文目录名（`实施经验/`）在 NTFS 上的编码兼容性需在实现阶段实测验证

---

## 模块二：文档格式规范

### YAML Frontmatter（统一格式）

每份经验文档以 YAML frontmatter 开头，Plugin 和 Agent 均可解析：

```yaml
---
title: "/feat 命令实施经验"
category: 实施经验
tags: [feat-command, 自举, Gate量化, V1.5]
date: 2026-06-06
source: tasks/feat-实现feat命令-20260606
quality: draft
---
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 否 | 文档标题（缺失则用文件名） |
| `category` | string | 是 | 所属分类：实施经验/参考模式/错误经验 |
| `tags` | array | 是 | 关键词标签，Agent 用于匹配。Plugin 扫描后注入到 L1 |
| `date` | string | 否 | 创建日期 ISO 8601 |
| `source` | string | 否 | 来源任务 workflow-id |
| `quality` | string | 否 | 成熟度：draft / verified |

### 文件名约定

```
{领域}-{分类}.md
```

- 领域：描述涉及模块/命令（如 feat-command、gate、installer、V1、design）
- 分类：与 `category` frontmatter 字段一致（实施经验/参考模式/错误经验）
- 文件放入对应分类子目录（分类由目录决定，文件名中的分类后缀为冗余可读性标记）

### 渐进式披露分层

| 层级 | 触发时机 | 内容 | Token 预算 |
|------|---------|------|-----------|
| **L1（注入层）** | 会话启动，Plugin 自动注入 | 目录用途 + 各文件 tag 列表（从 frontmatter 中提取） | ≤ 1000 tokens（50 文档规模） |
| **L2（按需层）** | Agent 根据 tag 匹配后自主决定 | 使用 Read 工具读取具体文档全文 | 由 Agent 自行判断 |

> **不在 L1 注入摘要**：L1 仅暴露目录作用 + tag 列表，Agent 自行判断读取时机。Agent 收到系统提示后，根据当前任务关键词在 tag 列表中匹配，然后自主决定读取哪些文档全文。

---

## 模块三：READMe.md 设计（权威分类源）

READMe.md 是 Plugin 扫描 docs/ 的**唯一权威源**。新增分类目录只需在此文件中声明，无需修改 Plugin 代码。

```markdown
# Self-Workflow 经验文档

本目录存放跨任务可复用的经验资产。Agent 在新会话启动时自动获取本目录的文档索引（目录用途 + 各文件 tag 列表），根据任务关键词按需匹配加载。

## 如何使用

### 查找经验

根据任务主题在下方"分类"段中查找对应标签，用 Read 工具查看具体文档。

### 沉淀经验

在任务总结阶段（Phase 5），如果产出了跨任务可复用的经验：

1. 在对应分类目录下创建新文件，命名：`{领域}-{分类}.md`
2. 填写 YAML frontmatter（见下方"文档格式"）
3. 内容建议包含：背景、问题、方案、适用场景

### 新增分类

如需新增经验分类：

1. 在 `docs/` 下创建新目录，放入 `.gitkeep` 或文档
2. 在本文件底部的"分类定义"段中新增 `### 新分类名/` 条目，并写一行描述
3. Agent 会在下次会话自动识别新分类

## 文档格式

每份文档以 YAML frontmatter 开头：

---
title: "/feat 命令实施经验"
category: 实施经验
tags: [feat-command, 自举, Gate量化]
date: 2026-06-06
source: tasks/feat-实现feat命令-20260606
quality: draft
---

`title`：文档标题（可选，缺失则用文件名）
`category`：所属分类，与所在目录对应
`tags`：关键词标签，Agent 用于匹配，Plugin 扫描后注入
`date`：创建日期
`source`：来源任务 workflow-id
`quality`：成熟度（draft / verified）

### Tag 标准化规则

为确保 Agent 跨会话可复用地匹配文档，tag 应遵循以下约定：

1. **统一小写**：所有 tag 使用英文小写（`feat-command` 而非 `Feat-Command`），与代码标识符一致
2. **优先英文**：技术术语用英文（`gate`, `installer`, `plugin`），中文仅用于领域特有名詞（`自举`）
3. **避免歧义**：同类概念使用同一 tag（不要同时使用 `V1.5` 和 `v1.5`）
4. **粒度适中**：3-5 个 tag 为佳，过少难以匹配，过多稀释相关性
5. **领域前缀**：涉及特定命令/模块的，使用 `领域:主题` 格式（如 `feat-command`、`installer`）

---

## 分类定义

> ⚠️ 以下 `### 目录名/` 条目被 Plugin 自动解析。新增分类目录后在此处添加对应条目。

### 实施经验/
实际开发中遇到的问题与解决方案，来自特定任务的执行记录。

### 参考模式/
跨任务复用的设计模式与约定，不止于某一任务的通用经验。

### 错误经验/
踩过的坑，记录错误根因和修复方式，避免重复犯错。
```

**Plugin 解析规则**：
- 扫描 `### 分类名/` 标题 → 获取分类名
- 读取标题下方一段文字 → 获取分类描述
- 只扫描 README 中声明的分类目录（忽略未声明的目录，防御性设计）

---

## 模块四：安装器模板改造

### 当前状态
- `packages/installer/templates/` 下无 `docs/` 目录
- MANIFEST 中无 docs 相关条目
- EMPTY_DIRS 仅创建空 `docs/` 目录

### 新增内容

**1. 新增模板目录**：`packages/installer/templates/docs/`

```
templates/docs/
├── README.md                          ← 分类权威源 + 文档格式说明
├── 实施经验/
│   └── .gitkeep
├── 参考模式/
│   └── .gitkeep
└── 错误经验/
    └── .gitkeep
```

**2. 更新 MANIFEST**（在 `packages/installer/index.js` 中新增）：

```javascript
const MANIFEST = [
  // ... 现有条目 ...
  
  // docs/ 分类目录 .gitkeep
  [".self-workflow/docs/实施经验/.gitkeep", "docs/实施经验/.gitkeep"],
  [".self-workflow/docs/参考模式/.gitkeep", "docs/参考模式/.gitkeep"],
  [".self-workflow/docs/错误经验/.gitkeep", "docs/错误经验/.gitkeep"],
  
  // docs/ README（分类权威源）
  [".self-workflow/docs/README.md", "docs/README.md"],
];
```

**3. 更新 EMPTY_DIRS**：删除旧的 `"docs/"` 条目（已由 .gitkeep 覆盖子目录创建）

**4. 新增 Plugin 模板**：`packages/installer/templates/plugin/self-workflow-session.ts`

```javascript
[".opencode/plugin/self-workflow-session.ts", "plugin/self-workflow-session.ts"],
```

**5. 新增 opencode.json plugin 配置**：需在 init 时动态追加 plugin 条目（如果 opencode.json 不存在则创建）。

### `--force` 下的覆盖策略

| 文件 | 行为 |
|------|------|
| `.gitkeep` | 有则跳过，无则创建（不会删除已有文档） |
| `README.md` | `--force` 时覆盖（模板提供初始结构，用户后续自行修改） |
| 已有 `docs/` 下的文档 | MANIFEST 不管理 → 不会被 `--force` 影响 |
| Plugin `.ts` 文件 | `--force` 时覆盖 |

---

## 模块五：现有文档迁移

### 迁移映射

| 原路径 | 新路径 | 说明 |
|--------|--------|------|
| `feat-command-实施经验.md` | `实施经验/feat-command-实施经验.md` | ✅ 一致 |
| `gate-强制步骤-实施经验.md` | `实施经验/gate-强制步骤-实施经验.md` | ✅ 一致 |
| `V1.5-实施经验.md` | `实施经验/V1.5-实施经验.md` | ✅ 一致 |
| `V1-实施经验.md` | `实施经验/V1-实施经验.md` | ✅ 一致 |
| `产物权威来源唯一-ADR引用而非内联.md` | `参考模式/产物权威来源唯一-ADR引用而非内联.md` | ✅ 内容声明为参考模式 |
| `gate-推理链一致性-实施经验.md` | `错误经验/gate-推理链一致性-错误经验.md` | ⚠️ 文件名修正，内容为错误经验 |
| `design-可定制性声明验证-实施经验.md` | `错误经验/design-可定制性声明验证-错误经验.md` | ⚠️ 同上 |
| `installer-错误经验.md` | `错误经验/installer-错误经验.md` | ✅ 一致 |
| `经验分级与加载指引.md` | `README.md` | 🔄 提升为根 README.md，作为 Plugin 的权威分类源 |

### 迁移步骤

1. `git mv` 移动文件（保留 Git 历史）
2. 对文件名分类不一致的（`gate-推理链一致性`、`design-可定制性`），修正文件名中的分类后缀为 `错误经验`
3. 统一所有文档的 frontmatter 格式
4. `经验分级与加载指引.md` 内容整合进 README.md
5. **一致性校验**：确认每个文档的 `category` frontmatter 字段、文件名分类后缀、所在目录三者一致

---

## 接口设计

### 两阶段注入流程

```
阶段1 — 检测（event hook）
  │
  ├─ session.created 触发
  ├─ scanDocs(directory) → 读取 README + 分类目录 + YAML frontmatter
  ├─ injectionCache.set(sessionID, formattedText)
  └─ 完成（不注入，仅缓存）

阶段2 — 注入（chat.system.transform hook）
  │
  ├─ 首次 LLM 调用触发
  ├─ injectedSessions.has(sessionID)? → 是 → 跳过（已注入过）
  ├─ injectionCache.get(sessionID) ?? scanDocs(directory)
  ├─ output.system[0] += "\n\n" + injected
  └─ injectedSessions.add(sessionID)，清理 injectionCache
```

- **检测**：`event` hook + V2 `session.created` 事件（仅在会话创建时触发一次）
- **注入**：`chat.system.transform` hook（该 session 只注入一次，通过 `injectedSessions` Set 去重）
- **Fallback**：如果 `session.created` 未触发（已知 bug），`chat.system.transform` 的 `scanDocs()` 作为实时降级
- **扩展性**：用户在 README 中新增 `### 新分类/` → 两阶段自动识别，无需修改代码

**Agent 自行查找文档**：Agent 收到注入的 tag 列表后，根据当前任务关键词匹配，自主决定读取哪些文档——无需额外查询步骤。

---

## 数据模型

### README.md 解析规则

Plugin 解析 README.md 的 `### 分类名/` 标题来发现分类：

```
### 实施经验/
实际开发中遇到的问题与解决方案，来自特定任务的执行记录。
              ↑ 这段文字作为分类描述
```

**规则**：
- 标题格式：`### <分类目录名>/`（`/` 后缀标识这是一个目录分类条目）
- 描述：标题下方第一个非空段落
- Plugin 仅扫描 README 中声明的分类目录

### 文档 Frontmatter Schema

统一所有文档使用 YAML frontmatter：

```yaml
---
title: "/feat 命令实施经验"
category: 实施经验
tags: [feat-command, 自举, Gate量化, V1.5]
date: 2026-06-06
source: tasks/feat-实现feat命令-20260606
quality: draft
---
```

---

## 备选方案对比

### 方案 A：Plugin + chat.system.transform（选定）

| 维度 | 评价 |
|------|------|
| 实现复杂度 | 中（约 50 行 TS） |
| 用户侵入性 | 低（不修改 AGENTS.md） |
| 自动化程度 | 高（全自动，无需用户操作） |
| 风险 | 中（依赖 experimental API） |

### 方案 B：Slash Command（`/docs`）

| 维度 | 评价 |
|------|------|
| 实现复杂度 | 低（纯 Markdown） |
| 用户侵入性 | 低 |
| 自动化程度 | 低（需手动触发 `/docs`） |
| 风险 | 低 |

### 方案 C：AGENTS.md 指针

| 维度 | 评价 |
|------|------|
| 实现复杂度 | 最低（1 行文字） |
| 用户侵入性 | 中（修改 AGENTS.md） |
| 自动化程度 | 中（Agent 自律执行） |
| 风险 | 低 |

**选型理由**：方案 A 满足"全自动"+"不修改 AGENTS.md"两个硬性需求。方案 B 作为降级方案保留（如果 `experimental.chat.system.transform` 在 OpenCode 升级中移除）。

### 降级方案：Slash Command `/docs`

```markdown
# /docs 命令（保留作为 Plugin 不可用时的降级方案）

用法：/docs               → 显示 docs/ 目录索引（同 Plugin 注入内容）
     /docs <关键词>       → 按关键词搜索匹配的文档

命令读取 docs/README.md + 扫描各分类目录 frontmatter，
输出与 Plugin 注入格式一致的索引文本。
```

Plugin 中增加降级检测：若 `chat.system.transform` 不可用（try-catch SDK 检查），输出日志提示使用 `/docs` 命令。

---

## 完成检查清单

- [ ] 质疑报告已提交并经 Human 确认 ✅（质疑报告已通过）
- [ ] 关键架构决策已记录（含 trade-off 评估）✅
- [ ] 接口设计已定义 ✅
- [ ] 数据模型已设计 ✅
- [ ] 备选方案至少 2 个 ✅
- [ ] **决策捕捉**：检查 adrs/ 目录——如果本阶段有架构决策，adrs/ 下必须有对应 ADR 文件

---

## 决策声明

- [x] ADR 已创建（Plugin 方案选定），见 `adrs/ADR-001-plugin-session-inject.md`

但首先需要确认 Human 是否认可上述方案。
