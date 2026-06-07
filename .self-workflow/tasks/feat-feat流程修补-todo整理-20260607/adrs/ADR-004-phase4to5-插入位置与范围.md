# ADR-004：Phase 4→5 文档同步步骤 — 插入位置与范围

## 背景

Phase 4 Gate 通过和 Phase 5 入口之间需插入文档同步步骤。Phase 1 分析发现现有 3 个文档检查点（Phase 3 checklist、Phase 5 checklist、Compound 4.5 审计）均非强制执行步骤，且范围仅限于 `docs/实现方案/`。Human 指定范围扩大为「所有相关文档」。

## 决策

在 feat-workflow.md 第 509 行（Gate 4 通过条件）和第 513 行（Phase 5 入口）之间插入「阶段 4.5：相关文档同步」章节。

执行逻辑：Agent 用 `git diff --name-only <tag>..HEAD` 获取变更文件 → 映射到对应文档分类（`docs/`、`specs/`、`configs/`）→ 逐类判断是否需要更新 → 输出 `doc-sync` 决策到 `05-summary.md`。

Non-blocking：即使全部判断为 `skipped` 也可进入 Phase 5，但必须输出决策记录。

## 理由

1. Human 明确反馈「不仅仅是实现方案文档，而是可能相关的文档都应该更新」
2. Non-blocking 机制保证文档同步不阻断工作流——Agent 可快速判断 `skipped` 并附理由
3. Agent 通过 Gate 4 时刚完成代码变更，git diff 可精准确定变更范围
4. 与 Compound 4.5 的关系为「前置强制检查（Phase 4.5）+ 事后兜底审计（Compound 4.5）」互补

## 职责区分（Phase 4.5 vs Compound 4.5）

| 维度 | 阶段 4.5（新增） | Compound 4.5（现有） |
|------|-----------------|---------------------|
| 时机 | Gate 4 通过后、Phase 5 入口前 | 任务全部完成后 |
| 性质 | 前置强制检查 | 事后兜底审计 |
| 范围 | 全部文档分类 | 仅 `docs/实现方案/` |
| 输出 | `doc-sync` 逐类决策（必须） | 审计报告（仅检决策是否存在） |
| 阻断 | Non-blocking（决策输出即可） | Non-blocking（仅记录 error） |

## 关联

- 关联 ADR：ADR-001（Phase 4→5 文档同步，已晋升）
- 关联需求：Phase 4→5 增加文档更新步骤（todo #1，范围已扩大）
- 关联文件：`packages/installer/templates/configs/guides/feat-workflow.md` 第 509-513 行
