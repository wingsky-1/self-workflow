# .opencode 目录不可直接修改

> 分类：错误经验
> 领域：安装器 / 文件分发
> 日期：2026-06-06
> 关联任务：feat-v1.5剩余问题修复-20260606

## 摘要

`.opencode/` 目录由安装器管理，直接编辑其中文件导致修改被安装器覆盖或不在 git 追踪中。必须通过 `packages/installer/templates/` 模板源修改，再运行安装器同步。

## 详细内容

### 陷阱

在本次实施中，我直接编辑了 `.opencode/commands/adr.md` 的多处内容（用法、参数、步骤 3-4）。修改在文件系统中成功，但：
- `.opencode/` 目录不在 git 追踪中（被 gitignore 或由安装器生成）
- `git diff` 看不到变更，无法通过 Git 管理版本
- 下次运行 `self-workflow init` 时，安装器会用 `packages/installer/templates/commands/adr.md` 覆盖 `.opencode/commands/adr.md`，导致直接编辑丢失

### 正确做法

1. 修改源文件：`packages/installer/templates/commands/adr.md`（或其他模板）
2. 运行安装器：`node packages/installer/index.js` 同步到 `.opencode/`
3. 验证同步后 `.opencode/` 中的文件内容正确

### 适用场景

- 所有 `.opencode/` 下的文件变更（commands、agents、skills 等）
- 适用 AGENTS.md 规则："不要修改.opencode中的文件，要通过安装器导入"
