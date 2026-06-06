---
phase: 1
workflow: feat
description: 需求分析阶段产物 — /feat 命令实现
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — 实现 /feat 命令

> 工作流 ID：`feat-实现feat命令-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T16:49:00+08:00
> 参考文档：`docs/feat-command-需求设计.md` (v0.2)、`.self-workflow/configs/guides/feat-workflow.md` (v0.2)

---

## 需求概述

`feat-workflow.md` 是一份 570 行的指引文档，定义了完整的 5 阶段 + 4 Gate 流程。但它是一个"被动文档"——Agent 不会主动加载它，用户也无法通过 slash command 触发。触发完全依赖用户在对话中手动说明，不可靠、不统一。

**目标**：提供 `/feat` 这个确定性的 slash command 入口，一键启动工作流，自动完成目录初始化、元数据创建、阶段推进。

自举场景：本次任务本身即使用 `feat-workflow.md` 流程来执行，实现命令后可在后续任务中通过 `/feat` 启动。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P0 | F1 - 启动工作流 | `/feat <描述>` 启动一个完整的 feat 工作流 | 核心链路 |
| P0 | F2 - workflow-id 生成 | 自动生成 `feat-<slug>-<YYYYMMDD>`，冲突时追加序号（-2, -3...） | slug 支持中文 Unicode |
| P0 | F3 - 目录 + 元数据初始化 | 自动创建 `task.yaml` + `workflow.yaml` + 子目录（adrs/logs/artifacts/errors/） | 基于现有模板 |
| P0 | F4 - 进入阶段 1 | 加载 `feat-workflow.md` 作为执行指引，加载 `interaction-protocol` + `agent-reasoning` Skill，进入需求分析阶段 | 移交控制权给工作流指引 |
| P1 | F5 - 快速模式 | `/feat --quick <描述>` 快速模式，Gate 重量量化的 `user-signal = -1` | 降低快速任务的审查开销 |
| P1 | F6 - 任务仪表盘 | `/feat`（无参数）扫描 `.self-workflow/tasks/` 展示所有任务状态 | 按 in_progress/completed/stuck/cancelled 分组 |
| P1 | F7 - Skills 加载 | 自动加载 `interaction-protocol` + `agent-reasoning` Skill | 不硬编码，由指引驱动 |

---

## 约束条件

### 技术约束

- **语言/格式**：命令定义文件为 Markdown（`.opencode/commands/feat.md`），遵循 OpenCode slash command 规范
- **文件系统**：产物写入 `.self-workflow/tasks/<workflow-id>/`，由安装器确保目录存在
- **模板依赖**：`task.yaml` 参考已有格式（`feat-quality-v15-20260606/task.yaml`），`workflow.yaml` 从 `workflow-metadata-template.yaml` 模板填充
- **时间戳**：遵循 ISO 8601 含时区格式（`YYYY-MM-DDTHH:mm:ss±HH:MM`），如 `2026-06-06T16:12:00+08:00`
- **并发**：不支持多工作流并发执行。仅做检测警告，不提供工作流级别的隔离
- **Git**：Checkpoint 机制使用 Git tag（`<workflow-id>-ph<N>-<name>-gate-passed`），在工作流中由指引驱动

### 业务约束

- **触发语义**：工作流应为用户主动决策行为，Command 提供明确触发语义（"我要开始一个新功能了"），非 Agent 自动行为
- **关注点分离**：`/feat` 命令只负责启动（一次性），阶段执行由 `feat-workflow.md` 指引驱动（持续）
- **安装器集成**：通过 `self-workflow init` 新项目自动安装 `/feat` 命令
- **与现有命令共存**：与 `/adr`（决策记录）、`/catchup`（会话恢复）互补，不重复

---

## 验收标准

### 功能验收

- [ ] **AC1**：Given `.self-workflow/` 目录已初始化，When 执行 `/feat 实现测试功能`，Then 创建完整目录结构（adrs/ logs/ artifacts/ errors/），`task.yaml` + `workflow.yaml` + `errors.yaml` 内容符合模板格式
- [ ] **AC2**：Given 工作流已启动，When 检查 `workflow.yaml`，Then 时间戳为 ISO 8601 含时区格式（`YYYY-MM-DDTHH:mm:ss±HH:MM`）
- [ ] **AC3**：Given 执行 `/feat --quick 修复typo`，When 后续执行阶段时计算 Gate 重量，Then `user-signal = -1` 被纳入三维量化公式
- [ ] **AC4**：Given `.self-workflow/tasks/` 下有 N 个任务目录，When 执行 `/feat`（无参数），Then 仪表盘计数与实际目录数一致
- [ ] **AC5**：Given 同日已有 `feat-user-login-20260606` 目录，When 再次执行同 slug 的 `/feat`，Then workflow-id 自动变为 `feat-user-login-20260606-2`
- [ ] **AC6**：Given slug 冲突超过 10 次，When 执行 `/feat`，Then 报错提示"slug 冲突过多"，不创建目录
- [ ] **AC7**：Given 已有 `status: in_progress` 的任务，When 执行 `/feat`，Then 提示用户确认后再继续（防并发）
- [ ] **AC8**：Given 新项目未执行 `self-workflow init`，When 执行 `/feat`，Then 提示"请先运行 self-workflow init"
- [ ] **AC9**：Given 执行 `self-workflow init`，When 检查 `.opencode/commands/`，Then `feat.md` 文件存在且内容完整
- [ ] **AC10（自举验证）**：Given 在 self-workflow 项目上执行 `/feat 实现测试功能`，When 阶段 1 完成后检查，Then `artifacts/01-analysis.md` 包含 Given-When-Then 格式验收标准，`workflow.yaml` phases[0] 状态为 completed/gate=passed，且 Git tag 存在

### 质量要求

- [ ] slug 生成规则：中文字符保留（U+4E00–U+9FFF, U+3400–U+4DBF），特殊符号替换为 `-`，连续 `-` 压缩，首尾去除，截断 40 字符
- [ ] 所有写入文件的 YAML 格式合法（可被标准 YAML parser 解析）
- [ ] 错误场景的有提示信息（4 种错误场景各覆盖）
- [ ] 安装器 MANIFEST 新增 1 行，package.json 版本迭代

---

## 不纳入范围

- `/feat resume <id>` 恢复已暂停任务 — 由 `/catchup` 命令覆盖
- 阶段专用 Skill 自动切换 — V2 范围，需 Adapter 编译能力
- 多工作流并发执行 — 不支持。仅做检测警告，不提供工作流隔离或冲突解决
- 模板引擎渲染 — 当前直接读写 YAML/Markdown，够用
- 工作流暂停/恢复机制 — 当前仅支持「取消」状态（cancelled），无暂停-恢复语义
- ADR 编号 per-task — 需单独修复 `/adr` 命令
- 每阶段指导增强 — V2 范围

---

## 决策捕捉检查

本阶段以下决策点已在 `docs/feat-command-需求设计.md` 第 4 节记录，无需新 ADR：

| 决策 | 状态 | 备注 |
|------|------|------|
| Command vs Skill | 已记录 | 选 Command，显式触发语义 |
| workflow-id 生成规则 | 已记录 | slug + 日期，冲突追加序号 |
| 初始化 vs 加载分离 | 已记录 | Command 只启动，不执行各阶段 |
| Skills 加载策略 | 已记录 | 不硬编码，由指引驱动 |
| `--quick` 与 Gate 重量量化 | 已记录 | user-signal=-1，三维公式控制 |

> **后续阶段新增决策将触发 `/adr` 命令创建 ADR。**
