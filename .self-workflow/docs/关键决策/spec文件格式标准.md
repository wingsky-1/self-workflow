---
title: "Spec 文件格式标准"
category: 关键决策
tags: [spec-format, frontmatter, yaml, markdown, overridden-adr-008]
date: 2026-06-07
source: tasks/feat-specs结构奠基-20260606
quality: verified
---

# Spec 文件格式标准

## 规则

`.self-workflow/specs/` 下所有规范文件采用 **YAML frontmatter + Markdown body** 格式，与 `docs/` 经验文档统一。

### Frontmatter 模板

```yaml
---
title: "规范标题"
type: spec
level: default          # default（始终生效）| situational（按需）
tags: [tag1, tag2]     # 英文小写，3-5 个
version: 1.0.0
summary: "一句话摘要"   # Plugin 注入时展示
---
```

### Body 规范

- 按 MUST / SHOULD / MAY 三级分类
- MUST：强制，Gate 阻断
- SHOULD：建议，产生警告
- MAY：可选参考

## 为什么

- 与 docs/ 一致——复用 `parseFrontmatter()` 解析代码
- `level` / `summary` 支持 Plugin 程序化注入

## 超驰

此决策超驰 ADR-008（V1）的"纯 Markdown"声明。彼时 specs/ 为空骨架，实战证明 frontmatter 必要且可行。
