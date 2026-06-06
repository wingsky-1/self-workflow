---
promoted-from: feat-specs结构奠基-20260606
---

# ADR-001：Spec 文件格式 —— YAML Frontmatter + Markdown Body

## 背景

`specs/` 当前只有一个 34 行骨架 `README.md`，纯 Markdown 的 MUST/SHOULD/MAY 列表格式。`docs/需求草案.md` 中描述了 YAML 格式的 spec 愿景（`coding-style.yaml` 等）。`docs/` 经验文档已经采用了 YAML frontmatter + Markdown body 的格式。

V1.8 需要统一 spec 文件的格式标准——它既是 Human 可读的规范文档，也需被 Plugin 程序化解析。

## 决策

**Spec 文件采用 YAML frontmatter + Markdown body 格式**，与 `docs/` 经验文档格式一致。

### Frontmatter 字段

| 字段 | 说明 | 必需 |
|------|------|------|
| `title` | Spec 标题 | ✅ |
| `type` | `spec` 固定值 | ✅ |
| `level` | `default`（始终生效）/ `situational`（按需） | ✅ |
| `tags` | 标签，用于 Agent 匹配 | ✅ |
| `version` | 版本号 | ✅ |
| `summary` | 一句话摘要 | ✅ |

### Body 结构

- 自由 Markdown 格式
- 规范条目使用 MUST/SHOULD/MAY 分类（沿用现有骨架概念）
- 每条规范包含：分级标记、描述、适用范围、示例（如有）

## 理由

1. **与 docs/ 一致**：Agent 已有解析 docs/ frontmatter 的代码（`self-workflow-session.ts` 中的 `parseFrontmatter()`），格式一致降低实现成本
2. **Human 可读**：Markdown body 比 YAML 更适合人类阅读和编辑
3. **程序可解析**：YAML frontmatter 提供结构化元数据（level、tags、version），Plugin 可据此决定是否注入
4. **渐进复杂**：frontmatter 轻量，不追求 V2 的全 YAML 结构体

## 与 ADR-008 的矛盾及推翻理由

**ADR-008（V1 实现任务）在"Spec 格式"中明确声明**：`使用 Markdown 格式，非 YAML`。

**本 ADR 推翻 ADR-008 的格式决策**，理由：
1. ADR-008 决策时 `specs/` 仅有空骨架，无实际 spec 内容
2. `docs/` 经验文档已证明 frontmatter 可行
3. Plugin 注入需要结构化元数据
4. frontmatter 不增加用户编辑门槛（body 仍是 Markdown）

**结论**：本 ADR 正式**超驰（override）** ADR-008 的格式声明。

## 关联

- 超驰：ADR-008（V1 实现任务）的"使用 Markdown 格式，非 YAML"声明
- 依赖：ADR-003（Spec 目录结构）
