---
phase: 5
workflow: feat
description: V1.22 Phase 5 总结沉淀 — 得与失 + 经验治理 + ADR 晋升 + 文档同步
validation:
  required-fields:
    - "总结"
    - "经验治理"
    - "文档同步"
  required-format:
    "经验治理": "审查报告"
---

# 总结沉淀 — V1.22：文档/工具规范修补（P1/P2）

> 工作流 ID：`feat-文档工具规范修补-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T22:20:00+08:00

---

## 相关文档同步（Phase 4.5）

> 变更范围：`git diff --name-only feat-文档工具规范修补-20260607-ph1-analysis-gate-passed..HEAD`

| 分类 | 决策 | 理由 |
|------|------|------|
| `docs/` | skipped | 本次任务未创建或修改经验文档；spec 修改不触发 docs/ 同步 |
| `specs/` | updated | 3 个 spec 文件已通过 `init --force` 同步到部署副本 |
| `configs/` | updated | feat-workflow.md 已通过 `init --force` 同步到部署副本 |
| `实现方案/` | skipped | 无模块接口/数据流/架构变更，无需更新实现方案文档 |
| `opencode/` | updated | feat.md 命令 + self-workflow-session.ts 插件已通过 `init --force` 同步 |

---

## 总结

### 得

1. **session 重命名方案研究充分**：未止步于表面的 `opencode db` SQL hack，而是深入 Plugin SDK 和 REST API，找到了官方推荐的 `client.session.update()` 方案。设计了 `sw_session_rename` 工具解决"命令触发时 slug 未知"的时序问题——Agent 可在 slug 生成后的任意时机调用。

2. **Gate 审查发现关键矛盾**：Gate 2 方向审查 + 对抗性审查发现了"不得内联 ADR"与 `design-template.md` required-fields 的矛盾，在设计阶段修复而非编码阶段返工。

3. **所有 AC 一条过**：12 条验收标准全部一次性通过，无返工修复。修改范围虽跨 5 个 Markdown + 1 个 TypeScript 文件，但每个修改都是精准的文本级变更。

4. **修改→验证闭环完整**：SHA256 文件一致性验证 + init --force 无报错 + AC 逐条对照，验证链完整。

### 失

1. **Phase 1 分析文档的"不纳入范围"预先排除了方案 B**（不新建 spec 文件），导致 Phase 2 的 ADR-001 表面是二选一，实则已被前置决策——审查 Agent 指出了此推理链不连续的问题。以后应避免在 Phase 1 中预设 Phase 2 的设计决策。

2. **task.yaml 状态同步延迟**：`sw_task_phase_update` 工具返回了 `updated: true` 但文件实际未写入——不得不手动 edit。这是工具 bug，已知 todo.md 记录了此问题（"sw_task_phase_update gate=passed 无 checkpoint 时 warning 未写入 errors.yaml"）。

3. **子 Agent 审查的上下文盲区**：Review Agent 无法看到主 Agent 的对话上下文，导致 behavior 维度误判（如"Gate 前置检查未执行"——实际已执行但在对话中而非文件中）。

### 经验

**task 级（本任务）**：
- 规范修改任务看起来简单，但涉及的模块多（5+1 文件），必须有精确的设计文档指导每个文件的修改位置和内容
- Gate 审查对"跨阶段推理链一致性"的检查揭示了 Phase 1 前置决策的问题——值得在以后的 Phase 1 分析中引入"决策声明"而非"决策预设"

**doc 级（跨任务可复用）**：
- 见下方经验治理结果

---

## 经验治理

<!-- 由 exp-governance skill 审查后填充 -->

**审查结果摘要**：31 份文档，0 critical / 4 warning / 1 info。

| 维度 | 发现 |
|------|------|
| 一致性 | 30 份标准文档 frontmatter 全部完整；迭代报告缺 `quality` 字段（warning） |
| 去重 | 无实质性重复——4 对疑似重复均已由"关联经验"段明确区分职责边界 |
| 质量分布 | verified: 22, draft: 8, 缺失: 1 |
| 晋升建议 | 8 份 `实现方案/` 文档 draft → verified（内容与源码一致、被广泛引用、经此轮治理审查） |
| V1.22 关联 | 无冲突；`todowrite-display` 和 `session-rename` 是经验空白点 |

**详细报告**：见 exp-governance skill 完整输出。

---

## ADR 晋升检查

| ADR | 路径 | 晋升评估 |
|-----|------|---------|
| ADR-001 | `adrs/ADR-001-内置工具优先-扩展agent-reasoning.md` | **不建议晋升**：属于项目内部文件组织决策（扩展现有 spec vs 新建），非跨任务通用决策，影响范围仅限于本项目。未来 V2.0 如扩展工具选择规则，可重新评估。 |

---

## 决策捕捉

- [x] ADR-001 已在 Phase 2 创建（`adrs/ADR-001-内置工具优先-扩展agent-reasoning.md`）
- [x] ADR 晋升检查已完成，结论：不建议晋升
