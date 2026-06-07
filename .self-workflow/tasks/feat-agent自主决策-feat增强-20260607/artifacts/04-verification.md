---
phase: 4
workflow: feat
---

# 功能验证 — V1.11：/feat 增强 + todo 管理 + 内置工具

> 工作流 ID：`feat-agent自主决策-feat增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T12:12:00+08:00

---

## 验收标准逐条验证

| AC | 标准 | 验证结果 | 证据 |
|----|------|---------|------|
| AC1 | /feat 无参数→自动认领 | ⚠️ 需新会话验证 | feat.md 无参数模式已包含 4 步自动认领逻辑 |
| AC2 | /feat 无参数无任务→仪表盘 | ⚠️ 需新会话验证 | feat.md 步骤 4 含仪表盘兜底逻辑 |
| AC3 | 完成后自动更新 todo | ⚠️ 需完整工作流验证 | feat-workflow.md Compound 新增步骤 5 |
| AC4 | todo 整理命令 | ✅ 可静态验证 | `.opencode/commands/todo-organize.md` 已部署 |
| AC5 | todo 注入（feat context） | ✅ 可静态验证 | feat.md 步骤 0.3 "Todo 上下文" |
| AC6 | 歧义澄清 spec | ✅ 可静态验证 | `.self-workflow/specs/default/ambiguity-clarification.md` 已部署 |
| AC7 | 内置 tool 目录创建 | ⚠️ 需重启验证 | self-workflow-session.ts 中 `sw_task_create` tool 已注册 |
| AC8 | 内置 tool 任务列表 | ⚠️ 需重启验证 | self-workflow-session.ts 中 `sw_task_list` tool 已注册 |

## 静态验证

### 文件部署完整性

| 文件 | 模板源 | 运行时 | 匹配 |
|------|--------|--------|------|
| feat.md | 8,610 B | 8,610 B | ✅ |
| todo-organize.md | 1,429 B | 1,429 B | ✅ |
| feat-workflow.md | 32,591 B | 32,591 B | ✅ |
| ambiguity-clarification.md | 1,283 B | 1,283 B | ✅ |
| self-workflow-session.ts | 18,199 B | 18,199 B | ✅ |

### YAML 解析修复验证

- 自定义 YAML 解析器已删除（~170 行）
- 使用项目已有的 `yaml` 包（`.opencode/node_modules/yaml/`）
- `parseYaml` 正确处理 `phases:` 对象数组

### 模板占位符修复验证

- `feat-task.yaml` 模板 `workflow-id` 行：`workflow-id: feat-<slug>-<YYYYMMDD>`（消除双重 `>>`）
- 模板源和运行时一致

## 反向检查

- [x] 自定义 YAML 解析器已删除（旧内容不存在）
- [x] `yaml` 包 import 已添加（新内容存在）
- [x] 模板占位符 `<feat-<slug>-<YYYYMMDD>>` 已替换为 `feat-<slug>-<YYYYMMDD>`（旧格式不存在）

## 待新会话验证项

以下项需在**重启 OpenCode 后的新会话**中验证：
1. `sw_task_list/create/read/phase_update` 4 个 tool 出现在工具列表中
2. `/feat`（无参数）行为为自动认领
3. `/todo-organize` 命令可触发

> 注：由于 Plugin tool hook 需 OpenCode 重启才能加载，工具级功能需新会话实测。当前阶段已完成所有静态可验证项的检查。

## 决策捕捉

- [x] **本阶段无架构决策**
