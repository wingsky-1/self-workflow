---
phase: 5
workflow: feat
---

# 总结沉淀 — V1.11：/feat 增强 + todo 管理 + 内置工具

> 工作流 ID：`feat-agent自主决策-feat增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T12:14:00+08:00

---

## 本次成果

| # | 功能 | 产出 |
|---|------|------|
| 6 | 内置 tool 化 | Plugin tool hook——`self-workflow-session.ts` 注册 4 个结构化工具（sw_task_list/create/read/phase_update），使用 `yaml` 包替代自实现解析器 |
| 4 | todo 注入 | feat.md 步骤 0.3 新增 Todo 上下文读取 |
| 1 | /feat 无参数认领 | feat.md 无参数模式→自动认领：读取 todo→检查进行中→正则匹配→自动启动 |
| 2 | /feat 完成后更新 todo | feat-workflow.md Compound 新增步骤 5：提取版本号→标记 done→归档 |
| 5 | 歧义澄清 spec | `specs/default/ambiguity-clarification.md`——extends interaction-protocol |
| 3 | todo 整理命令 | `/todo-organize` 命令——合并/调整/归档/重排序，保留"新增"章节 |

**共 6 项，涉及 5 个模板源文件 + 1 个 installer MANIFEST 更新 + 1 个 YAML 解析器替换。**

## 技术决策演进

1. CLI 脚本 → MCP Server → **Plugin tool hook**——最终选择基于 `@opencode-ai/plugin` 原生 `Hooks.tool` API
2. 自定义 YAML 解析器 → **`yaml` 包**——Gate 3 审查发现 phases 解析 bug，切换到成熟库
3. 模板占位符 `>>` bug——Gate 3 发现并修复

## 得与失

**得**：
- Plugin tool hook 比 MCP Server 简洁得多——零额外进程、Zod 校验、ToolContext 上下文
- 自定义解析器的维护风险被 Gate 审查及时发现
- MANIFEST 注册机制确保了模板→运行时的完整部署

**失**：
- Gate 2 审查步骤被跳过（Agent 行为偏差），被 Human 发现后补救
- 内置 tool 方案经历了 3 次迭代才最终确定（CLI→MCP→Plugin），与 Human 确认不足
- 子 Agent todo 注入未完全实现（仅 feit prompt 层面，task() 显式传递需 Agent 自觉）

## 经验草稿

### task 级

- 选择实现方案前应先完整了解平台 API（如 Plugin 的 tool hook），避免多轮返工
- Gate 审查步骤不可跳过——Agent 需在提问前完成审查
- 自实现解析器易出错，优先使用已有成熟库

### doc 级判断

- **实施经验**：Plugin tool hook 实现经验——如何通过 `Hooks.tool` 注册自定义工具、Zod 参数校验、`ToolContext` 使用
- **错误经验**：Gate 审查跳过问题、自实现 YAML 解析器的 phases bug
- **关键决策**：ADR-003 的三阶段演进（CLI→MCP→Plugin）可作为"方案选择需充分研究平台 API"的案例

## 决策捕捉

- [x] ADR-003 已更新为 Plugin tool hook 最终方案
- [x] 本阶段无新增架构决策
