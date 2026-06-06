---
phase: adr
type: complex
workflow: feat
description: feat.md 重定位为系统级提示词框架，feat-workflow.md 作为纯工作流定义
---

# ADR-002：feat.md 重定位为系统提示词框架

## 背景

当前 `/feat` 命令（`.opencode/commands/feat.md`，196 行）和工作流指引（`.self-workflow/configs/guides/feat-workflow.md`，600 行）的关系是隐式的：

- feat.md 负责**启动**（参数解析、目录初始化、task.yaml/workflow.yaml 创建、触发阶段 1）
- feat-workflow.md 负责**执行**（5 阶段详细步骤、4 个 Gate 审查、Checkpoint、Compound）

两者有 3 个重叠区域（目录结构、workflow.yaml 处理、阶段 1 内容），但角色关系从未被显式声明。Agent 需要自行推断两者的职责边界。

参见：`.self-workflow/tasks/feat-先做v1-5-2的需求-20260606/artifacts/01-analysis.md` F7 详细分析

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | **feat.md 作为系统提示词框架**：feat.md 包含入口+初始化+系统约束，通过引用使用 feat-workflow.md 的阶段定义。feat-workflow.md 变为纯工作流描述模板，可由用户定制 | 职责清晰（入口 vs 定义）；用户可定制工作流；消除内容重复；feat.md 可承载系统级约束（task() 调用规范、skill 加载规则等） | 需重写 feat.md 结构；feat-workflow.md 需移除 bootstrap 内容 |
| B | **仅添加角色声明**：两个文件开头各加一句角色说明+互链，内容不变 | 最小改动，即刻见效 | 不解决内容重叠；不承载系统约束；治标不治本 |
| C | **合并为单一文件**：feat.md 内嵌完整 600 行工作流指引 | 单一文件，无歧义 | 命令文件过重（796 行）；启动和执行关注点混合；用户无法独立定制工作流 |

## 选择

**方案 A**：feat.md 作为系统提示词框架，feat-workflow.md 作为纯工作流定义模板

## 理由

1. **自然的职责分离**：feat.md 是"如何使用这个工具"（入口+约束），feat-workflow.md 是"工具做什么"（阶段+Gate+规则）。这是经典的 interface vs implementation 分离
2. **承载系统约束**：当前 feat.md 和 feat-workflow.md 都没有集中承载系统级约束（如 task() 调用必须带 `load_skills`、Gate 量化公式等）。方案 A 的 feat.md 正好可以作为这些约束的载体
3. **用户可定制性**：方案 A 让 feat-workflow.md 成为纯模板——用户可以修改阶段定义、Gate 条件、Checkpoint 规则，而不影响命令入口逻辑。**定制方式**：修改安装器模板源 `packages/installer/templates/configs/guides/feat-workflow.md`，运行 `init --force` 同步。直接编辑 `.self-workflow/configs/guides/feat-workflow.md` 会被安装器覆盖（遵循 ADR-004 安装器管理规则）。完全的"热定制"（无需安装器的直接编辑）属于 V2 规划。
4. **消除内容重叠**：方案 A 明确"feat-workflow.md 是权威定义源，feat.md 只做引用"，彻底消除当前 3 个重叠区域
5. **渐进可实施**：方案 A 不需要一次性重写整个 196 行的命令文件——可以先添加角色声明和约束章节，逐步移除重复内容

方案 B 太弱——只加声明不解决根本问题。方案 C 太重——796 行的命令文件不适合作为可定制模板。

## 影响

**正面**：
- feat.md 成为完整、自包含的 Agent 指令（Agent 无需在参考和命令间切换）
- 系统级约束有了明确的载体
- 工作流可被用户独立定制和优化
- 新 Agent 更容易理解系统运作方式

**负面**：
- 需重写 feat.md 结构（模板源 `packages/installer/templates/commands/feat.md`）
- 需在 feat-workflow.md 开头添加角色声明
- 重叠内容消除需要仔细验证（确保不丢失关键信息）

**feat.md 新结构**：
```
角色定位 (新增) → 用法 → 前置检查 → 目录初始化 (简化) → 工作流执行 (引用) → 系统约束 (新增) → 仪表盘 → 错误处理
```

**feat-workflow.md 新结构**：
```
角色声明 (新增) → 工作流总览 → 阶段 1-5 → Gate 1-4 → Checkpoint → Compound → 附录
```

## 反对意见

1. **最小改动风险**：方案 B 的支持者认为"最小改动 = 最低风险"，且 V1.5.2 是 P1 迭代不应做大改动。回应：V1.5.2 的本质是"澄清"，方案 A 正是最彻底的澄清方式——不只是加注释，而是从根本上重新定义两个文件的职责。且 F6（合并 task.yaml）已是破坏性变更，F7 的改动程度与之匹配是合理的。

2. **"用户可定制性"的部署限制**：feat-workflow.md 位于 `.self-workflow/configs/guides/`，该目录由安装器管理（模板源在 `packages/installer/templates/configs/guides/feat-workflow.md`）。用户直接编辑部署副本会在 `init --force` 时被覆盖。回应：在 V1.5.2 中，定制流程为"修改模板源 → 运行安装器同步"。完全的无需安装器的热定制属于 V2+ 规划。AGENTS.md 和 feat-workflow.md 的文档中应明确标注此定制方式。

3. **快捷引用表的硬编码锚点**：方案 A 的计划中 feat.md 包含"快捷引用"表，使用硬编码锚点（如 `feat-workflow.md#阶段-1需求分析`）。如果用户重命名阶段，这些锚点会静默失效。回应：在实施时使用数字阶段 ID 锚点（`#阶段-1`），或使用 HTML 显式锚点 `{#phase1}` 确保稳定性。

## 关联

- 关联 ADR：ADR-001（合并 task.yaml）——feat.md 结构变更会影响 task.yaml 创建步骤
- 关联需求：F7（/feat 命令与 feat-workflow 关系澄清）
- 关联文件：`artifacts/02-design.md` 设计 3
