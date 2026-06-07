---
phase: 1
workflow: feat
description: 需求分析阶段产物模板
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.19：/feat 流程修补 + todo 整理

> 工作流 ID：`feat-feat流程修补-todo整理-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T16:51:00+08:00

---

## 需求概述

V1.19 是 P1/P2 级别的流程修补版本，聚焦 `/feat` 工作流的两个薄弱环节：

1. **实现与文档脱节**：Agent 完成 Phase 4（功能验证）通过 Gate 后直接进入 Phase 5（总结沉淀），缺少一个强制更新相关文档的步骤。导致功能已实现但 `docs/`、`specs/`、`configs/` 中的文档停留在旧版本——下一次开发时 Agent 读到的还是过时文档。

2. **todo.md 上下文污染**：`.self-workflow/todo.md` 已积累 330 行，其中 12+ 个已关闭版本段占据大量篇幅。每次 session 启动时插件注入 todo 上下文，这些已关闭的内容白白浪费 token。

此外还包含一个 P1 级别 bug 修复：`sw_task_phase_update` 工具调用时 checkpoint 未写入、YAML 重复字段问题（关联 3 个受影响任务文件），以及一个流程强化项：/feat 任务完成后强制更新 todo.md 状态。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P1 | Phase 4→5 增加相关文档同步步骤 | 在 feat-workflow.md 的 Gate 4 通过和 Phase 5 入口之间，插入独立的"相关文档同步"步骤，强制 Agent 扫描 `docs/`、`specs/`、`configs/` 中受影响的文档并逐类输出更新决策 | 来源：todo #1（范围扩大：从仅 实现方案/ → 全部相关文档） |
| P1 | /feat 强制更新 todo | 将 feat-workflow.md Compound 步骤 5 从"自动执行"改为 MUST 级别：Agent 在 /feat 任务完成后必须更新 todo.md 中的对应版本项状态 | 来源：todo #4 |
| P1 | Bug 修复：checkpoint 未记录 + yaml 重复字段 | 修改 `self-workflow-session.ts` 的 `updatePhase` 函数：gate=passed 时创建 git tag + 写入 checkpoint SHA；修复文本替换导致重复 `started:` 的 bug | 来源：todo #5 |
| P2 | todo 已关闭版本迁移至 done.md | 将 `.self-workflow/todo.md` 的 `## 已关闭` 章节（12+ 折叠块）迁移到独立的 `done.md` 文件，减少注入时的上下文污染 | 来源：todo #2 |
| P2 | ~~auto-slash-command 重复调用修复~~ | 已确认属于 OpenCode 上游问题，非本框架引入。移除出 V1.19 范围 | 新发现→已排除 |

---

## 需求背景分析

### Phase 4→5 相关文档同步步骤：现有检查点为何不足

feat-workflow.md v0.4 已经在 3 个位置涉及文档检查：

1. **Phase 3 完成检查清单**：「本次修改是否影响已有实现方案文档？如是，按 `specs/default/implementation-documentation.md` 同步更新」——范围仅限于实现方案文档，且 Agent 在 Phase 3 结束时才检查，可能尚未全面评估影响范围。
2. **Phase 5 完成检查清单**：「确认本次任务引入/修改的关键特性已在 `docs/实现方案/` 中创建或同步更新」——范围同样仅限于实现方案文档，且是 checklist 项目而非强制执行步骤。
3. **Compound 步骤 4.5**：「实现方案文档决策审计」——事后兜底审计，仅扫描是否存在决策输出，不强制要求文档更新。

**核心问题**：三者范围均限于 `docs/实现方案/`，而实际开发中 `docs/参考模式/`、`docs/实施经验/`、`specs/`、`configs/` 等都可能需要同步更新。且三者均为 checklist 或审计项，没有一个位于 Gate 4 通过后的**强制执行位置**。新增步骤定位在 Phase 4 通过后、Phase 5 入口前——利用 Phase 4 验证阶段刚完成、代码变更记忆新鲜的时间窗口，扫描全部文档分类并逐类输出更新决策，作为进入总结阶段的**前置动作**（non-blocking 但显式要求决策输出）。

**与 Compound 4.5 的职责区分**：新步骤是**前置强制检查**（Phase 5 入口前执行，全文档分类扫描+显式决策输出），Compound 4.5 是**事后兜底审计**（任务全部完成后扫描，仅检查 Agent 是否做了决策——无论决策是 updated/skipped/none）。两者互补，不可相互替代。

---

## 约束条件

### 技术约束

- 所有修改必须先改安装器模板源（`packages/installer/templates/`），再运行 `node packages/installer/index.js init --target . --force` 同步到 `.self-workflow/`
- `checkpoint` 修复需要 `sw_task_phase_update` 工具中集成 `child_process.execSync` 执行 git 命令
- `done.md` 需要同步更新 README.md 中 todo 相关的引用（如有）
- **auto-slash-command 重复调用**属于 OpenCode 上游问题，非本框架引入。不纳入本次修复范围（框架不受控于上游行为）。如需防御性保护可在后续版本评估

### 业务约束

- Phase 4→5 文档更新步骤不能阻断工作流（应为 non-blocking check，失败时记录到 errors.yaml 而非阻止推进）
- 迁移到 `done.md` 后，`todo.md` 的 `## 已关闭` 章节改为引用链接（如 `详见 [done.md](done.md)`）而非完全删除（保留审计线索）
- YAML 修复方案需向后兼容：已存在重复字段的任务文件应被修复（或至少在 feat-workflow Compound 中增加检测逻辑）
- 项目规范 `.self-workflow/specs/default/` 中可能涉及本版本变更的规范（如 `implementation-documentation.md`）需评估是否需要同步更新

---

## 验收标准

### 功能验收

- [ ] **AC1（Phase 4→5 相关文档同步）**：Given 一个 /feat 工作流已经完成 Phase 4 功能验证并通过 Gate 4，When Agent 进入 Phase 5 之前，Then Agent 必须扫描本次变更涉及的所有文档（`docs/` 下各分类、`specs/`、`configs/`），评估哪些需要同步更新，并在 `05-summary.md` 的「相关文档同步」节中逐类输出决策——格式 `doc-sync: <分类> → updated | skipped（理由）`
- [ ] **AC2（/feat 强制更新 todo）**：Given 一个 /feat 工作流完成所有阶段和 Compound 步骤，When Agent 执行 Compound 的 todo 更新步骤，Then Agent 必须更新 todo.md 中对应版本的项状态（标记 [done]），不可跳过或仅记录"建议更新"
- [ ] **AC3（checkpoint 写入）**：Given 调用 `sw_task_phase_update(workflowId, phaseId, status, gate="passed", checkpoint="<sha>")`（checkpoint 由 Agent 先执行 `git tag` + `git rev-parse` 获取后外部传入），When gate 为 "passed" 且 checkpoint 非空，Then 工具将 checkpoint SHA 写入 task.yaml 对应 phase 的 `checkpoint` 字段；When gate 为 "passed" 但 checkpoint 未传入，Then 工具返回 warning 提示 Agent 可能遗漏
- [ ] **AC4（YAML 重复字段修复—幂等保护）**：Given 调用 `sw_task_phase_update` 对已在 in_progress 状态的 phase 再次调用（重入），When 工具执行 `started:` 更新逻辑，Then 不会创建重复的 `started:` 键——通过增加幂等保护实现（检测 `started:` 是否已有非 null 值，有则跳过插入）
- [ ] **AC4b（历史文件修复）**：Given 3 个受重复 `started:` 影响的 task.yaml 文件（feat-核心特性-实现方案-文档化-20260607, feat-经验治理-优化执行-20260607, feat-经验治理-合并引用-20260607），When 执行修复，Then (1) 每个 phase 删重复行，保留含时间戳的 `started:` 值（如有），删除 `started: null` 版本；(2) 修复后每个 phase 通过 `grep -c 'started:'` 验证仅有 1 个 `started:` 字段
- [ ] **AC5（todo → done.md 迁移）**：Given `.self-workflow/todo.md` 包含 `## 已关闭` 章节，When 迁移完成，Then `todo.md` 的 `## 已关闭` 替换为引用链接 `详见 [done.md](done.md)`，所有已关闭版本段完整迁移到 `done.md`，格式不变
- [ ] ~~**AC6（auto-slash-command 责任边界）**~~ — 已移除：确认为 OpenCode 上游问题，非本框架引入（见约束条件）

### 质量要求

- [ ] 安装器同步后 `feat-workflow.md` 的 v0.4→v0.5 版本号更新
- [ ] `self-workflow-session.ts` 的改动通过 lint + typecheck
- [ ] 所有受影响文件（`feat-workflow.md`, `feat.md`, `self-workflow-session.ts`）的安装器模板源和运行时副本一致
- [ ] 受 yaml 重复字段影响的 3 个 task.yaml 文件一并修复（feat-核心特性-实现方案-文档化-20260607, feat-经验治理-优化执行-20260607, feat-经验治理-合并引用-20260607）

---

## 不纳入范围

- **Phase 3 文档编辑类任务产物规则**：已在 todo.md 标记 [wontfix]，拒绝理由为"建议拆分 doc 工作流，非当前版本范围"。过渡方案：在 feat-workflow.md Phase 3 产物说明中增加"纯文档编辑任务允许 03-implementation.md 写入 `N/A: 纯文档编辑任务`"的容错说明，降低 Agent 误解风险（不改变工作流结构，仅增加提示文本）
- **完整的 YAML 结构化替换重构**：将 `updatePhase` 从文本替换改为 `parseYaml`/`stringifyYaml` 是更彻底的修复，但风险高于本次 P1 修复所需。本次仅修复已知的重复 `started:` bug + 添加 checkpoint 支持。完整重构延后至子Agent架构版本
- **done.md 自动归档到 Git**：仅处理文件迁移和注入机制，不涉及 Git hooks 或自动化归档策略

---

## 决策捕捉

- [x] **ADR 已创建**：Phase 4→5 文档同步步骤插入 + Compound 步骤 5 MUST 升级 → 见 `adrs/ADR-001-phase4to5-文档同步-强制todo.md`
