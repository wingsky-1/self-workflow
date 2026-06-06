# 功能验证 — V1.6 质量收尾

> 工作流 ID：`feat-开始v1-6版本-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T21:10:00+08:00

---

## 验收标准逐条验证

| AC | 描述 | 验证命令/方法 | 结果 |
|----|------|-------------|------|
| AC-1 | /feat 步骤 0 不再检查 workflow-metadata-template | `grep "workflow-metadata-template" .opencode/commands/feat.md` → 0 | ✅ |
| AC-2 | docs/ 文件名符合 `<领域>-<分类>.md` | `ls .self-workflow/docs/` 9 文件全部符合格式 | ✅ |
| AC-3 | 旧文件名无残留引用（除 tasks/） | `grep -r "Gate强制步骤实施经验" .self-workflow/` → 仅 tasks/ | ✅ |
| AC-5 | 根 docs/ 无 `docs/todo.md` 引用 | `grep -r "docs/todo\.md" docs/` → 0 | ✅ |
| AC-6 | catchup.md 无 plan.md 引用 | `grep "plan\.md" .opencode/commands/catchup.md` → 0 | ✅ |
| AC-7 | task.yaml 无重复 artifacts 键 | `grep "^artifacts:" task.yaml` → 仅 `structure.artifacts` | ✅ |
| AC-9 | ADR-003 状态为被超驰 | 读取 ADR → `\| 状态 \| 被超驰（superseded） \|` + 超驰说明段落 | ✅ |
| AC-10 | adr-review-template.md 已删除 | `glob **/adr-review-template*` → 0 | ✅ |

> AC-4 和 AC-8 因 #3、#7 移除而取消。

---

## 安装器同步验证

```
node packages/installer/index.js init --target . --force
→ 26 项，0 错误
→ feat.md、catchup.md、feat-workflow.md 等全部模板正确同步
→ 不再报 adr-review-template.md 缺失错误（已从 index.js MANIFEST 移除）
```

---

## 修改文件完整性

| 类别 | 文件数 | 说明 |
|------|--------|------|
| 编辑 | 11 | feat.md, catchup.md, feat-workflow.md, index.js, todo.md, task.yaml(×1), ADR-003, 3 docs(路径更新), 经验分级与加载指引.md |
| 重命名 | 3 | `git mv` 3 个经验文档 |
| 删除 | 3 | adr-review-template.md ×3 副本 |
| 同步 | 18 | init --force 同步到 .self-workflow/ 和 .opencode/ |

---

## 边界条件检查

- [x] 文件重命名后 Git 历史保留（`git mv` 使用）
- [x] init --force 不覆盖用户自定义（已检查无非标准配置）
- [x] 旧文件名 grep 仅 tasks/ 历史产物命中（预期行为）
- [x] 安装器 index.js MANIFEST 更新后重新同步验证通过
- [x] todo.md 中 #9 标记 `[done]` 后 YAML 格式仍有效

---

## 结论

全部 8 项验收标准通过。无已知严重问题。

- [x] 本阶段无架构决策
