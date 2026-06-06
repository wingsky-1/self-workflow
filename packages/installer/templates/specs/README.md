---
title: "Self-Workflow 规范（Spec）"
type: spec-index
---

# Self-Workflow 规范（Spec）

规范是约束 Agent 行为的规则。`default/` 下的规范通过插件自动注入到 system prompt，Agent 在每次会话中都必须遵守。

## 如何使用

- `default/` 下的规范**始终生效**——插件自动注入摘要到 system prompt，Agent 用 Read 工具查看完整内容
- 其他分类的 spec 按需加载——根据任务关键词匹配 spec 的 tags
- 遇到不确定时主动查阅 spec 文件

## Spec 格式

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

Body 使用 Markdown 自由格式，规范条目使用 MUST/SHOULD/MAY 分类。

## 如何添加规范

1. 在对应分类目录下创建 `.md` 文件
2. 填写 YAML frontmatter（见上方格式）
3. Body 按 MUST/SHOULD/MAY 分类编写规范条目
4. `default/` 下的规范需在本文件"分类定义"段中已有对应目录

---

## 分类定义

> ⚠️ 以下 `### 目录名/` 条目被 Plugin 自动解析。新增分类目录后在此处添加对应条目。

### default/
始终生效的关键规范——影响 /feat 工作流运行、Gate 审查、Agent 行为约束。
Agent 在每次会话中都必须遵守 default/ 下的规范。

<!-- 未来扩展：
### docs/
文档编写与审查规范

### workflow/
工作流行为规范
-->
