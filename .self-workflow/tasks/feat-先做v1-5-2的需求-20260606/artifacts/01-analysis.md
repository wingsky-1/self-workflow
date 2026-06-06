# 需求分析 — V1.5.2 Todo 体系优化

> 工作流 ID：`feat-先做v1-5-2的需求-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T18:24:47+08:00

---

## 需求概述

V1.5.2 是 P1 级（质量改善）迭代，目标是**优化 todo 体系和元数据文件的定位**，消除当前存在的冗余和模糊性。核心需求来自 `docs/todo.md` 中的 4 项待办（#4-#7），涉及三个维度：

1. **Todo 格式**：todo.md 的优先级/版本标记规范化和归档机制完善
2. **元数据关系**：task.yaml 和 workflow.yaml 的职责边界澄清
3. **文档关系**：/feat 命令和 feat-workflow 指引的角色澄清

> 来源：`docs/todo.md` V1.5.2 章节，#4-#7；历史 todo #2, #15, #16, #19

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P1 | F4: todo.md 优先级/版本标记规范化 | 将已存在的 P0/P1/P2 标签和 V1.x 版本标题从"文本约定"升级为可被 Agent 解析的结构化机制 | 当前已有使用但无正式定义文件 |
| P1 | F5: 已完成/已拒绝项归档机制 | 补充 `<wontfix>` 的实际使用支持，标准化"已关闭"区域的折叠分组规则 | 当前 `<done>` 可用，`<wontfix>` 已声明但从未使用 |
| P1 | F6: task.yaml 与 workflow.yaml 关系澄清 | 明确两个文件的职责边界，消除 4 个重叠字段（status/created/updated/description）的歧义 | 存在潜在数据不一致风险 |
| P1 | F7: /feat 命令与 feat-workflow 关系澄清 | 显式记录两个文件的角色定位（启动 vs 执行），减少读者困惑 | 已有关系说明存在于 `feat-command-需求设计.md` 决策 3 中，但缺乏独立可发现性 |

### 功能点详细说明

#### F4: todo.md 优先级/版本标记规范化

**发现**：`docs/todo.md` 第 3 行已定义 `P0=阻断框架成熟度 / P1=质量改善 / P2=愿景`，且每项均标注 `<P0>` 等。版本以 `## V1.x` 二级标题分组。但这一切都是**纯文本约定**——Agent 没有结构化的方式读取和关联这些标记。最坏情况下，Agent 会将它们视为普通 Markdown，不做任何优先级排序或版本关联。

**需要产出**：
- 一份正式约定文档（spec 或 config），定义 todo.md 的优先级和版本标记格式
- 或者将标记机制融入 feat-workflow.md 的 Agent 指引中

#### F5: 已完成/已拒绝项归档机制

**发现**：`docs/todo.md` 第 71-92 行使用 `<details><summary>` 折叠完成项，效果良好。`<done>` 标记已在用，`<wontfix>` 在第 4 行已声明但**实际未使用**。

**需要产出**：
- `<wontfix>` 的实际使用规则（何时标记、如何标记）
- 归档分组的命名/版本约定标准化（当前靠人工维护，无规则约束）

#### F6: task.yaml 与 workflow.yaml 关系澄清

**发现**（遍历全部 4 个已存在任务目录）：

| 字段 | task.yaml | workflow.yaml | 风险 |
|------|-----------|---------------|------|
| `status` | 有（date: `2026-06-06`） | 有（datetime: `2026-06-06T17:22:00+08:00`） | 🔴 双源真值，可能不同步 |
| `created` | 有 | 有（格式不同） | 🟡 格式不统一 |
| `updated` | 有 | 有（格式不同） | 🟡 格式不统一 |
| `description` | 完整长描述 | 简短摘要 | 🟡 内容重叠但详略不同 |

**独有字段**：
- task.yaml: `name`, `title`, `tags`, `structure`, `milestones`, `cross-refs`
- workflow.yaml: `workflow-id`, `type`, `phases`（含阶段时间戳/gate/errors），`experience-draft`

**额外发现**：
- `feat-实现feat命令-20260606/workflow.yaml` 存在**数据损坏**：第 57-70 行有重复的阶段 4/5 条目（与上方正确数据冲突）
- `20260606-V1实现/` 无 workflow.yaml（工作流系统建立前的遗留任务，预期之内）

**需要产出**：
- 一份明确两个文件职责边界的文档
- 消除 `status` 重复的方案（建议只保留在 task.yaml，workflow.yaml 的阶段汇总可推导整体状态）

#### F7: /feat 命令与 feat-workflow 关系澄清

**发现**：

| 文件 | 角色 | 行数 |
|------|------|------|
| `.opencode/commands/feat.md` | 工作流启动（bootstrap） | 196 |
| `.self-workflow/configs/guides/feat-workflow.md` | 工作流执行（execute phases 1-5） | 600 |

**两者的关系是明确的——命令负责启动，指引负责执行**——但这一关系**未在任何地方显式陈述**。具体表现：
- feat.md 末尾引用了 feat-workflow.md
- feat-workflow.md **未反向引用** feat.md
- `feat-command-需求设计.md` 决策 3 中有此关系的说明，但它不是可被 Agent 日常发现的参考文档

**两者存在 3 个重叠区域**（非矛盾，但增加认知负荷）：
1. 目录结构在两者都展示（feat.md 基础版，feat-workflow.md 详细版）
2. workflow.yaml 处理在两者都描述（feat.md 写入规范，feat-workflow.md 生命周期规则）
3. 阶段 1 在两者都涉及（feat.md 触发入口，feat-workflow.md 完整执行）

**需要产出**：
- 在两个文件的开头/结尾添加显式的角色声明和交叉引用
- 或者创建独立的参考文档说明两者关系

---

## 约束条件

### 技术约束

1. **自举约束**：本项目是自举开发，修改 `.opencode/` 需要通过安装器（`packages/installer/templates/`）→ `node packages/installer/index.js init --target . --force`。但 `docs/` 和 `.self-workflow/docs/` 可直接修改。
2. **YAML 兼容性**：task.yaml 和 workflow.yaml 修改需要与现有的 feat-workflow.md 解析逻辑兼容。
3. **反向兼容**：`feat-workflow.md` 作为 Agent 执行指引，修改后需要确保现有的 Gate 逻辑不中断。
4. **Markdown 可解析性**：todo.md 的标记机制应保持人类可读性优先，机器可解析性为辅助目标。

### 业务约束

1. **质量改善（P1）不是阻断性需求**：V1.5.2 不涉及框架成熟度的 P0 级问题，改动应小步、安全。
2. **文档修改优先于代码修改**：F6/F7 是纯文档澄清任务，F4/F5 是格式约定任务，均不涉及运行时代码。

### 依赖关系

- V1.5.2 **不依赖** V1.5.1（两者是平级迭代）
- V1.5.2 的 F6/F7 澄清完成后，可能对 V1.5.3 的"新会话实测 /feat 完整流程"有积极影响（减少 Agent 困惑）

---

## 验收标准

### 功能验收

#### F4: todo.md 优先级/版本标记

- [ ] Given 一个 Agent 读取 `docs/todo.md`，When 它看到 `## V1.5.2：Todo 体系优化（P1）`，Then 它能识别"V1.5.2"是版本标记、"P1"是优先级
- [ ] Given `docs/todo.md` 已修改，When 程序员或 Agent 添加新条目，Then 有明确规则告知应使用哪个优先级标签（P0/P1/P2）和版本标题格式
- [ ] Given 优先级/版本标记存在，When 安装器运行时，Then 安装器不需要任何修改（标记是文档约定，不是安装器管理的文件格式）

#### F5: 已完成/已拒绝项归档机制

- [ ] Given 一个已完成任务，When 它被移入"已关闭"区域，Then 有标准化规则说明使用哪个折叠组名、`[done]` 或 `<wontfix>` 标记、完成证据格式
- [ ] Given 一个被拒绝的任务，When 它被标注 `<wontfix>`，Then 有规则说明拒绝理由的书写格式和位置
- [ ] Given 任一归档条目，When 回溯时，Then 能通过日期标签追溯到完成或拒绝的工作流实例

#### F6: task.yaml 与 workflow.yaml 关系澄清

- [ ] Given 一个 Agent 读取了两个文件，When 它需要判断某个字段该写到哪里，Then 有明确文档说明 task.yaml 负责"长期任务元数据"、workflow.yaml 负责"运行态阶段追踪"
- [ ] Given `status` 字段，When 它出现在 task.yaml，Then 它是任务整体状态的权威源（workflow.yaml 不应独立维护 status）
- [ ] Given `description` 字段，When 它出现在两者中，Then workflow.yaml 的描述应为 task.yaml 的子集或引用，非独立副本

#### F7: /feat 命令与 feat-workflow 关系澄清

- [ ] Given 一个 Agent 首次遇到 `/feat`，When 它加载 feat.md，Then feat.md 开头显式声明"本命令仅负责工作流启动初始化，后续执行由 feat-workflow.md 指引"
- [ ] Given 一个 Agent 正在执行 feat-workflow.md，When 它查看该文件，Then 文件开头显式说明"本指引由 `/feat` 命令触发加载"
- [ ] Given 两者有内容重叠（目录结构、workflow.yaml 处理），When 发生变更时，Then 有规则说明哪个是权威源（feat-workflow.md 为权威源，feat.md 为简化引用）

### 质量要求

- [ ] 所有修改都能通过安装器同步验证（如有涉及模板文件的修改）
- [ ] 修改后的 `feat-workflow.md` 不引入新的 Agent 行为矛盾
- [ ] 修改后的 `docs/todo.md` 归档规则对现有条目反向兼容

---

## 不纳入范围

- ❌ 修改 `feat-workflow.md` 的 5 阶段 + 4 Gate 执行逻辑（那是 V1.5.3 实测验证的范畴）
- ❌ 实现自动归档脚本（V1.5.2 只定义约定，不自制工具）
- ❌ 合并 task.yaml 和 workflow.yaml 为一个文件（探索结论：两个文件生命周期不同，分开优于合并）
- ❌ 修改安装器代码或模板（除非澄清类修改明确涉及模板文件）
- ❌ 修改 `.opencode/commands/feat.md` 的步骤逻辑（只做角色声明和交叉引用，不改执行流程）
- ❌ 新建 `.self-workflow/specs/` 下的 todo 系统规范文件（定义约定不必须等于创建 spec 文件；具体方案在阶段 2 决定）

---

## 决策捕捉

本阶段无需要独立的 ADR 记录的架构决策。以下两个关键判断将在阶段 2（方案设计）中进一步评估：

1. **F6 的 `status` 去重方案**：是"仅在 task.yaml 中保留"还是"workflow.yaml 从阶段状态派生"。两个方案各有 trade-off，将在方案设计中对比。
2. **F4/F5 的约定定义载体**：是独立创建一个 `specs/todo-convention.md`，还是将约定写入 `feat-workflow.md` 附录，还是融入 `AGENTS.md`。涉及可发现性 vs 维护成本的权衡。
