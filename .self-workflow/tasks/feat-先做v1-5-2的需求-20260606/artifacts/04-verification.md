# 功能验证 — V1.5.2 Todo 体系优化

> 工作流 ID：`feat-先做v1-5-2的需求-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T19:28:00+08:00

---

## 验证结果

| 验收标准 | 结果 | 证据 |
|---------|------|------|
| F4: todo.md 优先级/版本标记规范化 | ✅ | `.self-workflow/todo.md` 头部定义 P0/P1/P2，版本分组存在 |
| F4: Agent 可识别标记 | ✅ | AGENTS.md 新增"Todo 体系"章节说明标记含义 |
| F5: wontfix 使用规则 | ✅ | todo.md 归档规则行更新为 `[wontfix]` + 拒绝理由 |
| F5: wontfix 示例 | ✅ | todo.md 末尾已添加注释示例 |
| F5: 归档分组命名 | ✅ | 现有 `<details><summary>` 分组保留，新增规则说明 |
| F6: task.yaml workflow-id/type/phases | ✅ | feat.md 步骤 3 YAML 模板已包含全部新字段 |
| F6: workflow.yaml 不再创建 | ✅ | feat.md 步骤 4 改为注释，目录树无 workflow.yaml |
| F6: Gate 引用更新 | ✅ | feat-workflow.md 全部 workflow.yaml → task.yaml |
| F7: feat.md 角色声明 | ✅ | feat.md line 12-19 角色定位章节 |
| F7: feat-workflow.md 角色声明 | ✅ | feat-workflow.md line 7-10 角色说明 |
| F7: 交叉引用完整性 | ✅ | feat.md 引用 feat-workflow.md；feat-workflow.md 说明由 /feat 引用 |
| F7: 系统约束章节 | ✅ | feat.md 含 task()规范/skill规则/Gate量化/决策捕捉 |
| 安装器同步 | ✅ | 27/27 项，模板源 = 部署文件 |
| todo.md 迁移 | ✅ | 新文件存在，旧文件是 stub，引用已更新 |
| 向后兼容 | ✅ | 仪表盘支持双格式（phases 检测→回退 workflow.yaml） |

## 未覆盖项

| 项目 | 状态 | 说明 |
|------|------|------|
| todo.md 末尾游离内容 | ⚠️ | 4 行未归组的编号项（原始文件的遗留内容）— 非阻断 |
| docs/todo.md stub 行数 | ⚠️ | 1 行而非设计中的 3 行 — 功能等效 |
| 本任务的 task.yaml | ⚠️ | 保持旧 schema（按设计不迁移 in_progress 任务） |
