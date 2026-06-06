# 代码实现 — V1.6 质量收尾

> 工作流 ID：`feat-开始v1-6版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T21:00:00+08:00

---

## 修改清单

### #1: feat.md 移除已弃用模板检查 ✅

| 文件 | 操作 | 变更 |
|------|------|------|
| `packages/installer/templates/commands/feat.md` | 编辑 | 步骤 0 移除第 2 条检查（模板可用性）；错误处理表移除对应行 |

### #2: 经验文档命名符合 ADR-003 ✅

| 旧文件名 | 新文件名 | 方式 |
|---------|---------|------|
| `Gate强制步骤实施经验.md` | `gate-强制步骤-实施经验.md` | `git mv` |
| `gate-推理链一致性经验.md` | `gate-推理链一致性-实施经验.md` | `git mv` |
| `design-可定制性声明验证经验.md` | `design-可定制性声明验证-实施经验.md` | `git mv` |

| 文件 | 操作 | 变更 |
|------|------|------|
| `.self-workflow/docs/经验分级与加载指引.md` | 编辑 | 表格新增 3 行 |

无外部交叉引用需要更新（所有旧文件名引用均在 tasks/ 历史产物中）。

### #4: docs/todo.md 路径更新 ✅

| 文件 | 变更 |
|------|------|
| `docs/feat-command-需求设计.md` | 2 处：`docs/todo.md` → `.self-workflow/todo.md` |
| `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` | 1 处：`docs/todo.md` → `.self-workflow/todo.md` |
| `docs/V1.5/迭代需求/V1.5-后续迭代需求-20260606.md` | 1 处：`docs/todo.md` → `.self-workflow/todo.md` |

### #5: catchup.md 修复 plan.md 引用 ✅

| 文件 | 变更 |
|------|------|
| `packages/installer/templates/commands/catchup.md` | `读取 plan.md` → `读取 task.yaml 的 phases 段` |

### #6: 修复 task.yaml 重复 artifacts 键 ✅

| 文件 | 变更 |
|------|------|
| `.self-workflow/tasks/feat-先做v1-5-2的需求-20260606/task.yaml` | 删除行 29-32 顶层 `artifacts:` 键，保留 `structure.artifacts` |

### #8: ADR-003 标记"被超驰" ✅

| 文件 | 变更 |
|------|------|
| `.self-workflow/tasks/feat-实现feat命令-20260606/adrs/ADR-003-元数据模板填充策略.md` | 状态 `已选择` → `被超驰（superseded）`；末尾追加超驰说明段落 |

### #9: 删除 adr-review-template.md ✅

| 操作 | 路径 |
|------|------|
| 删除 | `packages/installer/templates/configs/templates/adr-review-template.md` |
| 删除 | `packages/installer/.self-workflow/configs/templates/adr-review-template.md` |
| 删除 | `.self-workflow/configs/templates/adr-review-template.md` |
| 编辑 | `packages/installer/index.js` 移除硬编码引用行 |
| 编辑 | `.self-workflow/todo.md` 标记 `[done]` |

### 安装器同步 ✅

`node packages/installer/index.js init --target . --force` → 26 项，0 错误。

---

## 验证总结

| AC | 项 | 验证方法 | 结果 |
|----|-----|---------|------|
| AC-1 | #1 | `grep workflow-metadata-template .opencode/commands/feat.md` | 0 匹配 ✅ |
| AC-2 | #2 | `ls .self-workflow/docs/` 文件名格式 | 全部符合 `<domain>-<category>.md` ✅ |
| AC-3 | #2 | `grep` 旧文件名（除 tasks/） | 0 残留 ✅ |
| AC-5 | #4 | `grep "docs/todo.md" docs/` | 0 匹配 ✅ |
| AC-6 | #5 | `grep "plan.md" .opencode/commands/catchup.md` | 0 匹配 ✅ |
| AC-7 | #6 | `grep "^artifacts:" task.yaml` | 仅 structure 下存在 ✅ |
| AC-9 | #8 | 读 ADR-003 状态 | 被超驰 + 超驰说明 ✅ |
| AC-10 | #9 | `glob **/adr-review-template*` | 0 结果 ✅ |

---

- [x] 本阶段无架构决策
