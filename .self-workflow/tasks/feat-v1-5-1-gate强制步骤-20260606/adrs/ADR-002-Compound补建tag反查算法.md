# ADR-002：F1 Compound 补建 tag — 反查算法

## 元数据

| 字段 | 值 |
|------|-----|
| ID | ADR-002 |
| 状态 | 已选择 |
| 决策者 | Agent (Sisyphus) |
| 日期 | 2026-06-06 |
| 工作流 | feat-v1-5-1-gate强制步骤-20260606 |

## 背景

F1 要求在 Compound 阶段检测缺失的 Git tag 并补建。补建需要找到正确的 commit SHA——该 commit 应当是 Gate 通过时的 commit，而非 Compound 执行时的 HEAD。上游任务中 3/5 Gate 的 tag 缺失，需要确定性补建算法。

## 备选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| A: git log --grep 反查 | 搜索 commit message 包含 `phase-<N> gate passed` 的 commit | 精确匹配，不依赖时间戳 | 依赖 commit message 约定被遵守 |
| B: 基于时间戳反查 | 读取 task.yaml 的 phase[N].completed 时间，用 git log --before 找对应 commit | 不依赖 commit message | 时间戳可能不精确（多 commit 在同一秒） |
| C: 基于内容反查 | 用 git log -S "gate: passed" 搜索包含 gate passed 的文件变更 | 内容精确匹配 | 可能匹配到其他任务 |

## 选择：方案 A（git log --grep 反查）

## 理由

1. Checkpoint 规范已定义了明确的 commit message 格式：`<workflow-id>: phase-<N> gate passed`
2. `--grep` 搜索 commit message 比时间戳或内容搜索更精确
3. 如果 commit message 约定也被违反（即没写标准 message），这是另一个需要修复的问题——补建逻辑不需要兼容所有违规场景

## 补建流程

```
对于每个 phase N（1-5），其中 gate: passed：
  1. git tag -l "<workflow-id>-ph<N>-<name>-gate-passed"
  2. 如果 tag 不存在：
     a. git log --oneline --grep="<workflow-id>: phase-<N> gate passed"
     b. 取第一个匹配的 commit SHA
     c. git tag <tag-name> <commit-sha>
     d. 记录到 errors.yaml（type: compound-recovery, severity: minor）
```

## 后果

- ✅ 补建逻辑精确且可自动执行
- ⚠️ 如果 commit message 被改写或遗漏，补建失败——但此时 errors.yaml 会记录，Agent 可通知用户手动处理
- ✅ 补建 tag 不会改变已有 tag（已存在的 tag 跳过）

## 关联

- 需求：F1 — Git tag 强制检查 + Compound 补建逻辑（来源：todo.md V1.5.1 #1）
- 上游问题：feat-v1.5剩余问题修复-20260606 P1 ❌——3/5 tag 缺失
