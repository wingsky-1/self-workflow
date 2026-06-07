# 安装器系统 (Installer System)

> 所属模块：部署层
> 文件位置：`packages/installer/`
> 实现方案：`.self-workflow/docs/实现方案/installer-系统实现方案.md`

---

## 功能概述

安装器是 Self-Workflow 的部署入口。它将 `packages/installer/templates/` 中的**模板源**（权威源）部署到项目的运行时目录（`.opencode/`、`.self-workflow/configs/`、`.self-workflow/specs/`）。

## 核心特性

### 1. MANIFEST 驱动部署

安装器通过 `MANIFEST` 数组声明所有需要部署的文件映射关系：

```javascript
const MANIFEST = [
  // [target-path, source-path]
  [".opencode/agents/review-agent.md",      "agents/review-agent.md"],
  [".opencode/commands/feat.md",            "commands/feat.md"],
  [".self-workflow/specs/default/agent-reasoning.md", "specs/default/agent-reasoning.md"],
  // ... 共 30+ 项
];
```

**特性**：
- 声明式——新增文件只需在 MANIFEST 中添加一行
- 可预览——`--dry-run` 模式不写入任何文件，仅展示变更计划
- 可覆盖——`--force` 强制覆盖已有文件

### 2. 三层架构

```
packages/installer/templates/     ← 模板源（唯一权威源）
        │  init --force
        ▼
.opencode/ + .self-workflow/      ← 运行时（安装器写入）
        │  工作流执行
        ▼
.self-workflow/docs/ + tasks/     ← 工作流产出（工作流直接写入）
```

**原则**：
- **模板源是唯一权威源**：修改 `.opencode/`、`.self-workflow/configs/`、`.self-workflow/specs/` 前，必须先改模板源
- **例外**：`.self-workflow/docs/`、`.self-workflow/tasks/` 由工作流直接写入，可直接编辑

### 3. 模板分类

| 模板目录 | 部署目标 | 内容 |
|---------|---------|------|
| `agents/` | `.opencode/agents/` | review-agent.md |
| `commands/` | `.opencode/commands/` | feat.md, catchup.md, todo-organize.md |
| `skills/` | `.opencode/skills/` | exp-governance/SKILL.md |
| `plugin/` | `.opencode/plugins/` | self-workflow-session.ts |
| `configs/guides/` | `.self-workflow/configs/guides/` | feat-workflow.md |
| `configs/templates/` | `.self-workflow/configs/templates/` | 11 个阶段模板 |
| `configs/tasks/` | `.self-workflow/configs/tasks/` | feat-task.yaml 任务模板 |
| `docs/` | `.self-workflow/docs/` | 5 个分类目录 + README.md（骨架） |
| `specs/` | `.self-workflow/specs/` | specs/README.md + 8 个 default/ spec |

### 4. 使用方式

```bash
# 首次安装（不覆盖已有文件）
node packages/installer/index.js init --target .

# 强制同步（覆盖已有文件）
node packages/installer/index.js init --target . --force

# 预览模式（不写入）
node packages/installer/index.js init --target . --dry-run
```

---

## 实现路径

### V1.0 — 基础部署
- MANIFEST 数组驱动文件复制
- 空目录自动创建
- 基础 CLI 参数解析（`--target`, `--dry-run`）

### V1.9 — 三层架构重构
- 明确模板源为唯一权威源
- 删除 `installer/.opencode/` 和 `installer/.self-workflow/` 死代码（17 个文件）
- `installer/README.md` 文档化三层架构

### V1.11 — feat-task.yaml 独立
- task 模板从 feat command 内联代码移入独立 `feat-task.yaml` 文件
- MANIFEST 添加 deploy 项

---

## 未来愿景

### V2.x — 安装能力增强
- **用户文件变更检测**：patch diff 展示，人工逐项确认
- **无损升级**：V1.x 安装可无损升级到 V2.x
- **选择性安装**：按模块选择性部署（如只安装审查系统）

### V3.x — 平台化
- **工作流模板市场**：社区贡献的预置模板
- **多 Agent 适配**：支持 Cursor、Copilot、Claude Code 等不同工具的安装目标
- **doctor 命令**：检查用户对可定制文件的改动是否正确合理

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `packages/installer/index.js` | CLI 入口 + MANIFEST + init 逻辑 |
| `packages/installer/templates/` | 30+ 模板文件（权威源） |
| `packages/installer/README.md` | 三层架构说明 |
