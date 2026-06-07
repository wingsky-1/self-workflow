# Todo 管理系统 (Todo Management System)

> 所属模块：规划层
> 文件位置：`.self-workflow/todo.md` + `.opencode/commands/todo-organize.md`
> 实现方案：`.self-workflow/docs/实现方案/todo-organize-命令实现方案.md`

---

## 功能概述

Todo 管理系统负责项目级的**版本规划和任务排期**。它是三层待办机制的最顶层——定义"要做什么"，中间层 task.yaml 定义"正在做什么"，底层 todowrite 定义"现在在做什么"。

## 核心特性

### 1. 三层待办机制

| 机制 | 层级 | 受众 | 生命周期 | 文件 |
|------|------|------|---------|------|
| **todo.md** | 项目级 | Human + Agent | 跨版本、跨 Agent | `.self-workflow/todo.md` |
| **task.yaml** | 任务级 | Agent | 跨会话、持久化 | `.self-workflow/tasks/*/task.yaml` |
| **todowrite** | Agent 级 | Human（主） | 当前会话、实时 | OpenCode 内置 |

### 2. todo.md 结构

```markdown
# Todo

## V1.19：/feat 流程修补（P1/P2）🟢
1. Phase 4→5 增加文档更新步骤 → 来源：新增 #6
2. todo 已关闭版本迁移至 done.md → 来源：新增 #3

## Vx：远期愿景（P2）🟢
- 子 Agent 执行拆分 ... <放到V2.0>

## 延后（待设计/更多观察）
- ...

## 新增（待评审排期）
1. 评审哪些docs经验具有普适性...

## 已关闭
<details>
<summary>V1.18：核心特性实现方案 — 1/1 项完成</summary>
...
</details>
```

**章节说明**：
- **活跃版本**：`## Vx.y.z` 格式，包含待完成项
- **远期愿景**：已识别但近期不排期
- **延后**：方向对但设计不清晰，标注原因和前置条件
- **新增**：待评审排期的收件箱
- **已关闭**：`<details>` 折叠的已完成版本

### 3. 优先级框架

| 优先级 | 判断条件 | 示例 |
|--------|---------|------|
| **P0** | 框架核心机制不工作/被绕过 | Gate 纪律强化 |
| **P1** | 直接影响当前每轮对话质量 | Gate 提交前自检清单 |
| **P2** | 效率/体验改善，非阻塞 | 迭代报告反哺优化 |

### 4. /todo-organize 命令

5 阶段自动整理流程：

| 阶段 | 内容 |
|------|------|
| **阶段 1：读取现状** | 读取 todo.md + 项目上下文（README、specs、commands） |
| **阶段 2：评审新增项** | 逐项评估优先级（P0/P1/P2）、归属版本、合并判断 |
| **阶段 3：整理活跃版本** | 归档已完成版本、调整优先级、重排序、合并重复 |
| **阶段 4：生成排期建议** | 排期建议表 + 逐版本项数校验 |
| **阶段 5：确认写入** | question 工具展示 → Human 确认 → 写入 |

### 5. /feat 自动关联

- **无参数模式**：读取 todo.md 版本段 → 自动认领第一个未认领版本
- **Compound 阶段**：自动更新关联版本段的所有项为 `[done]`，全部完成则移入"已关闭"

---

## 实现路径

### V1.5.2 — Todo 体系优化
- 优先级(P0/P1/P2) + 版本标记
- 已完成/已拒绝项归档机制

### V1.11 — /todo-organize + 自动关联
- /todo-organize 命令（5阶段流程）
- /feat 无参数模式自动认领
- Compound 自动更新 todo 状态

---

## 未来愿景

### V2.x — 智能化排期
- 经验反哺优先级判断
- 依赖关系自动检测

### V3.x — 用户体验
- 更灵活的版本规划视图
- 跨项目 todo 关联

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.self-workflow/todo.md` | 项目级待办（版本规划） |
| `.opencode/commands/todo-organize.md` | /todo-organize 命令 |
| `.self-workflow/specs/default/todowrite-display.md` | todowrite 可视化规范 |
