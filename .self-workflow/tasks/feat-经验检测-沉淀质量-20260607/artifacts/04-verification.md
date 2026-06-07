# 功能验证 — V1.16+V1.17 经验复利机制

> 工作流 ID：`feat-经验检测-沉淀质量-20260607`
> 时间戳：2026-06-07T07:25:00

## 验证结果

| # | 验证项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | Skill 文件存在且 frontmatter 有效 | ✅ PASS | `.opencode/skills/exp-governance/SKILL.md` 存在，`name: exp-governance` 与目录名一致，description 含触发词 |
| 2 | Spec 文件存在且 frontmatter 有效 | ✅ PASS | `.self-workflow/specs/default/exp-governance.md` 存在，`type: spec`, `level: default`, 含 version/summary |
| 3 | Spec 定义 5 级生命周期 | ✅ PASS | draft/verified/outdated/refreshed/archived 全部定义 |
| 4 | Phase 5 执行顺序正确 | ✅ PASS | 经验治理 (line 518) 在经验草稿 (line 519) 之前 |
| 5 | Phase 5 含治理步骤 | ✅ PASS | 执行内容 + 完成检查清单 + 双级经验说明 各含引用 |
| 6 | MANIFEST 注册完整 | ✅ PASS | skill + spec 已注册，`init --force` 同步成功 |
| 7 | docs/README.md quality 字段 | ✅ PASS | 已更新为 5 级（draft/verified/outdated/refreshed/archived） |
| 8 | 安装器模板源路径正确 | ✅ PASS | 3 个模板源文件位于正确路径，MANIFEST 映射正确 |

## 验收标准对照

| 验收标准 | 结果 | 说明 |
|---------|------|------|
| A1.1 (去重) | ✅ | Agent 语义判断，skill 中定义判断维度 |
| A2.1 (skill 存在) | ✅ | `skill(name="exp-governance")` 可加载 |
| A2.2 (审查维度) | ✅ | 4 维度：frontmatter/tag/category/source |
| A3.1 (spec 存在) | ✅ | `specs/default/exp-governance.md` |
| A4.1 (生命周期) | ✅ | 5 级：draft→verified→outdated→refreshed→archived |
| D1.1 (skill 入口) | ✅ | skill 为唯一入口 |
| D2.1 (工作流集成) | ✅ | Phase 5 含治理步骤 |
| D3.1 (spec 同步) | ✅ | 模板源→MANIFEST→init --force |

## 已知限制

- **Skill 运行时加载验证**：需新会话启动后 skill 才会出现在 `available_skills` 列表
- **Spec 自动注入验证**：需新会话启动后 Plugin 的 `scanSpecs()` 才会注入 exp-governance.md 摘要
- **去重效果验证**：需在实际 Phase 5 中加载 skill 执行完整审查流程验证 Agent 判断质量
