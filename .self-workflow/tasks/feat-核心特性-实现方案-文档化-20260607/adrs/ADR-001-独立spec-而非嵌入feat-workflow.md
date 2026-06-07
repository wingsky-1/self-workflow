---
title: "ADR-001：实现方案文档引导——独立 spec 而非嵌入 feat-workflow"
workflow: feat-核心特性-实现方案-文档化-20260607
phase: 2
date: 2026-06-07
status: accepted
---

## 背景

V1.18 需在 `docs/` 下新增"实现方案"文档分类，并建立引导机制让 Agent 主动创建/更新实现方案文档。需求分析中识别了两种实现路径。

## 决策

**选择方案 B：创建独立 spec 文件 `specs/default/implementation-documentation.md`，通过 Plugin 注入到所有 Agent session。feat-workflow.md 仅做轻量引用。**

## 方案对比

### 方案 A：引导内容直接嵌入 feat-workflow.md

在 feat-workflow.md Phase 2/3/5 的检查清单中分别写入详细的检查项和引导文字。

**优势**：
- 不需要新建文件
- 引导内容与工作流上下文紧密耦合——Agent 在 Phase 2 看到的就是 Phase 2 相关的引导

**劣势**：
- feat-workflow.md 已很长（731 行），3 处嵌入增加清单疲劳
- 引导内容只能在 /feat 工作流中生效——普通对话中 Agent 仍然不知道何时记录
- 子 Agent 架构转型时（V2 计划），需要重新设计引导注入方式
- 引导规则和流程规则混在一个文件中——关注点不分离

### 方案 B：独立 spec 文件 + feat-workflow 轻量引用（选择此方案）

**优势**：
- spec 通过 Plugin 的 session 注入机制自动进入**所有 Agent**（主 Agent + 子 Agent）
- 子 Agent 架构转型时零改动——spec 注入机制不变
- feat-workflow.md 保持简洁，仅在检查清单中加 1 行引用
- 引导规则可独立演进——修改 spec 不影响工作流文档
- 符合现有 spec 体系的设计哲学（独立、可注入、可复用）

**劣势**：
- 需要新建 spec 文件
- Agent 在普通对话中看到 spec 时可能缺少 /feat 工作流的上下文——但 spec 规则本身是"当你在设计/实现时，考虑是否需要记录"，语境自包含

## 影响

- 新建：`specs/default/implementation-documentation.md`
- 微调：`feat-workflow.md` Phase 2/3/5 检查清单各增加 1 行 spec 引用
- 微调：`review-agent.md` prompt 增加 non-blocking 检查
- 微调：`docs/README.md` 分类定义段和使用指南
- 新建：installer 模板中对应的源文件

## 来源

- 需求分析 `artifacts/01-analysis.md` 的"已知决策点"表
- Human 反馈："改为 spec 可能更合适，后续 workflow 也是要拆分子 Agent 的，先独立出来 spec 引导，后续更好结合复用"
