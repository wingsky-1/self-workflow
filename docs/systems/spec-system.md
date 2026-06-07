# 规范系统 (Spec System)

> 所属模块：约束层
> 文件位置：`.self-workflow/specs/default/`
> 注入机制：Session Plugin → system prompt

---

## 功能概述

规范系统定义 Agent 的行为边界。`default/` 下的 8 项规范通过 Session Plugin 自动注入到 system prompt，约束主 Agent 及所有子 Agent。

## 核心特性

### 1. 8 项 default 规范

| 规范 | 约束对象 | 核心规则 |
|------|---------|---------|
| **agent-reasoning** | 主 Agent | 委托优先、独立思考、上下文精简、验证结果 |
| **interaction-protocol** | 主 Agent | 交互式问答优先、总结先行再询问、question 工具使用 |
| **doc-audience** | 所有 Agent | 分辨文档受众（Human/Agent/Both），按受众编写评审 |
| **decision-record** | 主 Agent | ADR 创建时机、模板选择、晋升规则、生命周期 |
| **ambiguity-clarification** | 所有 Agent | 遇到歧义必须使用 question 工具澄清 |
| **todowrite-display** | /feat 执行 Agent | 三层待办区分、触发时机、条目粒度 |
| **exp-governance** | Phase 5 执行 Agent | 经验审查维度、去重规则、生命周期管理 |
| **implementation-documentation** | Phase 2/3/5 执行 Agent | 实现方案文档创建/更新时机和决策输出 |

### 2. Spec 格式

每份 spec 以 YAML frontmatter 开头：

```yaml
---
title: "规范标题"
type: spec
level: default            # default（始终生效）/ situational（按需加载）
tags: [tag1, tag2]       # 英文小写，3-5 个为佳
version: 1.0.0
summary: "一句话摘要"     # 注入 system prompt 时显示
---
```

Body 使用 MUST/SHOULD/MAY 分类编写规范条目。

### 3. 分类体系

| 分类 | 生效方式 | 定义 |
|------|---------|------|
| `default/` | **始终生效** | 影响 /feat 工作流运行、Gate 审查、Agent 行为约束 |
| 未来扩展 | 按需加载 | 根据任务关键词匹配 spec 的 tags |

### 4. 注入机制

- **主 Agent**：`experimental.chat.system.transform` hook → specs 摘要注入 system prompt
- **子 Agent**：`tool.execute.before` hook → 在 task() 调用时自动前置 specs 上下文
- **防重复**：`SPECS_MARKER` 检测确保跨 Plugin 重启不重复注入

---

## 实现路径

### V1.5 — Skill 形式
- agent-reasoning + interaction-protocol 以 OpenCode Skill 形式存在

### V1.8 — Spec 降格
- Skill 删除，内容迁移至 `specs/default/`
- spec 分类体系确立（README.md 分类定义段）
- Plugin 双钩子注入架构（docs + specs）

### V1.11 — ambiguithy-clarification
- 歧义澄清规范沉淀

### V1.15 — todowrite-display
- todowrite 使用规范沉淀

### V1.17 — exp-governance
- 经验治理规范沉淀

### V1.18 — implementation-documentation
- 实现方案文档引导规范沉淀

---

## 未来愿景

### V2.x — 规范进化
- **经验→spec 晋升管道**：参考模式中经多次验证的，自动发布为 spec
- **按需加载分类**：situational spec 按任务关键词匹配加载
- **Spec 版本管理**：spec 变更追踪和兼容性检查

### V3.x — 平台化
- **用户自定义 spec 模板**：安装时可选择规范包
- **团队共享 spec**：跨项目规范复用

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.self-workflow/specs/README.md` | 分类定义（Plugin 自动解析） |
| `.self-workflow/specs/default/*.md` | 8 个 default 规范 |
| `.opencode/plugins/self-workflow-session.ts` | 注入逻辑（scanSpecs + transform hook） |
