---
title: "Plugin 注入机制实现方案"
category: 实现方案
tags: [plugin, injection, session-transform, spec-injection, docs-index]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# Plugin 注入机制实现方案

> 最后更新：2026-06-07

## 模块定位

`self-workflow-session.ts`（`.opencode/plugins/`）是 OpenCode Plugin，负责在会话启动时和子 Agent 调用时注入项目上下文（specs、docs 索引）到 system prompt。

**一句话**：让每个 Agent（主+子）自动知道自己可以查阅哪些规范和文档。

## 架构概览

双钩子架构：

```
会话创建 (session.created)
    │
    ▼
system.transform 钩子 ──────► 主 Agent system prompt
    │                          注入 specs/ 索引 + docs/ 索引
    │
子 Agent 调用
    │
    ▼
tool.execute.before 钩子 ──► 子 Agent system prompt
                               注入 specs/ 内容 + docs/ 内容
```

### 两个钩子的职责分工

| 钩子 | 触发时机 | 注入内容 | 注入方式 |
|------|---------|---------|---------|
| `experimental.chat.system.transform` | 会话创建 | specs 索引（文件名+tags+summary）+ docs 索引（分类目录+用途） | 替换 system prompt 中的 marker `<!-- SELF_WORKFLOW_SPECS -->` 和 `<!-- SELF_WORKFLOW_DOCS_INDEX -->` |
| `tool.execute.before` | 子 Agent 调用前 | specs 索引 + docs 索引（与 system.transform 相同内容） | 注入到子 Agent 启动消息。子 Agent 需用 Read 工具自行加载完整 spec/docs 文件 |

## 关键数据流

### docs 索引生成（scanDocs）

```
1. 读取 .self-workflow/docs/README.md
2. 正则匹配 "### 分类名/" 提取分类定义
3. 检查对应目录是否存在 + 扫描 .md 文件
4. 生成索引列表注入 system prompt
```

关键正则：`/###\s+(.+?)\s*\/\s*\n+([^\n#]+)/g`

匹配 `### 实现方案/` → 提取分类名"实现方案"和描述文字。

**不需要修改 Plugin 代码来新增分类**——只要在 README.md 中按格式添加 `### 新分类/` 条目即可自动识别。

### specs 索引生成（scanSpecs）

```
1. 扫描 .self-workflow/specs/default/ 下的 .md 文件
2. 读取 frontmatter 提取 title/tags/summary
3. 生成一对一摘要行注入 system prompt
```

**注意**：仅注入索引摘要（非全文）。Agent 需要 Read 工具加载完整 spec 内容。

### sw_task_* 工具注册

Plugin 通过 `tool` 钩子注册 4 个 sw_task_* 内置工具（list / create / read / phase_update），Agent 可在对话中直接调用。

**`sw_task_phase_update` checkpoint 参数**（V1.19）：

| 参数 | 类型 | 说明 |
|------|------|------|
| `checkpoint` | `string?` | Gate 通过时的 checkpoint SHA。由 Agent 外部传入——Agent 先执行 `git tag` + `git rev-parse` 获取 SHA，再调用工具时传入 |

**Checkpoint 外部传入设计**：工具职责保持单一（YAML 写入），不跨域到 git 操作。Agent 按 feat-workflow.md Checkpoint 章节执行 git 操作，传入 SHA 零额外成本。避免 CI/容器环境 git 不可用时工具崩溃。

**Warning 机制**：当 `gate === "passed"` 但 `checkpoint` 未传入或为空时，工具返回 `warning: "gate passed but checkpoint not provided"`。不阻断流程，但提示 Agent 可能遗漏——兼顾灵活性和可靠性。

## 设计决策依据

见 `docs/关键决策/spec上下文注入架构.md`（双钩子架构的原始设计决策）。

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；新增 `实现方案/` 文档分类无需修改 Plugin 代码 |
| 2026-06-07 | feat-feat流程修补-todo整理-20260607 | sw_task_phase_update 新增 checkpoint 参数（外部传入），新增 gate=passed 时 checkpoint 缺失的 warning 机制 |
