---
title: "OpenCode Plugin 目录命名与注册机制"
category: 错误经验
tags: [plugin, opencode, directory-naming, auto-discovery, registration]
date: 2026-06-06
source: tasks/feat-开始v1-7-20260606
quality: verified
---

# OpenCode Plugin 目录命名与注册机制 —— 踩坑记录

## 摘要

将 Plugin 放在 `.opencode/plugin/self-workflow-session.ts`（单数 `plugin/`），但 OpenCode 的约定是 `.opencode/plugins/`（复数）。目录名错误导致 Plugin **静默不被加载**——没有报错，没有任何提示，就是不起作用。同时，误以为需要 `opencode.json` 注册，实际本地 Plugin 在 `plugins/` 目录下**自动发现**，无需显式配置。

## 根因

1. 安装器 EMPTY_DIRS 中写了 `.opencode/plugin`（单数），没有验证 OpenCode 的实际约定
2. 混淆了两种注册方式：
   - 本地文件：`.opencode/plugins/*.ts` → 自动发现，**无需配置**
   - npm 包：`opencode.json` 中 `plugin` 数组声明

## 正确做法

| 场景 | 位置 | 注册方式 |
|------|------|---------|
| 本地 Plugin | `.opencode/plugins/*.ts` | 自动发现 |
| npm Plugin | `opencode.json` → `"plugin": ["package-name"]` | 显式声明 |

## 适用场景

- 所有需要在 OpenCode 中部署 Plugin 的场景
- 安装器模板中涉及 `.opencode/` 目录创建的场合
