# /catchup 系统 (Session Catchup System)

> 所属模块：恢复层
> 文件位置：`.opencode/commands/catchup.md`
> 实现方案：`.self-workflow/docs/实现方案/catchup-命令实现方案.md`

---

## 功能概述

`/catchup` 命令用于**跨会话恢复工作状态**。当用户在新会话中不知道上一次做到了哪里，输入 `/catchup` 即可获得一份结构化的恢复摘要——进行中的任务、未解决的错误、已完成的进度。

## 核心特性

### 1. 5 步恢复流程

```
扫描 task 目录 → 检查未完成任务 → 检查未解决错误 → 生成摘要 → 询问用户
```

### 2. 任务状态扫描

读取 `.self-workflow/tasks/*/task.yaml`，识别：

| 状态 | 含义 | 摘要表现 |
|------|------|---------|
| `in_progress` | 进行中的任务 | 展示当前阶段/总阶段数 + 当前状态 |
| `stuck` | 卡住的任务 | 标注需要人工介入 |
| `cancelled` | 已取消的任务 | 简要提及 |

### 3. 未解决错误汇总

扫描 `.self-workflow/tasks/<task-id>/errors/errors.yaml`，汇总 `resolved: false` 的错误：

```
⚠ 未解决的错误
   - feat-gate-审查增强-20260607：Phase 3 lint 错误 → errors/03-implementation-errors.md
```

### 4. 输出格式

```
📋 Session Catchup — 2026-06-07

▶ 进行中的任务
   - feat-V1.19流程修补-20260607：Phase 2/5，当前状态：design
    建议：继续方案设计

⚠ 未解决的错误
   - feat-xxx：错误描述 → 错误文件路径

✅ 已完成的任务
   - feat-V1.18核心特性-20260607（2026-06-07）
```

---

## 实现路径

### V1.0 — 基础扫描
- task.yaml 状态扫描
- errors.yaml 未解决错误汇总
- 结构化输出

---

## 未来愿景

### V2.x — 智能恢复
- 自动恢复建议（基于错误类型匹配经验库中的解决方案）
- 跨任务依赖关系展示
- 恢复操作一键执行

### V3.x — 自动化
- 会话启动时自动执行轻量版 catchup
- 任务健康度评分

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.opencode/commands/catchup.md` | 命令定义（54 行） |
