---
promoted-from: feat-specs结构奠基-20260606
---

# ADR-002：Spec 加载机制 —— 插件注入 System Prompt + 子 Agent 拦截

## 背景

spec 不是 Skill，不应依赖 `load_skills`。`docs/` 已有插件注入机制（`self-workflow-session.ts` 扫描 docs/ 注入索引到 system prompt）。

V1.8 需要设计 spec 的加载机制，确保主 Agent 和子 Agent 都能获取 spec 约束。

## 决策

**扩展 `self-workflow-session.ts` 插件，双钩子注入架构**：

### 主 Agent：`experimental.chat.system.transform`

- 新增 `scanSpecs()` 函数，扫描 `specs/README.md` + `specs/default/`
- 使用独立 marker `<!-- SELF_WORKFLOW_SPECS -->`（与 docs 的 marker 去重独立）
- 注入内容：default/ 下所有 spec 的标题、tags、summary

### 子 Agent：`tool.execute.before`（Trellis 模式）

- 拦截 `Task` 工具调用（`input.tool === "task"`）
- 将 docs 索引 + specs 摘要注入到 `output.args.prompt` 开头
- 确保子 Agent 不依赖 system prompt 继承也获得上下文

### 注入内容格式

```
<!-- SELF_WORKFLOW_SPECS -->
## ⚠️ Self-Workflow 项目规范（必须遵守）
specs/default/ 下的规范始终生效。
### default/（始终生效）
- **agent-reasoning** [...] — 委托优先原则
- **interaction-protocol** [...] — 交互式问答优先
...
### 如何使用
- default/ 下的 spec 始终生效，Agent 用 Read 工具查看完整内容
```

## 理由

1. **不依赖 Skill 系统**：spec 通过 system prompt 注入 + tool.execute.before 注入
2. **与 docs 同架构**：共用同一插件、marker 去重逻辑
3. **双重保障**：system.transform 覆盖主 Agent，tool.execute.before 覆盖子 Agent
4. **Trellis 验证**：业界最佳实践采用 tool.execute.before 拦截 Task 调用

## 关联

- 参考：`docs/参考模式/plugin-session-inject-pattern.md`
- 参考：Trellis 的 PreToolUse (tool.execute.before) 子 Agent 注入模式
- 依赖：ADR-001（Spec 文件格式）、ADR-003（Spec 目录结构）
