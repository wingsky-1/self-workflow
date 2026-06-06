# 方案设计 — V1.5.1 Gate强制步骤

> 工作流 ID：`feat-v1-5-1-gate强制步骤-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T20:10:00+08:00（ADR 章节已精简为引用表，完整决策内容见 adrs/）

---

## 架构决策记录

> 完整 ADR 内容见 `adrs/` 目录下的独立文件。本节仅保留决策摘要和引用。
> 关于"ADR内联 vs 引用"的决策，见 [ADR-004](adrs/ADR-004-设计文档ADR引用而非内联.md)。

| ADR | 决策 | 选择 | 要点 | 文件 |
|-----|------|------|------|------|
| 001 | F3 量化公式：复制 vs 引用 | 混合方案（C） | 附录保留 canonical 定义，4 个 Gate 入口各含自包含计算指令——防止 Agent 跳转引用 | [ADR-001](adrs/ADR-001-F3量化公式混合方案.md) |
| 002 | F1 Compound 补建：反查算法 | git log --grep（A） | 用 commit message 反查定位 Gate 通过时的 commit SHA，补建缺失 tag | [ADR-002](adrs/ADR-002-Compound补建tag反查算法.md) |
| 003 | F2 ADR 检查：防绕过 | 显式声明（B） | 每阶段完成时强制标注"无决策"或引用 ADR 路径，留下审计痕迹 | [ADR-003](adrs/ADR-003-显式声明防绕过.md) |
| 004 | 设计文档中ADR呈现方式 | 引用而非内联 | 设计文档仅保留摘要表+链接，完整内容只在 adrs/ 独立文件中——避免维护两份相同内容 | [ADR-004](adrs/ADR-004-设计文档ADR引用而非内联.md) |

---

## 接口设计

> 本任务为纯文档修改，无代码接口。以下"接口"指 feat-workflow.md 中各章节的修改规范。

### 修改点矩阵

#### M1: 量化公式复制到 4 个 Gate 入口

| Gate | 插入位置 | 插入内容 |
|------|---------|---------|
| Gate 1 (分析审查, L91) | "### 审查步骤" 之前 | 量化计算块（见下） |
| Gate 2 (设计审查, L180) | "### 审查步骤" 之前 | 量化计算块 |
| Gate 3 (实现审查, L283) | 替换现有 L321-346 | 更新为自包含计算块 + 保留规范定义表 |
| Gate 4 (验证审查, L384) | "### 审查步骤" 之前 | 量化计算块 |

**量化计算块模板**（每个 Gate 入口插入）：

```markdown
### Gate 重量量化（入口强制计算）

进入本 Gate 前，显式输出三维分值（**输出位置：当前 Gate 审查产出的开头，或对话中显式输出**）：

- scope: [single-file / multi-file / cross-module] → [分值]
- risk: [typo-config / logic-change / architecture] → [分值]
- user-signal: [quick-mode / default / full-review] → [分值]
- **total = [分值]** → **weight = [skip / light / full]**

> 量化结果决定本 Gate 的审查强度（skip=全跳过 / light=仅程序化验证 / full=完整审查）。
> 量化标准见附录"Gate 重量速查"。
```

#### M2: ADR 检查清单修改（5 个阶段）

每个阶段的"完成检查清单"中修改 2 处：

1. 将 `- [ ] **决策捕捉**：阶段中有没有需要记录的决策？（…→ 需要 ADR）`
   改为 `- [ ] **决策捕捉**：检查 adrs/ 目录——如果本阶段有架构决策，adrs/ 下必须有对应 ADR 文件（非空，含来源引用+决策理由）`

2. 新增 `- [ ] **决策声明**：显式标注——`[ ] 本阶段无架构决策` 或 `[x] ADR 已创建，见 adrs/ADR-XXX-xxx.md``

#### M3: Git tag 强制检查项（4 个 Gate 通过条件）

每个 Gate 的"通过条件" section 中新增一行：

```markdown
- [ ] Git tag checkpoint 已创建（`<workflow-id>-ph<N>-<name>-gate-passed`）
```

#### M4: Compound 补建逻辑（L499-517）

在 Compound section 的步骤 1 和 2 之间插入"步骤 2：Git tag 补建"：

```markdown
2. **Git tag 补建**：扫描各阶段 gate，缺失的 tag 补建：
   - 对于 phase N（1-5），若 `gate: passed` 但无对应 tag：
     a. `git log --oneline --grep="<workflow-id>: phase-<N> gate passed"` 定位 commit
     b. `git tag <workflow-id>-ph<N>-<name>-gate-passed <commit-sha>` 补建
     c. 记录到 errors.yaml（type: compound-recovery, severity: minor）
```

原步骤 2-5 顺延为步骤 3-6。

#### M5: 工作流状态管理 — tag 创建强调（L568）

将步骤 c：
```markdown
c. **Gate 通过**：创建 Git tag checkpoint，更新 task.yaml...
```
改为：
```markdown
c. **Gate 通过**（必须执行 tag 创建，不可跳过）：创建 Git tag checkpoint，更新 task.yaml...
```

#### M6: 附录 Gate 重量速查表更新（L523-532）

将表头行改为显式说明：
```markdown
| Gate | weight | 方向审查 | 程序化验证 | 对抗性审查（含行为审查） | 人工确认 |
|------|--------|---------|-----------|------------------------|---------|
| 分析审查 | *量化决定* | — | 跳过 | ✅ Review Agent | ✅ 需要 |
| 设计审查 | *量化决定* | ✅ 新增 | 跳过 | ✅ Grill 风格 + behavior | ⚠️ 可选 |
| 实现审查 | *量化决定* | — | ✅ lint/typecheck/test | ✅ Review Agent | ❌ |
| 验证审查 | *量化决定* | — | ✅ 完整测试套件 | ✅ Review Agent | ❌ |
```

并增加说明：
```markdown
> ⚠️ weight 列标注 `*量化决定*` 意为不可直接使用声明值——必须以 scope+risk+user-signal 三维公式计算结果为准。
```

#### M7: 版本号更新

`version: 0.2` → `version: 0.3`

---

### 修改统计

| 章节 | 修改点数 | 类型 |
|------|---------|------|
| Gate 1 (L91-132) | +1 量化块, +1 tag检查项 | 插入 |
| Gate 2 (L180-244) | +1 量化块, +1 tag检查项 | 插入 |
| Gate 3 (L283-353) | +1 量化块(替换), +1 tag检查项 | 修改 |
| Gate 4 (L384-413) | +1 量化块, +1 tag检查项 | 插入 |
| 阶段 1 检查清单 (L76-81) | 改2处（ADR检查 + 决策声明）| 修改 |
| 阶段 2 检查清单 (L164-171) | 改2处 | 修改 |
| 阶段 3 检查清单 (L267-274) | 改2处 | 修改 |
| 阶段 4 检查清单 (L374-380) | 改2处 | 修改 |
| 阶段 5 检查清单 (L433-438) | 改2处 | 修改 |
| Compound (L499-517) | +1 步骤(补建) | 插入 |
| 工作流状态管理 (L559-568) | 改1处(c步骤强调) | 修改 |
| 附录速查表 (L523-532) | 改表头 + 加说明 | 修改 |
| 版本号 (L4) | version 0.2→0.3 | 修改 |
| **总计** | **约 28 处修改** | |

---

## 数据模型

本任务为纯文档修改，无新增或变更数据结构。涉及的文件仅为：

- 修改：`packages/installer/templates/configs/guides/feat-workflow.md`
- 同步生成：`.self-workflow/configs/guides/feat-workflow.md`（由安装器生成，不直接编辑）

---

## 实施顺序

```
1. 修改安装器模板源 feat-workflow.md（~28处）
2. 运行安装器同步：node packages/installer/index.js init --target . --force
3. 验证同步结果：diff 模板源 vs 部署副本
4. 测试：检查部署副本是否包含所有修改点
```
