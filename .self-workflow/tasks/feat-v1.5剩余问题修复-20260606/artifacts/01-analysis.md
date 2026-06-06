---
phase: 1
workflow: feat
description: 需求分析阶段产物 — V1.5 剩余问题修复
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.5 剩余问题修复

> 工作流 ID：`feat-v1.5剩余问题修复-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T17:22:00+08:00
> 参考文档：`docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` (v0.1)、`docs/V1.5/评审报告-feat-实现feat命令-20260606.md`
> 关联：`docs/V1.5/验收标准.md` v1.2、`docs/todo.md` 遗留项

---

## 需求概述

在 `/feat` 命令自举实施中，4 项框架缺陷被系统性地暴露——不是在设计阶段预见的，而是在实际跑通全流程后才发现的。同时 `docs/todo.md` 中还有 4 项遗留问题需处理。这些问题的共同特点是：影响 Agent 的行为一致性、流程质量保证和知识沉淀机制，属于"基础设施级"修复。

**目标**：修复 8 个已知问题（F1-F4 + T1-T4），让 feat-workflow 框架更健壮、Agent 执行更可预期、经验沉淀更系统化。

**修复位置**集中在以下文件：
- `.self-workflow/configs/guides/feat-workflow.md`（F1, F2, F3）
- `.opencode/commands/adr.md` + `packages/installer/templates/commands/adr.md`（F4, T1, T2）
- `.self-workflow/docs/` — 经验分级设计（T3）

---

## 功能清单

### 第一类：框架缺陷修复（F1-F4）

| 优先级 | 功能点 | 描述 | 修复位置 | 工作量 |
|--------|--------|------|---------|--------|
| 🔴 P0 | F1 - Gate 权重优先级声明 | 在 feat-workflow.md 中显式声明：**量化结果覆盖声明权重**。声明权重仅是"典型场景默认值" | `feat-workflow.md` Gate 重量量化章节 | 小（1 行声明） |
| 🔴 P0 | F2 - Review Agent 强制调用 | 4 个 Gate 步骤中明确写入 `task(subagent_type="review-agent", prompt="...")`，让 Agent 无法跳过独立审查 | `feat-workflow.md` 各 Gate 对抗性审查步骤 | 中（修改 4 个 Gate） |
| 🟡 P1 | F3 - 双级经验模型入 workflow | Phase 5 检查清单拆分为 task 级和 doc 级，防止 doc 级经验遗漏 | `feat-workflow.md` 阶段 5 检查清单 | 小（加 2 行） |
| 🟡 P1 | F4 - /adr 命令重构 | 去掉类型参数（simple/complex/review），由 Agent 自行判断模板复杂度；增加 `--auto` 模式 | `.opencode/commands/adr.md` + 安装器模板 | 中 |

### 第二类：todo.md 遗留项（T1-T4）

| 优先级 | 功能点 | 描述 | 修复位置 | 关联 |
|--------|--------|------|---------|------|
| 🟡 中 | T1 - ADR 编号 per-task 独立 | ADR 编号在当前 task 内递增，不要求全局 | `/adr` 命令编号逻辑 | 与 F4 合并 |
| 🟡 中 | T2 - /adr 去掉类型参数 | 同 F4 | — | 与 F4 合并 |
| 🟢 低 | T3 - 经验分级与渐进式披露 | 设计分类原则 + 注入机制：区分实施经验/参考模式/错误经验三类 | `.self-workflow/docs/` | 待设计 |
| 🟢 低 | T4 - /feat 新会话实测 | 在新会话中执行 `/feat 测试` 验证完整的启动→阶段1→Gate流程 | — | 无 |

---

## 约束条件

### 技术约束

- **不改 .opencode 源文件**：`.opencode/` 中的文件通过安装器导入，不能直接修改。修改应同时更新 `packages/installer/templates/` 中的模板
- **安装器同步**：修改 `packages/installer/templates/commands/adr.md` 后，需运行安装器同步到 `.opencode/commands/adr.md`
- **feat-workflow.md 可直接编辑**：`.self-workflow/configs/guides/feat-workflow.md` 是运行时文件，非安装器管理，可直接修改
- **YAML 格式**：所有元数据文件必须合法
- **OpenCode Command 格式**：`/adr` 命令定义需遵循 OpenCode slash command 规范（Markdown + frontmatter）
- **Agent 行为约束**：F2 的修复效果取决于 Agent 是否严格遵循 workflow 指引中的步骤描述——无法在代码层面"强制执行"，只能通过指引措辞的强制性和可验证性来提高触发率。

### 业务约束

- **Review Agent 可用性**：Review Agent（`.opencode/agents/review-agent.md`）已存在且功能完好。F2 修复的前提是 Review Agent 能被 `task(subagent_type="review-agent")` 正常调用
- **向后兼容**：修改 `/adr` 命令时，不能破坏已有的 ADR 归档格式
- **降级策略**：F2 修复后如果 Review Agent 不可用（如 Agent 未加载），Agent 应自行按 Grill 风格审查（已在指引中定义为降级策略）

---

## 验收标准

### F1：Gate 权重优先级冲突

- [ ] **AC-F1-1**：Given `feat-workflow.md` Gate 重量量化章节，When 阅读该章节，Then 明确包含"量化结果覆盖声明权重"的声明语句
- [ ] **AC-F1-2**：Given 设计审查 Gate 的场景（scope=0, risk=0, user-signal=0 → 量化总分=0 → light），When Agent 计算 Gate weight，Then Agent 按 light 执行（跳过对抗性审查），而非按声明 full 执行

### F2：Review Agent 强制调用

- [ ] **AC-F2-1**：Given `feat-workflow.md` 分析审查 Gate 步骤，When 读取步骤内容，Then 包含显式的 `task(subagent_type="review-agent", prompt="...")` 调用指令
- [ ] **AC-F2-2**：Given `feat-workflow.md` 设计审查 Gate 步骤，When 读取步骤内容，Then 方向审查和对抗性审查步均包含显式的 Review Agent 调用（含 prompt 示例）
- [ ] **AC-F2-3**：Given `feat-workflow.md` 实现审查 Gate 步骤，When 读取步骤内容，Then 对抗性审查步包含显式 Review Agent 调用
- [ ] **AC-F2-4**：Given `feat-workflow.md` 验证审查 Gate 步骤，When 读取步骤内容，Then 对抗性审查步包含显式 Review Agent 调用

### F3：双级经验模型

- [ ] **AC-F3-1**：Given `feat-workflow.md` Phase 5 检查清单，When 读取清单，Then 包含独立的 "task 级经验" 检查项（指向 `artifacts/05-summary.md`）
- [ ] **AC-F3-2**：Given `feat-workflow.md` Phase 5 检查清单，When 读取清单，Then 包含独立的 "doc 级经验" 检查项（判断标准：是否遇到框架缺陷？是否发现可推广模式？是否验证新机制？→ 写入 `.self-workflow/docs/`）

### F4+T1+T2：/adr 命令重构

- [ ] **AC-F4-1**：Given `/adr` 命令定义文件，When 读取命令参数，Then 无 `simple|complex|review` 类型参数
- [ ] **AC-F4-2**：Given `/adr` 命令定义文件，When Agent 执行 `/adr --auto`，Then 跳过交互式收集步骤，直接写入文件
- [ ] **AC-F4-3**：Given `/adr` 自主归档路径（Agent 已在设计文档中写好 ADR 内容），When Agent 调用写入逻辑，Then 编号在当前 task 内递增（如 `ADR-001`, `ADR-002`），不依赖全局
- [ ] **AC-F4-4**：Given 安装器模板 `packages/installer/templates/commands/adr.md`，When 与 `.opencode/commands/adr.md` 对比，Then 内容一致（安装器同步）

### T3：经验分级设计

- [ ] **AC-T3-1**：Given `.self-workflow/docs/` 目录，When 检查文件，Then 存在三种分类的经验文档模板或示例（实施经验、参考模式、错误经验）
- [ ] **AC-T3-2**：Given 经验分级设计文档，When 阅读，Then 定义了每种分类的 Agent 加载时机（任务启动/设计阶段/遇到错误）

### T4：/feat 实测验证

- [ ] **AC-T4-1**：Given 新会话，When 执行 `/feat 测试验证`，Then 完整走通阶段 1 + Gate 分析审查（含 Review Agent 调用、人工确认对话框）
- [ ] **AC-T4-2**：Given 实测完成后，When 检查 `.self-workflow/tasks/`，Then `task.yaml` + `workflow.yaml` + `artifacts/01-analysis.md` 均内容完整

### 质量要求

- [ ] 所有修改不引入 YAML 语法错误
- [ ] feat-workflow.md 的 Phase 5 检查清单与指引正文一致（正文详细描述 + 清单简要检查）
- [ ] 安装器 MANIFEST + package.json 版本同步迭代
- [ ] F2 的 4 个 Review Agent 调用 prompt 模板用语一致（含审查要点、输出格式）

---

## 不纳入范围

- **Review Agent 自动触发（Hook）** — V2 范围。V1.5 仅在指引中强制写入调用步骤
- **经验自动晋升与检索** — V2 范围（Compound 章节已注明）。V1.5 仅做分类设计和手动写入
- **多工作流并发执行** — 不支持。本次不涉及
- **Gate 独立单元化** — V2 范围。当前 Gate 仍为 workflow 指引中的逻辑步骤
- **doc 级经验的索引系统** — V2 范围。V1.5 仅建立文件级的分类，不建立索引/检索机制
- **ADR 全局编号** — 已明确为 per-task 编号，本次修复后即完成。不追求全局递增

---

## 范围决策（已确认）

> ✅ 用户确认：**全部覆盖** F1-F4 + T1-T4 共 8 项。阶段 2 方案设计中按优先级分里程碑管理。

---

## 决策捕捉检查

本阶段识别到以下决策点：

| 决策 | 状态 | 备注 |
|------|------|------|
| 执行范围：分批 vs 全部 | ✅ 已确认 | 全部覆盖，阶段 2 分里程碑 |
| F2 Review Agent prompt 模板格式 | ⏳ 待方案设计 | 4 个 Gate 的 prompt 需统一用语 |
| F4 /adr --auto 模式实现策略 | ⏳ 待方案设计 | OpenCode Command 参数解析能力待确认 |
| T3 经验分类命名约定 | ⏳ 待方案设计 | 文件名约定 vs frontmatter 字段 |

> 后续阶段新增决策将触发 `/adr` 命令创建 ADR。
