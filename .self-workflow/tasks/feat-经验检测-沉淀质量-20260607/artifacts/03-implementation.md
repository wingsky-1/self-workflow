# 代码实现 — V1.16+V1.17 经验复利机制

> 工作流 ID：`feat-经验检测-沉淀质量-20260607`
> 时间戳：2026-06-07T07:10:00

## 变更清单

| 文件 | 操作 | 路径 |
|------|------|------|
| SKILL.md | 新增 | `packages/installer/templates/skills/exp-governance/SKILL.md` |
| exp-governance.md | 新增 | `packages/installer/templates/specs/default/exp-governance.md` |
| feat-workflow.md | 修改 | `packages/installer/templates/configs/guides/feat-workflow.md` |
| index.js | 修改 | `packages/installer/index.js` |

## 实现摘要

### 1. exp-governance skill（SKILL.md）

- 入口：`skill(name="exp-governance")`
- frontmatter：`name: exp-governance`（与目录名一致），`description` 含触发关键词
- 6 步执行流程：收集文档 → 一致性审查 → 去重检测 → 质量评估 → 生命周期建议 → 输出报告
- 去重：Agent 语义判断，不硬编码算法
- 输出：结构化 Markdown 报告（一致性/去重/质量/生命周期 四维度）

### 2. exp-governance spec（specs/default/）

- 遵循 default/ spec 格式（MUST/SHOULD/MAY 分层）
- 定义 5 级生命周期：draft → verified → outdated → refreshed → archived
- 4 个审查维度：frontmatter 完整性、tag 规范性、category 一致性、source 有效性
- 引用 `decision-record.md` 的 ADR 治理模型

### 3. feat-workflow.md Phase 5 集成

- **执行内容**：新增"经验治理"步骤（在"经验草稿"之后，"文档补充"之前）
- **完成检查清单**：新增"经验治理已完成"检查项（在"task 级经验"之后）
- **双级经验说明**：新增"治理"桥梁说明（在 task 级和 doc 级之间）

### 4. MANIFEST 注册

- 新增 2 条注册：skill（`.opencode/skills/exp-governance/SKILL.md`）+ spec（`.self-workflow/specs/default/exp-governance.md`）
- feat-workflow.md 已存在，仅内容修改

## 部署验证

```bash
node packages/installer/index.js init --target . --force
```

结果：42 项操作，2 个文件写入、多个文件更新，0 错误。

- ✅ `.opencode/skills/exp-governance/SKILL.md` 存在
- ✅ `.self-workflow/specs/default/exp-governance.md` 存在
- ✅ `feat-workflow.md` 含 3 处 `exp-governance` 引用
