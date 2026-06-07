---
name: exp-governance
description: 经验治理 skill——审查 .self-workflow/docs/ 下的经验文档质量、检测重复、评估生命周期状态。Use when summarizing a /feat task (Phase 5) or when user asks to review experience docs. Triggers: 'exp-governance', '经验治理', '审查经验', '检查经验文档', 'experience review', 'exp-review'.
---

# exp-governance — 经验治理

审查 `.self-workflow/docs/` 下的经验文档，产出结构化审查报告。遵循 `specs/default/exp-governance.md` 的审查标准。

## 执行步骤

### 1. 收集文档

读取 `.self-workflow/docs/` 下所有分类目录的 `.md` 文件（不含 `.gitkeep`，不含 `README.md`）。

对每份文档，解析 YAML frontmatter（`title`, `category`, `tags`, `date`, `source`, `quality`）。

### 2. 一致性审查

逐项检查每份文档：

- **frontmatter 完整性**：6 个字段全部存在且非空。缺失字段列出。
- **tag 规范性**：与 `docs/README.md` 的 tag 约定对照。英文 tag 应为小写；中文 tag 仅限领域特有名词（如"自举"）。标注不一致的 tag。
- **category 一致性**：`category` 值是否与所在目录名匹配。
- **source 有效性**：`source` 引用的 task 目录是否存在。

### 3. 去重检测

**不依赖算法，基于语义判断。**

- 通读所有文档内容后，比较标题相似性、主题重叠、内容重复程度
- 特别关注：无 frontmatter 的原始 ADR 副本（如 `docs/关键决策/` 中以 "ADR-XXX："开头的文档）与有 frontmatter 推广版的关系
- 对"疑似重复"文档对，给出：文档A路径、文档B路径、判断维度、具体理由

### 4. 质量评估

按 `specs/default/exp-governance.md` 的生命周期状态定义，评估每份文档当前的 `quality` 是否合理：

- `draft` → 是否已达到 verified 条件？（内容与源码/spec一致、可被 Agent 检索匹配）
- `verified` → 是否已过时应降为 outdated？（source task 完成很久且无活跃引用）
- `outdated` → 是否可刷新或归档？

### 5. 生命周期建议

汇总建议操作清单：
- **建议晋升**（draft → verified）：文档路径 + 理由
- **建议降级**（verified → outdated）：文档路径 + 理由
- **建议归档**（outdated → archived）：文档路径 + 理由

### 6. 输出报告

按以下结构输出审查报告到标准输出（Markdown 格式）：

```markdown
## 经验治理报告

**审查范围**：`.self-workflow/docs/`
**审查时间**：<当前时间>
**文档总数**：N 份

### 一致性审查

| 文件 | 问题 | 严重度 |
|------|------|--------|
| <path> | 缺失 date 字段 | warning |
| <path> | tag 大小写不一致：Feat-Command → feat-command | warning |
| <path> | 无 frontmatter（原始 ADR 副本，未按推广规范格式化） | critical |

### 去重检测

疑似重复对：
- `<path-A>` ↔ `<path-B>`
  - 判断维度：标题近似 + 内容重叠
  - 理由：<具体说明>
  - 建议：合并 / 保留 / 区分标题

### 质量分布

| quality | 数量 |
|---------|------|
| draft | N |
| verified | N |
| 缺失 | N |

### 生命周期建议

| 文档 | 当前状态 | 建议操作 | 理由 |
|------|---------|---------|------|
| <path> | draft | → verified | 内容与 spec 一致，可被检索 |
| <path> | verified | → outdated | source task 完成超过 XX 天 |

---

**治理结论**：审查完成，发现 X 项 critical、Y 项 warning、Z 项 info。
```

## 注意

- 审查结果 MUST 给出具体理由，不能仅给标签/等级
- 不自动修改文档内容（即使是 minor 问题）——仅输出建议
- 如果文档数量 > 50，可分批评审（每批 25 份）
