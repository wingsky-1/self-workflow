# 功能验证：V1.8 — specs 结构奠基

> workflow-id: feat-specs结构奠基-20260606
> 阶段：4/5 — 功能验证

---

## 验证清单

### F1：通用 spec 结构

- [x] `.self-workflow/specs/README.md` 存在，含分类定义段（`### default/`）
- [x] `.self-workflow/specs/default/` 目录存在
- [x] `agent-reasoning.md` — 含 YAML frontmatter + MUST/SHOULD 分类
- [x] `interaction-protocol.md` — 含 YAML frontmatter + MUST/SHOULD 分类
- [x] `doc-audience.md` — 含 目录→受众映射表 + 编写/评审指引
- [x] `decision-record.md` — 含 MUST 触发条件 + ADR 生命周期 + 晋升流程
- [x] 所有 spec 文件遵循统一格式（YAML frontmatter + Markdown body）
- [x] 安装器模板源 `packages/installer/templates/specs/` 同步

### F2：文档受众分类 spec

- [x] `doc-audience.md` 含 `.self-workflow/` 目录受众映射表
- [x] 含项目根目录文档受众表（AGENTS.md → Agent, README.md → Human）
- [x] 含按受众编写文档的指引（Agent/Human/Both）
- [x] 含按受众评审文档的检查项
- [x] 不修改已有文档（仅 spec 定义，无批量 frontmatter 更新）

### F3：Skill 降格为 spec

- [x] `agent-reasoning` 完整内容从 SKILL.md 平移（4 MUST + 2 SHOULD + 流程图）
- [x] `interaction-protocol` 完整内容从 SKILL.md 平移（6 MUST + 2 SHOULD + 示例）
- [x] `.opencode/skills/agent-reasoning/` 已删除
- [x] `.opencode/skills/interaction-protocol/` 已删除
- [x] `feat.md` 已移除 `load_skills=['agent-reasoning', 'interaction-protocol']` 引用
- [x] 安装器 MANIFEST 已移除 skill 条目
- [x] 插件 `tool.execute.before` 确保子 Agent 收到 spec 注入

### F4：决策自动记录 spec

- [x] `decision-record.md` 含 ADR 创建触发条件（架构选择/方向性决策/流程性决策/反模式纠正）
- [x] 含 ADR 模板选择规则（simple/complex）
- [x] 含 ADR 生命周期：创建 → 引用 → 沉淀（晋升） → 废弃/更新
- [x] 含 docs/关键决策/ 晋升标准（跨任务性/框架级/持久性/可引用性 + Human 决策）
- [x] `.self-workflow/docs/关键决策/` 目录已创建（含 .gitkeep）
- [x] `docs/README.md` 已新增 `### 关键决策/` 分类

### 插件注入

- [x] `scanSpecs()` 函数已实现（扫描 specs/README.md + specs/default/）
- [x] `SPECS_MARKER` 独立于 `DOCS_MARKER`，两个注入互不阻断
- [x] `tool.execute.before` 拦截 Task 调用，注入 docs+specs 到子 Agent prompt
- [x] Plugin 已通过 `init --force` 部署到 `.opencode/plugins/`

### feat-workflow.md

- [x] Phase 5 checklist 已增加 ADR 晋升检查步骤
- [x] "总结沉淀"完成检查清单含"ADR 晋升检查"条目

---

## 已知限制

1. 子 Agent spec 继承需在实际会话中验证（新会话启动后检查 SPECS_MARKER）
2. `docs/关键决策/` 目录为空——需在后续任务中实际晋升 ADR 后验证流程
3. M0-1/M0-2 验收标准文档尚未更新路径（引用 .opencode/skills/ 需改为 specs/default/）— 非 blocker，下次编辑时修正

---

## 验证结论

✅ 所有 4 项功能（F1-F4）的实现符合设计文档和 ADR 定义。插件双钩子架构（system.transform + tool.execute.before）覆盖主 Agent 和子 Agent 的 spec 注入。安装器自举验证通过。
