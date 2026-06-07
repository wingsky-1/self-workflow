---
phase: 2
workflow: feat
description: V1.22 方案设计 — 4 项修改的精确 diff，每个文件的变更位置与内容
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — V1.22：文档/工具规范修补（P1/P2）

> 工作流 ID：`feat-文档工具规范修补-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T22:00:00+08:00

---

## 架构决策记录

> ADR-001：P2 内置工具优先 — 扩展 agent-reasoning.md 而非新建独立 spec
>
> **决策摘要**：选择扩展 `agent-reasoning.md`（在"委托决策"段之后新增"工具选择优先"子节），不创建独立 spec 文件。
> 核心理由：工具选择是委托决策的自然延伸，共享"先检查再执行"原则；规则简短（~10 行）适合内聚，避免 20 行文件的碎片化。
> 备选方案 B（新建 spec）的合理优点已记录（关注点分离、可按需加载、扩展性好），当前不选的原因主要是比例失衡。
>
> 完整内容见 **adrs/ADR-001-内置工具优先-扩展agent-reasoning.md**

---

## 修改方案（按文件）

> 所有修改在 `packages/installer/templates/` 下进行，修改后运行 `init --force` 同步。以下 diff 用"原文 → 修改后"格式描述，标注插入位置（行号基于当前模板源）。

### 文件 1：`specs/default/decision-record.md`

**当前版本**：1.2.0 → **目标版本**：1.3.0

**修改 1.1 — 在"触发条件"段增加时间约束**

位置：第 27 行之后（反模式纠正条目之后），"### 存储结构"之前

```markdown
<!-- 新增：时间约束 -->
**时间约束**：当 `/feat` 工作流的 Phase 2（方案设计）产出涉及上述任一触发场景时，Agent **MUST** 在编写 `02-design.md` 前先在 `tasks/<workflow-id>/adrs/` 创建独立 ADR 文件（按下方模板选择规则）。ADR 的完整内容 MUST 在独立文件中；产物文档可保留含对比摘要的引用章节，但禁止将完整 ADR 替换产物文档的独立决策记录段。

判断流程：
1. Phase 2 产出中是否包含架构选择/方向性决策/流程性决策/反模式纠正？→ 是 → 必须创建独立 ADR 文件
2. 不确定？→ 使用 `question` 工具向 Human 确认
3. 明确不涉及？→ 在 Phase 2 checklist 中显式标注"本阶段无架构决策"
```

**修改 1.2 — 更新版本号**

位置：frontmatter `version` 字段：`1.2.0` → `1.3.0`

**修改 1.3 — 更新 summary**

位置：frontmatter `summary` 字段，追加"含时间约束——先于产物创建独立 ADR 文件"

---

### 文件 2：`configs/guides/feat-workflow.md`

**当前版本**：0.5 → **目标版本**：0.6

**修改 2.1 — Phase 2 checklist "决策捕捉"项强化**

位置：第 218 行（当前 checklist "决策捕捉"项）

```markdown
<!-- 原文 -->
- [ ] **决策捕捉**：已检查 adrs/ 目录（有决策则必有文件）

<!-- 修改为 -->
- [ ] **决策捕捉**：已检查 adrs/ 目录——若本阶段产出触及 decision-record.md 的触发场景，adrs/ 目录必须非空（含独立 ADR 文件）；若未触及，需显式标注"本阶段无架构决策"并附判断依据
```

**修改 2.2 — Phase 1/3/4/5 checklist 同步**

类似措辞统一，在 Phase 1、3、4、5 的"决策捕捉"项追加"若触及触发场景则 adrs/ 必须非空"约束。具体：
- Phase 1 (L81)：补充"若触及触发场景"条件
- Phase 3 (L356)：补充"若触及触发场景"条件
- Phase 4 (L518)：补充"若触及触发场景"条件
- Phase 5 (L656)：补充"若触及触发场景"条件

**修改 2.3 — 更新版本号**

位置：frontmatter `version` 字段：`0.5` → `0.6`

---

### 文件 3：`specs/default/todowrite-display.md`

**当前版本**：1.0.0 → **目标版本**：1.1.0

**修改 3.1 — M-1 增加即时性约束**

位置：第 29-37 行（M-1 段），替换为：

```markdown
### M-1：阶段入口即时创建条目

Agent 进入 `/feat` 工作流的任意阶段时，**MUST** 在该阶段的**第一个产出操作**时创建一条 todowrite 条目。

> "第一个产出操作"指第一条有意义的工具调用（如创建文件、写入产物）或第一条实质性内容输出（非格式性标题/问候）。准备性读取（如读取分析模板 `analysis-template.md`、读取现有规范文件）和 task.yaml 状态更新（`sw_task_phase_update`）不视为产出操作。

条目内容格式：`Phase N：[阶段名称] — [核心目标]`

示例：
- `Phase 1：需求分析 — 理解需求、识别约束、定义验收标准`
- `Phase 3：代码实现 — 编写 spec 文件并通过 lint/typecheck`

**MUST NOT** 延迟到 Human 提醒后才创建——此条目是 Phase 入口的第一优先级操作。
```

**修改 3.2 — S-1 关键节点表同步更新**

位置：第 98 行（"进入新 Phase" 行）

```markdown
<!-- 原文 -->
| 进入新 Phase | ✅ MUST |

<!-- 修改为 -->
| 进入新 Phase（入口即时） | ✅ MUST — 第一个产出操作时创建 |
```

**修改 3.3 — 更新版本号**

位置：frontmatter `version` 字段：`1.0.0` → `1.1.0`

---

### 文件 4：`specs/default/agent-reasoning.md`

**当前版本**：1.0.0 → **目标版本**：1.1.0

**修改 4.1 — 新增 MUST 子节"工具选择优先"**

位置：第 43 行之后（"### 委托决策"段之后），"### 委托后验证"之前（即插入一个新的 ### 子节）

```markdown
### 工具选择优先

在执行任何文件操作（创建目录、写入文件、修改文件）前，Agent **MUST** 先检查项目是否提供匹配的内置工具：

1. **优先检查 `sw_task_*` 系列**：所有以 `sw_task_` 为前缀的工具（如 `sw_task_create`、`sw_task_list`、`sw_task_read`、`sw_task_phase_update` 等），按工具名匹配使用场景
2. **检查 `task()` 委托工具**：`task()` 是委托机制本身而非"内置工具"，但在无专用内置工具时应作为降级选择
3. **存在匹配工具 → MUST 使用内置工具**，不得手工重复实现（如手动 `mkdir` + `write` 替代 `sw_task_create`）
4. **不存在匹配工具 → 按委托决策表判断是自己做还是委托子 Agent**

此规则是"委托优先"原则在工具选择层面的延伸：内置工具 = 最可靠的"委托目标"。
```

**修改 4.2 — 更新版本号**

位置：frontmatter `version` 字段：`1.0.0` → `1.1.0`

**修改 4.3 — 更新 summary**

位置：frontmatter `summary` 字段：追加"含工具选择优先——优先使用内置 sw_task_* 系列工具"

---

### 文件 5：`commands/feat.md`

**当前版本**：无版本字段 → 不适用

**修改 5.1 — 步骤 0 新增 session 重命名步骤**

位置：第 44 行之后（"Todo 上下文" 之后），"### 步骤 1：参数解析" 之前

```markdown
4. **Session 重命名**：将当前 OpenCode session 重命名为 `feat-<slug>-<YYYYMMDD>` 格式以提高辨识度。通过 `opencode db` 直接更新 session 表的 `title` 字段：
   ```bash
   opencode db "UPDATE session SET title = 'feat-<slug>-<YYYYMMDD>', time_updated = <unix_timestamp_ms> WHERE id = '<current_session_id>';"
   ```
   其中 `<current_session_id>` 从当前对话上下文中获取（如 `session_info` 工具或系统提供的 session ID）。
```

---

## 修改影响范围

| 文件 | 模板源路径 | 部署目标 | 影响 |
|------|-----------|---------|------|
| decision-record.md | `packages/installer/templates/specs/default/decision-record.md` | `.self-workflow/specs/default/decision-record.md` | 所有后续 /feat 工作流的 ADR 创建行为受影响 |
| feat-workflow.md | `packages/installer/templates/configs/guides/feat-workflow.md` | `.self-workflow/configs/guides/feat-workflow.md` | 所有后续 /feat 工作流的 Phase checklist 受影响 |
| todowrite-display.md | `packages/installer/templates/specs/default/todowrite-display.md` | `.self-workflow/specs/default/todowrite-display.md` | 所有后续会话的 todowrite 创建时机受影响 |
| agent-reasoning.md | `packages/installer/templates/specs/default/agent-reasoning.md` | `.self-workflow/specs/default/agent-reasoning.md` | 所有后续会话的工具选择行为受影响；插件注入后立即影响所有 Agent |
| feat.md | `packages/installer/templates/commands/feat.md` | `.opencode/commands/feat.md` | 所有后续 /feat 命令启动流程受影响 |
| *本任务自身* | — | — | Phase 3 修改模板源 → `init --force` 覆盖部署副本；本任务 Phase 4/5 将在新规范下运行 |

---

## 数据模型

无数据模型变更。本次修改仅涉及 Markdown 规范文件的文本措辞调整，不涉及数据结构定义。

---

## 实施顺序

独立修改（可并行）：
1. `decision-record.md` + `feat-workflow.md`（捆绑——决策规范与工作流检查清单需一致）
2. `todowrite-display.md`（独立）
3. `agent-reasoning.md`（独立）
4. `feat.md`（独立）

推荐顺序（考虑验证便利性）：
1. 先改 `decision-record.md` + `feat-workflow.md`（P1，捆绑）
2. 再改 `todowrite-display.md`（P1，独立）
3. 再改 `agent-reasoning.md`（P2，独立）
4. 最后改 `feat.md`（P2，独立，session 重命名通过 opencode db SQL UPDATE 实现，已验证可用）
5. 运行 `init --force` 一次同步所有变更

---

## 决策捕捉

- [x] ADR 已创建，见 adrs/ADR-001-builtin-tool-extend-vs-new.md（P2 工具选择优先——扩展 agent-reasoning vs 新建 spec 的决策）

---

## 实现方案文档

本次任务修改规范文本措辞和命令步骤，不涉及模块接口/数据流/架构变更，无需更新 `docs/实现方案/` 文档。该判断已在约束条件中声明。
