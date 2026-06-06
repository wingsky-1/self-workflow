---
name: feat-workflow
description: 特性开发工作流指引 — 多步骤特性开发的完整流程，包含 5 阶段 + Phase Gate 审查
version: 0.1
---

# Feat 工作流指引

## 工作流总览

```
需求分析 → [Gate/light] → 方案设计 → [Gate/full] → 代码实现 → [Gate/full] → 功能验证 → [Gate/light] → 总结沉淀 → Compound
```

**适用场景**：多步骤特性开发（3+ 阶段）、架构决策、重构
**不适用场景**：单文件 typo 修复、配置值修改、快速原型（< 30 行代码）— 请使用 `--quick` 模式

### 工作流标识

每次工作流执行需要一个唯一 ID，格式：`<type>-<feature-name>-<YYYYMMDD>`
例如：`feat-user-login-20260606`

### 产物目录结构

```
.self-workflow/tasks/<workflow-id>/
├── workflow.yaml          # 工作流实例元数据（启动时创建）
├── artifacts/             # 各阶段产物
│   ├── 01-analysis.md
│   ├── 02-design.md
│   ├── 03-implementation.md
│   ├── 04-verification.md
│   └── 05-summary.md
└── errors/                # 错误日志
    ├── errors.yaml
    ├── 01-analysis-errors.md
    └── ...
```

---

## 阶段 1：需求分析

**目标**：理解需求、识别约束、明确验收标准。

### 执行内容

1. **理解需求**
   - 阅读并分析用户提供的特性描述
   - 识别核心功能需求和边缘情况
   - 明确"做什么"和"不做什么"

2. **识别约束**
   - 技术约束（语言、框架、现有架构）
   - 业务约束（性能、安全、合规）
   - 时间/资源约束

3. **定义验收标准**
   - 每个功能点对应一条验收标准
   - 验收标准应可测试（Given-When-Then 格式优先）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/01-analysis.md`
格式参考：`.self-workflow/configs/templates/analysis-template.md`

### 完成检查清单

- [ ] 需求理解文档已写入 `01-analysis.md`
- [ ] 功能清单覆盖所有核心需求
- [ ] 约束条件已识别
- [ ] 验收标准已定义且可测试
- [ ] 不纳入范围已明确标注

### 错误日志

如果在此阶段遇到问题（需求不明确、约束冲突等），立即记录到：
`.self-workflow/tasks/<workflow-id>/errors/01-analysis-errors.md`
格式参考：`.self-workflow/configs/templates/error-log-template.md`

---

## Gate：分析审查（weight: light）

### 审查步骤

#### 步骤 1：程序化验证

本阶段无代码产出，跳过程序化验证。

#### 步骤 2：对抗性审查

调用 Review Agent 审查需求分析文档的完整性和一致性。

**审查要点**：
- 需求理解是否与用户输入一致？
- 功能清单是否覆盖了所有需求？
- 验收标准是否可测试？
- 约束条件是否被合理识别？

如果 Review Agent 尚未就绪，由主 Agent 自行完成上述检查。

#### 步骤 3：人工确认

✅ **需要用户确认** — 展示需求分析文档给用户，确认理解正确。

**确认话术**：
> 我已经完成了需求分析，请确认以下理解是否正确：
> - 功能清单：<简要列出>
> - 验收标准：<简要列出>
>
> 如果没问题，输入"确认"继续；如有调整，请说明。

### 通过条件

- [ ] 需求分析文档完整
- [ ] 用户已确认需求理解正确
- [ ] 所有 blocker 已关闭

**不通过** → 返回阶段 1 修正需求分析。

---

## 阶段 2：方案设计

**目标**：架构决策、接口设计、数据模型设计。

### 执行内容

1. **架构决策**
   - 识别需要做架构决策的关键点
   - 对每个决策点列出至少 2 个备选方案
   - 评估 trade-off，明确选择理由

2. **接口设计**
   - 定义模块/组件之间的接口
   - 输入输出格式、错误处理策略

3. **数据模型设计**
   - 新增/修改的数据结构
   - 与现有数据模型的关系

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/02-design.md`
格式参考：`.self-workflow/configs/templates/design-template.md`

### 完成检查清单

- [ ] 关键架构决策已记录（含 trade-off 评估）
- [ ] 接口设计已定义
- [ ] 数据模型已设计
- [ ] 备选方案至少 2 个

### 错误日志

如果遇到问题，记录到：
`.self-workflow/tasks/<workflow-id>/errors/02-design-errors.md`

---

## Gate：设计审查（weight: full）

### 审查步骤

#### 步骤 1：程序化验证

本阶段无代码产出，跳过程序化验证。

#### 步骤 2：对抗性审查（Grill 风格）

调用 Review Agent 执行对抗性设计评审。

**审查流程**（Grill 风格）：
1. 读取设计文档中的每个架构决策
2. 对每个决策：
   - 分析备选方案是否被充分评估
   - 检查选择的理由是否成立
   - 挑战隐含假设
   - 确认 trade-off 被明确记录
3. 输出审查报告

审查报告格式参考：`.self-workflow/configs/templates/review-report-template.md`

如果 Review Agent 尚未就绪，主 Agent 自行按 Grill 风格审查。

#### 步骤 3：人工确认

✅ **可选** — 复杂设计需要用户确认。简单设计可跳过。

### 通过条件

- [ ] 设计文档完成
- [ ] 对抗性审查通过（无 critical 问题）
- [ ] （可选）用户已确认设计

**不通过** → 返回阶段 2 修正设计。

---

## 阶段 3：代码实现

**目标**：按设计进行编码、单元测试。

### 执行内容

1. **编码**
   - 按设计文档的接口和数据模型实现
   - 遵循项目编码规范
   - 保持与现有代码风格一致

2. **单元测试**
   - 新增代码必须有对应的单元测试
   - 测试覆盖核心逻辑路径和边界情况

3. **自检**
   - 运行 lint 检查代码风格
   - 运行 typecheck 检查类型安全

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/03-implementation.md`
格式参考：`.self-workflow/configs/templates/implementation-template.md`

### 完成检查清单

- [ ] 所有功能点的代码已实现
- [ ] 单元测试已编写并通过
- [ ] lint 检查通过
- [ ] typecheck 通过

### 错误日志

如果遇到实现问题，记录到：
`.self-workflow/tasks/<workflow-id>/errors/03-implementation-errors.md`

---

## Gate：实现审查（weight: full）

### 审查步骤

#### 步骤 1：程序化验证

运行以下验证命令，全部通过后方可进入下一步：

```bash
# 示例（根据项目实际调整）：
npm run lint          # 代码风格检查
npm run typecheck     # 类型检查
npm run test          # 单元测试
```

**失败处理**（Ralph Loop）：
- 最多重试 3 次
- 每次修复后重新触发验证
- 3 次均失败 → 标记为 `auto-fix-failed`，通知用户手动处理

#### 步骤 2：对抗性审查

调用 Review Agent 审查代码实现。

**审查要点**：
- 实现是否与设计文档一致？
- 代码质量（命名、结构、注释）
- 测试覆盖是否充分
- 是否引入安全漏洞

#### 步骤 3：人工确认

❌ 不需要用户确认。

### Gate 重量自动降级

如果变更确实很小（≤ 3 个文件，不涉及架构决策），Agent 应主动将本 Gate 降级：
- `full` → `light`：跳过对抗性审查，仅程序化验证
- `full` → `skip`：极简变更（如 typo 修复），跳过所有审查

### 通过条件

- [ ] 程序化验证全部通过（lint + typecheck + test）
- [ ] 对抗性审查无 critical 问题
- [ ] 代码与设计一致

**不通过** → 返回阶段 3 修复。

---

## 阶段 4：功能验证

**目标**：运行完整测试、边界检查、确认功能可用。

### 执行内容

1. **运行完整测试套件**
   - 所有单元测试
   - 集成测试（如有）
   - E2E 测试（如有）

2. **边界条件检查**
   - 空值/边界值处理
   - 错误路径覆盖

3. **手动验证**（可选）
   - 用实际场景验证功能是否满足验收标准

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/04-verification.md`
格式参考：`.self-workflow/configs/templates/verification-template.md`

### 完成检查清单

- [ ] 完整测试套件运行通过
- [ ] 验收标准全部满足
- [ ] 边界条件已覆盖
- [ ] 无已知严重问题

---

## Gate：验证审查（weight: light）

### 审查步骤

#### 步骤 1：程序化验证

运行完整测试套件。

#### 步骤 2：对抗性审查

Review Agent 简要检查：
- 测试覆盖是否充分
- 边界条件是否处理
- 是否引入回归问题

#### 步骤 3：人工确认

❌ 不需要用户确认。但如果程序化验证失败，需要用户介入。

### 通过条件

- [ ] 完整测试套件通过
- [ ] 验收标准全部满足
- [ ] 对抗性审查通过

**不通过** → 返回阶段 3 修复 → 重新进入 Gate 验证。

---

## 阶段 5：总结沉淀

**目标**：提炼经验、补充文档，让下一次同类任务更简单。

### 执行内容

1. **编写总结**
   - 回顾本次工作流的得与失
   - 记录有价值的经验和教训

2. **经验草稿**
   - 提取可复用的解决方案
   - 标记为 `draft` 等级

3. **文档补充**
   - 更新 README 或相关文档（如果代码变更涉及公共接口）

### 输出产物

写入 `.self-workflow/tasks/<workflow-id>/artifacts/05-summary.md`
格式参考：`.self-workflow/configs/templates/summary-template.md`
---

## Compound（自动执行）

工作流完成后，执行以下操作：

1. **确认产物完整性**：所有 5 个阶段产物已写入 `.self-workflow/tasks/<workflow-id>/artifacts/`
2. **更新元数据**：在 `workflow.yaml` 中：
   - 最后阶段 `status: completed`, `gate: passed`, `completed: <当前时间>`
   - 顶层 `status: completed`, `updated: <当前时间>`
3. **经验草稿**：如果阶段 5 产出了经验，在 `workflow.yaml` 中添加 `experience-draft: true`
4. **Compound 标记**：完成后不再修改任何 `tasks/<workflow-id>/` 下的文件

> **注意**：完整的 Compound（经验自动晋升、检索）将在 V2 实现。V1 仅做基础归档和草稿收集。

---

## 附录：快速参考

### Gate 重量速查

| Gate | weight | 程序化验证 | 对抗性审查 | 人工确认 |
|------|--------|-----------|-----------|---------|
| 分析审查 | `light` | 跳过 | ✅ Review Agent | ✅ 需要 |
| 设计审查 | `full` | 跳过 | ✅ Grill 风格 | ⚠️ 可选 |
| 实现审查 | `full` | ✅ lint/typecheck/test | ✅ Review Agent | ❌ |
| 验证审查 | `light` | ✅ 完整测试套件 | ✅ Review Agent | ❌ |

### 产物清单

| 阶段 | 文件路径 |
|------|---------|
| 需求分析 | `tasks/<workflow-id>/artifacts/01-analysis.md` |
| 方案设计 | `tasks/<workflow-id>/artifacts/02-design.md` |
| 代码实现 | `tasks/<workflow-id>/artifacts/03-implementation.md` |
| 功能验证 | `tasks/<workflow-id>/artifacts/04-verification.md` |
| 总结沉淀 | `tasks/<workflow-id>/artifacts/05-summary.md` |
| 工作流元数据 | `tasks/<workflow-id>/workflow.yaml` |

### 错误日志路径

| 阶段 | 文件路径 |
|------|---------|
| 阶段 1 错误 | `tasks/<workflow-id>/errors/01-analysis-errors.md` |
| 阶段 2 错误 | `tasks/<workflow-id>/errors/02-design-errors.md` |
| 阶段 3 错误 | `tasks/<workflow-id>/errors/03-implementation-errors.md` |
| 错误索引 | `tasks/<workflow-id>/errors/errors.yaml` |

### 工作流状态管理（workflow.yaml 生命周期）

工作流执行过程中需要持续维护 `workflow.yaml`，它是工作流实例的权威状态记录。
创建模板参考：`.self-workflow/configs/templates/workflow-metadata-template.yaml`

#### 执行流程

1. **启动**：复制 `workflow-metadata-template.yaml` 到 `tasks/<workflow-id>/workflow.yaml`，填入具体值
2. **每阶段开始**：更新对应 phase 的 `status: in_progress`，设 `started`
3. **每 Gate 通过**：更新当前 phase 的 `status: completed, gate: passed, completed`，设下一 phase 为 `in_progress`
4. **特殊情况**：
   - Gate 失败返回修复：gate 保持 `pending`，不推进
   - 工作流取消：状态 `cancelled`，保留产物快照
   - Ralph Loop 耗尽：gate `failed`，状态 `stuck`

### 历史产物查询

Agent 可以通过读取 `tasks/` 目录来回答用户的问题：

| 用户问法 | Agent 行为 |
|---------|-----------|
| "上次用户登录模块的开发记录在哪？" | 扫描 `tasks/` 目录，按关键词匹配 workflow-id |
| "之前遇到过类似的数据库问题吗？" | 扫描 `tasks/<workflow-id>/errors/` 目录，按关键词匹配错误描述 |
| "我们项目对 API 设计有什么规范？" | 读取 `.self-workflow/specs/`（V2 功能，V1 返回"尚未定义"） |
| "这个工作流当前进展到哪了？" | 读取 `tasks/<workflow-id>/workflow.yaml` 的 status 和 current-phase |

### 快速入门（Agent 指引）

执行工作流时，按此顺序操作：

1. 解析用户输入，确定需求描述
2. 创建工作流 ID：`feat-<简述>-<日期>`
3. 创建 `tasks/<workflow-id>/workflow.yaml`，写入元数据（见"工作流状态管理"）
4. 按阶段 1 → Gate → 阶段 2 → Gate → ... 顺序执行
5. 每个阶段完成后：
   a. 执行 Gate 检查
   b. **Gate 通过**：更新 `workflow.yaml` 中当前 phase 的 status 和 gate，推进到下一阶段
   c. **Gate 不通过**：返回当前阶段修复，gate 保持 pending
6. 所有阶段完成后，执行 Compound 归档（更新 status → completed）

### 错误管理

- **错误详细日志**：写入 `tasks/<workflow-id>/errors/` 下（按阶段如 `01-analysis-errors.md`）
- **错误索引**：同步更新 `tasks/<workflow-id>/errors/errors.yaml`
- **severity 说明**：`blocking`（阻碍推进） / `minor`（非阻塞但值得记录）
- 错误详细上下文记录在阶段错误日志中，索引文件仅做摘要
