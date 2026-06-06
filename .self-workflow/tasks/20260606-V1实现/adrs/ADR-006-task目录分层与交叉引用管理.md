---
id: 006
title: task 目录分层管理——adrs/ + logs/ 子目录，交叉引用维护规则
date: 2026-06-06
status: 已采纳
---

# ADR-006：task 目录分层与交叉引用管理

## 背景

随着 V1 实现任务的推进，task 目录下的文件数量快速增长（计划、状态、ADR、实施记录等）。初始的"平铺"策略导致根目录文件过多，难以快速定位入口。

同时，task 下各文件之间存在交叉引用关系（task.yaml 引用 plan.md，ADRs 互相引用，progress.md 引用 task.yaml），文件增删改时容易遗漏引用的更新。

## 决策

### 目录分层

task 目录采用"入口文件 + 子目录"的两层结构：

```
tasks/<task-name>/
├── task.yaml       ← 元数据（入口：状态、里程碑、结构）
├── plan.md         ← 执行计划（入口：高层级实施计划）
├── progress.md     ← 完成记录（入口：里程碑完成情况）
├── adrs/           ← 决策记录（只读，归档后不再修改）
└── logs/           ← 实施记录（实时写入，随实施增长）
```

**分层原则**：
- 根层不超过 5 个入口文件，让新来者快速理解"这个 task 是什么"
- `adrs/` 只读——决策归档后不再修改，保证引用的稳定性
- `logs/` 实时写入——按实施阶段创建文件，不嵌套子目录
- 不出现第三层嵌套

### 交叉引用维护规则

task 目录下的文件之间存在引用关系，每次文件变更时需检查并更新。

#### 引用关系图

```
task.yaml ──ref──→ plan.md（milestones 的 ref 字段）
task.yaml ──→ 自身 artifacts/structure 字段（新增文件时更新）
progress.md ──ref──→ task.yaml（权威状态源）
adrs/*.md ──ref──→ 其他 adrs/*.md（ADR 间互引用）
logs/* ──→ adrs/*（实施记录可引用相关 ADR）
```

#### 何时更新什么

| 操作 | 需要更新的文件 | 说明 |
|------|--------------|------|
| **新增 ADR** | `task.yaml` → artifacts 或 structure | 新增 adrs 下文件时，检查是否需要记录到 task.yaml |
| **修改 plan.md** | 如影响里程碑范围 → `task.yaml` milestones | 计划变更时同步 milestones 定义 |
| **修改某个 milestone 状态** | `task.yaml` milestones + `progress.md` | task.yaml 是权威状态源，progress.md 是说明 |
| **新增实施记录(logs/)** | 通常无需更新引用（logs 是独立文档） | 除非日志产生了新的决策需要转成 ADR |
| **删除文件** | 引用该文件的所有文件 | 最容易被忽略，需 grep 检查引用 |
| **移动/重命名文件** | 引用该文件的所有文件 | 同删除，需全局替换引用路径 |

#### 操作流程

1. 改文件前，先用 `grep` 搜索该文件名在 task 目录内的引用
2. 改文件后，更新所有引用中的路径/名称
3. 修改 milestone 状态时，同时更新 `task.yaml` 和 `progress.md`
4. 新增 ADR 时，在文件末尾的"关联"章节列出被引用的 ADR

#### 特殊规则：logs/ 与 adrs/ 的关系

- `logs/` 中的实施记录如果发现了一个值得记录的架构决策，应**新建 ADR**，而不是在 logs 中长篇论述
- ADR 归档后不再修改，logs 可以引用 ADR 编号（如"参见 ADR-004"）
- 反之，ADR 不引用 logs（因为 logs 可能后续被清理或重命名）

#### 例外：adrs/ 的 status 变更

`adrs/` 只读规则有一条例外——ADR 的 `status` 字段从"已采纳"变为"已废弃"时：

1. 修改 frontmatter 的 `status: 已采纳 → 已废弃`
2. 在文件顶部追加废弃声明（正文不改）：
   ```markdown
   > **废弃声明**：本 ADR 于 YYYY-MM-DD 因 <原因> 废弃，替代方案见 ADR-XXX。
   ```
3. 在 task.yaml 中注明该 ADR 已废弃

除此之外，`adrs/` 下的文件正文不做修改。勘误以追加注释方式处理。

#### 跨 task 的 ADR 引用

当一个决策影响多个 task 时：

1. **决策在当前 task 记录**：ADR 只属于产生它的 task
2. **受影响 task 标记引用**：在受影响 task 的 `task.yaml` 中增加 `cross-refs` 字段：
   ```yaml
   cross-refs:
     - source: "20260606-V1实现/adrs/ADR-004-目录职责划分.md"
       reason: "该决策影响本 task 的目录结构"
   ```
3. 源 ADR 无需知道被哪些 task 引用——引用的维护是引用方的责任

## 理由

- **入口清晰**：新加入 task 的人先看根层 3 个文件，再按需深入子目录
- **减少遗漏**：明确的交叉引用维护规则，避免增删文件导致引用断裂
- **adrs/ 只读**：稳定引用基座，logs/ 自由写入，互不干扰
- **一层嵌套**：adrs/ 和 logs/ 内部只有文件，没有子目录，不过度复杂

## 影响

- 后续所有 task 目录遵循此结构
- 修改文件时必须检查交叉引用（grep 搜索文件名）
- `adrs/` 下的文件原则上不删除、不修改（勘误可追加注释，不改正文）
- 需要为 task.yaml 补充 `ref` 字段支持（见 task.yaml 规范更新）

## 关联

- 关联 ADR：[ADR-005 task目录元数据规范](./ADR-005-task目录元数据规范.md)（task.yaml 的格式定义）
- 关联实践：`plan.md` 中的里程碑与 `task.yaml` milestones 应保持同步
