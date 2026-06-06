---
description: Session Catchup — 扫描 .self-workflow/ 中的进行中任务和未解决错误，生成恢复摘要
---

<command-instruction>
你正在执行 Session Catchup。请按以下流程操作：

## 1. 扫描 task 目录

读取 `.self-workflow/tasks/` 下每个子目录中的 `task.yaml`，检查状态：

- `status: in_progress` → 进行中的任务
- `status: stuck` → 卡住的任务（需要人工介入）
- `status: cancelled` → 已取消的任务（简要提及即可）

## 2. 检查未完成的任务

对每个 `in_progress` 的任务：
- 读取 `task.yaml` 中的 milestones，找出 `status: pending` 或 `status: in_progress` 的里程碑
- 读取 `task.yaml` 的 phases 段了解当前进度
- 简要总结当前进展到哪一步

## 3. 检查未解决的错误

- 扫描 `.self-workflow/tasks/<task-id>/errors/` 下的 `errors.yaml`
- 找出 `resolved: false` 的错误
- 汇总未解决错误清单

## 4. 生成 Catchup 摘要

按以下格式输出：

```
📋 Session Catchup — {当前日期}

▶ 进行中的任务
   - {task-name}：{当前阶段/总里程碑数}，当前状态：{status}
    建议：继续 {task-name}

⚠ 未解决的错误
   - {task-id}：{错误描述} → {错误文件路径}

✅ 已完成的任务
   - {task-name}（{完成日期}）
```

## 5. 询问用户

输出摘要后，询问用户是否需要恢复某个任务。
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>
