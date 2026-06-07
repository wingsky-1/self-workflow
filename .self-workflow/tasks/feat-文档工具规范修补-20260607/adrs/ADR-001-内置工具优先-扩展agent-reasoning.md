---
phase: adr
type: simple
workflow: feat
description: P2 内置工具优先——选择扩展 agent-reasoning.md 而非新建独立 spec
validation:
  required-fields:
    - "背景"
    - "决策"
    - "理由"
  required-format:
    "决策": "明确、无歧义的结论性陈述"
---

# ADR-001：P2 内置工具优先 — 扩展 agent-reasoning.md 而非新建 spec

## 背景

V1.22 P2"内置工具优先"需求要求在 Agent 规范中增加工具选择优先规则：Agent 执行文件操作前 MUST 先检查项目是否提供匹配的内置工具（如 `sw_task_*` 系列）。需要决定将此规则放在哪里。

当前 `agent-reasoning.md` 已有"委托优先"原则（MUST 段含委托决策表），工具选择是委托逻辑的自然延伸——两者共享"先检查现有能力再自行执行"的核心原则。

## 决策

**扩展 `agent-reasoning.md`**，在"委托决策"段之后新增"工具选择优先"子节。不创建独立 spec 文件。

## 理由

1. **主题内聚**：工具选择与委托决策共享"先检查再执行"原则，放在同一文件中 Agent 阅读一个文件即可理解完整决策流程
2. **发现性高**：Agent 阅读 `agent-reasoning.md` 时自然看到工具选择规则，降低遗漏概率——相比新建独立 spec 文件（Agent 需额外发现和加载）
3. **维护成本低**：工具选择规则与委托规则共享"验证结果"要求（来自"委托后验证"段），放在同一文件中避免重复声明
4. **比例适中**：本规则本身简短（~10 行），独立文件的文件开销 > 规则内容——在扩展达到显著规模前，内聚在 `agent-reasoning.md` 中更合理

## 备选方案评估

方案 B（新建独立 spec 文件 `builtin-tool-priority.md`）的合理优点：

- **关注点分离**：工具选择逻辑独立版本化，不影响 `agent-reasoning.md` 现有结构
- **可按需加载**：当前 8 个 default spec 已较为庞大，独立 spec 可设为 situational 级别，仅在触发工具选择场景时加载
- **扩展性好**：未来工具选择规则如需扩展（如增加安全检查、权限校验），独立文件不会膨胀 `agent-reasoning.md`

方案 A 选择的主要考虑：
- 本规则本身简短（~10 行），独立文件比例失衡
- 放在 `agent-reasoning.md` 中与"委托决策"形成流程闭环："先查内置工具 → 无则按委托决策表行事"
- 如果未来规则扩展到显著规模，可从此文件中提取（重构成本低，因为规则独立在一个子节中）

**决策权衡**：短期（V1.x）选择方案 A 避免碎片化；长期（V2.x+）如规则扩展，可提取为独立 spec。

## 关联

- 关联需求：V1.22 P2 — 内置工具优先（来源：V1.15 会话评审 #1，Agent 未用 sw_task_create 手工创建目录）
- 关联 spec：`agent-reasoning.md`
