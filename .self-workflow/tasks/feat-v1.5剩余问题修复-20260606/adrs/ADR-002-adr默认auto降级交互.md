# ADR-002：/adr 命令 — 默认 auto + 降级交互

> 日期：2026-06-06
> 状态：已采纳（经 Human 审查修正）
> 关联：`packages/installer/templates/commands/adr.md`

## 背景

`/adr` 命令原设计为手动触发工具：`/adr <simple|complex|review> <标题>`，用户必须指定模板类型，然后通过 `question` 工具交互式填写内容。

V1.5 验收标准 v1.2 重新定位：**Agent 自主归档是主路径，`/adr` 是兜底**。Agent 在设计文档中已经写好了 ADR 内容，不需要交互式选择模板和填写字段。但命令不支持"跳过交互直接写入"。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：`--auto` flag（初版设计） | `/adr --auto <标题>` — Agent 显式声明 auto 模式 | 语义清晰 | Agent 需记住加 `--auto`；auto 是主路径却需要 opt-in——不自然 |
| B：指引约定 | 不改变命令，在 feat-workflow.md 中约定"Agent 直接用 write 工具写入" | 零修改 | 不够统一；Agent 可能仍调用 /adr 走交互 |
| C：默认 auto + 降级交互 | `/adr <标题>` — Agent 默认提供上下文中的完整内容；内容不足时降级为 question 交互 | auto 是默认行为，符合"主路径"定位；无需 Agent 记忆 flag | — |

## 决策

**选择方案 C：默认 auto + 降级交互**（经 Human 审查修正，替代初版设计的 --auto flag）。

命令签名简化为 `/adr <标题>`。步骤 4：Agent 在上下文中准备完整 ADR 内容直接填入模板 → 若内容不足以填充必需字段 → 降级为 `question` 交互。

## 修正记录

初版设计（AD-2 in `02-design.md`）采用 `--auto` flag 方案，Human 审查后指出：
> "没有输入时默认 auto，auto 失败时再进行交互"

这更符合 V1.5 验收标准的定位——auto 是关注路径而非例外路径，应该是默认行为，不应要求 Agent 记住 `--auto`。

## 理由

1. **定位一致性**：V1.5 验收标准 v1.2 明确"Agent 自主归档为主路径"，默认 auto 与此一致
2. **降低认知负担**：Agent 不需要判断"我该不该加 --auto"——总是尝试 auto，失败再降级
3. **向后兼容**：人类直接使用 `/adr "标题"` 时，由于上下文中没有 ADR 内容，自动降级为交互模式——与原来的体验一致

## 影响

- 命令用法从 `/adr <simple|complex|review> <标题>` → `/adr <标题>`
- 去掉类型参数，Agent 根据决策复杂度自行判断模板
- `type` 输出字段 → `mode` 字段（auto / interactive）
