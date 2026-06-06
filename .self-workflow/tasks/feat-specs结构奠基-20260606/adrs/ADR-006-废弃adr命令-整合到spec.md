# ADR-006：废弃 /adr 命令，ADL 创建逻辑整合到 Spec

## 背景

`/adr` 命令定义了一套 7 步 ADR 创建流程（识别 task、编号、选模板、auto/交互填写、写入文件、更新 task.yaml）。这个流程本质上是 `decision-record-spec` 的执行指令，不应该作为一个独立命令存在。

`specs/default/decision-record.md` 已经定义了"何时创建 ADR"、"模板选择"、"生命周期"等规范，但缺少"如何创建 ADR"的操作流程——这部分正好是 `/adr` 命令的内容。

## 决策

**废弃 `/adr` 命令**，将其 ADR 创建流程整合到 `specs/default/decision-record.md` 中。spec 成为 ADR 创建的唯一权威来源。

## 变更

1. `specs/default/decision-record.md` — 新增"ADR 创建流程"章节（吸收 /adr 的 7 步流程）
2. `packages/installer/templates/commands/adr.md` — 删除
3. `packages/installer/templates/commands/feat.md` — 移除 `/adr` 引用
4. `packages/installer/index.js` — MANIFEST 移除 adr.md 条目

## 理由

1. **单一权威源**：ADR 相关的所有规则（何时创建、怎么创建、什么模板、怎么晋升）集中在一个 spec 中
2. **自动生效**：spec 通过 Plugin 注入 system prompt，Agent 始终可见——不需要记得执行 `/adr` 命令
3. **减少碎片**：/adr 命令和 decision-record spec 描述同一件事的两面，合并后消除冗余

## 关联

- 被整合：`/adr` 命令的全部逻辑
- 依赖：specs/default/decision-record.md 的"ADR 创建流程"章节
