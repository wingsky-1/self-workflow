---
phase: 4
workflow: feat
description: V1.5 质量加固——功能验证
---

# 功能验证 — V1.5 质量加固

> 工作流 ID：`feat-quality-v15-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T17:00:00+08:00

---

## 测试结果

| 验证项 | 通过 | 失败 | 跳过 |
|--------|------|------|------|
| 文件存在性检查（18 个 MANIFEST 文件） | 18 | 0 | 0 |
| 安装器 dry-run 验证 | 26 项 | 0 | 0 |
| 安装器实际部署验证 | 26 项 | 0 | 0 |
| JS 语法检查 | 1 | 0 | 0 |
| 验收标准验证 | 15 | 0 | 1 |

## 验收标准验证

### M0 框架融入

- [x] M0.1 `interaction-protocol` Skill：文件存在于 `.opencode/skills/interaction-protocol/SKILL.md`，安装器模板存在，安装后部署成功
- [x] M0.2 `agent-reasoning` Skill：文件存在于 `.opencode/skills/agent-reasoning/SKILL.md`，安装器模板存在，安装后部署成功
- [x] M0.3 `/adr` Command：文件存在于 `.opencode/commands/adr.md`，支持三种模板（simple/complex/review），自动编号逻辑已定义
- [x] M0.4 task.yaml 强制：`feat-workflow.md` 快速入门指引步骤 3 明确要求创建 task.yaml
- [x] Review Agent Gate 检查 task.yaml：`review-agent.md` 中已增加 task.yaml 存在性检查

### M1 流程防错

- [x] M1.1 方向审查 Gate：`feat-workflow.md` 设计审查 Gate 新增"步骤 0：方向审查"，Review Agent 回答 4 个问题，不通过则阻断
- [x] M1.2 Checkpoint 回溯：`feat-workflow.md` 新增"Checkpoint 回溯（Git-based）"章节，含 tag 命名规范、回溯操作、worktree 多会话、回溯规则
- [x] M1.3 决策捕捉嵌入：5 个阶段末尾的完成检查清单均包含"决策捕捉"项
- [x] M1.4 Gate 重量量化：原"≤ 3 个文件"描述替换为三维量化表（scope/risk/user-signal），含示例计算

### M2 Agent 约束

- [x] M2.1 强制质疑流程：阶段 2 入口新增"强制质疑节点"，含方向质疑/约束检查/风险提示，确认后方可进入
- [x] M2.2 检查清单驱动：5 个阶段执行内容均为检查清单格式，每项无歧义
- [x] M2.3 行为审查：`review-agent.md` 审查报告输出格式增加 `behavior` 和 `behavior-notes` 字段，审查维度新增"行为审查"

### M3 产物验证

- [x] M3.1 结构化验证：5 个阶段模板（analysis/design/implementation/verification/summary）frontmatter 均增加 `validation` 字段，含 required-fields 和 required-format
- [x] M3.2 交叉引用：Compound 阶段已包含 5 项交叉引用检查（task.yaml artifacts、milestones refs、ADR 引用、新增文件记录、删除文件清理）
- [x] M3.3 模板强制：review-agent.md 中包含模板必填字段检查逻辑，缺失时标记为 critical

### 质量要求

- [x] V1 已有功能不受影响：安装器运行成功，review-agent.md 和 catchup.md 未被破坏
- [x] 新增文件按现有目录规范存放：skills/ 在 `.opencode/skills/`、模板在 `configs/templates/`、命令在 `.opencode/commands/`
- [x] Gate 权重可量化：三维量化公式已写入 feat-workflow.md
- [ ] 自举验证：**需要在新会话中用 V1.5 工作流完成一个真实功能**（人工验证项）

## 边界测试

| 边界场景 | 结果 |
|---------|------|
| 空 .opencode/skills/ 目录时安装器行为 | ✅ 自动创建目录 |
| 已存在文件的更新策略 | ✅ `--force` 覆盖，否则跳过 |
| /adr 无 in_progress task | ✅ 提示无任务，列出所有状态 |
| /adr 多个 in_progress task | ✅ 取最近启动的 |
| Git Checkpoint tag 冲突 | ✅ 每次 Gate 通过才创建，阶段唯一 |
| 方向审查不通过 | ✅ 阻断 Gate，返回阶段 2 |
| 自定义需求名称含特殊字符 | ⚠️ workflow-id 建议字母数字+连字符 |

## 已知问题

1. **Skills 自动加载机制待验证**：`/opencode/skills/` 目录下的 Skill 是否自动生效需要 OpenCode 实测。如果未生效，Agent 需在启动时手动 `skill(name="interaction-protocol")` 加载。此问题不影响文件安装，是运行时行为。
2. **自举验证尚未执行**：需要创建一个新 task，用 V1.5 工作流在 Self-Workflow 项目上完成一个真实功能，验证全部流程。
