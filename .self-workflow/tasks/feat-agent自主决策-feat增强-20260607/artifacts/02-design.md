---
phase: 2
workflow: feat
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — V1.11：/feat 增强 + todo 管理 + 内置工具

> 工作流 ID：`feat-agent自主决策-feat增强-20260607`
> 阶段状态：✅ 完成（审查后修订）
> 时间戳：2026-06-07T04:30:00+08:00（创建） / 2026-06-07T11:40:00+08:00（修订）

---

## 架构决策记录

> ADR 完整内容见 `adrs/` 目录。以下为决策摘要和引用。

| ADR | 决策 | 核心选择 | 文件 |
|-----|------|---------|------|
| 001 | /feat 无参数认领策略 | 版本段认领——正则提取版本号精确匹配，第一个无 in_progress 版本自动启动 | [ADR-001](../adrs/ADR-001-无参数认领策略.md) |
| 002 | todo 注入策略 | 仅 feat command prompt 中注入，不修改 Plugin；子 Agent 由主 Agent 显式传递 todo 摘要 | [ADR-002](../adrs/ADR-002-todo注入策略.md) |
| 003 | 内置 tool 实现方式 | **结构化工具（MCP Server）**——参照 OpenCode 工具模式，类型化参数+结构化返回值 | [ADR-003](../adrs/ADR-003-内置tool实现方式.md) |
| 004 | 歧义澄清 spec 关系 | 互补——新 spec 定义"何时问"（extends interaction-protocol），interaction-protocol 定义"如何问" | [ADR-004](../adrs/ADR-004-歧义澄清spec关系.md) |

### 审查后精化

| 问题 | 修复 |
|------|------|
| **ADR 存储违规** | 从 02-design.md 内联改为 adrs/ 独立文件，更新 task.yaml structure.adrs |
| **版本号匹配脆弱** | 正则 `/V\d+\.\d+(?:\.\d+)?/` 提取 + 精确比对（非子串），大小写敏感 |
| **内置 tool 模式** | 从 CLI 脚本改为 MCP Server 结构化工具（sw_task_list/create/read/phase_update） |
| **todo 组织命令路径** | `packages/installer/templates/commands/todo-organize.md` → installer 部署 |
| **歧义 spec 引用** | frontmatter `extends: interaction-protocol.md` + 正文引用块 |

---

## 接口设计

### 1. /feat 无参数认领（feat.md 命令 prompt 变更）

```
输入：/feat（无参数）
行为：
  1. 调用 sw_task_list 获取进行中任务
  2. 读取 todo.md，解析版本段，提取版本号（正则 /V\d+\.\d+(?:\.\d+)?/）
  3. 排除已有关联 in_progress 任务的版本段
  4. 选择第一个未认领版本段
  5. 按现有 /feat <描述> 流程启动（生成 slug → 创建目录 → 进入阶段 1）
  6. 无未认领版本 → 展示仪表盘（保持现有行为）
错误处理：todo.md 不存在 → 提示运行 init
```

### 2. /feat 完成后更新 todo（feat-workflow.md Compound 步骤追加）

```
输入：Compound 阶段执行
行为：
  1. 从 task.yaml description 提取版本号
  2. 定位 todo.md 对应版本段的每一项
  3. 为每项追加 [done] 标记
  4. 版本段所有项完成后，移入已关闭（<details> 折叠）
  5. 不修改"新增"章节
错误处理：找不到匹配 → 跳过（记录到 errors.yaml，severity: minor）
```

### 3. todo 整理排期命令（新 command）

```
命令名：/todo-organize
部署路径：packages/installer/templates/commands/todo-organize.md → .opencode/commands/
参数：无（或 --dry-run 预览）
行为：
  1. 读取 todo.md
  2. 合并重复项（保留一个 + 标注来源）
  3. 调整优先级标注
  4. 归档已完成版本到"已关闭"
  5. 重新排序版本段
  6. 保留"新增（待评审排期）"章节不变
  7. 输出 diff 预览，Human 确认后写入
```

### 4. todo 注入（feat.md command prompt 内嵌指令）

```
触发时机：/feat 命令执行时
实现方式：在 feat.md 的 prompt 中嵌入指令，Agent 读取 todo.md 获取上下文
子 Agent 传递：主 Agent 在 task() prompt 中显式传递当前版本的 todo 项摘要
不修改 self-workflow-session.ts Plugin
```

### 5. 歧义澄清 spec（新 spec 文件）

```
文件路径：specs/default/ambiguity-clarification.md
frontmatter：
  title: "歧义澄清"
  type: spec
  level: default
  tags: [ambiguity, question, clarification, interaction]
  version: 1.0.0
  summary: "遇到歧义输入时必须使用 question 工具澄清，不可自作主张"
  extends: interaction-protocol.md
正文首段引用块：
  > 补充 interaction-protocol.md 的触发条件。执行格式遵守 interaction-protocol.md 的 question 使用规则。
```

### 6. 内置 tool（Plugin tool hook）

```
实现方式：MCP Server，注册为 OpenCode 一等工具
部署路径：packages/installer/mcp/task-server.js

工具接口（参照 OpenCode 工具参数格式）：

sw_task_list：
  - 描述：扫描 tasks/*/task.yaml，返回所有任务状态
  - 参数：status (optional) — in_progress/pending/completed/cancelled
  - 返回：[{workflowId, title, status, currentPhase, created, updated}]

sw_task_create：
  - 描述：从 feat-task.yaml 模板创建完整 task 目录结构
  - 参数：slug (required), title (required), description (optional)
  - 返回：{workflowId, path, created}

sw_task_read：
  - 描述：读取指定 task.yaml，返回结构化数据
  - 参数：workflowId (required)
  - 返回：完整 task.yaml 解析结果

sw_task_phase_update：
  - 描述：更新 task.yaml 中指定 phase 的状态
  - 参数：workflowId (required), phaseId (1-5, required), status (required), gate (optional)
  - 返回：{updated}
```

---

## 数据模型

### 无新增文件级数据模型

本版本主要是 prompt/指令层 + 工具层的修改。现有 task.yaml schema 已足够。

### task.yaml description 字段补充约定

```yaml
# 首行格式约定：Vx.y <空格> or Vx.y.z <空格>...
# 用于 sw_task_list 和 /feat 自动认领的版本号提取
description: >
  V1.11 版本——增强 /feat 命令...
```

### todo.md 项状态约定

- `[done]` = 已完成 → Compound 阶段追加，归档时识别
- 无标记 = 待完成
- todo 整理命令可追加完成标注

---

## 实施顺序

| 顺序 | 项 | 理由 |
|------|-----|------|
| 1 | #6 内置 tool（MCP Server） | 基础设施——sw_task_list 被 /feat 无参数认领依赖 |
| 2 | #4 todo 注入（feat.md prompt） | /feat 无参数认领需 todo 上下文 |
| 3 | #1 /feat 无参数认领 | 依赖 #2（感知 todo）+ #6（查 in_progress 任务） |
| 4 | #2 /feat 完成后更新 todo | 依赖 #1（认领流程就绪） |
| 5 | #5 歧义澄清 spec | 独立——仅新增 spec 文件到 installer 模板 |
| 6 | #3 todo 整理命令 | 独立——仅新增 command 文件到 installer 模板 |

---

## 决策捕捉

- [x] ADR 已创建：见 [adrs/](../adrs/)
  - [ADR-001-无参数认领策略.md](../adrs/ADR-001-无参数认领策略.md)
  - [ADR-002-todo注入策略.md](../adrs/ADR-002-todo注入策略.md)
  - [ADR-003-内置tool实现方式.md](../adrs/ADR-003-内置tool实现方式.md)
  - [ADR-004-歧义澄清spec关系.md](../adrs/ADR-004-歧义澄清spec关系.md)
- [x] **决策声明**：4 项 ADR 已创建为独立文件，覆盖全部架构决策
- [x] task.yaml structure.adrs 已更新
- [x] 修订记录：审查后修复——ADR 拆分、版本匹配规则、tool 模式重设计、部署路径明确化
