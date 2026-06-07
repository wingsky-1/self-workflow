---
title: "经验治理规范"
type: spec
level: default
tags: [exp-governance, quality, lifecycle, dedup, review]
version: 1.0.0
summary: "经验文档质量分级、生命周期管理、去重审查、治理流程——定义 Agent 如何审查和维护经验库"
---

# 经验治理规范

> 经验资产需要持续治理才能复利。治理 = 质量审查 + 去重 + 生命周期管理。

## 核心原则

本规范约束 Agent 在执行经验审查和维护时的行为。与 `decision-record.md` 的 ADR 治理框架对齐——经验也有完整生命周期，需定期评估质量。

---

## MUST

### 审查触发条件

Agent 在以下场景 **MUST** 执行经验治理：

- **Phase 5 总结沉淀**：写新经验前，先审查现有经验库——检查重复、评估质量、识别可晋升/过时文档
- **用户指令**：用户说"审查经验"、"检查经验文档"、"经验治理"等类似指令时
- 执行治理时 **MUST** 加载 `exp-governance` skill（`skill(name="exp-governance")`）

### 审查维度

每份 `docs/` 下的经验文档 **MUST** 检查：

| 维度 | 检查项 | 判定标准 |
|------|--------|---------|
| frontmatter 完整性 | title, category, tags, date, source, quality | 全部存在且非空 |
| tag 规范性 | 英文小写、无同义词重复、无大小写不一致 | 与 `docs/README.md` tag 约定一致；中文仅限领域特有名词（如"自举"） |
| category 一致性 | category 字段值与所在目录名 | 完全匹配（如 `category: 实施经验` ↔ `docs/实施经验/`） |
| source 有效性 | source 引用的 task 目录 | 目录存在且含有效 `task.yaml` |

### 去重规则

Agent **MUST** 通过阅读文档内容自行判断是否重复。**MUST NOT** 依赖预定义算法阈值（如编辑距离、SimHash）——去重是语义判断，非机械匹配。

- 判断维度：标题相似性、主题重叠、内容重复程度
- 判定"疑似重复"时 **MUST** 输出：文档对、判断维度、具体理由（不能仅给结论）
- 对无 YAML frontmatter 的文档（如原始 ADR 副本）与有 frontmatter 的推广版本，**MUST** 特别标注为"疑似重复"

### 生命周期管理

每份经验文档处于以下状态之一：

| 状态 | 含义 | 进入条件 |
|------|------|---------|
| `draft` | 新沉淀，未经验证 | 默认初始状态 |
| `verified` | 经审查确认可靠 | 经至少一次治理审查 + 内容与源码/spec 一致 + 可被 Agent 检索匹配 |
| `outdated` | 过时但保留参考 | 内容不再反映当前实践，但仍有参考价值 |
| `refreshed` | 内容已更新，待重新验证 | 从 outdated 刷新后进入此状态，经审查确认后回到 verified |
| `archived` | 已归档 | 确认无长期参考价值 |

状态转换通过更新文档 frontmatter 的 `quality` 字段实现。

### 记录治理结果

审查结果 **MUST** 写入 Phase 5 的 `05-summary.md`，包含：
- 审查覆盖的文档数量
- 发现的 frontmatter 缺失/不一致项
- 疑似重复文档对及判断理由
- 建议的质量状态变更及理由

---

## SHOULD

- 审查时优先关注 quality 为 `draft` 的文档——促进新经验成熟
- 晋升 `verified` 前应检查内容是否与最新源码/spec 一致
- 同 source task 产出的多份文档应交叉检查避免重复
- 发现 quality 字段缺失的文档时，协助补充（但不在无人类确认时自动修改内容）

---

## MAY

- Agent 可提议将 `outdated` 文档移入 `archived`
- Agent 可提议合并疑似重复文档
- 治理结果中的 minor 问题（如 tag 大小写修正）Agent 可自主修复

---

## 关联

- `exp-governance` skill：治理执行指令
- `feat-workflow.md` Phase 5：治理触发点
- `docs/README.md`：文档格式和分类定义——扩展 quality 字段值时需同步更新
- `specs/default/decision-record.md`：ADR 生命周期管理模型参考
- `docs/关键决策/跨任务决策沉淀与 ADR 治理.md`：晋升流程参考
