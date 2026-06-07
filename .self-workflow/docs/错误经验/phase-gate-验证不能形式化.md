---
title: "Phase Gate 验证不能形式化"
category: 错误经验
tags: [gate, verification, phase-4, formalization, substantive-review]
date: 2026-06-06
source: tasks/feat-开始v1-7-20260606
quality: verified
---

# Phase Gate 验证不能形式化 —— 踩坑记录

## 摘要

V1.7 Phase 4（功能验证）被标记为 passed，但实际只做了"文件存在性检查"（frontmatter 解析、installer manifest 输出），漏掉了关键验证：**Plugin 是否真的能被 OpenCode 加载运行？**。事后发现 Plugin 放在了错误的目录名下（`plugin/` 而非 `plugins/`），且 OpenCode 是否自动发现 plugin 也未验证。

## 根因

Phase 4 验证停留在"静态文件检查"层面：
- ✅ 文件存在
- ✅ 文件内容含预期代码
- ❌ 没有模拟 OpenCode 加载 Plugin 的环境
- ❌ 没有验证 Plugin 注册机制（自动发现 vs config 声明）

## 正确做法

Phase 4 验证应包含**运行时等价验证**：

1. **目录结构语义验证**：不仅检查文件存在，还要确认目录名符合平台约定（如 OpenCode 的 `plugins/` 而非 `plugin/`）
2. **注册机制验证**：确认 Plugin 能被平台发现（OpenCode: `plugins/*.ts` 自动发现，无需 opencode.json）
3. **静态分析**：检查 TypeScript 代码是否可被 OpenCode 的 Bun 运行时解析（无语法错误）

## 适用场景

- 所有涉及外部平台约定的 Phase Gate 验证
- Plugin/Extension 类功能开发
- 文件路径/目录名有平台特定约定的场景

## 关联经验

- **`提取/删除类变更——防执行偏差`**（`参考模式/`）—— 与本文的差异：本文讲验证不能形式化（反面警告——仅文件存在性检查不够），该文档讲正确的验证模式（正面方案——正向检查+反向检查+防歧义 prompt）。两篇合在一起形成完整的验证方法论。
- `docs/实现方案/gate-审查机制实现方案.md` — Gate 审查机制的完整架构（包含 Phase 4 验证审查的步骤和通过条件）。与本文的差异：实现方案讲"验证审查应该怎么做"，本文讲"验证审查实际上做错了什么"。
