---
phase: 2
workflow: feat
description: 方案设计阶段产物——todowrite 可视化 spec 的架构决策、接口设计、数据模型
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — todowrite 可视化

> 工作流 ID：`feat-todowrite-可视化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T13:00:00+08:00

---

## 架构决策记录

### ADR-001：Spec 文件定位 — 独立 spec vs 嵌入已有 spec

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-001 |
| 状态 | 已选择 |
| 决策者 | Agent + Human |
| 日期 | 2026-06-07 |

**背景**

todowrite 使用规范需要沉淀为项目规范。现有 `specs/default/` 下已有 `agent-reasoning.md`（委托决策）和 `interaction-protocol.md`（交互模式）两份与 todowrite 相关的 spec。问题是：todowrite 规范应作为独立 spec 还是嵌入已有 spec。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **独立 spec**：新建 `specs/default/todowrite-display.md` | 职责单一，易检索（搜 todowrite 直接命中）；独立版本管理；不污染已有 spec 的 focus | default/ 下多一个文件，增加索引复杂度 |
| B | **嵌入 agent-reasoning**：在 agent-reasoning.md 中新增 todowrite 章节 | 减少 spec 文件数；todowrite 本质是 Agent 推理的延伸 | agent-reasoning 关注"如何决策"，todowrite 关注"如何展示"，职责混合降低可读性 |
| C | **分散嵌入**：触发时机→agent-reasoning，展示规则→interaction-protocol，粒度→新 spec | 每条规则放到语义最接近的 spec | 使用者（Agent）需要跨 3 个文件拼凑完整规则，增加遗漏风险 |

**选择**：方案 A — 独立 spec

**理由**
- 一致原则：项目已有 `doc-audience`、`decision-record` 等粒度相近的独立 spec，新增 `todowrite-display` 符合此模式
- 检索效率：Agent 搜 todowrite 关键词时，独立文件直接命中；嵌入方案需要全文搜索
- 关注点分离：todowrite 的行为规范（何时创建/更新/完成条目）自成体系，不应混入推理决策或交互协议

**后果**
- 正面：清晰的所有权边界，未来扩展（如 todowrite 条目内容格式、归档策略）不需改动其他 spec
- 负面：default/ 下的 spec 数量 +1，Agent 需要多加载一份文件的 frontmatter 摘要

**关联**
- 关联需求：P0"触发时机规则"、P0"展示粒度规范"
- 关联 ADR：ADR-002（条目粒度策略）、ADR-003（子 Agent 隔离）

---

### ADR-002：Todowrite 条目粒度 — 三级结构 vs 扁平列表

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-002 |
| 状态 | 已选择 |
| 决策者 | Agent + Human |
| 日期 | 2026-06-07 |

**背景**

Phase 1 分析指出 `todowrite` 条目的信息密度是核心设计问题。过粗（一条"做 Phase 1"）无意义，过细（每条工具调用）浪费 token。需要确定统一的粒度规则。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **阶段级**：每 Phase 一条条目 | 最少条目数，维护成本最低 | 信息量极低，"做 Phase 3" 对人类无帮助；Phase 3 可能持续 30 分钟无更新 |
| B | **操作级**：每次工具调用（read/write/edit/bash）一条条目 | 最细粒度，完全透明 | Token 浪费严重（100+ 条目/任务）；噪音淹没关键信息 |
| C | **混合粒度**：Phase 入口 + Gate 完成 + 子 Agent 委托（>30s）各一条 | 平衡信息量与维护成本，关键节点有标记 | 需 Agent 自行判断哪些操作值得创建条目，有一定主观性 |
| D | **三级嵌套**：Phase（粗）→ Gate/委托（中）→ 可选子条目（细） | 结构化，Human 可折叠查看 | todowrite 工具不支持嵌套，此方案依赖工具扩展 |

**选择**：方案 C — 混合粒度

**理由**
- 工具约束：todowrite 当前不支持嵌套（方案 D 依赖平台功能，不可控）
- 信息价值原则：条目应标记"流程转折点"——阶段开始、Gate 审查、子 Agent 委托——这些是 Human 最关心的进度里程碑
- 实践经验：V1.11 评审中"每步标记"被表扬，"无 todo 或批量标记"被批评——方案 C 的"关键节点标记"符合此质量标准
- 避免过度设计：方案 C 边界清晰（"涉及新阶段/新审查/新委托时创建"），Agent 不易误判

**后果**
- 正面：典型 `/feat` 工作流产生 15-25 条条目（5 阶段 × ~3-5 个关键节点），信息密度适中
- 负面：Agent 需持续判断"是否达到创建阈值"，增加运行时认知负担和疏漏风险。spec 需提供决策清单降低主观性。此外，规范本身不能消除所有跨文件引用——委托不轮询、总结对齐等规则仍分布在其他 spec 中

**补充决策清单**（规范编写参考）：

| 触发事件 | 创建条目？ | 说明 |
|---------|-----------|------|
| 进入新 Phase | ✅ MUST | 标记阶段开始 |
| Gate 审查启动 | ✅ MUST | 标记审查点 |
| 子 Agent 委托（>30s） | ✅ MUST | 标记等待状态 |
| 子 Agent 返回 | ✅ 更新状态 | 将 in_progress → completed |
| 子 Agent 失败 | ✅ 更新状态 | 标记 cancelled，content 注明原因 |
| 每次文件编辑 | ❌ | 过细，噪音 |
| 中间工具调用（read/grep） | ❌ | 属于子 Agent 内部操作 |
| 阶段内长时间卡顿（>10 分钟无进展） | SHOULD | 创建"阻塞中"条目说明原因 |
| Gate 内多轮修复 | MAY | 仅首次创建，后续不重复 |

**关联**
- 关联需求：P0"展示粒度规范"

---

### ADR-003：子 Agent todowrite 隔离策略

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-003 |
| 状态 | 已选择 |
| 决策者 | Agent + Human |
| 日期 | 2026-06-07 |

**背景**

OpenCode 平台中每个 Agent 拥有独立的 todowrite 空间（子 Agent 的 todowrite 不会影响主 Agent）。问题是：spec 应如何规定子 Agent 的 todowrite 使用行为，以及主 Agent 如何通过 todowrite 反映子 Agent 的进度。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **禁止子 Agent 使用**：spec 中 MUST NOT 条款禁止子 Agent 创建 todowrite 条目 | 主 Agent 的 todowrite 完全可控，无混淆风险 | 过度限制——子 Agent 自身也需要进度追踪；与平台能力矛盾 |
| B | **子 Agent 自由使用**：spec 不干涉子 Agent 的 todowrite 行为 | 尊重平台隔离机制，减少规范约束 | 子 Agent 的条目格式可能不一致；主 Agent 无法利用子 Agent 的条目 |
| C | **主 Agent 标记委托**：spec 仅约束主 Agent——委托子 Agent 时创建条目（in_progress），返回后更新（completed）；子 Agent 的 todowrite 行为不受本 spec 约束 | 职责清晰：主 Agent 追踪"我委托了什么"，子 Agent 追踪"我做了什么"；平台隔离已保证不冲突 | 主 Agent 不知道子 Agent 的中间进度（但这正是 agent-reasoning 的设计意图） |

**选择**：方案 C — 主 Agent 标记委托

**理由**
- 与 agent-reasoning 一致："委托后等结果即可，不需要中间状态更新"——方案 C 的主 Agent 条目不轮询子 Agent 进度，仅在委托/返回两个时点更新
- 平台事实：子 Agent 的 todowrite 空间独立，主 Agent 即使想轮询也无法读取——方案 C 承认这一事实
- Human 可见性：主 Agent 的 todowrite 中"正在等 Review Agent 返回"比空白更能让 Human 理解当前状态
- Human 确认：用户明确指出"子Agent有自己的todo 不会影响主Agent"

**后果**
- 正面：主 Agent 的 todowrite 始终反映"我当前的状态"，无子 Agent 干扰
- 负面：子 Agent 的 todowrite 行为无规范约束，可能出现不一致（留待 V2.x 子 Agent 架构时统一）。Human 无法通过主 Agent 的条目了解子 Agent 内部进度，长等待场景可能产生焦虑
- 注：子 Agent 失败时，主 Agent 将条目标记为 `cancelled` 并在 content 中注明原因（如"Review Agent 超时未返回"）

**关联**
- 关联需求：P1"子 Agent 协调中的 todowrite"
- 关联规范：`agent-reasoning.md`（委托后不轮询）

---

## 接口设计

### Spec 文件接口：`specs/default/todowrite-display.md`

本任务的唯一交付物是一个 spec 文件，其"接口"即 spec 的 frontmatter 和章节结构。

**Frontmatter 结构**（遵循 `specs/README.md` 格式）：

```yaml
---
title: "Todowrite 可视化规范"
type: spec
level: default
tags: [todowrite, visualization, progress-tracking, agent-display]
version: 1.0.0
summary: "定义 Agent 何时及如何使用 OpenCode todowrite 工具展示执行进度——触发时机、条目粒度、与 task.yaml/todo.md 的职责划分。"
---
```

**章节结构**：

```
# Todowrite 可视化规范

## 核心原则
- 三层区分（todo.md / task.yaml / todowrite）
- Todowrite = 当前 Agent 的待办，会话内实时追踪

## MUST（必须遵守）
1. 阶段入口：进入 Phase N 时创建一条条目
2. Gate 完成：Gate 通过后更新条目状态
3. 子 Agent 委托：委托 >30s 子任务时创建条目，返回后更新
4. 总结对齐：interaction-protocol 的"总结先行"与 todowrite 状态一致
5. 不混淆 todo.md：todowrite 不修改 todo.md 内容

## SHOULD（建议遵守）
1. 条目粒度：仅在流程转折点创建（非每次工具调用）
2. 条目质量：标题含阶段/任务名称和核心目标（≥10 字）
3. 引用格式：涉及 todo.md 项时以 [<描述>] 引用

## MAY（可选）
1. 跨会话重建：新会话中可基于 task.yaml 重建 todowrite
2. 批量更新：Gate 通过后可批量完成多条子条目
```

**与现有组件的交互**：

```
todowrite-display spec
  │
  ├─→ agent-reasoning spec（委托决策引用"不轮询"约束）
  ├─→ interaction-protocol spec（"总结先行"引用 todowrite 对齐规则）
  ├─→ decision-record spec（如果产生 ADR，需引用此 spec）
  └─→ task.yaml phases（todowrite 条目状态不得与 phases 冲突）
```

---

## 数据模型

### Todowrite 条目结构（OpenCode 内置，不可修改）

```typescript
// 每条 todowrite 条目有 3 个字段：
//   content: string           — 显示文本
//   status: "pending" | "in_progress" | "completed" | "cancelled"
//   priority: "high" | "medium" | "low"
```

### Spec 中的条目内容约定

本 spec 不修改 todowrite 工具的数据结构，但约束 `content` 字段的内容格式：

```
条目内容 = [阶段/任务名称] — [核心目标]
```

示例：
- `Phase 2：设计 todowrite 使用模式 — 含触发条件、粒度、职责划分`
- `调用 Review Agent 审查设计文档 — 等待返回中`
- `Gate 2 审查：修复方向审查指出的 3 个问题`
- `[todowrite 使用模式设计] — 编写 spec 文件`

### 优先级使用约定

| 优先级 | 使用场景 |
|--------|---------|
| `high` | 当前正在进行的唯一条目（in_progress 状态的条目设 high） |
| `medium` | 已完成的阶段条目（completed） |
| `low` | 待开始的阶段条目（pending）、可选/增强条目 |

### 与其他数据模型的关系

| 本 spec 的数据 | 对应关系 | 对应数据 |
|---------------|---------|---------|
| todowrite 条目 "Phase N" | 1:1 映射 | `task.yaml` → `phases[N-1].name` |
| todowrite 条目状态 completed | 应一致 | `task.yaml` → `phases[N-1].status` |
| todowrite 条目 `[<描述>]` | 引用 | `todo.md` → 对应项的 `描述` |
| todowrite 条目"调用 X Agent" | 1:1 | `task()` 委托调用 |

---

## 适用范围与迁移策略

### 适用范围

本 spec 位于 `specs/default/` 下，**始终生效**于所有 Agent 会话。但规则强度按场景分级：

| 场景 | 约束强度 | 说明 |
|------|---------|------|
| `/feat` 工作流（新启动） | **MUST 全部适用** | 所有 MUST/SHOULD 规则生效 |
| 普通对话（非 /feat） | **SHOULD 参考** | MUST-1/2（Phase 入口/Gate 标记）不适用，但 SHOULD-1（粒度）、SHOULD-3（引用格式）建议遵循 |
| 已进行中的 /feat 任务 | **MAY 从当前阶段起** | 不追回创建已过阶段的条目；从当前 Phase 起遵循 MUST 规则。如本任务从 Phase 3 起使用 todowrite |

### AC-5 降级说明

Phase 1 验收标准 AC-5 定义 `[<todo项描述>]` 引用格式为验收要求（隐式 MUST）。Phase 2 设计将其降级为 SHOULD-3。理由：引用格式的精确性对功能完整性不是必要条件——即使条目未使用 `[ ]` 格式，只要语义上关联了 todo.md 项，就达到了"防止混淆"的核心目标。格式是推荐做法，不是强制标准。

---

## 决策捕捉

- [x] **ADR 已创建**，见：
  - `adrs/ADR-001-spec文件定位.md`
  - `adrs/ADR-002-条目粒度策略.md`
  - `adrs/ADR-003-子Agent隔离.md`
