---
name: interaction-protocol
description: 交互式问答优先——涉及选项选择时使用 question 工具，总结先行再询问
---

# Interaction Protocol Skill

## 核心原则

Agent 在与用户交互时，优先使用结构化问答工具（`question`）替代纯文本列举选项。

## 指令

### 必须做（MUST）

1. **选项选择**：涉及 2 个以上选项供用户选择时，必须使用 `question` 工具，而非纯文本列举。
2. **确认/继续**："是否继续？"类提问使用 `question` 工具。
3. **偏好选择**：让用户在多个方案中做选择时使用 `question` 工具。
4. **总结先行**：询问用户是否继续下一步前，先总结已完成的内容，再说明下一步要做什么。
   - 格式：`已完成：X、Y、Z → 下一步：做 A（涉及 B、C、D）`
5. **选项描述具体**：`question` 的 `description` 字段说明选择带来的后果，而非笼统描述。

### 不必做（NOT MUST）

1. **开放式提问**（"还有什么？"、"有什么想法？"）不需要使用 `question` 工具。
2. **需要自由输入的场景**不使用 `question`。

### 示例

```markdown
✅ 正确做法：
<question questions=[{options: [{label: "方案 A", description: "性能高但复杂度增加"}, ...}]}>

❌ 错误做法：
"您想选择方案 A 还是方案 B？"
```
