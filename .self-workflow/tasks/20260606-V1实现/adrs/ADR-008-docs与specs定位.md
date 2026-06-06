---
id: 008
title: docs / specs 定位——自举优先，规范从实践中来
date: 2026-06-06
status: 已采纳
---

# ADR-008：docs / specs 定位——自举优先，规范从实践中来

## 背景

V1 完成后有三个信息目录的定位需要澄清：`docs/`（根）、`.self-workflow/docs/`、`.self-workflow/specs/`。

初始理解将 `docs/` 窄化为"开发参考文档"，而未认识到其本质定位是"用户项目的文档"。

同时，installer 中的 spec 模板被过早设计——在没有任何自举经验的情况下预置了 3 个 YAML 格式的 spec 文件（coding-style、architecture、workflow-protocol），格式复杂且未经验证。

## 决策

### 定位澄清

| 目录 | 本质定位 | 在本项目的含义 |
|------|---------|--------------|
| `docs/` | **用户项目的文档**，描述项目本身 | Self-Workflow 的需求、路线图、设计 |
| `.self-workflow/docs/` | **Agent 运行时沉淀的经验** | 自举中产生的经验，提升项目能力 |
| `.self-workflow/specs/` | **项目自有的规范**，约束 Agent | 自举中产生的规范，可反哺到 installer |
| `installer/specs/` | **预置的通用规范** | 经过验证的通用规则，每个用户都可能需要 |

### 规范优先级

```
自举开发 → 发现问题 → 沉淀为 spec → 
  ├─ 能融入框架？→ 改 workflow/模板/Gate 逻辑（根治）
  └─ 不能融入？→ 保留为 spec，考虑是否通用 → 
       ├─ 通用？→ 放到 installer/specs/ 预置
       └─ 不通用？→ 留在 .self-workflow/specs/
```

### Spec 格式

- 使用 **Markdown** 格式，非 YAML
- 用户只需在 MUST/SHOULD/MAY 章节下添加 `- ` 列表项
- `@lint` 标记表示该规则有现成的 lint 工具可自动捕获，否则由 Review Agent 审查
- 不需要用户理解 `enforcement`、`Layer 2/3` 等术语

## 理由

- **自举优先**：没有自始至终用过自己的工具，就不可能知道用户真正需要什么
- **最小预置**：installer 只装被验证过的通用规则，不装猜测的规则
- **融入优先**：能通过改框架解决的问题，不留到 spec 层面
- **门槛最低**：Markdown 列表项比 YAML 结构更易理解

## 影响

- installer/specs/ 当前只有一个 README.md 模板，没有预置规则
- 后续自举过程中产生的规范，先评估能否融入框架，不能的再保留为 spec
- Markdown 格式的 spec 需要 Review Agent 支持解析（按章节标题识别 MUST/SHOULD/MAY）

## 关联

- 关联 ADR：[ADR-004 目录职责划分](./ADR-004-目录职责划分与开发使用分离.md)（目录结构的框架基础）
- 关联概念：自举开发、关注点分离
