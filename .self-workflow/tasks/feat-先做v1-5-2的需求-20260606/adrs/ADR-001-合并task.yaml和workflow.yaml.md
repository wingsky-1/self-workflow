---
phase: adr
type: complex
workflow: feat
description: 合并 task.yaml 和 workflow.yaml 为单一元数据文件
---

# ADR-001：合并 task.yaml 和 workflow.yaml 为单一元数据文件

## 背景

当前每个工作流任务在 `.self-workflow/tasks/<workflow-id>/` 下维护两个元数据文件：

- **task.yaml**：任务标识（name/title/tags）、目录结构（structure）、里程碑（milestones）、交叉引用（cross-refs）
- **workflow.yaml**：工作流实例运行时状态（workflow-id/type/phases/gates/时间戳/errors）

遍历 4 个已完成任务后发现：

1. **4 个字段重叠**：`status`、`created`、`updated`、`description` 在两者中均存在，但格式不一致（task 用日期，workflow 用带时区的 datetime）
2. **status 双源风险**：两者独立维护 `status`，当前 4 个任务碰巧一致（均为 `completed`），但无任何同步机制
3. **1 个已存在文件有数据损坏**：`feat-实现feat命令-20260606/workflow.yaml` 第 57-70 行有重复的阶段条目

参见：`.self-workflow/tasks/feat-先做v1-5-2的需求-20260606/artifacts/01-analysis.md` F6 详细分析

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **合并为单一 task.yaml**：workflow.yaml 的 `phases`/`workflow-id`/`type`/`experience-draft` 迁入 task.yaml，删除 workflow.yaml | 单一真值源，无同步风险；Agent 只需读一个文件；仪表盘扫描效率提高 | 单个文件变大（~80行）；需修改 /feat 命令和 feat-workflow.md 的 Gate 逻辑；需重新设计 task.yaml schema |
| B | **保留双文件，声明权威关系**：两者都保留，task.yaml 的 status 为权威源，workflow.yaml 为镜像 | 非破坏性，向后兼容；现有任务无需迁移 | 仍存在"权威源未同步到镜像"的维护风险；Agent 仍需读两个文件 |
| C | **语义分离**：task.yaml.status = 任务长期状态（仪表盘用），workflow.yaml.status = 工作流实例运行态（可不同） | 概念清晰，各有其用 | 增加 Agent 认知负荷；需要回答"哪个状态更权威"仍无答案；维护两个 status 的成本 |

## 选择

**方案 A**：合并为单一 task.yaml

## 与阶段 1 分析结论的反转说明

阶段 1 需求分析（`01-analysis.md`）在"不纳入范围"中写道："❌ 合并 task.yaml 和 workflow.yaml 为一个文件（探索结论：两个文件生命周期不同，分开优于合并）"。当前决策选择了合并，反转理由如下：

1. **新证据**：分析后进一步发现了 `feat-实现feat命令-20260606/workflow.yaml` 的数据损坏（重复阶段条目），以及 `artifacts` 字段在 task.yaml 中重复出现的问题。这些实际损坏表明，双文件维护在实践中已经导致了数据质量退化，不仅仅是理论上的"双源风险"。

2. **生命周期差异被高估**：分析阶段认为"生命周期不同，分开优于合并"。但复盘后发现，task.yaml 的"静态"部分（name/title/tags/description）写一个工作流中只执行 1 次，workflow.yaml 的"动态"部分（phases）每阶段变更 1-2 次。两者合计约 15-20 次写入，集中在同一文件完全在可接受范围内。生命周期差异不足以支撑"必须分开"的结论。

3. **Human 方向确认**：阶段 2 入口的质疑节点中，用户明确选择了"合并为单一 task.yaml"方向，确认了此决策的优先级高于分析阶段的保留意见。

4. **精简优于冗余**：在 P0（阻断框架成熟度）原则下，消除冗余字段优于保留"可能有用"的双文件结构。宁可后续因实际需要再拆分（低概率），也比维持冗余结构（现实问题）好。

## 理由

1. **消除假性同步**：status 是工作流驱动的核心字段。方案 B 只声明权威关系但不能自动同步，方案 C 把两个"不同但相关"的状态分开更增加了混乱可能
2. **简化 Agent 上下文**：Agent 在执行工作流时只需读取和修改一个文件，减少 I/O 和认知切换
3. **文件大小可控**：合并后约 70-80 行（现有 task 30行 + workflow 50行），远低于任何文件大小阈值
4. **写入频率差异不是真问题**：task.yaml 的"静态部分"（name/title/tags）写一次后不变，"动态部分"（phases）按阶段推进写入——实际上就是 workflow.yaml 当前已有的写入频率，只是文件变了
5. **仪表盘性能提升**：`/feat`（无参数模式）当前需要读取两个文件来展示状态，合并后只需读一个

## 影响

**正面**：
- 消除 4 个字段的重复维护
- Agent 工作流执行更简单（单文件读写）
- 新任务创建更简洁（/feat 命令少一步写 workflow.yaml）

**负面**：
- 需修改 `/feat` 命令模板源（`packages/installer/templates/commands/feat.md`）→ 删除 workflow.yaml 创建步骤
- 需修改 `feat-workflow.md` 中所有 `workflow.yaml` 引用 → `task.yaml`
- 需重新设计 task.yaml schema（添加 phases 段）
- `workflow-metadata-template.yaml` 模板变为历史文件

**迁移策略**：
- 新任务从 2026-06-06 起使用新 schema
- 4 个已有 completed 任务不做迁移（保留为历史快照）
- 无 in_progress 任务的迁移需求

## 反对意见

1. **破坏性变更**：方案 B 的主要反对理由是"破坏性变更"——修改已有文件格式和 /feat 命令需要测试成本。回应：V1.5.3 已计划"新会话实测 /feat 完整流程"，能覆盖此变更的测试需求。且早合并比晚合并好——目前只有 4 个历史任务，再积累下去迁移成本会更高。

2. **混合环境仪表盘兼容性**：新旧 schema 共存时，`/feat`（无参数模式）需要兼容两种格式。回应：仪表盘先检查 task.yaml 是否有 `phases` 段，有则按新格式读取，无则回退到读取 workflow.yaml。此逻辑在 F7 的 feat.md 重写中一并实现。

3. **并发写入风险**：单文件在阶段频繁更新时存在并发读写冲突的可能。回应：当前工作流是单 Agent 串行执行，不存在真正的并发场景。如未来引入并行子 Agent，可在此 milestone 重新评估。

## 关联

- 关联 ADR：ADR-002（feat.md 重定位）——feat.md 结构变更会影响 task.yaml 创建步骤
- 关联需求：F6（task.yaml 与 workflow.yaml 关系澄清）
- 关联文件：`artifacts/02-design.md` 设计 2
