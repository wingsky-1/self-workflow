# 02 - 方案设计

**任务**：经验治理优化执行
**创建**：2026-06-07T14:30:00+08:00

---

## 架构决策记录

本阶段无架构决策——任务为纯文档 metadata 修复，无需 ADR。

---

## 执行策略

### 原则

1. **顺序执行**：Tier 1→6，每批完成后验证再进入下一批
2. **批量操作**：同 Tier 内的独立编辑并行处理
3. **每批 commit**：每个 Tier 完成后独立提交，便于回溯

### 为什么不用子 Agent

所有修改均为单文件 frontmatter/metadata 编辑，无需代码分析、无需外部库、无需多模块协调。直接编辑更快、更可控。

---

## Tier 执行映射

### Tier 1 [CRITICAL]：原始 ADR → 添加 frontmatter + 精炼

| # | 文件 | 操作 |
|---|------|------|
| 1 | `docs/关键决策/对抗性审查提示词-Grill+COT策略.md` | 添加 frontmatter；标题去 `ADR-002：`；删除 V1.10 历史叙事；删除反对意见段 |
| 2 | `docs/关键决策/文档审查注入点-混合模式.md` | 添加 frontmatter；标题去 `ADR-001：`；精炼备选方案历史语境 |

**frontmatter 模板**：

```yaml
---
title: "对抗性审查提示词——Grill + COT 策略"
category: 关键决策
tags: [grill, cot, review, gate, prompt-engineering]
date: 2026-06-06
source: tasks/feat-开始v1-7-20260607
quality: draft
---
```

### Tier 2 [CRITICAL]：修复字段名

| # | 文件 | 操作 |
|---|------|------|
| 3 | `docs/参考模式/LLM指令设计-语义优先于机械规则.md` | `created`→`date`；删除 `related`；补 `source`/`quality` |
| 4 | `docs/参考模式/ADR与设计文档交叉一致性审查.md` | `created`→`date`；删除 `related`；补 `source`/`quality`；tag 英文化 |

### Tier 3 [WARNING]：补充 date

| # | 文件 | 操作 |
|---|------|------|
| 5 | `docs/实施经验/V1.5-实施经验.md` | 添加 `date: 2026-06-06` |
| 6 | `docs/实施经验/V1-实施经验.md` | 添加 `date: 2026-06-06` |
| 7 | `docs/实施经验/feat-command-实施经验.md` | 添加 `date: 2026-06-06` |

### Tier 4 [WARNING]：修复 source

| # | 文件 | 操作 |
|---|------|------|
| 8 | `docs/参考模式/验收验证的双重检查-存在与不存在.md` | 修正 `source` |
| 9 | `docs/错误经验/委托提示词歧义-提取不等于保留副本.md` | 修正 `source` |

> 先执行 `git log --all --oneline -- "*安装器重构*"` 查证真实任务名。

### Tier 5 [WARNING]：中文 tag 英文化

| # | 文件 | 修正 |
|---|------|------|
| 4 | （Tier 2 已处理）`ADR与设计文档交叉一致性审查` | `审查`→`review`, `一致性`→`consistency` |
| 10 | `docs/参考模式/readme-作为配置权威源.md` | `配置`→`config`, `权威源`→`authoritative-source`, `动态扫描`→`dynamic-scanning`, `分类`→`classification` |
| 11 | `docs/错误经验/plugin-目录命名与注册机制.md` | `目录命名`→`directory-naming`, `自动发现`→`auto-discovery`, `注册`→`registration` |
| 12 | `docs/错误经验/phase-gate-验证不能形式化.md` | `验证`→`verification`, `形式化`→`formalization`, `实质审查`→`substantive-review` |
| 13 | `docs/错误经验/gate-推理链一致性-错误经验.md` | `推理链`→`reasoning-chain`, `阶段一致性`→`phase-consistency`, `审查`→`review` |
| 14 | `docs/错误经验/design-可定制性声明验证-错误经验.md` | `设计审查`→`design-review`, `安装器`→`installer` |

### Tier 6 [QUALITY]：draft → verified 批量晋升

影响 17 份文档（不含 Tier 1 尚未完成推广的 2 份 + Tier 4 source 待修复的 2 份）：

| 目录 | 文档数 | 操作 |
|------|--------|------|
| 实施经验/ | 4 | draft→verified |
| 参考模式/ | 5 | draft→verified（含 Tier2 修复后的 2 份） |
| 错误经验/ | 4 | draft→verified（含 Tier4 修复后的 2 份） |
| 关键决策/ | 4 | 维持 verified |

> 注：Tier 1 的 2 份文档在 Tier 1 修复后 quality 仍为 `draft`——内容精炼为人工判断密集型操作，本轮仅添加 frontmatter 作为基础格式化，精炼内容留待后续评估。

---

## 安全检查

| 措施 | 说明 |
|------|------|
| 每 Tier 后 `lsp_diagnostics` | 确认无格式/语法错误 |
| 每 Tier 独立 commit | 单批出错可单独 revert |
| 不改 `.opencode/` | 非 installer 管理范围 |
| 不改文档主体内容 | 除 Tier1 精炼外，仅动 frontmatter |
