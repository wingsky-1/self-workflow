# ADR-003：Spec 目录结构 —— default/ + 主题分类

## 背景

当前 `specs/` 仅含一个 `README.md` 骨架，无子目录。V1.8 需要定义可扩展的目录结构，支持 "始终生效的规范" 和 "按需加载的规范" 的分层。

`docs/` 经验目录已有成功的三分类目录结构（实施经验/参考模式/错误经验），Plugin 通过扫描 `README.md` 中的 `### 分类名/` 条目自动识别分类。

## 备选方案

### 方案 A：单层 default/ 目录

```
specs/
├── README.md           # 索引入口
└── default/            # 所有规范文件直接放在这里
    ├── agent-reasoning.md
    ├── interaction-protocol.md
    ├── doc-audience.md
    └── decision-record.md
```

- ✅ 简单，V1.8 奠基阶段够用
- ❌ 无分类，spec 增多后难以管理

### 方案 B：default/ + 多主题分类目录

```
specs/
├── README.md           # 索引入口（含分类定义段，Plugin 可解析）
├── default/            # 始终生效、影响 flow 运行的关键规范
│   ├── agent-reasoning.md
│   └── interaction-protocol.md
├── docs/               # 文档相关规范
│   └── doc-audience.md
└── workflow/           # 工作流相关规范
    └── decision-record.md
```

- ✅ 可扩展，与 docs/ 三分类模式一致
- ❌ 4 个 spec 分到 3 个目录，略显过度划分（奠基阶段）

### 方案 C：default/ + 按需扩展（不预设空目录）

```
specs/
├── README.md           # 索引入口
├── default/            # 始终生效的关键规范
│   ├── agent-reasoning.md
│   ├── interaction-protocol.md
│   ├── doc-audience.md
│   └── decision-record.md
└── <未来按需添加分类目录>
```

- ✅ 奠基阶段不预设空目录（不过度设计）
- ✅ default/ 语义明确——影响 flow 运行的关键规范
- ✅ README.md 中说明扩展规则：需要新分类时创建子目录 + 在 README 的分类定义段新增条目
- ✅ 与 docs/ 的增长模式一致（docs 最初也没有三分类，后来逐步增长的）

## 决策

**选择方案 C**：`specs/default/` + README 中定义扩展规则。

### 目录结构

```
.self-workflow/specs/
├── README.md           # 索引入口（类似 docs/README.md 的角色）
│                       #   含 "如何使用"、"Spec 格式"、"分类定义" 三部分
│                       #   "分类定义" 段使用 ### 分类名/ 格式，Plugin 可解析
└── default/            # 始终生效的关键规范
    ├── agent-reasoning.md
    ├── interaction-protocol.md
    ├── doc-audience.md
    └── decision-record.md
```

### Spec README.md 结构

```markdown
# Self-Workflow 规范（Spec）

## 如何使用
（Agent 如何发现和使用 spec 的指引）

## Spec 格式
（frontmatter 字段说明）

---

## 分类定义

### default/
始终生效的关键规范——影响 /feat 工作流运行、Gate 审查、Agent 行为约束。
Agent 在每次会话中都必须遵守 default/ 下的规范。

<!-- 未来扩展：
### docs/
文档编写与审查规范

### workflow/
工作流行为规范
-->
```

## 理由

1. **V1.8 奠基不过度设计**：4 个 spec 全部属于 default/（都影响 flow 运行），恰好填满 default/
2. **扩展性预留**：README 中的 "分类定义" 段采用 `### 分类名/` 格式（与 docs/ 一致），Plugin 可自动识别新增分类
3. **语义清晰**：`default/` 一词直译"默认生效"，Agent 看到就知道必须遵守
4. **与 docs 一致**：README 索引 + 子目录分类的模式，Agent 已有认知

## 反对意见

- "4 个 spec 全放 default/，是否弱化了分类的意义？" → 当前 4 个确实都属于"始终生效"范畴，未来 spec 增多时自然需要拆分（如代码规范类 → `coding/`，审查规范类 → `review/`），README 中的扩展规则留好了口子

## 关联

- 参考：`docs/README.md` 的分类定义格式（`### 目录名/` + 描述行）
- 依赖：ADR-002（Spec 加载机制）依赖此结构扫描 default/ 目录
