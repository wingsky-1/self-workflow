---
title: "Review Agent 系统实现方案"
category: 实现方案
tags: [review-agent, adversarial-review, gate, quality]
date: 2026-06-07
source: tasks/feat-核心特性-实现方案-文档化-20260607
quality: verified
---

# Review Agent 系统实现方案

> 最后更新：2026-06-07

## 模块定位

Review Agent 是 /feat 工作流 Phase Gate 的独立审查模块——在每个阶段产物产出后，以对抗性立场（Grill 风格）替代议性评估，输出结构化 YAML 审查报告。

**一句话**：没有修改权限的独立审查者，只输出报告，不修改代码。

与 Gate 审查机制的关系：

- **Gate 审查机制**（`gate-审查机制实现方案.md`）定义 Gate 的编排逻辑——何时、以何种 weight 触发哪些审查步骤
- **Review Agent** 定义审查的执行体——如何审查、输出什么格式、检查哪些内容
- 两者协作：Gate 编排流程，Review Agent 提供审查能力；Gate 根据 Review Agent 的报告做通过/不通过决策

## 架构概览

### 权限模型

Review Agent 是只读 Agent，由 OpenCode 的 `permission` 字段强制执行：

| 操作 | 权限 | 说明 |
|------|------|------|
| read | allow | 读取阶段产物、Spec 规则、决策记录 |
| glob | allow | 文件模式匹配搜索 |
| grep | allow | 文件内容搜索 |
| list | allow | 目录列出 |
| edit | deny | 不能修改任何文件 |
| bash | deny | 不能执行任何 shell 命令 |

这意味着 Review Agent **无法**：
- 修改产物文件来"修复"问题
- 运行测试或 lint 来验证
- 创建 Git tag 或 commit

它只能阅读、分析、输出报告。

### 调用架构

```
主 Agent (Gate 入口)
    |
    +-- 计算 Gate weight (scope + risk + user-signal)
    |
    +-- 如 weight = full：
    |   task(subagent_type="review-agent", prompt="<Grill 风格提示词>")
    |       |
    |       +-- 读取 artifacts/ 阶段产物
    |       +-- 读取 adrs/ 决策记录
    |       +-- 读取相关 Spec（若存在）
    |       |
    |       +-- 逐项对抗性审查
    |       +-- 输出 YAML 审查报告
    |       |
    |       +-- Review Agent 退出
    |
    +-- 主 Agent 处理报告
        +-- 有 critical -> 返回当前阶段修复
        +-- 无 critical -> 通过 Gate -> 创建 checkpoint
```

### 审查风格：Grill 对抗式

Review Agent 不信任任何产物——它以"事先假设有问题"的立场逐项挑战：

- **设计审查**：挑战架构决策的备选方案是否充分评估、选择理由是否成立、隐含假设是否被挑战、trade-off 是否被记录
- **实现审查**：逐项对照设计文档的接口定义，找出任何偏差；检查遗漏、隐性变更、代码质量、安全
- **验证审查**：质疑验证报告中的每个"通过"项——是否有实质证据？是否仅做了文件存在性检查？

### 审查维度

| 维度 | 检查内容 |
|------|---------|
| 规范遵循 | 是否符合项目 Spec（如有） |
| 质量检查 | 代码质量、测试覆盖、边界处理 |
| 安全审查 | 常见安全漏洞 |
| 设计一致性 | 是否与现有架构一致 |
| 文档完整性 | 相关文档是否同步更新 |
| 行为审查 | 主 Agent 行为（决策捕捉、question 工具使用、质疑报告） |
| 实现方案文档 | 主 Agent 是否对 `docs/实现方案/` 文档做了显式决策（创建/更新/跳过/询问用户） |

### 严重级别体系

| 级别 | 含义 | 阻断性 | Gate 行为 |
|------|------|--------|-----------|
| critical | 阻断性问题（安全漏洞、功能错误、Spec 违规） | blocking | 不通过，必须修复 |
| warning | 非阻断性问题（质量、风格、覆盖不足） | non-blocking | 可通过，但记录 |
| info | 建议项 | non-blocking | 仅记录，不影响 Gate |

### behavior 维度

2026-06 新增的行为评估维度，评估主 Agent 的执行行为是否规范：

```
behavior: passed | warning | failed
```

| 值 | 含义 |
|----|------|
| passed | 主 Agent 行为规范（执行了决策捕捉、使用了 question 工具、质疑报告充分） |
| warning | 行为有轻微偏离 |
| failed | 行为严重偏离（如未执行决策捕捉、未使用 question 工具） |

## 关键数据流

### 1. 审查报告输出格式

Review Agent 的所有输出以 YAML 结构化为核心：

```yaml
review-report:
  scope: "<审查范围>"
  workflow: "<workflow-id>"
  gate: "<gate-name>"
  summary: "<审查摘要>"
  behavior: passed | warning | failed
  behavior-notes: "<行为偏离说明（如非 passed）>"
  findings:
    - severity: critical | warning | info
      location: "<文件路径:行号>"
      description: "<问题描述>"
      rule: "<规则 ID（如有 Spec）>"
      evidence: "<具体证据>"
      suggestion: "<改进建议>"
      status: blocking | non-blocking
  pass: true | false
  recommended-action: "<建议操作>"
```

### 2. 强制检查项

无论是否有 Spec，Review Agent 在每个 Gate 审查中必须执行以下检查：

#### 2.1 task.yaml 存在性与 Schema 检查

1. 检查当前 task 目录下是否存在 `task.yaml`
2. 如果不存在 -> 标记为 critical，建议创建
3. 如果存在 -> 验证：
   - `status`、`milestones` 字段是否完善
   - 有 `phases` 段 -> 新 schema：验证 phases 数组至少有 5 个元素，每个 phase 包含 `status`/`gate` 字段
   - 无 `phases` 段 -> 旧 schema：标记为 info，提示建议迁移到新 schema

#### 2.2 决策捕捉检查

1. 检查当前阶段的产物中是否包含"决策捕捉"记录
2. 如果阶段的 Gate 已通过但没有决策捕捉记录，且阶段涉及了架构选择 -> 标记为 warning

#### 2.3 行为审查

评估主 Agent 的执行行为：
1. 是否执行了决策捕捉？
2. 是否按要求使用 question 工具（涉及 2+ 选项时）？
3. 质疑报告是否充分（设计阶段入口）？

#### 2.4 实现方案文档决策检查（2026-06 新增）

当 Gate 2/3 weight=full 时，审查主 Agent 是否对 `docs/实现方案/` 文档做了显式决策输出：
- 如未输出任何决策 -> warning
- 如输出"跳过"但 artifacts 中明确列出了 >=2 个模块/组件的接口设计 -> warning

此检查为非阻断（warning 级别）。当 Gate weight=skip 时，由 Compound 步骤 4.5 作为兜底检查。

### 3. 无 Spec 时的行为

如果项目没有定义 Spec，Review Agent 退化为通用质量审查：
- 代码风格一致性
- 常见反模式
- 安全漏洞
- 测试覆盖

### 4. 各 Gate 调用场景

| Gate | 调用途径 | 审查对象 | 审查重点 |
|------|---------|---------|---------|
| Gate 1（分析审查） | 步骤 2 对抗性审查 | `01-analysis.md` | 需求理解、功能清单覆盖、验收标准可测试性、约束条件识别 |
| Gate 2（设计审查） | 步骤 0 方向审查 | `02-design.md` | 架构一致性、替代方案评估、约束遗漏、影响范围 |
| Gate 2（设计审查） | 步骤 2 对抗性审查（Grill） | `02-design.md` + `01-analysis.md` | 架构决策充分性、交叉推理链一致性、behavior |
| Gate 3（实现审查） | 步骤 2 对抗性审查 | `03-implementation.md` + `02-design.md` | 设计一致性、遗漏功能、隐性变更、代码质量、安全 |
| Gate 4（验证审查） | 步骤 2 对抗性审查 | `04-verification.md` + `01-analysis.md` | 验证证据真实性、验收标准逐条对照、反向检查、边界条件 |

## 设计决策依据

- `docs/关键决策/对抗性审查提示词-Grill+COT策略.md` — 决定采用按 Gate 差异化提示词 + COT 推理链策略，而非统一模板
- `docs/错误经验/gate-推理链一致性-错误经验.md` — 跨阶段推理链断裂问题的纠正措施：Gate 审查必须交叉对照前置阶段的约束章节
- `docs/错误经验/phase-gate-验证不能形式化.md` — 验证审查必须避免静态文件存在性检查，要求运行时等价验证
- `docs/实现方案/gate-审查机制实现方案.md` — Gate 编排逻辑的整体架构；Review Agent 作为 Gate 的审查执行体与之协作
- `.opencode/agents/review-agent.md` — Review Agent 的权威定义（权限模型、审查流程、强制检查项）
- `.self-workflow/configs/templates/review-report-template.md` — 审查报告的 Markdown 展示模板

## 变更记录

| 日期 | 任务 | 变更摘要 |
|------|------|---------|
| 2026-06-07 | feat-核心特性-实现方案-文档化-20260607 | 初始版本；基于 `.opencode/agents/review-agent.md` 和 `feat-workflow.md` Gate 章节编写；引用 Grill+COT 策略关键决策和推理链一致性错误经验 |
