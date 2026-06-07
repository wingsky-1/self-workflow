# 审查系统 (Review System)

> 所属模块：质量层
> 文件位置：`.opencode/agents/review-agent.md`
> 实现方案：`.self-workflow/docs/实现方案/review-agent-系统实现方案.md`

---

## 功能概述

审查系统由一个**只读的审查 Agent** 组成，在 /feat 工作流的每个 Gate 处对阶段产物进行对抗性审查。它没有任何代码修改权限——输出是结构化审查报告，不是代码变更。

## 核心特性

### 1. 只读权限模型

```yaml
permission:
  edit: deny    # 不能修改代码
  bash: deny    # 不能执行命令
  read: allow   # 可以读取文件
  glob: allow   # 可以搜索文件
  grep: allow   # 可以文本搜索
```

审查 Agent 的职责是**发现问题**，修复由主 Agent 执行。

### 2. Grill 风格审查（对抗性）

与传统"确认型审查"不同，审查 Agent 采用 **Grill（烧烤）风格**：

- **默认假设产出有缺陷**，主动寻找问题
- **逐项挑战**设计/实现决策，而非泛泛确认
- **要求证据**：不信任任何标记为"通过"的项
- **推理链输出**：每项检查需说明"检查了什么 → 发现了什么证据 → 如何得出结论"

### 3. 7 个审查维度

| 维度 | 检查内容 |
|------|---------|
| **规范遵循** | 是否符合项目 Spec |
| **质量检查** | 代码质量、测试覆盖、边界处理 |
| **安全审查** | 常见安全漏洞（注入、越权、数据泄露） |
| **设计一致性** | 是否与现有架构一致、接口/数据模型偏差 |
| **文档完整性** | 相关文档是否同步更新 |
| **行为审查** | 主 Agent 行为（决策捕捉、question 工具使用、质疑报告） |
| **实现方案文档** | 是否对 docs/实现方案/ 做出显式决策 |

### 4. 强制检查项（无 Spec 也执行）

无论项目是否定义了 Spec，每个 Gate 必须执行以下检查：

1. **task.yaml 存在性与 Schema 检查**：验证 phases 数组至少 5 个元素，每个含 status/gate 字段
2. **决策捕捉检查**：阶段涉及架构选择时，adrs/ 下必须有 ADR 文件
3. **行为审查**：评估主 Agent 是否执行决策捕捉、使用 question 工具、产出质疑报告

### 5. 结构化输出（YAML）

```yaml
review-report:
  scope: "<审查范围>"
  workflow: "<workflow-id>"
  gate: "<gate-name>"
  summary: "<审查摘要>"
  behavior: passed | warning | failed
  findings:
    - severity: critical | warning | info
      location: "<文件路径:行号>"
      description: "<问题描述>"
      evidence: "<具体证据>"
      suggestion: "<改进建议>"
      status: blocking | non-blocking
  pass: true | false
```

### 6. Gate 专有审查策略

| Gate | 审查重点 | 特殊步骤 |
|------|---------|---------|
| Gate 1：分析审查 | 需求覆盖度、验收标准可测试性 | 构造让验收标准失败的场景 |
| Gate 2：设计审查 | 备选方案评估、隐含假设挑战 | 步骤0方向审查 + Grill风格+交叉一致性 |
| Gate 3：实现审查 | 设计偏差、隐性变更、安全漏洞 | 逐项对照设计文档的接口/数据模型 |
| Gate 4：验证审查 | 证据实质性、反向检查 | 质疑所有"通过"项的证据充分性 |

---

## 实现路径

### V1.0 — 基础审查 Agent
- 只读权限模型
- 通用质量审查（代码风格、安全、测试覆盖）

### V1.5 — Gate 强制调用
- Review Agent 调用从"建议"提升为"强制"
- 行为审查维度新增

### V1.10 — Grill+COT 升级
- Gate 1/3/4 提示词升级为 Grill 风格
- 推理链输出要求
- Gate 2 增加交叉一致性检查

### V1.21 — Gate 纪律强化（进行中）
- Gate 未通过绝对不进入下一阶段
- 提交前自检清单

---

## 未来愿景

### V2.x — 审查增强
- **多维度深度评审**：适应不同场景的审查策略
- **自发性深入挖掘**：Agent 主动发现关联问题
- **经验反哺审查**：利用经验库提高审查准确度

### V3.x — 智能化
- **评审自动决策**：置信度 >95% 时自动抉择
- **持续审查**：非 Gate 阶段也进行背景审查

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.opencode/agents/review-agent.md` | 审查Agent定义（权限+审查流程+输出格式） |
| `packages/installer/templates/agents/review-agent.md` | 模板源 |
