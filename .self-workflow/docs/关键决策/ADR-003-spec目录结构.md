---
promoted-from: feat-specs结构奠基-20260606
---

# ADR-003：Spec 目录结构 —— default/ + 按需扩展

## 背景

`specs/` 仅含空 README.md 骨架，无子目录。需要定义可扩展的目录结构。

## 备选方案

- **A**：单层 default/ — 简单但无分类
- **B**：default/ + 多主题分类 — 可扩展但奠基阶段过度划分
- **C**：default/ + 按需扩展（不预设空目录）✅ 选中

## 决策

**选择方案 C**：`specs/default/` + README 中定义扩展规则。

### 目录结构

```
.self-workflow/specs/
├── README.md       # 索引入口（含"分类定义"段，Plugin 可解析 ### 目录名/）
└── default/        # 始终生效的关键规范
    ├── agent-reasoning.md
    ├── interaction-protocol.md
    ├── doc-audience.md
    └── decision-record.md
```

### 扩展规则

需要新分类时：创建子目录 + 在 README 的"分类定义"段新增 `### 新分类名/` 条目。Plugin 自动识别。

## 理由

1. **V1.8 奠基不过度设计**：4 个 spec 全属 default/（都影响 flow 运行）
2. **与 docs/ 一致**：README 索引 + 子目录分类模式，Agent 已有认知
3. **语义清晰**：`default/` = 默认生效，Agent 看到就知道必须遵守

## 关联

- 参考：`docs/README.md` 的分类定义格式（`### 目录名/` + 描述行）
