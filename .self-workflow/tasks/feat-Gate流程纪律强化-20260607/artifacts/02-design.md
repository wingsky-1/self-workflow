---
phase: 2
workflow: feat
description: 方案设计——修改文件范围、实施顺序、前置检查段机制设计
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — V1.21：Gate + 流程纪律强化

> 工作流 ID：`feat-Gate流程纪律强化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T20:45:00+08:00

---

## 架构决策记录

### ADR-001：前置检查段的结构与位置

详见 `adrs/ADR-001-前置检查段结构.md`

**摘要**：选择方案 A——前置检查作为独立的 `#### 前置检查` 段，放在 Gate 重量量化段之后、审查步骤之前。不嵌套在步骤编号中。

决策理由：语义正确（入场条件≠审查步骤）、防跳过（weight=skip 不连带跳过）、可读性好。

---

## 修改范围

### 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/installer/templates/configs/guides/feat-workflow.md` | 修改 | 主战场——4 个 Gate + Phase 3 入口 |
| `packages/installer/templates/commands/feat.md` | 修改 | 系统约束段同步 |
| `.self-workflow/configs/guides/feat-workflow.md` | 由安装器同步 | `init --force` 后自动更新 |
| `.opencode/commands/feat.md` | 由安装器同步 | `init --force` 后自动更新 |
| `docs/实现方案/gate-审查机制实现方案.md` | 评估后更新 | 如 Gate 步骤结构变更则同步（本次新增前置检查段，需更新） |

### 不修改的文件

- `.opencode/agents/review-agent.md` — review-agent 工具定义不变
- `.self-workflow/specs/` — 本次不涉及 spec 变更
- `.self-workflow/tasks/` — 已有实例不变

---

## 详细设计

### 1. feat-workflow.md：前置检查段模板

每个 Gate 在 `### Gate重量量化` 段和 `### 审查步骤` 段之间插入以下结构：

```markdown
#### 前置检查（进入审查前必须完成，不可跳过）

1. **量化输出（MUST，即使 weight=skip 也不可省略）**：
   按上述公式计算并显式输出：
   `scope=X(条件), risk=Y(条件), user-signal=Z(条件) → total=N → weight=skip/light/full`

2. **产物自查（MUST）**：
   逐项对照产物模板/规范检查阶段产物：
   - [ ] 产物完整性：所有 required-fields 均已填写
   - [ ] 模板一致性：内容结构与对应模板一致
   - [ ] 跨阶段一致性：未推翻前阶段已确认的结论（如有推翻，ADR 中需有显式反转说明）

3. **自检清单（MUST）**：
   - [ ] task.yaml phases 状态已同步（当前阶段 status=completed, gate=pending）
   - [ ] ADR 完整性：如本阶段有架构决策，adrs/ 下对应文件存在且 frontmatter 完整
   - [ ] 产物 frontmatter 合规：phase/description/validation 字段均完整

4. **程序化验证声明（MUST，不可静默跳过）**：
   [x] 程序化验证：跳过（本阶段无代码产出）
   —或—
   [_] 程序化验证：待执行（见下方步骤 1）
```

**Gate 差异**：

| Gate | 产物自查重点 | 程序化验证声明 |
|------|-------------|---------------|
| Gate 1（分析） | `01-analysis.md` vs `analysis-template.md` | 跳过（无代码产出） |
| Gate 2（设计） | `02-design.md` vs `design-template.md` + Phase 1 约束对照 | 跳过（无代码产出） |
| Gate 3（实现） | `03-implementation.md` vs `implementation-template.md` + 设计文档对照 | 待执行或显式跳过（附理由） |
| Gate 4（验证） | `04-verification.md` vs `verification-template.md` + 验收标准对照 | 待执行或显式跳过（附理由） |

### 2. feat-workflow.md：MUST NOT 阻断式措辞

各 Gate 审查步骤段增加 MUST NOT 指令：

| Gate | MUST NOT 指令 | 插入位置 |
|------|--------------|---------|
| Gate 1 | **MUST NOT** 在 review-agent 返回结果前推进至下一阶段。后台审查≠跳过 Gate——必须等待审查结果返回，根据结果决定通过/修复。 | 步骤 2（对抗性审查）末尾 |
| Gate 2 | **MUST NOT** 在方向审查或对抗性审查未通过时进入 Phase 3。 | 步骤 0/步骤 2 末尾 |
| Gate 3 | **MUST NOT** 跳过前置检查直接进入步骤 1。程序化验证不通过时 **MUST NOT** 跳过修复直接提交对抗性审查。 | 前置检查段末尾 + 步骤 1 末尾 |
| Gate 4 | **MUST NOT** 将仅做文件存在性检查的结果标记为"验证通过"（必须包含实质验证步骤）。 | 步骤 2 末尾 |

### 3. feat-workflow.md：Phase 3 入口方案确认

Phase 3 "代码实现"段，在执行内容列表**之前**增加：

```markdown
### 入口：方案确认（MUST，不可跳过）

进入编码前，Agent MUST 输出以下方案摘要并经用户确认：

1. **修改范围摘要**：列出所有待修改文件及每文件的变更简述
2. **实施顺序**：修改的顺序和依赖关系
3. **风险预案**：预期可能遇到的问题及预案

**确认话术**：
> 以上为本次实现的修改方案。请确认后开始编码，或提出调整。

用户确认后，方可开始编码。**MUST NOT** 在确认前修改任何文件。
```

### 4. feat-workflow.md：review-agent 提示词更新

每个 Gate 的 review-agent 调用提示词增加行为合规检查项：

| Gate | 新增检查项 |
|------|-----------|
| Gate 1 | "6. **Gate 纪律检查**：主 Agent 是否在本 Gate 入口执行了前置检查（量化输出+产物自查+自检清单）？如未执行，标注为 behavior: warning" |
| Gate 2 | "6. **Gate 纪律检查**：主 Agent 是否执行了前置检查、方向审查（步骤 0）？是否在方向审查未通过时仍继续？如违反，标注为 behavior: failed" |
| Gate 3 | "6. **Gate 纪律检查**：主 Agent 是否在编码前经用户确认了修改方案？是否执行了前置检查？程序化验证跳过时是否声明了理由？如违反任一，标注为 behavior: warning/failed" |
| Gate 4 | "6. **Gate 纪律检查**：主 Agent 是否执行了前置检查？验证是否仅做文件存在性检查而无实质验证？程序化验证跳过时是否声明了理由？如违反，标注为 behavior: warning" |

### 5. feat.md：系统约束同步

在 `### 系统约束` 段末尾增加：

```markdown
#### Gate 纪律（MUST，不可跳过）

- **Gate 未通过绝对不进入下一阶段**：Agent MUST 等待 review-agent 审查结果返回，根据结果决定通过/修复。后台审查≠跳过 Gate。
- **每个 Gate 入口执行前置检查**：按 `feat-workflow.md` 中对应 Gate 的"前置检查"段逐项执行（量化输出+产物自查+自检清单+程序化验证声明），不可跳过。
- **程序化验证不可静默跳过**：如项目无编译/测试套件，MUST 显式标注跳过理由。
- **实现前必须先确认方案**：Phase 3 入口 MUST 输出修改方案摘要并经用户确认，不可直接编码。
```

---

## 实施顺序

依赖关系：无——所有修改在同一文件的非重叠区域，可一次完成。

```
1. 修改 feat-workflow.md（模板源）
   ├── Gate 1：插入前置检查段 + MUST NOT + 更新 review-agent prompt
   ├── Gate 2：插入前置检查段 + MUST NOT + 更新 review-agent prompt
   ├── Gate 3：插入前置检查段 + MUST NOT + 更新 review-agent prompt
   ├── Gate 4：插入前置检查段 + MUST NOT + 更新 review-agent prompt
   └── Phase 3 入口：增加方案确认段
2. 修改 feat.md（模板源）
   └── 系统约束段：增加 Gate 纪律子段
3. 运行 `node packages/installer/index.js init --target . --force`
   └── 同步到 .self-workflow/ 和 .opencode/
4. 更新 docs/实现方案/gate-审查机制实现方案.md
   └── 架构概览中增加"前置检查"步骤
```

---

## 数据模型

### 新增结构：前置检查段

每个 Gate 新增以下 Markdown 子段：

```
#### 前置检查（进入审查前必须完成，不可跳过）
├── 1. 量化输出 (MUST)
├── 2. 产物自查 (MUST) — 含 3 项子检查
├── 3. 自检清单 (MUST) — 含 3 项子检查
└── 4. 程序化验证声明 (MUST) — 二选一模板
```

### 变更结构：Gate 审查段结构

```
Before:
  ### Gate：XX审查
  ├── ### Gate重量量化
  └── ### 审查步骤
      ├── 步骤 0/1/2/3...

After:
  ### Gate：XX审查
  ├── ### Gate重量量化
  ├── #### 前置检查 ← NEW
  └── ### 审查步骤
      ├── 步骤 0/1/2/3... (末尾增加 MUST NOT)
```

### 变更结构：Phase 3 入口

```
Before:
  ## 阶段 3：代码实现
  ├── **目标**：...
  └── ### 执行内容

After:
  ## 阶段 3：代码实现
  ├── **目标**：...
  ├── ### 入口：方案确认 ← NEW
  └── ### 执行内容
```

### 变更结构：feat.md 系统约束

```
Before:
  ### 系统约束
  ├── #### task() 调用规范
  ├── #### spec 规范
  ├── #### Gate 量化公式
  └── #### 决策捕捉

After:
  ### 系统约束
  ├── #### task() 调用规范
  ├── #### spec 规范
  ├── #### Gate 量化公式
  ├── #### Gate 纪律 ← NEW
  └── #### 决策捕捉
```

---

## 决策捕捉

- [x] ADR 已创建，见 `adrs/ADR-001-前置检查段结构.md`（前置检查段位置选择：独立段 vs 步骤 0 vs 嵌入量化段）

## 实现方案文档评估

`docs/实现方案/gate-审查机制实现方案.md` 需要更新——架构概览图中需增加"前置检查"步骤（在 Gate 入口 → 量化 → **前置检查** → 审查步骤...）。将在 Phase 3 实现时同步更新。
