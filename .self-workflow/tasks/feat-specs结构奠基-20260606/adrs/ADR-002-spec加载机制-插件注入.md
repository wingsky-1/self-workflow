# ADR-002：Spec 加载机制 —— 插件注入 System Prompt

## 背景

当前 Agent 的行为约束（agent-reasoning、interaction-protocol）以 Skill 形式存在于 `.opencode/skills/`，通过 `feat.md` 中的 `load_skills` 参数显式加载。V1.8 要将这些约束降格为 spec 存入 `.self-workflow/specs/`，需要设计新的加载机制——spec 不是 Skill，不应依赖 `load_skills`。

`docs/` 已有成熟的注入机制：`self-workflow-session.ts` 插件在 `session.created` 时扫描 docs/，在 `system.transform` 时注入索引到 system prompt（带 `<!-- SELF_WORKFLOW_DOCS_INDEX -->` marker 去重）。

## 决策

**扩展 `self-workflow-session.ts` 插件，增加 specs/ 扫描与注入功能**，使用独立 marker `<!-- SELF_WORKFLOW_SPECS -->`。

### 注入内容设计

插件在 system prompt 末尾注入如下结构：

```
<!-- SELF_WORKFLOW_SPECS -->

## ⚠️ Self-Workflow 项目规范（必须遵守）

specs/default/ 下的规范**始终生效**，Agent 在每次会话中都必须遵守。
读取每个 spec 文件的 frontmatter 和内容，按遵循执行。

### default/（始终生效）

- **agent-reasoning** [agent-reasoning, delegation, decision] — 委托优先原则：独立思考、精简上下文、合理委托、验证结果
- **interaction-protocol** [interaction-protocol, question, ui] — 交互式问答优先：涉及选项选择时使用 question 工具，总结先行再询问
- **doc-audience** [doc-audience, audience, classification] — 文档受众分类：Agent 如何判断 .self-workflow/ 下文档的受众
- **decision-record** [decision-record, adr, lifecycle] — 关键决策自动记录：何时必须创建 ADR，如何沉淀跨任务决策

### 如何使用

- default/ 下的 spec 始终生效，Agent 用 Read 工具查看完整内容
- 其他 spec 按需加载：根据任务关键词匹配 spec 的 tags
- 遇到不确定时主动查阅 spec 文件
```

### 注入时机与去重

- `session.created` 事件触发时扫描 `specs/README.md` + `specs/default/` 目录
- `system.transform` 时注入，检测已有 `<!-- SELF_WORKFLOW_SPECS -->` marker 则跳过
- default/ 下的 spec 标题和摘要直接注入（避免 Agent 忽略），完整内容由 Agent 按需读取

### 代码结构

在现有 `self-workflow-session.ts` 中增加：
- `SPECS_DIR` 常量 → `.self-workflow/specs`
- `SPECS_MARKER` 常量 → `<!-- SELF_WORKFLOW_SPECS -->`
- `scanSpecs()` 函数 → 扫描 `specs/README.md`（获取索引）+ `specs/default/`（获取 key specs 列表）
- 在 `system.transform` 中注入 specs 内容（在 docs 索引之后）

## 理由

1. **不依赖 Skill 系统**：spec 通过 system prompt 注入，OpenCode 原生支持，无需 `load_skills` 参数
2. **与 docs 同架构**：共用同一个插件、同一套 marker 去重逻辑、相同的扫描-注入模式，维护成本低
3. **default/ 重点强调**：在注入内容中用 ⚠️ 标记 + "必须遵守" 措辞，符合 Human 的"重点强调 default 目录"要求
4. **渐进加载**：注入摘要（标题+tags），完整内容由 Agent 按需 Read，不占用过多 context
5. **独立 marker**：docs 和 specs 使用不同 marker，互不干扰，可独立调试

## 影响

- `packages/installer/templates/plugin/self-workflow-session.ts` 需扩展 ~50 行
- `packages/installer/index.js` MANIFEST 需增加 specs/ 相关条目
- 安装器 `init --force` 后插件自动生效，无需用户额外配置

## 关联

- 参考：`docs/参考模式/plugin-session-inject-pattern.md` 的注入模式文档
- 依赖：ADR-001（Spec 文件格式）— frontmatter 解析依赖格式标准
- 依赖：ADR-003（Spec 目录结构）— `default/` 目录是注入的核心来源
