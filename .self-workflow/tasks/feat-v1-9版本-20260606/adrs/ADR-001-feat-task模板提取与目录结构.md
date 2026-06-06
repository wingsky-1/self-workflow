---
phase: adr
type: simple
workflow: feat
description: task.yaml 模板从 feat.md 命令内嵌提取为独立文件，确定模板源目录、部署路径和命名规范
---

# ADR-001：feat-task 模板提取与目录结构

## 背景

当前 task.yaml 模板硬编码在 `packages/installer/templates/commands/feat.md` 第 84-151 行的 YAML 代码块中，无独立源文件。MANIFEST 中无任何 task.yaml 条目——模板由 Agent 在 `/feat` 执行时动态写入。

这导致两个问题：
1. **不可定制**：用户无法修改任务模板结构（如增减 phase、添加自定义字段），除非直接修改 `feat.md` 命令文件
2. **不可拓展**：未来可能有 `fix-task.yaml`、`refactor-task.yaml` 等其他工作流类型的模板，当前无承载目录

## 决策

1. 新建模板源目录 `packages/installer/templates/tasks/`，用于存放工作流类型的任务模板
2. 首文件命名为 `feat-task.yaml`（`feat-` 前缀绑定工作流类型，而非通用 `task.yaml`）
3. 通过 MANIFEST 部署到 `.self-workflow/configs/tasks/feat-task.yaml`
4. `feat.md` 步骤 3 改为"从 `.self-workflow/configs/tasks/feat-task.yaml` 加载模板"而非内联 YAML 块
5. 首次 `init` 创建该文件；无 `--force` 时不覆盖（用户定制不受影响）

## 理由

**方案 A（采纳）**：`templates/tasks/feat-task.yaml`
- 独立 `tasks/` 目录与现有 `configs/templates/`（阶段产物模板）职责分离。运行时目标为 `.self-workflow/configs/tasks/`，与源目录 `templates/tasks/` 对称，不与阶段产物模板混放
- `feat-` 前缀明确绑定工作流类型，为未来 `fix-task.yaml`、`refactor-task.yaml` 留空间

**方案 B（放弃）**：命名为 `task.yaml`
- 过于通用，后续的多工作流扩展时难以区分模板来源

**方案 C（放弃）**：放入 `configs/templates/` 与阶段产物模板混放
- 任务模板与产物模板是不同层次的抽象——前者定义"任务结构"，后者定义"阶段输出格式"

## 关联

- 关联需求：V1.9 #1 "task 模板从 feat command 移动到 templates"
- 引用：`packages/installer/templates/commands/feat.md`（模板源）、`packages/installer/index.js`（MANIFEST）
