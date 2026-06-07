# 方案设计 — V1.16+V1.17 经验复利机制

> 工作流 ID：`feat-经验检测-沉淀质量-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T06:30:00

---

## 架构决策记录

| ADR | 决策 | 状态 | 来源 |
|-----|------|------|------|
| [ADR-001](adrs/ADR-001-经验审查工具架构.md) | Skill 作为唯一入口，不创建独立 Command | accepted | Phase 1 |
| [ADR-002](adrs/ADR-002-单一审查命令设计.md) | 单一 skill 覆盖全部审查维度，分节输出 | accepted | Phase 1 |
| [ADR-003](adrs/ADR-003-去重策略Agent判断.md) | 去重由 Agent 语义判断，不硬编码算法；**覆盖 A1.1 的算法方案** | accepted | Phase 2 |

> 完整决策内容（备选方案、trade-off、反对意见）见各 ADR 文件。

---

## 接口设计

### Skill：exp-governance

**SKILL.md frontmatter**（OpenCode 加载依赖）：

```yaml
---
name: exp-governance              # MUST 与目录名一致
description: "经验治理 skill——审查经验文档质量、检测重复、评估生命周期。Triggers: 'exp-governance', '经验治理', '审查经验', 'exp-review'"
---
```

**目录结构**：
```
.opencode/skills/exp-governance/
└── SKILL.md              ← skill 指令文件

加载方式：
skill(name="exp-governance") → Agent 加载 SKILL.md 内容到上下文
```

> OpenCode 通过文件系统扫描 `.opencode/skills/<name>/SKILL.md` 发现 skill，`name` frontmatter 字段 **MUST** 与目录名一致。

**输入（skill 指令中的执行环境假设）**：
- `.self-workflow/docs/` 目录存在且含 README.md + 4 个分类子目录
- Agent 有文件读取权限
- 可选：用户指定审查范围（如"只检查关键决策下的文档"）

**输出（结构化审查报告）**：
```yaml
# 审查报告格式（Agent 按此结构输出）
审查范围: ".self-workflow/docs/"
审查时间: <ISO 8601>

维度1_一致性:
  检查文件数: N
  通过: N
  问题:
    - 文件: <path>
      缺失字段: [date]
      建议: "补充 date 字段"
    - 文件: <path>
      tag问题: "大小写不一致: Feat-Command → feat-command"

维度2_去重:
  疑似重复对:
    - 文件A: <path>
      文件B: <path>
      相似原因: "标题近似 + 主题重叠 + 内容重复"
      Agent判断理由: "<具体理由>"
      建议: "合并" | "区分标题" | "保留"

维度3_质量评估:
  文档质量分布:
    draft: N
    verified: N
    建议晋升: 
      - <path>: "理由..."
    建议标记过时:
      - <path>: "理由..."

维度4_生命周期建议:
  待刷新: []
  待标记过时: []
  待晋升: []
```

### Spec：exp-governance.md（本次重点产出之一）

遵循现有 spec 格式（`type: spec`, `level: default`, 含 `version`/`summary`，body 按 MUST/SHOULD/MAY 分层）。

**Frontmatter：**
```yaml
---
title: "经验治理规范"
type: spec
level: default
tags: [exp-governance, quality, lifecycle, dedup, review]
version: 1.0.0
summary: "经验文档质量分级、生命周期管理、去重审查、治理流程——定义 Agent 如何审查和维护经验库"
---
```

**Body 按 MUST/SHOULD/MAY 组织，参考 `decision-record.md` 和 `ambiguity-clarification.md` 的写法：**

```
# 经验治理规范

## 核心原则
经验资产需要持续治理才能复利。治理 = 质量审查 + 去重 + 生命周期管理。

## MUST

### 审查触发
- Phase 5 总结沉淀时，载入 exp-governance skill 前必须加载本 spec 作为判断依据
- 用户说"审查经验"或类似指令时，Agent 应自动加载本 spec + exp-governance skill

### 审查维度
每份经验文档必须检查：
- frontmatter 完整性：title/category/tags/date/source/quality 是否全部存在且非空
- tag 规范性：英文小写优先，中文仅限领域特有名词（如"自举"）
- category 一致性：category 字段值与所在目录名匹配
- source 有效性：source 引用的 task 目录是否存在

### 去重规则
- Agent 通过阅读文档内容自行判断是否重复（不定义算法阈值）
- 判断维度：标题相似性、主题重叠、内容重复程度
- 判定"疑似重复"时 MUST 输出具体理由，不能仅给结论

### 生命周期状态（与 A3.1/A4.1 对齐）

| 状态 | 含义 | 进入条件 | 退出条件 |
|------|------|---------|---------|
| `draft` | 新沉淀，未经验证 | 默认初始状态 | 经至少一次 Agent Review 且被 ≥1 份其他文档引用 → verified |
| `verified` | 经审查确认可靠 | 满足 draft→verified 条件 | source task 完成 > 30 天且近 30 天无新引用 → outdated |
| `outdated` | 过时但保留参考 | 内容不再反映当前实践 | 内容更新 + 重新审查 → refreshed；确认无长期价值 → archived |
| `refreshed` | 内容已更新，待重新验证 | 从 outdated 刷新后进入 | 经审查确认 → verified |
| `archived` | 已归档 | 确认无长期参考价值 | —（终态） |

### 记录治理结果
审查结果 MUST 写入 Phase 5 summary 文档，包含：
- 审查了哪些文档
- 发现的 frontmatter 缺失/不一致
- 疑似重复对及判断理由
- 建议的质量状态变更（draft→verified、verified→outdated）

## SHOULD

- 审查时优先关注质量标记为 draft 的文档（促进成熟）
- 晋升 verified 前应检查文档内容是否与源码/spec 最新状态一致
- 同一 source task 产出的多份文档应该交叉检查避免重复

## MAY
- Agent 可提议将 outdated 文档移入归档
- Agent 可提议合并疑似重复文档

## 关联
- `exp-governance` skill：治理执行指令
- `feat-workflow.md` Phase 5：治理触发点
- `docs/README.md`：文档格式和分类定义
```

### feat-workflow.md Phase 5 集成

**插入位置**：
- **执行内容列表**（编写总结/经验草稿/...）：新增"经验治理"执行动作——在"经验草稿"之前
- **完成检查清单**（task级经验/doc级经验/...）：新增"经验治理已完成"检查项——在"doc 级经验"之前

```markdown
# 执行内容新增：
- [ ] **经验治理**：加载 `exp-governance` skill（`skill(name="exp-governance")`），
  对 `.self-workflow/docs/` 执行审查：检查现有经验的质量、检测与即将写入的新经验是否有重复、
  识别可晋升或应标记过时的文档。审查结果写入 `05-summary.md` 的经验治理节。

# 完成检查清单新增：
- [ ] **经验治理已完成**：exp-governance skill 已执行，审查结果已写入 summary
```

---

## 数据模型

### Skill 注册模型（MANIFEST）

```
packages/installer/index.js MANIFEST 新增：
[".opencode/skills/exp-governance/SKILL.md", "skills/exp-governance/SKILL.md"]
```

### Spec 注册模型（MANIFEST）

```
packages/installer/index.js MANIFEST 新增：
[".self-workflow/specs/default/exp-governance.md", "specs/default/exp-governance.md"]
```

与现有 6 个 default/ spec 并列，无需修改 `specs/README.md`（default/ 分类定义已支持扩展）。

**quality 字段扩展影响**：扩展 `draft`/`verified` 新增 `outdated`/`refreshed`/`archived` 后，需同步更新：
- `docs/README.md` 的 quality 字段定义表（新增状态说明）
- Plugin（`.opencode/plugins/self-workflow-session.ts`）的 frontmatter 解析逻辑（`parseFrontmatter` 当前仅读取 title/tags，若未来按 quality 过滤需适配）

### 质量生命周期（spec 中定义，skill 中引用）

spec `exp-governance.md` 定义 5 级生命周期：`draft → verified → outdated → refreshed → archived`。
skill 指令引用 spec 中的转换条件指导 Agent 判断，但不机械执行——Agent 结合实际内容灵活判断。

### 安装器模板文件清单

| 文件 | 位置（模板源） | 部署位置 |
|------|-------------|---------|
| SKILL.md | `packages/installer/templates/skills/exp-governance/SKILL.md` | `.opencode/skills/exp-governance/SKILL.md` |
| exp-governance.md | `packages/installer/templates/specs/default/exp-governance.md` | `.self-workflow/specs/default/exp-governance.md` |
| feat-workflow.md | `packages/installer/templates/configs/guides/feat-workflow.md` | `.self-workflow/configs/guides/feat-workflow.md` |

---

## 实现顺序

| 步骤 | 内容 | 依赖 |
|------|------|------|
| 1 | 创建 `specs/default/exp-governance.md`（模板源） | — |
| 2 | 创建 `skills/exp-governance/SKILL.md`（模板源） | 需了解 OpenCode skill 格式（已完成） |
| 3 | 修改 `configs/guides/feat-workflow.md` Phase 5（模板源） | — |
| 4 | 更新 `installer/index.js` MANIFEST（新增 2 条注册：skill + spec；feat-workflow.md 已存在，仅修改内容） | 步骤 1-3 |
| 5 | 运行 `init --force` 同步到运行时 | 步骤 4 |
| 6 | 验证：skill 可被 `skill(name="exp-governance")` 加载 | 步骤 5 |

---

## 决策捕捉

- [x] ADR 已创建，见 `adrs/ADR-003-去重策略Agent判断.md`
