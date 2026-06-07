---
phase: 3
workflow: feat
description: 代码实现阶段产物——todowrite 可视化 spec 文件的创建、manifest 注册、安装器同步
validation:
  required-fields:
    - "实现清单"
    - "lint/typecheck"
    - "决策捕捉"
---

# 代码实现 — todowrite 可视化

> 工作流 ID：`feat-todowrite-可视化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T13:40:00+08:00

---

## 实现清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `packages/installer/templates/specs/default/todowrite-display.md` | **模板源**：todowrite 可视化规范（142 行） |
| `.self-workflow/specs/default/todowrite-display.md` | **运行时副本**：由安装器 `init --force` 同步生成 |

### 修改文件

| 文件 | 变更 |
|------|------|
| `packages/installer/index.js` | MANIFEST 数组新增 `todowrite-display.md` 条目（L50），使安装器同步此文件 |

### 用户补充需求

Phase 3 中用户提出：子 Agent 返回多事项时（如 Review Agent 返回 1 critical + 3 warning），主 Agent 应为每个 actionable item 创建单独的 todowrite 条目。已在 spec 中作为 **M-3.1** 补充。

---

## Spec 内容概要

### Frontmatter
```yaml
title: "Todowrite 可视化"
type: spec
level: default
tags: [todowrite, visualization, progress-tracking, agent-display]
version: 1.0.0
summary: "..."
extends: agent-reasoning.md
```

### Body 结构

| 章节 | 规则数 | 说明 |
|------|--------|------|
| 核心原则 | — | 三层待办区分表（todo.md / task.yaml / todowrite）、适用范围 |
| MUST | 6 条 | M-1 阶段入口、M-2 Gate 完成、M-3 子Agent委托、M-3.1 多事项处理、M-4 不混淆 todo.md、M-5 总结对齐 |
| SHOULD | 3 条 | S-1 关键节点粒度（含决策清单表）、S-2 条目信息量（≥10字）、S-3 引用格式 |
| MAY | 2 条 | MAY-1 跨会话重建、MAY-2 批次更新 |
| 反模式 | 4 条 | 常见错误 vs 正确做法对照 |

### 关键设计决策落地

- **ADR-001** 独立 spec → 文件 `todowrite-display.md`
- **ADR-002** 混合粒度 → S-1 决策清单（Phase/Gate/委托/卡顿/文件编辑/工具调用）
- **ADR-003** 子Agent隔离 → M-3 主Agent标记委托 + M-3.1 多事项逐项展示
- **追回性** → 核心原则段明确"已进行中任务从当前阶段起遵循"
- **AC-5 降级** → SHOULD-3 `[描述]` 引用格式（在 02-design.md 已有说明）

---

## 验证

### Lint/Typecheck

本任务为纯文档/spec 实现，无代码文件需 lint/typecheck。

### 安装器同步验证

```
node packages/installer/index.js init --target . --force
→ 40 项操作 ✅
→ 📝 写入 .self-workflow/specs/default/todowrite-display.md ✅
```

运行时文件与模板源内容一致。

### Frontmatter 合规性（预检 Compound 阶段审查标准）

| 字段 | 状态 | 值 |
|------|------|-----|
| `title` | ✅ | `"Todowrite 可视化"` |
| `type` | ✅ | `spec` |
| `level` | ✅ | `default` |
| `tags` | ✅ | 4 个英文小写标签 |
| `version` | ✅ | `1.0.0` |
| `summary` | ✅ | 非空，56 字 |

---

## 决策捕捉

- [x] 本阶段无新架构决策。所有架构决策已在 Phase 2 创建（ADR-001/002/003），Phase 3 仅执行实现。
