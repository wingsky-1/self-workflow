---
phase: 3
workflow: feat
description: 代码实现阶段产物
validation:
  required-fields:
    - "实现摘要"
    - "文件变更清单"
    - "验证结果"
---

# 代码实现 — V1.19：/feat 流程修补 + todo 整理

> 工作流 ID：`feat-feat流程修补-todo整理-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T17:45:00+08:00

---

## 实现摘要

按 Phase 2 设计的实现顺序，完成以下 5 项变更：

| 项 | 文件 | 变更类型 | ADR |
|----|------|---------|-----|
| 1 | `packages/installer/templates/plugin/self-workflow-session.ts` | Bug 修复 + 接口扩展 | ADR-002, ADR-003 |
| 2 | `packages/installer/templates/configs/guides/feat-workflow.md` | 流程增强 | ADR-004 |
| 3 | 安装器同步 `init --force` | 部署 | — |
| 4 | `.self-workflow/todo.md` + `.self-workflow/done.md` | 文件迁移 | — |
| 5 | 3 个历史 task.yaml 文件 | Bug 修复 | AC4b |

---

## 文件变更清单

### 1. `packages/installer/templates/plugin/self-workflow-session.ts`

**Fix 1：checkpoint 参数支持**（ADR-002）

- `updatePhase` 签名新增 `checkpoint?: string`
- checkpoint 写入逻辑：非空时替换 `checkpoint:\s*\S+`（覆盖 null/SHA）；字段不存在时插入 `errors:`/`artifact:` 前
- `gate === "passed"` 且无 checkpoint 时返回 warning
- 工具 schema 增加 `checkpoint: z.string().optional()`
- execute handler 传递 `args.checkpoint` 到 `updatePhase`

**Fix 2：started: 幂等保护**（ADR-003）

- `hasValidStarted` 双重检测：`started:\s*\S` 非 null 存在时跳过
- 仅 `started: null` 时执行替换（正则 `/started:\s*null\b/`）
- 无字段时在 `status:` 后插入（含 `statusLineIdx !== -1` 防御）

修改范围：仅 `updatePhase`（L177-263）和 `sw_task_phase_update` 工具注册（L439-460）

### 2. `packages/installer/templates/configs/guides/feat-workflow.md`

- **Phase 4.5 插入**（L513-535）：Gate 4 通过后、Phase 5 入口前新增 "阶段 4.5：相关文档同步"，含变更范围扫描、文档映射、逐类决策、non-blocking 说明
- **Compound 步骤 5 MUST**（L663）：文本从"自动更新"升级为"Agent MUST 更新...不可跳过"
- **版本号升级**（L4）：`version: 0.4` → `version: 0.5`

### 3. 安装器同步

运行 `node packages/installer/index.js init --target . --force`：
- 45 项操作，核心更新：`feat-workflow.md` → `.self-workflow/configs/guides/`、`self-workflow-session.ts` → `.opencode/plugins/`

### 4. Todo 已关闭迁移

- 创建 `.self-workflow/done.md`：含 16 个已关闭版本段（V1~V1.18），格式不变
- `.self-workflow/todo.md` 的 `## 已关闭` 替换为 `## 已关闭 → 详见 [done.md](done.md)`

### 5. 历史文件修复（AC4b）

| 文件 | Phase | 操作 |
|------|-------|------|
| `feat-核心特性-实现方案-文档化-20260607/task.yaml` | 3, 5 | 删除重复 `started: null`（保留带时间戳版本） |
| `feat-经验治理-优化执行-20260607/task.yaml` | 2, 3, 4, 5 | 同上 |
| `feat-经验治理-合并引用-20260607/task.yaml` | 2, 3, 4, 5 | 同上 |

共修复 10 处重复，修复后每个 phase 恰好 1 个 `started:` 字段。

---

## 验证结果

### 文件完整性

- [x] 模板源已修改（`packages/installer/templates/` 下 2 文件）
- [x] 安装器同步已执行（`init --force`，45 项操作全部成功）
- [x] 运行时副本已更新（`.self-workflow/configs/`、`.opencode/plugins/`）
- [x] `done.md` 已创建（16 个已关闭版本段完整迁移）
- [x] `todo.md` 已更新（引用链接替换）

### 验收标准对照

| AC | 状态 | 证据 |
|----|------|------|
| AC1（Phase 4→5 文档同步） | ✅ | feat-workflow.md L513-535 新增 Phase 4.5 |
| AC2（/feat 强制更新 todo） | ✅ | feat-workflow.md L663 "Agent MUST 更新...不可跳过" |
| AC3（checkpoint 写入） | ✅ | self-workflow-session.ts 新增 checkpoint 参数+写入逻辑+warning 防护 |
| AC4（YAML 幂等保护） | ✅ | self-workflow-session.ts hasValidStarted 双重检测 |
| AC4b（历史文件修复） | ✅ | 3 文件 10 处重复已修复，grep 验证每 phase 仅 1 started: |
| AC5（done.md 迁移） | ✅ | done.md 创建 + todo.md 引用链接 |

---

## 决策捕捉

- [x] **本阶段无新增架构决策** — 所有实现严格遵循 Phase 2 ADR-002/003/004 设计方案
- [x] **决策声明**：`[x] 本阶段无架构决策`（实现忠实执行设计，无偏离）
