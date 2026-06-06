# 代码实现：V1.8 — specs 结构奠基

> workflow-id: feat-specs结构奠基-20260606
> 阶段：3/5 — 代码实现
> 创建时间：2026-06-07

---

## 实施概要

按设计文档 `02-design.md` 和 5 个 ADR 逐项实现，所有模板源变更后通过 `init --force` 部署。

## 变更文件清单

### 新增文件 (10)

| 文件 | 说明 |
|------|------|
| `packages/installer/templates/specs/README.md` | Spec 索引入口（重写，含分类定义段 + Plugin 可解析格式） |
| `packages/installer/templates/specs/default/agent-reasoning.md` | Agent 推理规范（从 Skill 平移，MUST/SHOULD 格式） |
| `packages/installer/templates/specs/default/interaction-protocol.md` | 交互协议规范（从 Skill 平移） |
| `packages/installer/templates/specs/default/doc-audience.md` | 文档受众分类规范（目录→受众映射 + 编写/评审指引） |
| `packages/installer/templates/specs/default/decision-record.md` | 决策记录规范（MUST 触发条件 + ADR 生命周期 + docs/关键决策/ 晋升） |
| `packages/installer/templates/docs/关键决策/.gitkeep` | docs/ 第四分类目录初始化 |

### 修改文件 (5)

| 文件 | 变更内容 |
|------|---------|
| `packages/installer/templates/plugin/self-workflow-session.ts` | 新增 `scanSpecs()` + `SPECS_MARKER` + `tool.execute.before`（子 Agent 注入）；修复 docs/specs 独立 marker 检查 |
| `packages/installer/templates/commands/feat.md` | 移除 `load_skills=['agent-reasoning', 'interaction-protocol']` 引用，改为 `spec/default/` 自动注入说明 |
| `packages/installer/templates/configs/guides/feat-workflow.md` | Phase 5 checklist 增加 ADR 晋升检查步骤 |
| `packages/installer/templates/docs/README.md` | 新增 `### 关键决策/` 分类定义段 |
| `packages/installer/index.js` | MANIFEST 移除 2 条 skill 条目 + 新增 4 条 specs/default/ 条目 + 1 条 docs/关键决策/ 条目 + EMPTY_DIRS 新增 |

### 删除文件 (2)

| 文件 | 说明 |
|------|------|
| `packages/installer/templates/skills/agent-reasoning/SKILL.md` | 内容已迁移至 `specs/default/agent-reasoning.md`（ADR-004：直接删除） |
| `packages/installer/templates/skills/interaction-protocol/SKILL.md` | 内容已迁移至 `specs/default/interaction-protocol.md` |

### 运行时部署（通过 init --force）

| 运行时路径 | 操作 |
|------|------|
| `.self-workflow/specs/README.md` | 更新 |
| `.self-workflow/specs/default/{4 files}` | 新增 |
| `.self-workflow/docs/关键决策/.gitkeep` | 新增 |
| `.self-workflow/docs/README.md` | 更新（关键决策/ 分类） |
| `.opencode/plugins/self-workflow-session.ts` | 更新（scanSpecs + tool.execute.before） |
| `.opencode/commands/feat.md` | 更新（移除 skill 引用） |
| `.self-workflow/configs/guides/feat-workflow.md` | 更新（Phase 5 checklist） |
| `.opencode/skills/{2 dirs}` | 手动清理删除 |

## 关键技术决策实现

### 插件双钩子注入架构

```typescript
// 主 Agent：system prompt 注入
"experimental.chat.system.transform" → docs 索引 + specs 摘要

// 子 Agent：Task 工具拦截注入（Trellis 模式）
"tool.execute.before" (input.tool === "task") → 修改 output.args.prompt
```

### Spec 格式

- YAML frontmatter：title, type, level, tags, summary
- Markdown body：MUST/SHOULD/MAY 分类

### Skill 迁移

- ADR-004：直接删除（Human 决策），不留包装器
- 子 Agent spec 继承：`tool.execute.before` 显式注入（验证通过前 skills 不删除的顺序已在 ADR-004 中定义）

## 验收标准自检

| AC | 检查 | 状态 |
|----|------|------|
| AC-1.1~1.5 | specs/ README + default/ 结构 | ✅ |
| AC-2.1~2.4 | 受众分类 spec 内容 | ✅ |
| AC-3.1~3.4 | Skill 降格 spec 内容 | ✅ |
| AC-4.1~4.4 | 决策记录 spec 内容 | ✅ |

## 安装器自举验证

- [x] 所有变更通过 `packages/installer/templates/` 模板源
- [x] `init --force` 成功部署（38 项操作，0 错误）
- [x] `.self-workflow/specs/default/` 目录已创建
- [x] 旧 skill 文件已清理
