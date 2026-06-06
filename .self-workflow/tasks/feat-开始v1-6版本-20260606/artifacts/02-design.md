# 方案设计 — V1.6 质量收尾

> 工作流 ID：`feat-开始v1-6版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T20:50:00+08:00

---

## 总体策略

按 P0 → P1 → P2 顺序执行，每项原子化、独立可验证。涉及安装器模板的项先改模板源 `packages/installer/templates/`，再运行 `node packages/installer/index.js init --target . --force` 同步。

**本阶段无架构决策**。所有项都是定点修复——删除、重命名、路径替换、标记状态变更。

---

## P0 项设计

### #1: feat.md 移除已弃用模板检查

**目标**：`/feat` 命令步骤 0 不再检查 `workflow-metadata-template.yaml`。

**影响文件**：

| 文件 | 操作 | 变更内容 |
|------|------|---------|
| `packages/installer/templates/commands/feat.md` (模板源) | 修改 | 步骤 0 移除第 2 条检查（"模板可用性"），同时移除错误处理表中的对应条目 |
| `packages/installer/templates/configs/guides/feat-workflow.md` (模板源) | 修改 | 行 622 的注释 "创建模板参考：..." 改为明确标注已废弃 |

**不改**：`.self-workflow/configs/guides/feat-workflow.md`（通过 init --force 同步）

**执行步骤**：
1. 编辑 `packages/installer/templates/commands/feat.md`：删除步骤 0 的第 2 条检查及错误表对应行
2. 编辑 `packages/installer/templates/configs/guides/feat-workflow.md`：更新行 622 注释措辞
3. 运行 `node packages/installer/index.js init --target . --force` 同步到 .self-workflow/

**验证**：读取 `.self-workflow/` 下部署后的 feat.md，确认步骤 0 无 `workflow-metadata-template` 检查

---

### #2: 经验文档命名符合 ADR-003

**目标**：3 个文件名重命名为 `<领域>-<分类>.md` 格式。

**重命名表**：

| 旧文件名 | 新文件名 |
|---------|---------|
| `Gate强制步骤实施经验.md` | `gate-强制步骤-实施经验.md` |
| `gate-推理链一致性经验.md` | `gate-推理链一致性-实施经验.md` |
| `design-可定制性声明验证经验.md` | `design-可定制性声明验证-实施经验.md` |

**影响文件**（需更新内部引用）：

| 文件 | 引用类型 | 处理 |
|------|---------|------|
| `.self-workflow/docs/经验分级与加载指引.md` | "当前已有经验"表格 | 更新文件名 |
| `.self-workflow/docs/V1.5-实施经验.md` | 可能互引 | 检查后更新 |
| `.self-workflow/docs/gate-推理链一致性经验.md` | 关联 ADR 引用 | 无需改（文件内部不变） |
| 其他 `.self-workflow/docs/*.md` | 可能的互引 | `grep` 检查后更新 |

**执行步骤**：
1. `git mv` 重命名 3 个文件（保留 Git 历史）
2. `grep` 搜索旧文件名 → 更新所有引用
3. 更新 `经验分级与加载指引.md` 中"当前已有经验"表格

**验证**：`grep -r "Gate强制步骤实施经验" .self-workflow/` 返回 0（除 tasks/ 历史产物外）

---

## P1 项设计

### #4: docs/todo.md 路径更新

**目标**：3 份根级 docs/ 文档中的 `docs/todo.md` 更新为 `.self-workflow/todo.md`。

**影响文件**：

| 文件 | 行号 | 变更 |
|------|------|------|
| `docs/feat-command-需求设计.md` | 6, 393 | `docs/todo.md` → `.self-workflow/todo.md` |
| `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` | 5 | `docs/todo.md` → `.self-workflow/todo.md` |
| `docs/V1.5/迭代需求/V1.5-后续迭代需求-20260606.md` | 3 | `docs/todo.md` → `.self-workflow/todo.md` |

**执行**：直接编辑 3 个文件，替换路径引用。

**验证**：`grep -r "docs/todo\.md" docs/` 返回 0（不匹配 `.self-workflow/todo.md`）

---

### #5: catchup.md 修复 plan.md 引用

**目标**：catchup.md 第 20 行不再引用已废弃的 `plan.md`，改为读 `task.yaml` 的 phases 段。

**影响文件**：

| 文件 | 行号 | 变更 |
|------|------|------|
| `packages/installer/templates/commands/catchup.md` (模板源) | 20 | `读取 plan.md 了解该任务的执行计划` → `读取 task.yaml 的 phases 段了解当前进度` |

**执行步骤**：
1. 编辑模板源
2. 运行 `node packages/installer/index.js init --target . --force` 同步到 `.opencode/commands/catchup.md`

**验证**：读取 `.opencode/commands/catchup.md`，确认无 `plan.md` 引用

---

### #6: 修复 task.yaml 重复 artifacts 键

**目标**：`feat-先做v1-5-2的需求-20260606/task.yaml` 删除重复的顶层 `artifacts` 键。

**当前问题**：
```yaml
structure:          # 行 12-25
  root: [...]
  adrs: [...]
  artifacts: [...]  # ← 正确的 artifacts（structure 下）

artifacts:          # 行 29-32 ← 重复的顶层键
  - "workflow.yaml"
  - "adrs/"
  - "artifacts/"
```

**变更**：删除行 29-32 的顶层 `artifacts` 键及其值。

**执行**：直接编辑 `feat-先做v1-5-2的需求-20260606/task.yaml`

**验证**：Python/PowerShell YAML 解析不报错；`grep -c "artifacts:"` 结果为 1

---

## P2 项设计

### #8: ADR-003 标记"被超驰"

**目标**：`feat-实现feat命令-20260606/adrs/ADR-003-元数据模板填充策略.md` 状态从"已选择"改为"被超驰"。

**超驰原因**：V1.5.2 的 ADR-001 将 workflow.yaml 合并到 task.yaml，该 ADR 讨论的"模板驱动填充 workflow.yaml"方案因目标文件不存在而失效。

**变更**：
```yaml
# Before (行 6)
| 状态 | 已选择 |

# After
| 状态 | 被超驰（superseded by ADR-001 — workflow.yaml 已废弃） |
```

同时在文档末尾追加超驰说明段落。

**执行**：直接编辑该 ADR 文件。

**验证**：读取 ADR-003，状态为"被超驰"并含超驰理由。

---

### #9: 删除 adr-review-template.md

**目标**：删除 3 处副本，更新 `.self-workflow/todo.md` 中的引用。

**删除清单**：

| 路径 | 操作 |
|------|------|
| `packages/installer/templates/configs/templates/adr-review-template.md` (模板源) | 删除 |
| `.self-workflow/configs/templates/adr-review-template.md` | 通过 init --force 自动消失 |
| `packages/installer/.self-workflow/configs/templates/adr-review-template.md` | 手动删除（旧版本残留） |

**引用更新**：

| 文件 | 操作 |
|------|------|
| `.self-workflow/todo.md` 行 43 | 标记为 `[done]` 或移除 |

**执行步骤**：
1. 删除模板源文件
2. 删除 `packages/installer/.self-workflow/` 下的旧副本
3. 运行 `init --force` 同步
4. 更新 `.self-workflow/todo.md`

**验证**：`glob **/adr-review-template*` 返回 0；todo.md 该项已标记完成

---

## 执行顺序

```
#1 feat.md 移除检查 → #2 文件重命名 → init --force(同步#1)
#4 路径更新(直接编辑) → #5 catchup.md修复 → init --force(同步#5)
#6 重复键修复(直接编辑)
#8 ADR标记(直接编辑) → #9 模板删除 → init --force(同步#9)
```

所有 init --force 合并为一次执行（最后统一同步）。

---

## 验收标准对照

| AC | 对应项 | 验证方法 |
|-----|--------|---------|
| AC-1 | #1 | 读 feat.md 步骤 0，无 template 检查 |
| AC-2 | #2 | `ls docs/` 文件名格式正确 |
| AC-3 | #2 | `grep` 旧文件名无残留 |
| AC-5 | #4 | `grep "docs/todo.md" docs/` 返回 0 |
| AC-6 | #5 | 读 catchup.md，无 plan.md |
| AC-7 | #6 | 读 task.yaml，无重复键 |
| AC-9 | #8 | 读 ADR-003，状态为 superseded |
| AC-10 | #9 | `glob` 模板文件不存在；todo.md 已更新 |

> AC-4 和 AC-8 因 #3、#7 移除而取消。

---

- [x] 本阶段无架构决策
