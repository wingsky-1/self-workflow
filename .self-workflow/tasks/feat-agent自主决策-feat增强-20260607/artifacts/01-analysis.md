---
phase: 1
workflow: feat
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.11：/feat 增强 + todo 管理 + 内置工具

> 工作流 ID：`feat-agent自主决策-feat增强-20260607`
> 阶段状态：✅ 完成（修订）
> 时间戳：2026-06-07T04:21:29+08:00（创建） / 2026-06-07T04:28:00+08:00（修订）

---

## 需求概述

V1.11 目标：**增强 `/feat` 命令能力、完善 todo 管理机制、将确定性操作内置工具化**。三项互补——/feat 增强让任务启动更自动化，todo 管理让 Agent 可自主维护任务列表，内置 tool 减少 token 消耗。

> ⚠️ 原计划的"自动决策"(#1) 和"无人值守模式"(#7) 已移出本版本，待置信度评估框架成熟后重新设计。

共 6 项任务，分为 2 个主题组：

| 主题 | 关联项 | 核心改动文件 |
|------|--------|------------|
| /feat + todo 管理 | #1 无参认领, #2 todo 更新, #3 todo 整理命令, #4 todo 注入 | feat.md 模板, feat-workflow.md, 新增 command, 注入机制 |
| 规范 + 工具 | #5 歧义澄清 spec, #6 内置 tool | 新增 spec, installer tools/scripts |

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P1 | /feat 无参数认领 | `/feat` 无输入时自动扫描 todo.md，识别未认领版本任务，自动启动工作流 | 来源 todo #18 |
| P1 | /feat 完成后更新 todo | 从 todo 领取任务结束后，自动标记对应项为完成（或更新状态） | 来源 todo #8 |
| P1 | todo 整理排期命令 | Agent 可自主整理 todo 结构、调整优先级、排期，无 Human 实时介入 | 来源 todo #1 |
| P1 | todo 系统注入机制 | 确定 todo.md 内容应注入到哪些 Agent/子 Agent 的上下文中 | 来源 todo #5 |
| P1 | 歧义澄清 spec | 沉淀为 `specs/default/` 规范：Agent 遇到歧义输入时必须质疑，不可自作主张 | 来源 todo #8 |
| P1 | 内置 tool 化 | 确定性操作（获取未完成任务列表、创建 task 目录、读取 task.yaml 等）实现为内置 tool/code | 来源 todo #7 |

> 全部 P1（质量改善），无 P0 阻断项。无强依赖关系，6 项可相对独立实施。

---

## 约束条件

### 技术约束

- **自举架构**：修改 `.self-workflow/configs/` 和 `.self-workflow/specs/` 前，必须先改 `packages/installer/templates/` 中的模板源，运行 `node packages/installer/index.js init --target . --force` 同步
- **禁止直改 .opencode/**：`.opencode/` 中的文件通过安装器部署，不可直接编辑
- **可直改目录**：`.tasks/`、`.docs/` 可直接修改
- **spec 注入机制**：`specs/default/` 下的规范通过 `self-workflow-session` 插件自动注入 system prompt
- **command 机制**：新 command 以 `.md` 文件形式部署到 `.opencode/commands/`
- **Node.js/PowerShell 环境**：内置 tool 需以 Node.js 脚本实现
- **现有 Gate 量化公式**：不可破坏现有 scope+risk+user-signal 三维分值和 Gate weight 映射
- **现有 Checkpoint 机制**：Git tag 方案不可回退
- **现有 review-agent**：对抗性审查机制保持完整，自动决策不能绕过审查（如 review-agent 标记 critical，自动决策不得覆盖）
- **`agent-reasoning.md` 规范**：Agent 自主决策需符合"先判断合理性，必要时提出质疑，再执行"原则
- **已知错误经验引用**：
  - `gate-推理链一致性`：Phase 2 设计如推翻 Phase 1 结论（如决定不实现自动决策而改为其他方案），需在 ADR 中显式反转说明
  - `phase-gate-验证不能形式化`：内置 tool（#8）验证需运行时等价验证，不能仅做静态文件存在性检查

### 业务约束

- **渐进增强**：不破坏现有 `/feat` 工作流，新功能为增强/可选模式
- **向后兼容**：`/feat --quick` 快速模式行为不变；旧 task.yaml 格式仍可读取
- **Human 最终控制权**：自动决策需保留 Human 覆盖入口（无人值守模式除外）；置信度评估标准需可审查
- **默认不改变**：无人值守模式默认关闭，需显式 `--unattended` 标志触发
- **最小侵入**：歧义澄清 spec 作为新 spec 追加到 `default/`，不修改现有 spec 的核心语义

### 已知冲突（Phase 2 设计需解决）

- **todo 注入 vs context budget**：向子 Agent 注入 todo 内容增加上下文长度。Phase 2 需定义注入的上下文预算控制（如：子 Agent 仅注入关键词匹配的版本项摘要，而非完整 todo.md）

> 原"自动决策 vs interaction-protocol"和"无人值守 vs Gate 确认"冲突随 #1/#7 移出版本而消除。

---

## 验收标准

### 功能验收

- [ ] **AC1-/feat 无参数**：Given todo.md 中有未认领的版本任务，When 用户执行 `/feat`（无参数），Then Agent 自动分析 todo、选择最高优先级未认领任务、生成 workflow-id、启动工作流。同优先级时按 todo.md 列表顺序选择第一个未认领项
- [ ] **AC2-/feat 无参数无任务**：Given todo.md 中所有任务均已排入版本或完成，When 用户执行 `/feat`（无参数），Then Agent 展示仪表盘并提示"当前无待认领任务"
- [ ] **AC3-todo 自动更新**：Given 通过 /feat 从 todo 认领并完成了某项任务，When Compound 阶段完成，Then Agent 自动将对应 todo 项标记为 `[done]` 并归档到已关闭
- [ ] **AC4-todo 整理命令**：Given 用户执行 todo 整理命令，When Agent 执行，Then Agent 扫描 todo.md 和 tasks/，可重新排序、合并重复、调整优先级、归档已完成版本，但保留"新增"章节
- [ ] **AC5-todo 注入**：Given Agent 会话启动或 /feat 命令触发，When 注入机制生效，Then todo.md 内容按 Phase 2 确定的注入规则注入到指定上下文：主 Agent 看到版本摘要+未认领项；子 Agent 仅看到与当前 task 关键词匹配的相关版本项
- [ ] **AC6-歧义澄清**：Given 用户输入存在多种解释且会导致 2x+ 工作量差异，When Agent 检测到歧义，Then Agent 使用 question 工具寻求澄清而非选择默认解释
- [ ] **AC7-内置 tool 目录创建**：Given 需要创建 task 目录结构，When 调用内置 tool，Then 按 feat-task.yaml 模板创建完整目录和初始化文件，无需 Agent 逐条 mkdir/write
- [ ] **AC8-内置 tool 任务列表**：Given 需要获取所有未完成任务，When 调用内置 tool，Then 返回结构化的任务列表（JSON），含 workflow-id、标题、当前阶段、状态

### 质量要求

- [ ] 所有变更通过 installer 模板源 → init --force 同步路径
- [ ] 新 spec 的 frontmatter 符合 spec 格式标准（title/type/level/tags/version/summary）
- [ ] 新 command 的 frontmatter 含 description 和 argument-hint
- [ ] 现有 Gate 量化公式不受影响
- [ ] 内置 tool（#6）需有测试覆盖，至少包含正常路径和错误路径
- [ ] 参考已知错误经验：`phase-gate-验证不能形式化`（内置 tool 验证需运行时等价而非仅静态检查）

---

## 不纳入范围

- **自动决策 + 无人值守模式**：从 V1.11 移出，待置信度评估框架成熟后重新设计实现
- **V1.12（经验质量 I）**：docs/ 文档 tag 质量治理、交叉引用、渐进式披露触发条件细化
- **V1.13（经验质量 II）**：经验去重检测、一致性审查、生命周期管理
- **Vx 远期愿景**：子 Agent 架构、debug 工作流、doctor 命令、安装能力增强

---

## 决策捕捉

- [x] **本阶段无架构决策** — 需求分析阶段不涉及方向性决策或多方案对比。架构决策将在阶段 2（方案设计）中产出 ADR。

> 修订记录：2026-06-07 — 依 Human 决策，将 #1（自动决策）和 #7（无人值守模式）移出版本，范围从 8 项缩小至 6 项。移除相关的 AC1/AC2/AC9、置信度质量要求、interaction-protocol 冲突标注。
