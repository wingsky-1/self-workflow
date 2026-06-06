---
id: 005
title: task 目录元数据规范——每个任务目录应有 task.yaml
date: 2026-06-06
status: 已采纳
---

# ADR-005：task 目录元数据规范

## 背景

`.self-workflow/tasks/` 下的每个任务目录（`YYYYMMDD-任务名`）缺乏一个统一的入口文件来描述任务本身的元信息。

目录下已有 `plan.md`（执行计划）和 `完成状态.md`（完成记录），但缺少：
1. 机器可读的结构化任务状态（in_progress / completed / cancelled / stuck）
2. 里程碑列表及每个里程碑的完成情况
3. 任务内产物清单
4. 与 `workflow.yaml` 对应的任务级元数据规范

## 决策

**每个 `.self-workflow/tasks/<task-name>/` 目录下必须包含 `task.yaml` 作为任务元数据文件。**

### 格式

```yaml
# 任务元数据
name: <任务名>
title: <任务标题>
status: in_progress  # in_progress | completed | cancelled | stuck
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]

description: >
  任务描述

milestones:
  - id: M1
    name: 里程碑名称
    status: completed | in_progress | pending
    completed: YYYY-MM-DD | null

artifacts:
  - "文件名"
```

### 字段说明

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | ✅ | 任务名，与目录名一致（不含日期前缀） |
| `title` | ✅ | 任务的人类可读标题 |
| `status` | ✅ | 当前状态 |
| `created` | ✅ | 创建日期 |
| `updated` | ✅ | 最后更新日期 |
| `tags` | ❌ | 标签，便于检索 |
| `description` | ✅ | 任务描述 |
| `milestones` | ✅ | 里程碑分解及完成状态 |
| `artifacts` | ❌ | 任务目录下的重要文件清单 |

## 理由

- **一致性**：与工作流实例的 `workflow.yaml` 对应，运行时层统一使用 YAML 元数据
- **机器可读**：Agent 可以直接读取 `task.yaml` 了解任务状态，无需解析 Markdown
- **可聚合**：未来可以扫描所有 `tasks/*/task.yaml` 生成任务总览
- **自举基础**：`task.yaml` 本身就是工作流执行时应该产出的文件类型

## 影响

- 新建 task 目录时必须创建 `task.yaml`
- `完成状态.md` 可作为人类可读的补充，但权威状态以 `task.yaml` 为准
- 后续可考虑为 `task.yaml` 提供 JSON Schema 校验

## 关联

- 关联概念：`configs/templates/workflow-metadata-template.yaml`（workflow 元数据格式）
- 关联 ADR：[ADR-004 目录职责划分与开发使用分离](./ADR-004-目录职责划分与开发使用分离.md)（task 目录的定位）
