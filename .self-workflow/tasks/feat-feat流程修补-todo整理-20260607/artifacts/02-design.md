---
phase: 2
workflow: feat
description: 方案设计阶段产物——含 ADR、接口设计、数据模型
validation:
  required-fields:
    - "架构决策记录"
    - "接口设计"
    - "数据模型"
  required-format:
    "架构决策记录": "包含至少 2 个备选方案的对比表"
---

# 方案设计 — V1.19：/feat 流程修补 + todo 整理

> 工作流 ID：`feat-feat流程修补-todo整理-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T17:25:00+08:00

---

## 架构决策记录

---

### ADR-002：checkpoint 参数外部传入方案

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-002 |
| 状态 | 已选择 |
| 决策者 | Human 指定 |
| 日期 | 2026-06-07 |

**背景**

`sw_task_phase_update` 工具在 Gate 通过时需写入 checkpoint SHA，但当前实现不包含此逻辑。需要决定工具如何获取 checkpoint SHA——自动执行 git 命令获取，还是由调用方传入。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | 工具内部 `execSync` git tag + rev-parse（全自动） | Agent 无需手动操作；一步完成 | 环境依赖（CI/容器可能无 git）；工具职责过重（既管 YAML 又管 git）；错误处理复杂（git 失败需 graceful degrade） |
| B | 外部传入——Agent 先 `git tag` → 拿 SHA → 调用工具时传入 `checkpoint` 参数 | 环境无关；工具职责单一（只做 YAML 写入）；测试友好 | Agent 需多一步操作；但 Agent 已按 feat-workflow 指引在执行 git 操作 |

**选择**：方案 B — 外部传入

**理由**

1. Human 明确指定「checkpoint 由外部传入」，与方案 B 一致
2. 工具职责单一原则——`sw_task_phase_update` 的职责是「更新 task.yaml 中的 phase 状态」，不应跨域到 git 操作
3. Agent 按 feat-workflow.md Checkpoint 章节已在执行 git tag + rev-parse——传入 SHA 零额外成本
4. 避免 CI/容器环境 git 不可用导致工具崩溃

**后果**

- 正面：工具实现简洁，环境无关，易于测试
- 正面：Agent 保留 git 操作控制权（如自定义 commit message）
- 负面：Agent 可能忘记传入 checkpoint（需 feat-workflow.md 提示词强调 MUST 传入）

**实现要点**

- `sw_task_phase_update` 函数签名新增 `checkpoint?: string` 参数
- `checkpoint` 非空时，替换 phase 块中的 `checkpoint: null` 为 `checkpoint: <sha>`
- Agent 调用范式：`sw_task_phase_update(workflowId, 2, "completed", gate="passed", checkpoint="<sha>")`

**关联**

- 关联 ADR：ADR-001（Phase 4→5 文档同步）
- 关联需求：Bug 修复 checkpoint 未记录（todo #5）
- 关联文件：`packages/installer/templates/plugin/self-workflow-session.ts` 第 177-236 行

---

### ADR-003：YAML 重复字段修复方案选择

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-003 |
| 状态 | 已选择 |
| 决策者 | Agent 分析 |
| 日期 | 2026-06-07 |

**背景**

`updatePhase` 函数的文本替换方式已在 3 个任务文件中产生重复 `started:` 字段。需要修复逻辑防止未来再次出现。可选方案：仅增加幂等保护（最小改动），或改为 YAML 结构化解析（根本修复）。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | 仅增加幂等保护——精确正则边界检查 | 改动最小（~3 行）；风险极低；不影响现有注释格式 | 不解决根本问题（文本替换脆弱性）；未来可能再次出现其他字段重复 |
| B | 改为 YAML 解析+序列化（`parseYaml`/`stringifyYaml`） | 根本解决；结构安全 | 改动大（~30 行）；模板注释（`# ← 新增` 等）可能丢失；测试成本高；可能引入新 bug |
| C | 方案 B + 保留注释机制（如 `yaml-comments` 库） | 根本解决 + 保留注释 | 引入新依赖；实现复杂度最高 |

**选择**：方案 A — 仅增加幂等保护

**理由**

1. `01-analysis.md` 不纳入范围已明确排除「完整的 YAML 结构化替换重构」
2. 本次修复的已知问题是 `started:` 重复——方案 A 精准解决此问题
3. 方案 B/C 需要更多测试和验证，风险高于本次 P1 修复所需，延后至子Agent架构版本
4. 3 个受影响的历史文件通过手动脚本修复（AC4b 覆盖）

**后果**

- 正面：改动最小、风险最低、快速交付
- 负面：未来可能在其他字段出现类似问题（需增加防御性检查）
- 延后项：YAML 结构化重构列入 V2.x 技术债务

**实现要点**

- 修改第 211 行检查：`!phaseBlock.includes("started:")` → 使用 `/started:\s*\S/` 精确检测是否已有有效 started 值
- 修改第 216 行替换：`/started:\s*null/` → 已有天然幂等性（已是非 null 时不匹配）
- 增加「已非 null，跳过」注释，方便未来维护者理解

**关联**

- 关联需求：Bug 修复 YAML 重复字段（todo #5）
- 不纳入范围：完整的 YAML 结构化替换重构
- 关联文件：`packages/installer/templates/plugin/self-workflow-session.ts` 第 211-217 行

---

### ADR-004：Phase 4→5 文档同步步骤 — 插入位置与范围

**元数据**

| 字段 | 值 |
|------|-----|
| ID | ADR-004 |
| 状态 | 已选择 |
| 决策者 | Human 指定范围 |
| 日期 | 2026-06-07 |

**背景**

Phase 4 Gate 通过和 Phase 5 入口之间需插入文档同步步骤。需决定：插入精确位置、覆盖文档范围、与 Compound 4.5 的职责区分。

**备选方案**

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A | 仅覆盖 `docs/实现方案/`（原始 todo 描述范围） | 改动精准；与现有 Compound 4.5 范围一致 | Human 反馈「不仅仅是实现方案文档」— 范围过窄 |
| B | 覆盖全部 `docs/`、`specs/`、`configs/`（Human 指定范围） | 覆盖全面；一次扫描所有文档分类 | Agent 扫描负担重（每个 /feat 任务 2-3 分钟） |
| C | 覆盖全部文档 + 智能跳过（仅扫描本次变更涉及的目录） | 平衡全覆盖和效率 | 需额外逻辑（git diff 判断变更范围） |

**选择**：方案 B（Human 指定范围），配合 non-blocking 策略降低负担

**理由**

1. Human 明确反馈「不仅仅是实现方案文档，而是可能相关的文档都应该更新」
2. Non-blocking 机制保证文档同步不会阻断工作流——Agent 可快速判断 `skipped` 并附理由
3. Agent 已有 git diff 能力（Gate 4 通过时刚完成代码变更），扫描范围自然受限于变更文件
4. 在提示词中增加「本次变更涉及的文件列表」作为扫描输入，避免 Agent 盲目全量扫描

**实现要点**

- 插入位置：feat-workflow.md 第 509 行（Gate 4 通过条件）和第 511 行（`---` 分隔线）之间
- 新增章节标题：「## 阶段 4.5：相关文档同步」
- 执行逻辑：Agent 用 `git diff --name-only <tag>..HEAD` 获取变更文件 → 映射到对应文档分类 → 逐类判断是否需要更新 → 输出 `doc-sync` 决策
- Non-blocking：即使全部 `skipped` 也可进入 Phase 5

**与 Compound 4.5 职责区分表**：

| 维度 | 阶段 4.5（新增） | Compound 4.5（现有） |
|------|-----------------|---------------------|
| 时机 | Gate 4 通过后、Phase 5 入口前 | 任务全部完成后 |
| 性质 | 前置强制检查 | 事后兜底审计 |
| 范围 | 全部文档分类（`docs/`、`specs/`、`configs/`） | 仅 `docs/实现方案/` |
| 输出 | `doc-sync` 逐类决策（必须） | 审计报告（仅检决策是否存在） |
| 阻断 | Non-blocking（决策输出即可） | Non-blocking（仅记录 error） |

**关联**

- 关联 ADR：ADR-001（Phase 4→5 文档同步，已晋升）
- 关联需求：Phase 4→5 增加文档更新步骤（todo #1，范围已扩大）
- 关联文件：`packages/installer/templates/configs/guides/feat-workflow.md` 第 509-513 行

---

## 接口设计

### `sw_task_phase_update` — checkpoint 参数扩展

**当前签名**（`self-workflow-session.ts` 第 177-183 行）：
```typescript
async function updatePhase(
  directory: string,
  workflowId: string,
  phaseId: number,
  status: string,
  gate?: string
)
```

**新签名**：
```typescript
async function updatePhase(
  directory: string,
  workflowId: string,
  phaseId: number,
  status: string,
  gate?: string,
  checkpoint?: string   // ← 新增：git rev-parse 输出的 commit SHA
)
```

**参数说明**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `checkpoint` | `string` | 否 | 当 `gate === "passed"` 时由 Agent 传入。通过 `git rev-parse <tag-name>` 获取。传入非空值时写入 phase 块的 `checkpoint` 字段 |

**错误处理**：
- `gate === "passed"` 但 `checkpoint` 为空字符串或 undefined → **返回 warning**（不阻断流程，但提示 Agent 可能遗漏了 checkpoint 传入；warning 写入 errors.yaml）
- `checkpoint` 传入但 phase 块中无 `checkpoint:` 行 → 在 `errors:` 行前插入（向后兼容旧模板）；如 `errors:` 行也不存在，则在 `artifact:` 行后插入
- gate 不为 "passed" 但传入了 checkpoint → 仍写入（信任调用方）
- checkpoint 传入非空值 → 替换 phase 块中的 `checkpoint:\s*null` 为 `checkpoint: <sha>`

**Agent 调用范式更新**（feat-workflow.md Checkpoint 章节）：
```
git add task.yaml
git commit -m "..."
git tag <workflow-id>-ph<N>-<name>-gate-passed
# 新增：获取 SHA 并传入工具
sw_task_phase_update(<workflowId>, <N>, "completed", gate="passed", checkpoint="<git rev-parse 输出>")
```

---

### `started:` 幂等保护逻辑

**修改前**（`self-workflow-session.ts` 第 211-217 行）：
```typescript
if (status === "in_progress" && !phaseBlock.includes("started:")) {
  const statusLineIdx = phaseBlock.indexOf(`status: ${status}`);
  const afterStatus = phaseBlock.indexOf("\n", statusLineIdx);
  phaseBlock = phaseBlock.slice(0, afterStatus) + `\n    started: ${now}` + phaseBlock.slice(afterStatus);
} else if (status === "in_progress") {
  phaseBlock = phaseBlock.replace(/started:\s*null/, `started: ${now}`);
}
```

**修改后**：
```typescript
// started 字段处理（幂等保护）
if (status === "in_progress") {
  // 检查是否已有有效 started 值（非 null）
  const hasValidStarted = /started:\s*\S/.test(phaseBlock) && 
                           !/started:\s*null/.test(phaseBlock);
  if (!hasValidStarted) {
    // 仅当 started 为 null 或不存在时才更新
    if (/started:\s*null/.test(phaseBlock)) {
      phaseBlock = phaseBlock.replace(/started:\s*null/, `started: ${now}`);
    } else {
      // 向后兼容：旧模板无 started 字段时插入
      const statusLineIdx = phaseBlock.indexOf(`status: ${status}`);
      if (statusLineIdx !== -1) {
        const afterStatus = phaseBlock.indexOf("\n", statusLineIdx);
        phaseBlock = phaseBlock.slice(0, afterStatus) + `\n    started: ${now}` + phaseBlock.slice(afterStatus);
      }
    }
  }
  // 已存在有效 started 值 → 跳过（幂等）
}
```

**关键改进**：
1. `hasValidStarted` 双重检测：`started:` 存在 **且** 非 null → 跳过所有操作（幂等）
2. 仅 `started: null` 或完全不存在时执行更新
3. `statusLineIdx !== -1` 防御性检查，避免旧模板无 status 行时崩溃

---

## 数据模型

### 变更结构：`self-workflow-session.ts` updatePhase 函数

```
原结构：updatePhase(directory, workflowId, phaseId, status, gate?)
新结构：updatePhase(directory, workflowId, phaseId, status, gate?, checkpoint?)
变更原因：Gate 通过时需写入 commit SHA；Agent 先 git tag 再传入
```

### 变更结构：`sw_task_phase_update` 工具 schema

```typescript
// 原参数
{
  workflowId: string;   // workflow-id
  phaseId: number;      // 阶段编号 1-5
  status: string;       // pending | in_progress | completed | failed
  gate?: string;        // pending | passed | failed
}

// 新增参数
{
  ...
  checkpoint?: string;  // ← 新增：git rev-parse 输出的 SHA
}
```

### 变更结构：feat-workflow.md — 插入"阶段 4.5：相关文档同步"

```
现有结构（第 509-513 行）：
  Gate 4 通过条件（结束）
  ---                    ← 第 511 行
  ## 阶段 5：总结沉淀    ← 第 513 行

新结构：
  Gate 4 通过条件（结束）
  ---
  ## 阶段 4.5：相关文档同步  ← 新增（第 511 行之后插入）
  ### 执行内容
  ### 输出产物
  ---
  ## 阶段 5：总结沉淀
```

### 变更结构：feat-workflow.md — Compound 步骤 5 MUST 升级

```
原文本（第 639 行）：
  5. **Todo 状态更新**：如果本任务关联 todo.md 中的版本段，自动更新：

新文本：
  5. **Todo 状态更新（MUST）**：Agent MUST 更新 todo.md 中对应版本的项状态（标记 [done]），不可跳过或仅记录"建议更新"。如果本任务关联 todo.md 中的版本段：
```

### 新增文件：`.self-workflow/done.md`

```
从 todo.md 的 ## 已关闭 章节迁移所有 <details> 折叠块
保留原有格式（版本号标题 + [done] 标记 + <details> 折叠）
文件头部增加简短说明（指向 todo.md）
```

### 变更结构：`.self-workflow/todo.md` — 已关闭章节替换

```
原：## 已关闭 + 全部 <details> 折叠块
新：## 已关闭 → 详见 [done.md](done.md)
```

### 修复结构：3 个历史 task.yaml 文件

| 文件 | 受影响 phase | 修复操作 |
|------|-------------|---------|
| `feat-核心特性-实现方案-文档化-20260607/task.yaml` | Phase 3, Phase 5 | 删除重复 `started:` 行，保留时间戳版本 |
| `feat-经验治理-优化执行-20260607/task.yaml` | Phase 2, 3, 4, 5 | 同上 |
| `feat-经验治理-合并引用-20260607/task.yaml` | Phase 2, 3, 4, 5 | 同上 |

修复原则：（AC4b）
- 保留含时间戳的 `started:` 值
- 删除 `started: null` 重复版本
- 修复后每 phase 仅 1 个 `started:` 字段

---

## 实现顺序

按依赖关系和风险排序：

| 顺序 | 功能 | 依赖 | 风险 |
|------|------|------|------|
| 1 | Bug 修复：checkpoint + YAML（`self-workflow-session.ts`） | 无 | 高（影响所有 /feat） |
| 2 | Phase 4→5 文档同步步骤（`feat-workflow.md`） | ADR-004 | 中 |
| 3 | /feat 强制更新 todo（`feat-workflow.md` Compound） | 无 | 低 |
| 4 | todo.md → done.md 迁移（文件操作） | 无 | 低 |
| 5 | 3 个历史 task.yaml 修复（文件操作） | Item 1 的 YAML 修复 | 低 |
| 6 | 安装器同步（`init --force`） | 以上全部 | 中（需要验证） |

---

## 决策捕捉

- [x] **ADR 已创建**：ADR-002（checkpoint 外部传入）、ADR-003（YAML 幂等保护）、ADR-004（Phase 4→5 插入位置与范围）
- [x] **决策声明**：见 adrs/ 目录

---

## 实现方案文档

本次修改涉及以下系统模块，需评估是否同步更新对应实现方案文档：

| 模块 | 实现方案文档 | 是否需要更新 | 理由 |
|------|-------------|-------------|------|
| feat 工作流 | `docs/实现方案/feat-工作流实现方案.md` | ✅ 需要 | Phase 4.5 新增步骤是工作流架构变更 |
| session plugin | `docs/实现方案/Plugin-注入机制实现方案.md` | ✅ 需要 | `updatePhase` 接口签名变更 |
| task 系统 | `docs/实现方案/task-系统实现方案.md` | ✅ 需要 | checkpoint 字段处理逻辑变更 |
| installer | `docs/实现方案/installer-系统实现方案.md` | ⚠️ 可能 | 如修改 MANIFEST 则需更新 |
