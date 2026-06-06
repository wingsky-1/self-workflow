# ADR-001：Review Agent 强制调用 — 混合方案

> 日期：2026-06-06
> 状态：已采纳
> 关联：`.self-workflow/configs/guides/feat-workflow.md` Gate 章节

## 背景

`feat-workflow.md` 中 4 个 Gate 的对抗性审查步骤用自然语言描述"调用 Review Agent 审查..."，措辞为描述性而非指令性。在 `/feat` 命令自举实施中，Review Agent 一次都未被 `task(subagent_type="review-agent")` 调用——主 Agent 全部自审。独立审查机制形同虚设。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A：Inline task() 代码块 | 在 Markdown 中直接写入 `task(subagent_type="review-agent", prompt="...")` | 确定性最高；Agent 可直接复制执行 | 代码块打断文档可读性 |
| B：强制指令语句 | 使用"必须执行"措辞强化指令性，保留自然语言 | 可读性好 | Agent 仍可能跳过或构造不完善的 prompt |
| C：混合方案 | 自然语言描述审查要求 + 附 `task()` 代码块示例 | 兼顾可读性和确定性 | 文档长度增加 |

## 决策

**选择方案 C（混合方案）**。

每个 Gate 的对抗性审查步骤保留自然语言描述（审查要点），后追加 `**执行指令**（必须执行，不可跳过）：` 开头的 `task()` 代码块。同时删除原有的"如果 Review Agent 尚未就绪"逃生舱，改为"如果 Review Agent 不可用，主 Agent 自行完成"的降级路径。

## 理由

1. Agent 同时获得"理解为什么要审查"（自然语言）和"抄作业级的具体指令"（task() 代码块）
2. prompt 中的占位符（如 `<artifacts/01-analysis.md>`）可被 Agent 替换为实际值，模板本身不锁定上下文
3. 降级路径保留——Review Agent 不可用时仍可自审，不阻塞流程

## 影响

- `feat-workflow.md` 4 个 Gate 各新增 1 个 task() 代码块，Gate 2 额外新增步骤 0 的 task()
- 删除 2 处逃生舱文本
- 后续 Agent 在 Gate 处有明确、不可跳过的 Review Agent 调用指令

## 反对意见

**"Agent 跳过阅读 Gate 步骤时，代码块同样无效"**：这是文档层面能解决的极限。更底层的强制执行需要 V2 的 Hook 系统（Gate 定义为独立触发单元）。V1.5 退而求其次——让 Agent"很难找借口跳过"。
