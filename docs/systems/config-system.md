# 配置系统 (Config System)

> 所属模块：基础设施层
> 文件位置：`.self-workflow/configs/`
> 模板源：`packages/installer/templates/configs/`

---

## 功能概述

配置系统提供 /feat 工作流运行所需的**模板、指引和任务定义**。所有配置文件由安装器从模板源部署，用户可通过修改模板源再 `--force` 同步来定制。

## 核心特性

### 1. 三层配置结构

```
.self-workflow/configs/
├── guides/                          # 工作流指引
│   └── feat-workflow.md             # /feat 工作流完整定义（736行）
├── templates/                       # 阶段产物模板（11个）
│   ├── analysis-template.md         # Phase 1 需求分析
│   ├── design-template.md           # Phase 2 方案设计
│   ├── implementation-template.md   # Phase 3 代码实现
│   ├── verification-template.md     # Phase 4 功能验证
│   ├── summary-template.md          # Phase 5 总结沉淀
│   ├── implementation-plan-template.md  # 实现方案文档
│   ├── review-report-template.md    # 审查报告
│   ├── error-log-template.md        # 错误日志
│   ├── adr-simple-template.md       # ADR 简单模板
│   ├── adr-complex-template.md      # ADR 复杂模板
│   └── workflow-metadata-template.yaml  # ⚠️ 已废弃
└── tasks/                           # 任务模板
    └── feat-task.yaml               # task.yaml 模板（含 phases 段）
```

### 2. feat-workflow.md — 工作流核心指引

736 行的完整工作流定义，包含：

- **5 阶段详细定义**：每个阶段的执行内容、检查清单、输出产物、错误日志
- **4 Gate 审查规则**：重量量化公式、审查步骤（方向审查 + 程序化验证 + 对抗性审查）、通过条件
- **Checkpoint 回溯**：Git tag 创建/回溯机制、多会话开发（git worktree）
- **Compound 归档**：9 步自动执行流程
- **附录**：Gate 重量速查、产物清单、错误日志路径、历史产物查询

### 3. 11 个阶段模板

每个模板定义了对应阶段产物的标准格式和必须包含的内容。Agent 在写产物时参考模板，Gate 审查时对照模板检查合规性。

### 4. 定制流程

```
修改 packages/installer/templates/configs/ 下的模板源
        ↓
node packages/installer/index.js init --target . --force
        ↓
运行时配置文件同步更新
```

**原则**：直接编辑 `.self-workflow/configs/` 下的文件会在下次 `--force` 同步时被覆盖。

---

## 实现路径

### V1.0 — 基础模板
- feat-workflow.md 手写指引
- 阶段产物模板（analysis/design/implementation/verification/summary）

### V1.5 — Gate 审查模板
- review-report-template.md 新增
- error-log-template.md 新增
- adr-simple/complex 模板新增

### V1.9 — 任务模板独立
- feat-task.yaml 从 feat command 内联移入独立文件

### V1.18 — 实现方案模板
- implementation-plan-template.md 新增

---

## 未来愿景

### V2.x — 配置增强
- 工作流模板可组合（用户选择需要的 Gate/阶段）
- 模板版本管理和升级路径

### V3.x — 平台化
- 工作流模板市场
- 用户自定义模板 DSL

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `.self-workflow/configs/guides/feat-workflow.md` | 工作流完整定义 |
| `.self-workflow/configs/templates/` | 11 个阶段/ADR/审查模板 |
| `.self-workflow/configs/tasks/feat-task.yaml` | 任务元数据模板 |
