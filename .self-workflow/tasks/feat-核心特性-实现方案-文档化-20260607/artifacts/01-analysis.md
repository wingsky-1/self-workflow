---
phase: 1
workflow: feat
description: 需求分析阶段产物
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.18：核心特性实现方案

> 工作流 ID：`feat-核心特性-实现方案-文档化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T23:00:00+08:00

---

## 需求概述

当前 `docs/` 下仅有 4 类经验文档（实施经验、参考模式、错误经验、关键决策），缺少对项目核心特性实现方案的文档化能力。更重要的是——**没有机制引导 Agent 主动去记录**。即使建了目录，Agent 也不会自发知道"什么时候该写、该更新"。

**三层需求**：

1. **存储骨架（框架能力）**：self-workflow 应内置"实现方案"文档分类，作为 installer 模板的一部分随 `npx self-workflow init` 分发给用户。这是基础设施——提供一个存放位置和标准化格式。

2. **引导机制（框架能力·核心）**：框架必须在工作流的关键节点**主动提醒 Agent** 考虑是否需要创建/更新实现方案文档。这不是等 Agent 自发发现，而是把检查点嵌入 `/feat` 工作流：
   - **记录时机**：当 Agent 在 Phase 2（方案设计）中定义了新的模块/机制/数据流时 → 检查"是否为关键特性？应否在 `docs/实现方案/` 中创建新文档？"
   - **更新时机**：当 Agent 在 Phase 3（代码实现）中修改了已有模块的行为/接口时 → 检查"是否影响了已有实现方案文档描述的内容？应否同步更新？"
   - **收尾确认**：Phase 5（总结沉淀）中增加检查项——"本任务是否引入/修改了关键特性？确认实现方案文档已创建或更新"

3. **自举示范**：self-workflow 自身率先使用该分类，文档化自己的核心特性实现方案（installer、plugin 注入、/feat 工作流、Gate 审查），作为该分类的示范文档——既服务于自身 Agent 后续开发，也作为用户参考的范例。

**核心价值**：Agent 不再每次从头读源码——先查实现方案理解设计意图，变更时被框架提醒同步更新文档。文档不腐化，形成真正的**经验复利**。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P0 | 引导机制：Phase 2 嵌入创建检查点 | 修改 `feat-workflow.md` 模板源——Phase 2 检查清单增加"是否涉及项目关键特性的新设计？如是，是否应在 `docs/实现方案/` 中创建对应文档？" | Agent 设计新模块时被提醒创建 |
| P0 | 引导机制：Phase 3 嵌入更新检查点 | 修改 `feat-workflow.md` 模板源——Phase 3 检查清单增加"本次修改是否影响了 `docs/实现方案/` 中已有文档描述的内容？如是，应同步更新对应文档的变更记录节" | Agent 修改已有模块时被提醒更新 |
| P0 | 引导机制：Phase 5 收尾确认检查点 | 修改 `feat-workflow.md` 模板源——Phase 5 检查清单增加"本任务是否引入或修改了关键特性？确认 `docs/实现方案/` 中文档已创建或同步更新" | 收尾时最终核实 |
| P0 | 存储骨架：installer 模板新增"实现方案"分类 | 在 `templates/docs/` 下新增 `实现方案/.gitkeep`，installer MANIFEST 增加部署条目，`templates/docs/README.md` 分类定义段注册新分类 + 更新使用指南 | 用户 init 即可获得 |
| P0 | 存储骨架：新增实现方案文档模板 | 在 `templates/configs/templates/` 下新增模板（frontmatter + 章节：模块定位、架构概览、关键数据流、设计决策依据、变更记录） | 标准化格式 |
| P0 | 自举示范：installer 系统实现方案 | 文档化 installer 三层架构、MANIFEST 机制、模板同步流程 | 示范 + Agent 复用 |
| P0 | 自举示范：Plugin 注入机制实现方案 | 文档化双钩子架构、marker 检测、渐进式披露策略 | 示范 + Agent 复用 |
| P1 | 自举示范：/feat 工作流实现方案 | 文档化 5 阶段 + 4 Gate + Compound 的工作流驱动 | 示范 + Agent 复用 |
| P1 | 自举示范：Gate 审查机制实现方案 | 文档化 Gate 重量量化公式、review-agent 调用、Checkpoint 机制 | 示范 + Agent 复用 |

---

## 约束条件

### 技术约束

- 模板源修改→同步规则：先改 `packages/installer/templates/`，后运行 `init --force` 同步
- `/feat` 工作流修改需要通过 `feat-workflow.md` 模板源→同步
- 新增分类目录遵循 `docs/README.md` 的"新增分类"流程：建目录→注册到分类定义段
- 文档格式遵循现有 `docs/README.md` 的 YAML frontmatter 规范（title/category/tags/date/source/quality）
- 引导机制的检查点以**问句形式**嵌入工作流，不强制阻断（Agent 自主判断+Human 可跳过），避免过度约束
- Tag 使用英文小写，技术术语用英文，领域特有名詞可用中文

### 业务约束

- 引导机制的设计原则：**提醒 → 判断 → 决策可见**。Agent 遇到检查点时的标准行为路径：
  1. **评估**：这东西算不算"关键特性"？（影响范围大？后续 Agent 会反复查阅？涉及模块组织/数据流/设计意图？）
  2. **不确定时询问**：当 Agent 无法自行判断时，必须使用 `question` 工具向 Human 确认——"我认为 XXX 可能涉及关键特性，但不确定。是否需要在 `docs/实现方案/` 中创建/更新对应文档？"（遵循 `specs/default/interaction-protocol.md` 的歧义澄清规范）
  3. **决策输出**：无论判断结果如何，Agent 必须**显式输出决策结论**——`[x] 本阶段无关键特性变更，跳过` 或 `[x] 已在 docs/实现方案/ 创建 xxx.md` 或 `[x] 已向 Human 确认，决定跳过`。确保引导行为可审计
- **Gate 兜底检查**：Phase 2 Gate（设计审查）和 Phase 3 Gate（实现审查）的 review-agent prompt 中增加 non-blocking 检查项——"审查 Agent 是否对实现方案文档做了显式决策（创建/更新/跳过）"。不通过 Gate，但记录为 warning 到 errors.yaml，**确保即使 Agent 跳过检查点也能被事后发现**
- 示范文档定位为 V1 当前状态快照——不超前描述 V2 设计
- 文档模板应轻量：定义必须的 frontmatter 字段和推荐的内容节，不强制过度结构
- "实现方案"文档需包含**变更记录节**——当特性因后续任务修改时，Agent 在文档末尾追加变更条目（日期+任务+变更摘要），保持文档与代码同步演进的轨迹
- **边界约定**：
  - 变更记录节只记录"什么变了"（文件/接口/行为的简要描述），不记录"为什么变"（设计理由应写在对应任务的 ADR 中）
  - "设计决策依据"节引用 ADR 文件路径，不重复 ADR 内容。实现方案说"选择了什么"，ADR 说"为什么选这个"
  - "实现方案"与"实施经验"的区别：实现方案描述系统当前设计（"是什么"），实施经验记录开发过程中学到的东西（"发生了什么"）

---

## 验收标准

### 引导机制验收（文件内容存在性）

- [ ] **AC-1**：Given 读取 `feat-workflow.md` Phase 2 的检查清单，When 搜索关键词 `docs/实现方案/`，Then 清单中应包含引导 Agent 评估是否需要创建实现方案文档的检查项
- [ ] **AC-2**：Given 读取 `feat-workflow.md` Phase 3 的检查清单，When 搜索关键词 `docs/实现方案/`，Then 清单中应包含引导 Agent 评估是否需要更新已有实现方案文档的检查项
- [ ] **AC-3**：Given 读取 `feat-workflow.md` Phase 5 的检查清单，When 搜索关键词 `docs/实现方案/`，Then 清单中应包含引导 Agent 确认实现方案文档已创建或同步更新的检查项

### 引导机制验收（行为输出验证——Gate 兜底）

- [ ] **AC-4**：Given Phase 2 Gate（设计审查）的 review-agent prompt，When 检查 prompt 内容，Then 应包含 non-blocking 检查指令"审查 Agent 是否对实现方案文档（创建/跳过/询问用户）做了显式决策"
- [ ] **AC-5**：Given Phase 3 Gate（实现审查）的 review-agent prompt，When 检查 prompt 内容，Then 应包含 non-blocking 检查指令"审查 Agent 是否对实现方案文档（更新/跳过/询问用户）做了显式决策"
- [ ] **AC-6**：Given 读取 `feat-workflow.md` 中实现方案检查点附近的指引文字，When 检查内容，Then 应包含 Agent 不确定时使用 `question` 工具向 Human 确认的指导（引用或符合 `specs/default/interaction-protocol.md` 规范）

### 存储骨架验收

- [ ] **AC-7**：Given 用户执行 `npx self-workflow init`，When 初始化完成，Then `.self-workflow/docs/实现方案/` 目录应存在（含 `.gitkeep`），`docs/README.md` 分类定义段应包含 `### 实现方案/` 条目
- [ ] **AC-8**：Given 读取 `docs/README.md` 的"沉淀经验"部分，When 检查内容，Then 应包含不少于 3 句的实现方案文档创建时机说明，明确提及设计阶段（Phase 2-3）是创建时机而非 Phase 5 总结阶段
- [ ] **AC-9**：Given Agent 需要编写实现方案文档，When 查阅 `configs/templates/`，Then 应存在实现方案文档模板（含 frontmatter 结构 + 章节定义：模块定位、架构概览、关键数据流、设计决策依据、变更记录）

### 自举示范验收

- [ ] **AC-10**：Given `docs/实现方案/installer-系统实现方案.md`，When 检查内容结构，Then 应包含以下章节：[三层架构描述][MANIFEST 机制说明][模板同步流程][变更记录（空，预留）][设计决策依据（引用 ADR 路径）]
- [ ] **AC-11**：Given `docs/实现方案/plugin-注入机制实现方案.md`，When 检查内容结构，Then 应包含以下章节：[双钩子架构说明][marker 检测逻辑][渐进式披露策略][变更记录（空，预留）][设计决策依据（引用 ADR 路径）]

### 文档质量验收

- [ ] **AC-12**：Given 新增的文档，When 检查 YAML frontmatter，Then title/category/tags/date/source/quality 字段应完整，tags 使用英文小写
- [ ] **AC-13**：Given 新增的文档，When 按 `specs/default/doc-audience.md` 检查，Then 受众标示应为 Agent（`docs/` 目录下默认 Agent），内容含非空的"设计决策依据"节和"关键数据流"节

---

## 不纳入范围

- **不修改 installer 核心逻辑**：不修改 `index.js` 的函数行为，仅增加 MANIFEST 条目、EMPTY_DIRS 条目和模板文件
- **不修改现有经验文档正文**：已有经验文档内容不变，但 `docs/README.md` 的使用指南和分类定义段需同步更新（属于框架功能更新）
- **不创建硬性 Gate 阻断规则**：引导机制不产生"必须创建实现方案文档否则 Gate 不通过"的阻断规则。但 Phase 2/3 的 Gate review-agent prompt 中会增加 non-blocking 检查——不阻断 Gate 通过，但会记录 warning 到 errors.yaml
- **不涉及 V2 特性**：示范文档仅描述 V1 已实现特性
- **不覆盖所有特性**：首期文档化 installer、plugin、/feat、Gate 四个模块。spec 系统、exp-governance、内置工具等留待后续版本
- **不自动检测变更**：Agent 判断是否需要更新实现方案文档——V1 不做代码 diff 自动检测、不建立文档-代码的自动化关联

---

## 已知决策点（Phase 2 方案设计时权衡）

以下维度已在需求分析阶段识别，供 Phase 2 创建 ADR 时直接使用：

| 决策维度 | 选项范围 | 本分析推荐方向 |
|----------|---------|--------------|
| 检查点插入位置 | Phase 2 / Phase 3 / Phase 5 / Compound | Phase 2+3+5 三处插入（覆盖创建→更新→确认全周期） |
| 检查点形式 | 问句 / 断言 / 清单项+行为说明 | 清单项（`[ ]`）+ 显式决策输出要求 |
| Agent 不确定时的行为 | 自行判断 / 跳过 / 询问用户 | 使用 `question` 工具询问 Human（遵循 interaction-protocol） |
| 强制程度 | 纯提醒 / Gate 检查项 / Gate 阻断规则 | Phase 2/3 提醒 + Gate non-blocking 检查兜底 |
| Gate 兜底检查位置 | Phase 2 Gate / Phase 3 Gate / Compound | Phase 2 Gate（设计审查）+ Phase 3 Gate（实现审查） |
| 变更记录内容范围 | 仅变更摘要 / 变更摘要+原因 / 完整变更描述 | 仅变更摘要（日期+任务+改了什么），设计原因引用 ADR |
| 与 ADR 的关系 | 实现方案内联 ADR / 引用 ADR / 独立不关联 | 实现方案引用 ADR 路径，不重复内容 |

---

## 决策声明

- [ ] 本阶段涉及方向性决策——引导机制的设计需要在 Phase 2 方案设计中通过 ADR 正式记录。详见上方"已知决策点"表，6 个维度已配备选项范围和分析推荐方向
