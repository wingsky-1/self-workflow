# 03-implementation：V1.5.1 Gate强制步骤 — 实施记录

> **workflow-id**: feat-v1-5-1-gate强制步骤-20260606
> **时间戳**: 2026-06-06T20:30:00+08:00

## 修改文件

| 文件 | 操作 | 结果 |
|------|------|------|
| `packages/installer/templates/configs/guides/feat-workflow.md` | 重写（版本 0.2 → 0.3） | ✅ |
| `.self-workflow/configs/guides/feat-workflow.md` | 安装器同步 | ✅ （与模板源一致） |

## 修改清单

### F1：Git tag 强制检查 + Compound 补建

| 位置 | 修改 | 状态 |
|------|------|------|
| Gate 1 通过条件 | 新增 `[ ] Git tag checkpoint 已创建（ph1-analysis-gate-passed）` | ✅ |
| Gate 2 通过条件 | 新增 `[ ] Git tag checkpoint 已创建（ph2-design-gate-passed）` | ✅ |
| Gate 3 通过条件 | 新增 `[ ] Git tag checkpoint 已创建（ph3-implementation-gate-passed）` | ✅ |
| Gate 4 通过条件 | 新增 `[ ] Git tag checkpoint 已创建（ph4-verification-gate-passed）` | ✅ |
| Compound 步骤 2 | 新增 "Git tag 补建"（--grep 反查 + fallback 时间戳搜索） | ✅ |
| Compound 步骤 5 | 新增 "创建 Compound tag"（ph5-summary-completed） | ✅ |
| 工作流状态管理 步骤 c | 改为 "（必须执行 tag 创建，不可跳过）" | ✅ |
| 快速入门 步骤 c | 改为 "（必须执行 tag 创建，不可跳过）" | ✅ |

### F2：ADR 文件必须存在（非空）

| 位置 | 修改 | 状态 |
|------|------|------|
| 阶段 1 检查清单 | 决策捕捉 改为 "检查 adrs/ 目录——有决策则必有文件" | ✅ |
| 阶段 1 检查清单 | 新增 决策声明（显式标注项） | ✅ |
| 阶段 2 检查清单 | 同上 2 项 | ✅ |
| 阶段 3 检查清单 | 同上 2 项 | ✅ |
| 阶段 4 检查清单 | 同上 2 项 | ✅ |
| 阶段 5 检查清单 | 同上 2 项 | ✅ |
| 阶段 2 执行内容 | 新增 决策捕捉 + 决策声明 两项 | ✅ |

### F3：Gate 入口强制三维量化

| 位置 | 修改 | 状态 |
|------|------|------|
| Gate 1 入口 | 新增 "Gate 重量量化（入口强制计算，不可跳过）" 块 | ✅ |
| Gate 2 入口 | 同上 | ✅ |
| Gate 3 入口 | 同上（保留规范定义表作为引用源） | ✅ |
| Gate 4 入口 | 同上 | ✅ |
| Gate 3 (规范定义) | 从 L321 移至 Gate 入口下方，保留完整量化表 | ✅ |
| 附录 Gate 重量速查表 | weight 列改为 `*量化决定*` | ✅ |
| 附录 Gate 重量速查表 | 新增优先级说明 note | ✅ |

### M7：版本号

| 位置 | 修改 | 状态 |
|------|------|------|
| 文件头部 | `version: 0.2` → `version: 0.3` | ✅ |

## 设计偏差

无。实施严格按 `02-design.md` 执行，额外吸收了 Gate 2 方向审查的 2 个 warning：
1. 量化计算块中指定了输出位置（"对话中显式输出或写在 Gate 审查结果开头"）
2. Compound 补建增加了 fallback 逻辑（--grep 空结果时回退到时间戳范围搜索）

## 验证

- [x] 模板源 `.self-workflow/configs/guides/feat-workflow.md` 与部署副本 diff 一致
- [x] 版本号为 0.3
- [x] 4 个 Gate 入口均含量化计算块
- [x] 4 个 Gate 通过条件均含 Git tag 检查项
- [x] 5 个阶段检查清单均含 ADR 检查 + 决策声明
- [x] Compound 章节含补建逻辑（步骤 2）
- [x] 附录速查表 weight 列为 `*量化决定*`
