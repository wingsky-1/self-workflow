<!--
  安装器模板 — 执行 self-workflow init 时复制到 .opencode/commands/todo-organize.md。
  变更此文件后请运行安装器同步，或手动复制到 .opencode/commands/todo-organize.md。
-->
---
description: 整理 todo 结构——合并重复、调整优先级、归档已完成版本
argument-hint: [--dry-run]
---

# /todo-organize 命令

## 用法

```
/todo-organize              # 交互模式：展示 diff 预览后确认写入
/todo-organize --dry-run    # 仅预览，不写入
```

## 执行流程

1. 读取 `.self-workflow/todo.md` 全文
2. 扫描 `.self-workflow/tasks/*/task.yaml`，按 version 匹配已完成任务
3. 执行整理操作：
   - 合并重复项：相似描述合并为一个，标注 `(合并自 #N, #M)`
   - 调整优先级：检查 P0/P1/P2 标记与任务实际紧迫性是否一致
   - 归档已完成版本：所有项 `[done]` 的版本段移入"已关闭"，用 `<details>` 折叠
   - 重排序版本段：P0 在前，同优先级按创建时间
4. ⚠️ **CRITICAL**：保留"## 新增（待评审排期）"章节内容不变
5. 输出 diff 预览（变更前后对比）
6. `--dry-run` 则到此结束；否则使用 question 工具展示 diff，待 Human 确认后写入

## 错误处理

| 场景 | 行为 |
|------|------|
| todo.md 不存在 | 提示先运行 `self-workflow init` |
| "新增"章节缺失 | 警告后继续（不强制要求存在） |
