---
title: "installer 系统实现方案"
category: 实现方案
tags: [installer, template-deployment, manifest, init, architecture]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: draft
---

# installer 系统实现方案

> 最后更新：2026-06-07

## 模块定位

installer（`packages/installer/`）是 Self-Workflow 的部署引擎。职责：将模板源目录（`templates/`）中的文件按 MANIFEST 映射部署到项目目标目录。

**一句话**：模板源是唯一权威源，installer 负责同步到运行时。

## 架构概览

```
packages/installer/
├── index.js           # 入口：init 命令 + MANIFEST + 部署逻辑
├── templates/         # 模板源（权威源）
│   ├── agents/        → init --force → .opencode/agents/
│   ├── commands/      → init --force → .opencode/commands/
│   ├── skills/        → init --force → .opencode/skills/
│   ├── plugin/        → init --force → .opencode/plugins/
│   ├── configs/       → init --force → .self-workflow/configs/
│   ├── docs/          → init --force → .self-workflow/docs/（骨架）
│   ├── specs/         → init --force → .self-workflow/specs/
│   └── tasks/         → init --force → .self-workflow/configs/tasks/
└── README.md          # 三层架构说明
```

### 三层架构

| 层 | 位置 | 角色 |
|----|------|------|
| 开发层 | `packages/installer/templates/` | 模板源——修改从这里开始 |
| 部署逻辑层 | `packages/installer/index.js` | MANIFEST 映射 + init 命令 |
| 运行时层 | `.opencode/` + `.self-workflow/` | 部署目标——Agent 实际使用的文件 |

## 关键数据流

### 修改流程

```
1. 编辑 templates/ 下的模板文件
2. node packages/installer/index.js init --target . --force
3. installer 按 MANIFEST 将模板内容复制到目标路径
4. 运行时文件被更新
```

### MANIFEST 机制

`MANIFEST` 数组（index.js:26-62）定义源→目标的映射：

```js
const MANIFEST = [
  [targetPath, sourcePath],   // sourcePath 相对于 templates/
  // ...
];
```

`EMPTY_DIRS` 数组（index.js:64-76）定义需要预创建的目录。

`init(targetDir, dryRun, force)` 函数：
- 先创建 EMPTY_DIRS 中的所有目录（`mkdirSync({ recursive: true })`）
- 再遍历 MANIFEST，逐文件检查：
  - `force=true` → 无条件覆盖
  - `force=false` → 仅目标文件不存在时写入
  - 模板源不存在 → 报错

### 例外：可直接编辑的目录

| 目录 | 管理方式 |
|------|---------|
| `.self-workflow/configs/` | 安装器管理 → 必须通过模板源修改 |
| `.self-workflow/specs/` | 安装器管理 |
| `.opencode/` | 安装器管理 |
| `.self-workflow/docs/` | **可直接编辑**（经验文档通过工作流创建） |
| `.self-workflow/tasks/` | **可直接编辑**（任务目录通过 /feat 创建） |

## 设计决策依据

见 `adrs/ADR-001-独立spec-而非嵌入feat-workflow.md`（本次任务）。

关于 installer 的三层架构和自举认知陷阱，见 `docs/错误经验/安装器三层架构与自举认知陷阱.md`。

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；新增 `实现方案/` 分类的 MANIFEST 条目 |
