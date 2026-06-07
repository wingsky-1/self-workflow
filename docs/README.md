# Self-Workflow 系统架构文档

> 版本：V1.18
> 最后更新：2026-06-07
> 用途：为路线图规划和 README 更新提供系统全貌

---

## 概述

Self-Workflow 是一个 AI 辅助开发工作流框架。它的核心信念是：**AI 每次新会话不该从零开始**。

框架通过 10 个核心系统模块，构建了一套从"安装部署 → 任务执行 → 质量审查 → 经验沉淀 → 下次复用"的完整闭环。所有系统模块均由框架自身的工作流开发完成（自举）。

---

## 系统模块总览

```
                    ┌─────────────────────────────────┐
                    │       Session Plugin (会话插件)    │
                    │   自动注入经验索引 + 规范摘要       │
                    │   内置工具注册 + 子Agent上下文注入   │
                    └──────────────┬──────────────────┘
                                   │ 注入
    ┌──────────┐  ┌──────────┐  ┌──▼──────────┐  ┌──────────┐
    │ Installer│  │  /feat   │  │   Review    │  │ /catchup │
    │  安装器   │  │ 工作流    │  │  审查系统    │  │ 会话恢复  │
    └────┬─────┘  └────┬─────┘  └──────┬──────┘  └────┬─────┘
         │             │               │               │
         │        ┌────▼─────┐   ┌─────▼──────┐        │
         │        │   Task   │   │ Experience │        │
         │        │  任务管理  │◄──│  经验管理   │        │
         │        └────┬─────┘   └─────┬──────┘        │
         │             │               │               │
    ┌────▼─────┐  ┌────▼─────┐   ┌─────▼──────┐  ┌─────▼────┐
    │  Config  │  │   Todo   │   │    Spec    │  │   (未来)  │
    │  配置系统  │  │ 待办管理  │   │  规范系统   │  │   ...    │
    └──────────┘  └──────────┘   └────────────┘  └──────────┘
```

| # | 系统模块 | 核心作用 | 一句话描述 |
|---|---------|---------|-----------|
| 1 | **[Installer（安装器）](systems/installer-system.md)** | 部署 | 将模板源部署为运行时文件，MANIFEST 驱动的声明式安装 |
| 2 | **[/feat 工作流](systems/feat-workflow-system.md)** | 执行 | 5 阶段 + 4 Gate 的结构化开发流程，从需求到总结 |
| 3 | **[Review（审查）](systems/review-system.md)** | 质量 | 只读对抗性审查 Agent，Grill+COT 策略逐项挑战 |
| 4 | **[Task（任务管理）](systems/task-management-system.md)** | 追踪 | task.yaml 生命周期 + Git tag checkpoint + Compound 归档 |
| 5 | **[Experience（经验管理）](systems/experience-system.md)** | 记忆 | 5 分类经验库 + 5 级生命周期 + exp-governance 治理 |
| 6 | **[Spec（规范）](systems/spec-system.md)** | 约束 | 8 项 default spec，约束主 Agent 及所有子 Agent 行为 |
| 7 | **[Session Plugin（会话插件）](systems/session-plugin-system.md)** | 注入 | 双钩子自动注入（docs 索引 + specs 摘要）+ 4 个内置工具 |
| 8 | **[Todo（待办管理）](systems/todo-system.md)** | 规划 | 三层待办机制（todo.md → task.yaml → todowrite）+ 优先级框架 |
| 9 | **[/catchup（会话恢复）](systems/catchup-system.md)** | 恢复 | 扫描进行中任务和未解决错误，生成恢复摘要 |
| 10 | **[Config（配置）](systems/config-system.md)** | 模板 | 11 个阶段模板 + feat-workflow 指引 + task 模板 |

---

## 系统间协作流程

以一次典型的 `/feat` 执行为例，展示系统间如何协作：

```
1. 用户输入 /feat 实现用户登录
         │
2. Session Plugin: 注入 docs 索引 + specs 摘要到 system prompt
         │
3. /feat Command: 解析参数 → slug 生成 → 目录初始化
         │                    │
4. Config System: 加载 feat-workflow.md 指引 + feat-task.yaml 模板
         │
5. [Phase 1] 需求分析 → [Gate 1] 分析审查
         │                    │
6. Review Agent: 对抗性审查 01-analysis.md
         │
7. Task System: sw_task_phase_update → Git tag checkpoint
         │
8. ... [Phase 2-4] 设计 → 实现 → 验证，每阶段 Gate 审查 ...
         │
9. [Phase 5] 总结沉淀
         │
10. Experience System: exp-governance 审查 → 写经验 → ADR 晋升检查
         │
11. Todo System: 自动更新 todo.md 关联版本段状态
         │
12. Compound: 交叉引用检查 + 文档变更审查 + 补建 tag → 归档
```

---

## 版本路线图

当前实现覆盖 V1.0 ~ V1.18（19 个迭代版本）。以下为后续路线：

| 版本 | 主题 | 核心目标 |
|------|------|---------|
| **V1.x**（当前） | 核心功能雏形 | 10 个系统模块从无到有，迭代验证 → 问题修复（V1.19~V1.24） |
| **V2.x** | 多 Agent 并行 | 工作流拆分为多 Agent 协同、多会话并行开发、经验复利自动化 |
| **V3.x** | 用户体验 | 从"能用"到"好用"——无人值守模式、自然语言触发、老项目蒸馏 |

### V1.x 剩余工作（V1.19 ~ V1.24）

| 版本 | 内容 | 优先级 |
|------|------|--------|
| V1.19 | /feat Phase 4→5 文档更新步骤 + todo 已关闭版本迁移 | P1/P2 |
| V1.21 | Gate 纪律强化（不通过不进下一阶段）+ 提交前自检清单 | P0/P1 |
| V1.22 | ADR 先于产物 + todowrite 即时启动 + 内置工具优先 | P1/P2 |
| V1.23 | 迭代报告反哺框架描述优化 | P2 |
| V1.24 | exp-governance 自动化增强 + Phase 5 去重前置 | P1 |

### V2.x 核心方向

- **子 Agent 架构**：feat 工作流各阶段委托给专用 Agent 并行执行
- **多会话并行**：git worktree 支持同一项目多任务并行开发
- **经验复利闭环**：Compound 自动晋升 draft→verified，经验→spec 晋升管道
- **多种工作流类型**：debug/doc/review 工作流
- **经验 freshness 监控**：verified 文档自动过期提醒

### V3.x 核心方向

- **无人值守模式**：/feat 自主完成全流程，用户事后评审
- **自然语言触发**：普通对话中识别工作流意图
- **老项目蒸馏**：已有文档转 .self-workflow/docs 格式
- **用户体验优化**：周报/日报 command、doctor 命令、安装 patch 确认
- **智能化**：评审问题自动决策（高置信度场景）

---

## 实现路径

### 已完成（V1.0 ~ V1.18）

| 里程碑 | 版本 | 关键交付 |
|--------|------|---------|
| 框架诞生 | V1.0 | 安装器 + feat 工作流 + Review Agent + Catchup（单日 7/7 里程碑） |
| 质量加固 | V1.5 | Gate 强制步骤 + Gate 量化公式 + 双级经验模型 + /feat 自举 |
| 目录治理 | V1.7~V1.9 | docs 结构梳理 + specs 奠基 + 安装器三层架构重构 |
| 审查增强 | V1.10 | Grill+COT 提示词升级 + 文档变更纳入审查范围 |
| 工具链 | V1.11 | sw_task_* 内置工具 + /todo-organize + 歧义澄清 spec |
| 可视化 | V1.15 | todowrite 三层待办规范 |
| 经验治理 | V1.16~V1.17 | exp-governance skill + 5 级生命周期 + 去重检测 |
| 方案文档 | V1.18 | 9 份实现方案文档 + implementation-documentation spec |

### 关键技术决策

参见 `.self-workflow/docs/关键决策/`（已晋升为跨任务决策的 ADR）。

---

## 各系统详细文档

| 系统 | 文档 | 内容 |
|------|------|------|
| 安装器 | [installer-system.md](systems/installer-system.md) | 三层架构、MANIFEST 机制、模板权威源、部署流程 |
| /feat 工作流 | [feat-workflow-system.md](systems/feat-workflow-system.md) | 5阶段4Gate、重量量化、Compound、决策捕捉 |
| 审查 | [review-system.md](systems/review-system.md) | 只读Agent、7审查维度、Grill+COT策略、行为审查 |
| 任务管理 | [task-management-system.md](systems/task-management-system.md) | task.yaml schema、sw_task工具、Git checkpoint |
| 经验管理 | [experience-system.md](systems/experience-system.md) | 5分类、5级生命周期、exp-governance、去重 |
| 规范 | [spec-system.md](systems/spec-system.md) | 8项default spec、分类体系、注入机制 |
| 会话插件 | [session-plugin-system.md](systems/session-plugin-system.md) | 双钩子、marker检测、子Agent上下文注入 |
| Todo管理 | [todo-system.md](systems/todo-system.md) | 三层待办、/todo-organize、优先级框架 |
| /catchup | [catchup-system.md](systems/catchup-system.md) | 任务扫描、错误汇总、恢复建议 |
| 配置 | [config-system.md](systems/config-system.md) | 11模板、feat-workflow指引、task模板 |

---

## 文件结构映射

```
self-workflow/
├── packages/installer/          # 安装器（系统1）
│   ├── index.js                 # CLI 入口 + MANIFEST
│   ├── templates/               # 模板权威源
│   │   ├── agents/              # → .opencode/agents/
│   │   ├── commands/            # → .opencode/commands/
│   │   ├── skills/              # → .opencode/skills/
│   │   ├── plugin/              # → .opencode/plugins/
│   │   ├── configs/             # → .self-workflow/configs/
│   │   ├── docs/                # → .self-workflow/docs/（骨架）
│   │   ├── specs/               # → .self-workflow/specs/
│   │   └── tasks/               # → .self-workflow/configs/tasks/
│   └── README.md                # 安装器使用说明
│
├── .opencode/                   # OpenCode 运行时（安装器管理）
│   ├── agents/review-agent.md   # 审查Agent（系统3）
│   ├── commands/
│   │   ├── feat.md              # /feat 命令入口（系统2）
│   │   ├── catchup.md           # /catchup 命令（系统9）
│   │   └── todo-organize.md     # /todo-organize 命令（系统8）
│   ├── skills/exp-governance/   # 经验治理技能（系统5）
│   └── plugins/
│       └── self-workflow-session.ts  # 会话插件（系统7）
│
├── .self-workflow/              # 工作流运行时
│   ├── configs/                 # 配置（系统10）
│   │   ├── guides/feat-workflow.md
│   │   ├── templates/（11个文件）
│   │   └── tasks/feat-task.yaml
│   ├── specs/default/           # 规范（系统6）
│   │   ├── agent-reasoning.md
│   │   ├── interaction-protocol.md
│   │   ├── doc-audience.md
│   │   ├── decision-record.md
│   │   ├── ambiguity-clarification.md
│   │   ├── todowrite-display.md
│   │   ├── exp-governance.md
│   │   └── implementation-documentation.md
│   ├── docs/                    # 经验库（系统5）
│   │   ├── 实施经验/
│   │   ├── 参考模式/
│   │   ├── 错误经验/
│   │   ├── 关键决策/
│   │   └── 实现方案/
│   ├── tasks/                   # 任务实例（系统4）
│   └── todo.md                  # 项目待办（系统8）
│
└── docs/                        # 本文档目录
    ├── README.md                # ← 本文件
    └── systems/                 # 各系统详细文档
```
