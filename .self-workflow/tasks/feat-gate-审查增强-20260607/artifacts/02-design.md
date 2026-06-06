# 方案设计 — V1.10：Gate + 审查增强

> 工作流 ID：`feat-gate-审查增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T01:30:00+08:00

---

## 设计概述

V1.10 方案核心：修改单个文件（`feat-workflow.md` 的模板源），通过 6 处 Gate/Phase/Compound 章节的改动，实现文档变更审查和对抗性审查增强。不引入新文件，不修改 `feat.md` 命令。

---

## 架构决策

| ADR | 标题 | 选择 |
|-----|------|------|
| [ADR-001](adrs/ADR-001-文档审查注入点.md) | 文档变更审查的注入点 | 混合模式：Gate 确认 commit + Compound 集中审查 |
| [ADR-002](adrs/ADR-002-对抗性提示词策略.md) | 对抗性审查提示词改写策略 | 按 Gate 差异化定制 + COT 推理链 |

---

## 修改清单

### 目标文件

| 文件 | 位置 | 修改类型 |
|------|------|---------|
| `feat-workflow.md` | `packages/installer/templates/configs/guides/feat-workflow.md`（模板源） | 多处修改（见下方详细设计） |
| `review-report-template.md` | `packages/installer/templates/configs/templates/review-report-template.md`（模板源） | 可选：增加对抗性审查发现分类 |

### 同步方式

修改模板源后执行：`node packages/installer/index.js init --target . --force`

---

## 详细设计

### 改动 1：Gate 1 分析审查 — 对抗性提示词升级

**位置**：`feat-workflow.md` → Gate：分析审查 → 步骤 2：对抗性审查

**当前**：
```
task(subagent_type="review-agent", prompt="审查需求分析文档 <artifacts/01-analysis.md>。
检查：需求理解是否与用户输入一致？功能清单是否覆盖全部需求？验收标准是否可测试(Given-When-Then)？
约束条件是否合理？不纳入范围是否明确？输出：pass/fail，如 fail 列出具体问题。")
```

**改为**：
```
task(subagent_type="review-agent", prompt="以质疑的立场审查需求分析文档 <artifacts/01-analysis.md>。
不假设文档正确——主动寻找遗漏、矛盾和不一致。

重点攻击以下弱点：
1. 需求是否覆盖了用户的隐含期望（而非仅字面要求）？
2. 每条验收标准是否可客观判断通过/失败？尝试构造一个让它失败的场景。
3. 不纳入范围是否合理？有没有应该纳入但被排除的内容？
4. 约束条件是否遗漏了已知的项目规范？

输出：pass/fail/warning，如非 pass 列出具体问题和攻击点。

请逐项输出你的推理链：你检查了什么、发现了什么证据、如何得出结论。")
```

**设计意图**：
- "攻击弱点" 替代 "检查" → 立场从确认转为挑战
- "尝试构造让它失败的场景" → 针对 Phase 4 形式化验证问题的预防
- "隐含期望" → 防止只满足字面需求

---

### 改动 2：Gate 2 设计审查 — 增加文档变更检测

**位置**：`feat-workflow.md` → Gate：设计审查 → 通过条件

**当前**：方向审查 + 设计文档 + 对抗性审查 + behavior 维度 + 可选人工确认

**新增通过条件项**：
```
- [ ] **文档变更确认**：确认本阶段产生的 `docs/`、`configs/`、`specs/` 变更已 commit。
```

> Gate 2 的对抗性审查已使用 Grill 风格，不需要改动提示词。

---

### 改动 3：Gate 3 实现审查 — 对抗性提示词升级 + 交叉一致性

**位置**：`feat-workflow.md` → Gate：实现审查 → 步骤 2：对抗性审查

**当前**：
```
task(subagent_type="review-agent", prompt="审查代码实现。对照设计文档 <artifacts/02-design.md> 检查：
实现是否与设计一致？代码质量(命名、结构)？测试覆盖是否充分？是否引入安全漏洞？
输出：passed/warning/failed，如非 passed 列出具体问题。")
```

**改为**：
```
task(subagent_type="review-agent", prompt="以质疑的立场审查代码实现。对照设计文档 <artifacts/02-design.md>，
假设实现有缺陷——逐项找出它偏离设计的地方。

重点攻击以下弱点：
1. **设计一致性**：逐项对照设计文档的接口定义、数据模型、关键决策，找出任何偏差。
2. **遗漏检查**：设计文档中提到的所有功能点是否都已实现？有没有被跳过的？
3. **隐性变更**：除了设计文档要求的内容，是否引入了未声明的修改？
4. **代码质量**：命名是否清晰？错误处理是否完整？测试是否覆盖了边界和错误路径？
5. **安全**：是否有潜在的注入、越权或数据泄露问题？

输出：passed/warning/failed，如非 passed 列出具体偏差和遗漏。

请逐项输出你的推理链：你检查了什么、发现了什么证据、如何得出结论。")
```

**新增加通过条件项**：
```
- [ ] **交叉一致性**：实现与设计文档的接口定义、数据模型逐项对照无偏差
```

---

### 改动 4：Gate 4 验证审查 — 对抗性提示词升级 + 验收对照

**位置**：`feat-workflow.md` → Gate：验证审查 → 步骤 2：对抗性审查

**当前**：
```
task(subagent_type="review-agent", prompt="审查验证结果文档 <artifacts/04-verification.md>。
检查：测试覆盖是否充分？边界条件是否处理？是否引入回归问题？验收标准是否全部满足？
输出：passed/warning/failed。")
```

**改为**：
```
task(subagent_type="review-agent", prompt="以质疑的立场审查验证结果文档 <artifacts/04-verification.md>。
不要信任任何标记为"通过"的项——逐一质疑其证据是否充分。

重点攻击以下弱点：
1. **形式化验证**：验证报告中的"通过"是否有实质证据？是否仅做了文件存在性检查而无运行时验证？
2. **验收标准对照**：逐条对照 Phase 1 的验收标准（<artifacts/01-analysis.md>），每条"通过"是否有对应的验证步骤和结果？
3. **反向检查**：涉及"删除/替换/清理"的变更，是否验证了旧内容已不存在？
4. **边界条件**：是否测试了空值、边界值、错误路径？

输出：passed/warning/failed，如非 passed 列出缺乏实质证据的"通过"项。

请逐项输出你的推理链：你检查了什么、发现了什么证据、如何得出结论。")
```

**新增加通过条件项**：
```
- [ ] **验收标准对照**：Phase 1 的每条验收标准在验证报告中均有对应的验证步骤和通过证据
- [ ] **方向审查（交叉一致性）**：验证结果与 Phase 1 的需求分析结论无矛盾
```

---

### 改动 5：Phase 4 功能验证 — 检查清单增强

**位置**：`feat-workflow.md` → 阶段 4：功能验证 → 完成检查清单

**新增检查项**：

```
- [ ] **反向检查**：涉及"删除/替换/清理"的变更，已同时验证：
  - 正向：新内容存在且功能正常
  - 反向：旧内容/旧代码/旧路径已不存在
  （参考模式：验收验证的双重检查）
- [ ] **运行时等价验证**：涉及外部平台约定（如 OpenCode Plugin 目录名、注册机制）的变更，已验证：
  - 文件存在且位置符合平台约定
  - 平台注册/发现机制能正确加载（非仅静态文件检查）
  （参考错误经验：Phase Gate 验证不能形式化）
```

---

### 改动 6：Compound — 文档变更审查

**位置**：`feat-workflow.md` → Compound（自动执行）

**当前**：Compound 已有 7 步（确认产物完整性 → Git tag 补建 → 交叉引用检查 → 更新元数据 → Compound tag → 经验草稿标记 → 标记完成）

**在第 3 步（交叉引用检查）之后，新增第 4 步（文档变更审查），原步骤 4-7 顺延**：

```
4. **文档变更审查**：扫描本工作流所有阶段产生的 `docs/`、`configs/`、`specs/` 变更，执行以下审查：

   **审查范围确定**：
   - 扫描 `git diff --name-only <workflow-id>-ph1-analysis-gate-passed..HEAD` 
   - 筛选 `.self-workflow/docs/`, `.self-workflow/configs/`, `.self-workflow/specs/` 下的文件
   - 排除 `.self-workflow/tasks/<workflow-id>/` 下的文件（那些是任务内部文件，不在审查范围）

   **审查标准**：
   | 目录 | 检查项 |
   |------|--------|
   | `docs/` | frontmatter 完整性（title/category/tags/date/source/quality）; tag 使用 English lowercase; 受众正确性 |
   | `configs/` | YAML/格式正确性; 与安装器模板源一致性（如有对应模板源） |
   | `specs/` | frontmatter 层级合规性（type/level/tags/version/summary 完整）; summary 字段非空 |

   **执行方式**：主 Agent 自行审查（Review Agent 的审查已经包含在 Gate 中，Compound 的文档审查是最终的规范性检查）。

   **严重级别**：
   - blocking：YAML 格式错误、spec 层级标记为 default 但缺少 summary 字段
   - warning：tag 大小写不一致、frontmatter 缺少非必填字段
   - info：tag 可优化

   **通过条件**：无 blocking 问题。如有 warning，记录到 errors.yaml（type: compound-doc-review, severity: minor）。
```

**同时更新 Compound 开头的步骤编号**：将"3. 交叉引用检查"编号不变，在其后插入新步骤"4. 文档变更审查"，原步骤 4→5, 5→6, 6→7, 7→8。

---

## 各 Gate 文档变更检测机制

每个 Gate（2/3/4）的通过条件中新增一条：

```
- [ ] **文档变更检测**：确认本阶段产生的 `docs/`、`configs/`、`specs/` 变更已 commit（`git status` 无未暂存变更）。Compound 步骤 4 将执行完整审查。
```

**检测方式**：Agent 在每个 Gate 入口检查 `git status` — 如有未 commit 的文档变更则提醒 commit。不标记到 task.yaml，不触发额外审查。文档审查由 Compound 步骤 4 的 `git diff` 独立完成。

> 注：此检测项仅在 Gate weight=full/light 时执行。如果 Gate 被跳过（weight=skip），文档审查仍由 Compound 步骤 4 覆盖。
>
> Phase 1 和 Phase 5：Phase 1 通常不产生文档变更；Phase 5 无 Gate，其文档变更直接由 Compound 覆盖。

---

## 不做的设计选择

| 不做 | 理由 |
|------|------|
| 创建独立的"文档审查 Gate" | Gate 体系已足够复杂，新增 Gate 需要改命令流程，对 P2 版本过重 |
| 实时文件变更监听 | 需要 OS-level 机制，不属于流程改进范畴 |
| 修改 Review Agent 的系统提示词 | Review Agent 是 OpenCode 内置，不可配置 |
| 新建文档审查模板 | 审查标准已嵌入 Compound 章节，不需要独立模板 |
| Gate 层触发 Review Agent 审查文档变更 | **验收标准偏离**：F1a 原要求"Review Agent 收到文档审查指令"——被 ADR-001 方案 C 替代为 Compound 集中审查。Gate 层仅做 commit 状态确认。

---

## 影响评估

| 维度 | 评估 |
|------|------|
| **向后兼容** | ✅ 完全兼容。所有改动是新增检查项和提示词升级，不改变现有 Gate 流程结构。 |
| **Agent 行为变化** | Review Agent 审查更严格，可能增加 Gate 不通过率——但这是预期效果（减少假阴性） |
| **token 消耗** | 提示词长度增加约 15-20%（每个 Gate 增加 3-5 行）；Compound 增加文档审查步骤。总体可控。 |
| **维护成本** | 仅修改一个文件（feat-workflow.md），维护点集中。 |

---

## 决策捕捉

- [x] ADR 已创建：
  - `adrs/ADR-001-文档审查注入点.md` — 选择混合模式
  - `adrs/ADR-002-对抗性提示词策略.md` — 选择按 Gate 差异化
