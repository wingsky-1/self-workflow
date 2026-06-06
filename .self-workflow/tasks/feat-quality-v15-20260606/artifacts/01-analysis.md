---
phase: 1
workflow: feat
description: V1.5 质量加固——需求分析
---

# 需求分析 — V1.5 质量加固

> 工作流 ID：`feat-quality-v15-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T16:12:00+08:00
> 参考文档：`docs/V1.5-需求设计.md`

---

## 需求概述

V1 完成了 Self-Workflow 的基础框架（安装器、feat 工作流、Review Agent、Session Catchup），但在实际使用中暴露了 8 个流程缺陷，导致工作流在复杂任务中不可靠。四专家联合评审结论：**在 8 个已知缺陷上构建经验系统会导致"垃圾进垃圾出"。质量必须先于功能。**

V1.5 的核心目标是**质量加固**——修复 8 个已知流程缺陷，建立三层质量防线（流程防错、Agent 约束、产物验证），让工作流达到生产可用标准。

### 关键约束

- **不引入新的工作流类型**：仍只有 feat 工作流
- **不引入经验系统**：V2 才会做经验复利系统
- **自举目标**：修复后，能用工作流在 Self-Workflow 项目自身上完成一个真实功能开发
- **不破坏 V1 现有功能**：所有 V1 功能（安装器、Review Agent、Session Catchup）必须保持可用

---

## 功能清单

| 优先级 | 功能点 | 描述 | 所属里程碑 |
|--------|--------|------|-----------|
| P0 | `interaction-protocol` Skill | 将交互式问答优先原则固化为 Skill，安装到 `.opencode/skills/` | M0 |
| P0 | `agent-reasoning` Skill | 将委托优先原则固化为 Skill，安装到 `.opencode/skills/` | M0 |
| P0 | `/adr` Command | 备用安全网——当 Agent 自主决策捕捉遗漏或 Human 需要手动触发时，快速创建 ADR，自动编号、更新 task.yaml。主机制是 Agent 自主触发（参见"决策捕捉嵌入"） | M0 |
| P0 | task.yaml 创建强制 | 工作流启动指引明确要求创建 task.yaml，Review Agent 在 Gate 中检查 | M0 |
| P1 | 方向审查 Gate | 在方案设计 Gate 中增加方向审查节点，识别与现有架构不一致的方案 | M1 |
| P1 | Checkpoint 回溯 | 每阶段完成后自动创建 Checkpoint，支持从阶段 N 回到阶段 M 的非线性回溯 | M1 |
| P1 | 决策捕捉嵌入 | 每阶段末尾嵌入决策捕捉步骤，判断是否需要记录 ADR | M1 |
| P1 | Gate 重量量化 | 用三维量化（scope/risk/user-signal）计算 Gate weight | M1 |
| P1 | 强制质疑流程 | 方案设计阶段入口插入质疑节点，Agent 必须输出质疑报告 | M2 |
| P2 | 检查清单驱动执行 | 每个阶段从自然语言描述改为检查清单驱动 | M2 |
| P2 | Review Agent 行为审查 | 审查范围扩展到主 Agent 行为（决策捕捉、question 工具使用、质疑报告） | M2 |
| P2 | 结构化产物验证 | 产物模板 frontmatter 定义验证规则，Agent 写入后自行检查 | M3 |
| P2 | 交叉引用一致性检查 | Compound 阶段执行交叉引用检查（task.yaml、ADR、文件引用） | M3 |
| P2 | 模板强制使用 | 阶段产物格式必须匹配对应模板，Gate 验证模板必填字段 | M3 |

---

## 约束条件

### 技术约束

1. **语言**：所有 Skill 和 Command 使用 Markdown 格式（OpenCode 原生支持），无需编程语言
2. **平台**：OpenCode 的 Skill 和 Command 机制——需验证 Skill 放在 `.opencode/skills/` 是否自动生效，还是在 `opencode.json` 中注册
3. **ADR 存储路径**：根据 ADR-004/006，ADR 存储于 `.self-workflow/tasks/<task-id>/adrs/`
4. **Review Agent 为只读 Agent**：无代码变更权限，所有审查以报告形式输出
5. **安装器已存在**：V1 已完成安装器，M0 的 Skill 需通过安装器 MANIFEST 部署

### 业务约束

1. **时间**：预计 6 周总周期（M0=1周 + M1=2周 + M2=2周 + M3=1周）
2. **质量要求**：修复后的工作流必须通过自举验证——在 Self-Workflow 项目上完成一个真实功能
3. **兼容性**：不能破坏已有 V1 功能（现有工作流、ADR、templates 等）
4. **不引入经验系统**：所有 V2 相关功能（Compound 经验提取、知识库）推迟

### 待验证问题

1. Skills 自动加载机制：`/opencode/skills/` 目录是否自动生效？（需实测）
2. `/adr` 命令的 task 识别：多个 in_progress task 时取哪个？（建议：最近启动的）
3. Checkpoint 回溯技术实现：底层 Agent 不支持时降级为手动跳转
4. Review Agent 互审可靠性：Review Agent 也是 Agent，谁来审它？（暂时接受"有胜于无"）
5. Gate 量化 vs Human 覆盖：当 Human 要求全量审查时，量化结果是否被覆盖？（允许 Human 覆盖）

---

## 验收标准

### 功能验收

- [ ] M0.1 `interaction-protocol` Skill：Skill 文件存在于安装器模板 `.opencode/skills/interaction-protocol/SKILL.md`，安装后存在于目标目录
- [ ] M0.2 `agent-reasoning` Skill：Skill 文件存在于安装器模板 `.opencode/skills/agent-reasoning/SKILL.md`，Agent 加载后能在收到方向时主动提出质疑
- [ ] M0.3 `/adr` Command（安全网）：Given 当前有 in_progress 的 task，When Human 或 Agent 执行 `/adr` 命令，Then 在 30 秒内创建标准 ADR 文件并更新 task.yaml。主机制为 Agent 自主决策捕捉，`/adr` 为备用触发方式
- [ ] M0.4 task.yaml 强制：Given 启动新工作流，When 快速入门指引中明确要求创建 task.yaml，Then Review Agent 在 Gate 中检查 task.yaml 是否存在
- [ ] M1.1 方向审查 Gate：Given 方案设计阶段，When 提交设计文档，Then 方向审查识别与现有 ADR 不一致的方案，不通过时阻断 Gate
- [ ] M1.2 Checkpoint 回溯：Given 从阶段 3 需要回到阶段 1，When 执行回溯，Then 跳过已通过的 Gate 2，只验证被修改的产物
- [ ] M1.3 决策捕捉嵌入：Given 阶段执行完成，When 进入 Gate 之前，Then Agent 主动询问是否有需要记录的决策
- [ ] M1.4 Gate 重量量化：Given `feat-workflow.md` 中原有模糊的"≤ 3 个文件"降级描述，When 替换为三维量化标准（scope/risk/user-signal），Then 计算结果示例：typo 修复→skip（≤ -1），新增功能→light（=0），重构核心→full（≥ 1）
- [ ] M2.1 强制质疑流程：Given 进入方案设计阶段，When 启动方案设计，Then Agent 先输出质疑报告再进入设计
- [ ] M2.2 检查清单驱动：Given 查看任意阶段的执行内容，When 阅读阶段描述，Then 内容以检查清单形式组织，每个检查项无歧义
- [ ] M2.3 行为审查：Given Review Agent 执行审查，When 输出审查报告，Then 报告包含 behavior 维度（passed/warning/failed）
- [ ] M3.1 结构化验证：Given 产物模板包含 validation 字段，When Agent 写入产物后，Then 自行检查必填字段是否填写
- [ ] M3.2 交叉引用：Given 工作流完成时，When 执行 Compound 阶段，Then 自动检查 task.yaml artifacts 引用断裂
- [ ] M3.3 模板强制：Given Gate 验证阶段产物，When 产物模板必填字段缺失，Then Gate 不通过

### 质量要求

- [ ] 所有 V1 已有功能不受影响（安装器、Review Agent、Session Catchup）
- [ ] 新增文件均按照现有目录结构规范存放
- [ ] 所有 Gate 权重可量化，不再依赖 Agent 主观判断
- [ ] 自举验证：用 V1.5 工作流在 Self-Workflow 项目上完成一个真实功能

---

## 不纳入范围

- 经验复利系统（V2 范围）
- debug/doc/review 工作流类型（V2 范围）
- Compound 经验自动晋升和检索（V2 范围）
- 平台化、多 Agent 功能（V3+ 范围）
- 新增编程语言或运行时依赖
- 修改 V1 已有的安装器架构
