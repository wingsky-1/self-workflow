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
2. **Human 可读**：Markdown body 比 YAML 更适合人类阅读和编辑（目前 spec 的 README.md 骨架就是 Markdown，说明团队偏好）
3. **程序可解析**：YAML frontmatter 提供结构化元数据（level、tags、version），Plugin 可据此决定是否注入
4. **渐进复杂**：frontmatter 轻量，不追求 V2 的全 YAML 结构体。未来如需更结构化，可在 frontmatter 中扩展字段，不影响 body 的 Markdown

## 与 ADR-008 的矛盾及推翻理由

**ADR-008（V1 实现任务）在"Spec 格式"中明确声明**：`使用 Markdown 格式，非 YAML`，核心理由是降低用户编辑门槛——"不需要用户理解 enforcement、Layer 2/3 等术语"。

**本 ADR 推翻 ADR-008 的格式决策**，理由如下：

1. **V1 阶段的 spec 是空骨架**：ADR-008 决策时 `specs/` 仅有 34 行 README.md 骨架，没有实际的 spec 内容和加载需求。彼时的"Markdown 格式"是针对一个`- ` 列表项式的空壳的格式声明，而非经过实际 spec 编写验证的结论。

2. **实战经验证明 frontmatter 可行**：`docs/` 经验文档已采用 YAML frontmatter + Markdown body 格式，跨 18 个文档、3 个分类运行良好。Plugin 已实现 `parseFrontmatter()` 解析代码。用户只需填写值，不需要理解 YAML 语法本身。

3. **程序化注入需要结构化元数据**：ADR-002 的插件注入方案依赖 frontmatter 中的 `level`（default/situational）和 `summary`（一句话摘要）来决定哪些 spec 该注入、注入什么内容。纯 Markdown 无法提供这些结构化信息。

4. **不增加用户编辑门槛**：frontmatter 字段设计轻量（6 个字段），用户在 frontmatter 分隔符 `---` 之间填写键值对（如 `level: default`），与 docs/ 文档的 markdown 体验相同。body 仍是 Markdown——核心内容编辑复杂度不变。

**结论**：ADR-008 的"纯 Markdown"决策基于 V1 的空骨架场景，已不适用于 V1.8 的 spec 体系。本 ADR 正式**超驰（override）** ADR-008 的格式声明。

## 关联

- 替代方案：纯 YAML（`需求草案.md:668-704` 的愿景），但复杂度高、编辑门槛高、加载需 YAML parser → 留到 V2
- 参考：`docs/README.md` 的"文档格式"章节定义了经验文档的 frontmatter 规范
- 依赖：ADR-003（Spec 目录结构）决定 spec 文件放在哪个目录下
- 超驰：ADR-008（V1 实现任务 / docs-specs 定位）的"使用 Markdown 格式，非 YAML"声明
