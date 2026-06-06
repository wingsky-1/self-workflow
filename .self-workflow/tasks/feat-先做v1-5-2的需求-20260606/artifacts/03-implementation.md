# 代码实现 — V1.5.2 Todo 体系优化

> 工作流 ID：`feat-先做v1-5-2的需求-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T19:24:34+08:00

---

## 实施概述

本阶段为纯文档/模板编辑任务，无运行时代码变更。按 02-design.md 的三步骤顺序实施。

---

## 步骤 1：F4/F5 — Todo 模块合并到 .self-workflow/

| 操作 | 文件 | 状态 |
|------|------|------|
| 新建 | `.self-workflow/todo.md` | ✅ 从 `docs/todo.md` 复制全文 + wontfix 规则添加 |
| 修改 | `docs/todo.md` | ✅ 全文替换为迁移 stub |
| 修改 | `.self-workflow/docs/经验分级与加载指引.md` | ✅ `docs/todo.md` → `.self-workflow/todo.md` |
| 修改 | `AGENTS.md` | ✅ 新增"## Todo 体系"章节 |
| 确认 | `docs/ROADMAP.md` | ✅ 无引用需更新 |
| 不更新 | `docs/feat-command-需求设计.md` 等历史文档 | ✅ 按设计保留历史快照 |

---

## 步骤 2：F6 — task.yaml 合并（废弃 workflow.yaml）

### 2a: task.yaml 新 schema

在 02-design.md 中已定义，实施时 schema 已嵌入 feat.md 的步骤 3 YAML 模板中。

### 2b: feat-workflow.md 模板源更新

- 文件：`packages/installer/templates/configs/guides/feat-workflow.md`
- 变更：全部 8 处 `workflow.yaml` → `task.yaml`；目录结构图移除 workflow.yaml；产物清单移除 workflow.yaml 行；工作流状态管理标题更新；快速入门移除 bootstrap 步骤
- 安装器已同步至 `.self-workflow/configs/guides/feat-workflow.md`

### 2c: /feat 命令模板源更新

- 文件：`packages/installer/templates/commands/feat.md`
- 变更：步骤 3 task.yaml 增加 phases/workflow-id/type/experience-draft/cross-refs；步骤 4 "写入 workflow.yaml" → "阶段追踪初始化(单行注释)"

### 2d: Review Agent 模板源更新

- 文件：`packages/installer/templates/agents/review-agent.md`
- 变更：task.yaml 存在性检查 → 增加 phases 段新 schema 校验（验证 5 个元素 + status/gate 字段）

### 2e: workflow-metadata-template.yaml

- 文件顶部添加 4 行废弃声明
- 安装器 MANIFEST 中添加 `// ⚠️ DEPRECATED (V1.5.2)` 注释
- 模板仍部署（保留历史参考），但 /feat 不再引用

---

## 步骤 3：F7 — feat.md 重定位为系统提示词框架

| 操作 | 变更内容 |
|------|---------|
| 新增 `## 角色定位` | 定义 feat.md=系统提示词框架，feat-workflow.md=工作流定义模板 |
| 新增 `## 工作流执行` | 快捷引用表 + 系统约束(task()规范/skill规则/Gate量化/决策捕捉) |
| 更新 `## 无参数模式` | 新增 phases 段检测→回退 workflow.yaml 的双格式兼容 |
| 更新 `## 错误处理` | workflow-metadata-template 行为改为说明已废弃 |
| 更新 `## 参考` | 移除废弃模板引用 |
| feat-workflow.md 角色声明 | 文件开头添加角色定义 + 定制方式说明 + 覆盖警告 |

---

## 文件变更汇总

| 文件 | 操作 | 类别 |
|------|------|------|
| `.self-workflow/todo.md` | 新建 | 直接编辑 |
| `docs/todo.md` | 修改(全文替换) | 直接编辑 |
| `AGENTS.md` | 修改(新增章节) | 直接编辑 |
| `.self-workflow/docs/经验分级与加载指引.md` | 修改(引用更新) | 直接编辑 |
| `packages/installer/templates/commands/feat.md` | 重写 | 模板源→安装器 |
| `packages/installer/templates/configs/guides/feat-workflow.md` | 修改 | 模板源→安装器 |
| `packages/installer/templates/agents/review-agent.md` | 修改 | 模板源→安装器 |
| `packages/installer/templates/configs/templates/workflow-metadata-template.yaml` | 添加废弃声明 | 模板源→安装器 |
| `packages/installer/index.js` | 添加注释 | 安装器源码 |

安装器已运行 `init --target . --force`，27 项同步完成。

---

## 决策捕捉

本阶段无新增架构决策。所有决策已在阶段 2 通过 ADR-001/ADR-002 记录。
