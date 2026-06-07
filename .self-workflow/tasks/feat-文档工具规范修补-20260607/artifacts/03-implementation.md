---
phase: 3
workflow: feat
description: V1.22 Phase 3 代码实现记录 — 6 文件修改 + init --force 同步
validation:
  required-fields:
    - "变更清单"
    - "实施记录"
  required-format:
    "变更清单": "逐文件 diff 摘要"
---

# 代码实现 — V1.22：文档/工具规范修补（P1/P2）

> 工作流 ID：`feat-文档工具规范修补-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T22:10:00+08:00

---

## 变更清单

| # | 文件（模板源） | 变更 | 行数变化 |
|---|-------------|------|---------|
| 1 | `specs/default/decision-record.md` | 新增时间约束段 + 判断流程 + 版本 1.2.0→1.3.0 | +9 -2 |
| 2 | `configs/guides/feat-workflow.md` | 5 个 Phase checklist 决策捕捉强化（触及/未触及分支） + 版本 0.5→0.6 | +8 -8 |
| 3 | `specs/default/todowrite-display.md` | M-1 即时性约束 + S-1 表同步 + 版本 1.0.0→1.1.0 | +9 -3 |
| 4 | `specs/default/agent-reasoning.md` | 新增"工具选择优先"子节 + 版本 1.0.0→1.1.0 | +13 -2 |
| 5 | `commands/feat.md` | 步骤 0 新增 session 重命名说明 + 步骤 1 slug 生成后调用 sw_session_rename | +2 -0 |
| 6 | `plugin/self-workflow-session.ts` | 新增 sw_session_rename 工具 + currentSessionID 捕获（过滤子 Agent） | +27 -2 |

---

## 实施记录

### decision-record.md（修改 1.1）

在"触发条件"段之后、"存储结构"之前新增：

- **时间约束段**：明确 Phase 2 产出涉及触发场景时，MUST 在编写 `02-design.md` 前先创建独立 ADR 文件
- **判断流程**：3 步判断（触及场景？→ 不确定？→ 不涉及？）
- **措辞修正**：ADR 完整内容在独立文件中，产物可含引用摘要——解除与 design-template.md 的 required-fields 矛盾

### feat-workflow.md（修改 2.1-2.2）

全局替换两处模式：
- `如果本阶段有架构决策` → `若本阶段产出触及 decision-record.md 的触发场景`（5 处 Phase 1/2/3/4/5）
- `有决策则必有文件` → `若触及触发场景则必有文件，否则显式标注判断依据`（4 处 Phase 1/2/3/4/5 声明项）

### todowrite-display.md（修改 3.1-3.2）

- M-1 从"阶段入口创建条目"强化为"第一个产出操作时创建"，增加定义说明、排除项（task.yaml 状态更新、准备性读取）
- S-1 表"进入新 Phase"更新为"进入新 Phase（入口即时）"

### agent-reasoning.md（修改 4.1）

在"委托决策"之后新增"工具选择优先"子节：
- sw_task_* 系列模式匹配（非硬编码列表）
- task() 作为降级选择
- MUST 使用内置工具规则

### feat.md（修改 5.1）

- 步骤 0：新增第 4 项 "Session 重命名"说明
- 步骤 1：slug 生成后新增"调用 sw_session_rename"步骤

### self-workflow-session.ts

- 新增 `currentSessionID` 模块变量
- `event` hook 中通过 `parent_id` 过滤子 Agent session，仅捕获主 session ID
- 新增 `sw_session_rename` 工具：通过 `input.client.session.update()` 调用官方 REST API

### 同步

运行 `node packages/installer/index.js init --target . --force`，45 项同步成功，6 个修改文件正确部署到运行时目录。

---

## 验收对照

| AC | 状态 | 证据 |
|----|------|------|
| AC-1.1 | ✅ | decision-record.md 含时间约束段 + 判断流程，引用触发场景 |
| AC-1.2 | ✅ | MUST 措辞含"先于产物创建独立文件"的时间约束 |
| AC-1.3 | ✅ | feat-workflow.md 5 个 Phase checklist 均更新为"若触及...，否则显式标注" |
| AC-2.1 | ✅ | todowrite-display.md M-1 含"第一个产出操作"定义 + 排除项 |
| AC-2.2 | ✅ | S-1 表"进入新 Phase"更新为"进入新 Phase（入口即时）" |
| AC-3.1 | ✅ | agent-reasoning.md 新增"工具选择优先"子节，含 sw_task_* 模式匹配 |
| AC-3.2 | ✅ | 列出 sw_task_* 系列作为优先检查目标 |
| AC-4.1 | ✅ | feat.md 步骤 0 含 session 重命名说明 + 步骤 1 调用 sw_session_rename |
| AC-4.2 | ✅ | init --force 同步后模板源与部署副本一致 |
| Q-1 | ✅ | 所有文件 YAML frontmatter 格式正确 |
| Q-2 | ✅ | init --force 无报错 |
| Q-3 | ✅ | MUST/SHOULD/MAY 层级未引入矛盾 |
| Q-4 | ✅ | git diff 确认模板源与部署副本一致（无需人工校准的差异） |

---

## 决策捕捉

- [x] 本阶段无新增架构决策（ADR-001 已在 Phase 2 创建）
