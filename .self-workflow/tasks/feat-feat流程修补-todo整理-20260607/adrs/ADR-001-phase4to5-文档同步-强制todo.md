# ADR-001：Phase 4→5 文档同步步骤插入 + Compound 步骤 5 MUST 升级

## 背景

feat-workflow.md v0.4 中，实现方案文档更新依赖 3 个分散的检查点（Phase 3 checklist、Phase 5 checklist、Compound 4.5 审计），但三者均非强制执行步骤。多次 /feat 任务中 Agent 跳过文档更新，导致 `docs/实现方案/` 中的设计文档与代码实现脱节。

同时，Compound 步骤 5（todo 状态更新）描述为"自动执行"，但没有 MUST 级别约束，Agent 在实际执行中经常仅记录"建议更新"而不实际修改 todo.md。

## 决策

1. **插入独立的"相关文档同步"步骤**：在 feat-workflow.md Gate 4 通过条件和 Phase 5 入口之间（约第 511-512 行位置），新增一个强制步骤，要求 Agent：
   - 扫描本次变更涉及的所有文档（`docs/` 下各分类、`specs/`、`configs/`），对照已有文档评估哪些需要同步更新
   - 在 `05-summary.md` 的「相关文档同步」节中逐类输出决策：`doc-sync: <分类> → updated | skipped（理由）`
   - Non-blocking：即使 Agent 判断为 `skipped`（不更新）也可进入 Phase 5，但必须留下决策记录

2. **升级 Compound 步骤 5 为 MUST 级别**：将 feat-workflow.md Compound 步骤 5 的"自动更新"改为 MUST 级别语句——"Agent MUST 更新 todo.md 中对应版本的项状态（标记 [done]），不可跳过或仅记录建议更新"。

## 理由

- **时间窗口优势**：Phase 4 验证刚完成，代码变更记忆新鲜，此时执行文档同步效率最高、遗漏最少
- **显式决策需求**：`doc-sync` 逐类决策强制 Agent 对每一类文档做出判断（即使判断为"不需要"），将隐式跳过变为显式决策，降低审计盲区
- **Non-blocking 原则**：不因文档滞后阻断工作流推进（业务约束），但通过决策记录确保审计可追溯
- **与 Compound 4.5 互补**：新步骤是前置强制检查（有决策输出），Compound 4.5 是事后兜底审计（检查决策是否存在），双重保障
- **MUST 升级**：todo.md 是框架核心状态源，Compound 步骤 5 的"自动"措辞给 Agent 留下了跳过空间，MUST 级别消除歧义

## 关联

- 关联需求：Phase 4→5 增加文档更新步骤（todo #1）、/feat 强制更新 todo（todo #4）
- 受影响文件：`packages/installer/templates/configs/guides/feat-workflow.md` Phase 4→5 段 + Compound 步骤 5
- 相关规范：`specs/default/implementation-documentation.md`
- 审查记录：Gate 1 对抗性审查发现现有检查点重叠问题，本 ADR 记录设计理由
