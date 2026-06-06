---
title: "Spec 目录组织"
category: 关键决策
tags: [spec-structure, directory, default, extensible, classification]
date: 2026-06-07
source: tasks/feat-specs结构奠基-20260606
quality: verified
---

# Spec 目录组织

## 结构

```
.self-workflow/specs/
├── README.md        # 索引入口 + Plugin 可解析的分类定义段（### 目录名/）
└── default/         # 始终生效的关键规范
    ├── agent-reasoning.md
    ├── interaction-protocol.md
    ├── doc-audience.md
    └── decision-record.md
```

## 规则

| 目录 | 注入行为 | Agent 感知 |
|------|---------|-----------|
| `default/` | 自动注入 system prompt | 看到即知"必须遵守" |
| `<未来分类>/` | 按需加载 | 按 tags 匹配 |

## 扩展新分类

1. 在 `specs/` 下创建子目录
2. 在 `specs/README.md` 分类定义段添加 `### 新分类名/` + 描述行
3. Plugin 自动识别（`parseCategoryDescriptions` 解析 `### 目录名/` 格式）

## 设计原则

不过度设计——按需扩展，不预设空目录。与 docs/ 从零到三的渐进增长一致。
