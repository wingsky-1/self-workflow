---
phase: 1
workflow: feat
description: V1.9 需求分析——安装器/模板/命令的积压重构项
validation:
  required-fields:
    - "需求概述"
    - "功能清单"
    - "验收标准"
    - "不纳入范围"
  required-format:
    "验收标准": "Given-When-Then"
---

# 需求分析 — V1.9 重构收尾

> 工作流 ID：`feat-v1-9版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T22:30:00+08:00

---

## 需求概述

V1.9 版本主题是"重构收尾"——处理安装器、模板、命令模块的积压重构项。这些项在之前迭代中被识别但未纳入排期，当前积累为 4 项独立但互相关联的重构任务。

**背景**：自举开发过程中，安装器 (`packages/installer/`) 体系经历了多次迭代（V1.5 feat 命令、V1.7 docs 索引注入、V1.8 specs 结构），但一些基础设施层面的整洁性问题被搁置。本次迭代集中处理这些问题，为后续 V1.10+ 的 Gate 审查增强和 Agent 能力升级奠定整洁的基础。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P1 | 任务模板提取 | 将 task.yaml 模板从 feat.md 命令内嵌提取为独立模板文件 `packages/installer/templates/tasks/feat-task.yaml`（命名含 `feat-` 前缀支持后续拓展其他工作流类型），通过 MANIFEST 安装到 `.self-workflow/configs/templates/feat-task.yaml`，使用户可定制任务模板结构 | 当前模板硬编码在 `feat.md` 第 84-151 行，无独立的源文件 |
| P1 | 命名与提交信息优化 | **slug 语义生成**：Agent 理解任务内容后提炼关键词生成有辨识度的 slug（如 `安装器重构-模板清理`），而非机械变换用户输入；**title/description 精炼**：Agent 生成含版本号+工作要点的标题和 todo 摘要；**commit message**：携带阶段名+影响范围 | 无运行时代码，全部是 Markdown 指令文件中的 LLM 指令 |
| P2 | 门控 SHA 关联 | 在 task.yaml 的 phase schema 中新增 `checkpoint` 字段（初始 `null`），Gate 通过后 Agent 通过 `git rev-parse <tag>` 填充 commit SHA；Compound 回退时可从 checkpoint 补建缺失 tag | 当前 phase → git tag 映射仅靠命名约定维护，无 SHA 记录 |
| P1 | 三层目录清理 | **方案 A**：删除 `packages/installer/.opencode/` 和 `.self-workflow/`（废弃死代码），保留 `templates/` 为唯一源，新增 `packages/installer/README.md` 文档化三层职责边界 | 两个废弃目录未引用、不完整、已漂移。MANIFEST 自动发现不纳入本版本 |

---

## 决策推导

> 从 todo 一行话到具体验收标准之间的决策链路。每项推导过程：原始意图 → 现状发现 → 方案选项 → 选择理由。

### #1 任务模板提取

| 步骤 | 内容 |
|------|------|
| **Todo 原文** | "task 模板从 feat command 移动到 templates——可由用户进行定制" |
| **现状发现** | task.yaml 模板硬编码在 `packages/installer/templates/commands/feat.md` 第 84-151 行（一个 YAML 代码块），无独立源文件。MANIFEST 中无任何 task.yaml 条目——模板是 Agent 在 `/feat` 执行时动态写入。`packages/installer/templates/` 下无 `tasks/` 子目录 |
| **方案 A（采纳）** | 新建 `packages/installer/templates/tasks/feat-task.yaml`，MANIFEST 部署到 `.self-workflow/configs/templates/feat-task.yaml` |
| **方案 B（放弃）** | 命名为 `task.yaml` —— 过于通用，不支持未来 `fix-task.yaml`、`refactor-task.yaml` 等其他工作流类型拓展 |
| **方案 C（放弃）** | 放入 `configs/templates/` 与 10 个阶段产物模板混放 —— 任务模板是"结构定义"而非"阶段产物"，职责不同 |
| **选择理由** | `feat-` 前缀明确绑定 feat 工作流类型；独立 `tasks/` 目录为多工作流扩展留空间；首 init 时创建，无 `--force` 时不覆盖（用户定制不受影响） |

### #2 命名与提交信息优化

| 步骤 | 内容 |
|------|------|
| **Todo 原文** | "任务标题/描述/commit msg 生成优化——提升辨识度和可读性" |
| **现状发现** | Slug 生成是对用户输入的机械变换（CJK保留+ASCII小写+标点→`-`）。`V1.9`→`v1-9`丢失语义；`开始V1.7`中的`开始`无信息量；`先做v1-5-2的需求`是临时笔记语言。Commit message 固定模板 `<id>: phase-N gate passed` 无实质内容 |
| **方案 A（采纳）** | **语义理解生成**：Agent 读取用户描述 + todo.md 关联项，理解任务实质工作内容，提炼 2-4 个关键词生成 slug（如 `安装器重构-模板清理`）。机械规则保留仅为安全网（清理路径非法字符）。title/description 也由 Agent 精炼生成 |
| **方案 B（放弃）** | 优化机械规则（数字间点号保留+大小写保留）—— `V1.9版本` 仍只是版本号，不反映 4 项重构的工作内容。治标不治本 |
| **方案 C（放弃）** | 要求用户输入更好的描述 —— 增加用户负担，版本号是最自然的用法 |
| **选择理由** | 根本问题是"用户输入≠工作内容"，LLM 的语义理解是正确工具。中文项目保留中文 slug，有辨识度且人类可读。commit message 的模块摘要也依赖 Agent 语义提取 |

### #3 门控 SHA 关联

| 步骤 | 内容 |
|------|------|
| **Todo 原文** | "checkpoint tag/commit ID 关联到任务阶段——task.yaml 中记录每个 Gate checkpoint 对应的 commit SHA" |
| **现状发现** | Phase schema 有 8 个字段（id/name/status/gate/started/completed/artifact/errors），无任何 commit/tag/SHA 字段。Gate 通过时创建 `git tag <id>-ph<N>-<name>-gate-passed` 但 SHA 只存在于 git 对象库中，task.yaml 不知道。Compound 回退只能靠 `git log --grep` 按提交消息查找 |
| **存储位置方案 A（采纳）** | Phase schema 新增 `checkpoint: null` 字段。Gate 通过后 Agent 执行 `git rev-parse <tag>` 填充 SHA |
| **存储位置方案 B（放弃）** | 顶层新增 `checkpoints: {ph1-analysis: "sha", ...}` 映射 —— 冗余（phase 数量少且固定），增加维护负担（需同时维护 phase 数组和映射对象的一致性） |
| **初始值** | `null`（而非空字符串 `""`）—— 明确表达"尚未设置"语义，区分于"设置但为空"（不可能情况） |

### #4 三层目录清理

| 步骤 | 内容 |
|------|------|
| **Todo 原文** | "packages/installer/.opencode .self-workflow templates 三层目录关系梳理优化" |
| **现状发现** | `packages/installer/.opencode/` 和 `packages/installer/.self-workflow/` 是废弃死代码：未被 index.js 或其他任何文件引用、`installer/.opencode/` 缺 `feat.md`、`review-agent.md` 已漂移（3554 vs 3779 字节）、`installer/.self-workflow/docs/` 和 `tasks/` 为空。运行 `init --force` 时完全不涉及它们 |
| **方案 A（采纳）** | 删除 `packages/installer/.opencode/` 和 `packages/installer/.self-workflow/`，保留 `templates/` 为唯一源。新增 `packages/installer/README.md` 说明三层职责 |
| **方案 B（放弃）** | 直接在 `.opencode/` + `.self-workflow/` 维护 —— 优势是零同步开销，但丧失模板语义（无法 init 新项目、无法重置默认值） |
| **方案 C（放弃）** | 保留 `installer/.opencode/` + `.self-workflow/` 并修复漂移 —— 与 templates/ 职责重叠，维护 2 份副本造成混淆 |
| **MANIFEST 自动发现** | 不纳入本版本（改动面大，涉及 `--force` 覆盖逻辑变更、选择性忽略规则等，风险/收益不匹配） |

---

## 约束条件

### 技术约束

- **无运行时代码变更**：slug 生成、commit message 模板、task.yaml 字段定义均在 `.md` 指令文件中，不是 JS/TS 代码。修改 Markdown 文件即可。
- **安装器同步流**：所有修改必须遵循 `模板源 → init --force → 部署副本` 的流程。先改 `packages/installer/templates/`，再运行 `node packages/installer/index.js init --target . --force` 同步。
- **禁止直接改 `.opencode/`**：AGENTS.md 明确禁止。运行时文件由安装器管理。
- **不涉及现有 task 迁移**：新增 `checkpoint` 字段仅对新任务生效。已有 9 个 task.yaml 保持不变（向后兼容）。
- **MANIFEST 硬编码**：`packages/installer/index.js` 的 MANIFEST 数组目前是硬编码列表。如改为自动发现，需谨慎处理覆盖/忽略规则。

### 业务约束

- **自举连续性**：修改 `/feat` 命令模板后必须 `init --force`，确保当前会话后续 `/feat` 调用仍正常工作。
- **现有 tag 兼容**：新增 checkpoint 字段不影响已创建的 git tag。可通过 `git tag --points-at` 反查已有 tag 的 SHA。
- **用户可定制性**：提取的 task.yaml 模板应允许用户自行修改（加自定义字段、删减 phase 等），而不会被 `init --force` 覆盖（除非用户明确使用 `--force`）。

---

## 验收标准

### 功能验收

- [ ] **A1**：Given 用户运行 `node packages/installer/index.js init --target .`，When 初始化完成后，Then `.self-workflow/configs/tasks/` 下存在独立的 `feat-task.yaml` 文件，内容与当前 `feat.md` 中嵌入的 task.yaml 模板一致（且与阶段产物模板 `configs/templates/` 目录分离）。
- [ ] **A2**：Given Agent 执行 `/feat <描述>` 创建新工作流，When 写入 task.yaml 时，Then task.yaml 使用从 `.self-workflow/configs/tasks/feat-task.yaml` 加载的模板结构（不再是硬编码在 feat.md 中）；若模板文件不存在，Agent 提示安装并使用内联 fallback。
- [ ] **A3**：Given 用户修改了 `.self-workflow/configs/tasks/feat-task.yaml`（如增减 phase），When 后续 `/feat` 创建新任务时，Then 使用用户修改后的模板。⚠️ 注意：`init --force` 会覆盖定制文件，用户需自行备份定制内容。

- [ ] **B1**：Given 用户输入 `/feat V1.9版本`，When Agent 读取 todo.md 中 V1.9 的 4 项内容后生成 slug，Then slug 反映实际工作内容（如 `安装器重构-模板清理`）而非机械转换的 `v1-9版本`。
- [ ] **B2**：Given Gate 通过后创建 checkpoint，When Agent 生成 commit message 时，Then 格式为 `<id>: phase-<N> <阶段英文名> — <涉及模块摘要>`（如 `feat-安装器重构-模板清理-20260606: phase-3 implementation — installer/templates, feat.md, feat-workflow.md`）。
- [ ] **B3**：Given 任务仪表盘展示，When 人类查看时，Then `name` 和 `title` 均有辨识度——人类无需查看 todo 即可大致了解任务内容。`title` 含版本号+工作要点（如 `V1.9 安装器重构与模板清理`），`description` 含 todo 项摘要。

- [ ] **C1**：Given 阶段 Gate 通过后创建 Git tag，When Agent 更新 task.yaml 的 phase 状态时，Then 对应 phase 的 `checkpoint` 字段记录该 tag 的 commit SHA（通过 `git rev-parse <tag>` 获取）。
- [ ] **C2**：Given 工作流完成后执行 Compound，When 检查缺失的 tag 时，Then 若 git tag 缺失但 `checkpoint` 字段有 SHA，Agent 可从 SHA 补建 tag。

- [ ] **D1**：Given 删除 `packages/installer/.opencode/` 和 `packages/installer/.self-workflow/` 后，When 运行 `node packages/installer/index.js init --target . --force`，Then 所有运行时文件（`.opencode/` + `.self-workflow/`）与 templates/ 源完全一致，无功能缺失。
- [ ] **D2**：Given 三层目录结构梳理完成，When 新的贡献者查看 `packages/installer/` 目录时，Then 可以清晰理解 templates/ 是唯一源、index.js 控制分发、与运行时目录的职责边界（通过 README 或代码注释说明）。

### 质量要求

- [ ] **Q1**：所有修改经 `init --force` 同步后，`.opencode/` 和 `.self-workflow/` 内容与 `templates/` 源一致（无漂移）。
- [ ] **Q2**：feat.md 和 feat-workflow.md 的修改不破坏现有 `/feat` 命令的工作流执行。
- [ ] **Q3**：清洁性：删除废弃副本后 `packages/installer/` 根目录不再有 `.opencode/` 和 `.self-workflow/` 子目录。

---

## 不纳入范围

- 不修改 task.yaml 的 phase 结构（除新增 `checkpoint` 字段外），不改变 stages/gates 数量或顺序
- 不实现 MANIFEST 自动发现机制（仅评估可行性，如简单可附带实现，但非本版本目标）
- 不迁移已有 task.yaml 文件填充 `checkpoint` 字段（仅新任务生效）
- 不修改 installer 的 `--force` 覆盖逻辑
- 不涉及 `.self-workflow/configs/templates/` 下现有 10 个阶段产物模板的变更（仅新增 `feat-task.yaml`）
- 不改动 `packages/installer/templates/docs/` 的内容（骨架不变）

---

## 决策声明

- [x] ADR 已创建，见 adrs/ 目录：
  - [ADR-001](adrs/ADR-001-feat-task模板提取与目录结构.md)：feat-task.yaml 模板提取与目录结构
  - [ADR-002](adrs/ADR-002-Slug生成算法优化.md)：Slug 生成算法优化（数字间点号保留 + 大小写保留）
  - [ADR-003](adrs/ADR-003-Phase-Checkpoint-SHA字段设计.md)：Phase Checkpoint SHA 字段设计
  - [ADR-004](adrs/ADR-004-安装器三层目录清理.md)：安装器三层目录清理 + templates/ 唯一源化
