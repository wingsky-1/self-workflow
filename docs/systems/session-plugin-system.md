# 会话插件系统 (Session Plugin System)

> 所属模块：基础设施层
> 文件位置：`.opencode/plugins/self-workflow-session.ts`
> 实现方案：`.self-workflow/docs/实现方案/plugin-注入机制实现方案.md`

---

## 功能概述

Session Plugin 是 Self-Workflow 的**上下文注入中枢**。它是一个 OpenCode Plugin，在会话生命周期的关键节点自动注入经验索引和规范摘要，确保 Agent 在每个会话中都能获取框架知识而不需手动加载。

## 核心特性

### 1. 双钩子注入架构

```
Session Plugin
├── session.created → scanDocs() + scanSpecs()  # 会话启动时扫描
├── chat.system.transform → 注入 docs 索引 + specs 摘要  # system prompt 构建时
└── tool.execute.before → 子 Agent 上下文注入  # task() 调用时
```

### 2. 文档索引注入（docs）

**触发时机**：`session.created`（扫描）+ `chat.system.transform`（注入）

**注入内容**：`docs/README.md` 的分类定义 + 各分类下文件的 frontmatter 摘要（title + tags），不加载全文。

**防重复机制**：`<!-- SELF_WORKFLOW_DOCS_INDEX -->` marker 确保跨 Plugin 重启不重复注入。

### 3. 规范摘要注入（specs）

**触发时机**：同 docs

**注入内容**：`specs/README.md` 的分类定义 + `default/` 下每个 spec 的 frontmatter（文件名 + tags + summary），不加载全文。

**防重复机制**：`<!-- SELF_WORKFLOW_SPECS -->` marker。

### 4. 子 Agent 上下文注入

**触发时机**：`tool.execute.before` hook，拦截 `task()` 调用

**行为**：当 task() 指定了 `subagent_type` 时，自动将 specs + docs 上下文前置到 prompt 中：

```typescript
output.args.prompt = `${specs}\n\n${docs}\n\n---\n\n${original_prompt}`;
```

**效果**：子 Agent 也能获取到经验索引和规范约束，确保分派出去的任务同样遵守框架规则。

### 5. 4 个内置工具

| 工具 | 实现方式 | 说明 |
|------|---------|------|
| `sw_task_list` | 内置 tool（zod schema） | 扫描 .self-workflow/tasks/*/task.yaml |
| `sw_task_create` | 内置 tool | 从模板创建任务目录结构 |
| `sw_task_read` | 内置 tool | 读取并解析 task.yaml |
| `sw_task_phase_update` | 内置 tool | 更新 phase status/gate + 时间戳 |

**为什么用内置工具而非 Agent 手动操作**：YAML 格式精确性、token 效率、操作原子性。

### 6. 动态扫描架构

docs 和 specs 内容在 `session.created` 时扫描一次，缓存在内存中。后续 hook 调用直接使用缓存，避免每次 system transform 都重新扫描文件系统。

---

## 实现路径

### V1.7 — 文档索引注入
- session.created 扫描
- chat.system.transform 注入
- marker 防重复

### V1.8 — 规范注入 + 子 Agent 上下文
- specs 扫描和注入
- tool.execute.before 子 Agent 上下文前置

### V1.11 — 内置工具
- 4 个 sw_task_* 工具实现
- zod schema 参数验证

---

## 未来愿景

### V2.x — 注入策略增强
- **渐进式披露优化**：根据任务类型选择性注入相关分类
- **提示词注入场景梳理**：主 Agent/子 Agent 注入内容是否对应目标需要
- **经验 freshness 感知**：注入时标注文档质量级别

### V3.x — 智能化
- **上下文自适应**：根据会话历史自动调整注入内容
- **Agent 专有注入**：不同类型 Agent 注入不同的 spec 子集

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.opencode/plugins/self-workflow-session.ts` | Plugin 全部逻辑（483 行） |
| `packages/installer/templates/plugin/self-workflow-session.ts` | 模板源 |
