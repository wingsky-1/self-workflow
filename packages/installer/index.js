#!/usr/bin/env node

/**
 * Self-Workflow 安装器
 *
 * Usage:
 *   node index.js init                    # 安装到当前目录
 *   node index.js init --target ../my-project  # 安装到指定目录
 *   node index.js init --dry-run               # 预览模式，不写入文件
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATES = {
  "guides/feat-workflow.md": `---
name: feat-workflow
description: 特性开发工作流指引 — 多步骤特性开发的完整流程，包含 5 阶段 + Phase Gate 审查
version: 0.1
---

# Feat 工作流指引

## 工作流总览

\`\`\`
需求分析 → [Gate/light] → 方案设计 → [Gate/full] → 代码实现 → [Gate/full] → 功能验证 → [Gate/light] → 总结沉淀 → Compound
\`\`\`

**适用场景**：多步骤特性开发（3+ 阶段）、架构决策、重构
**不适用场景**：单文件 typo 修复、配置值修改、快速原型（< 30 行代码）— 请使用 \`--quick\` 模式

### 工作流标识

每次工作流执行需要一个唯一 ID，格式：\`<type>-<feature-name>-<YYYYMMDD>\`
例如：\`feat-user-login-20260606\`

### 产物目录结构

\`\`\`
.self-workflow/artifacts/<workflow-id>/
├── workflow.yaml          # 工作流实例元数据（启动时创建）
├── 01-analysis.md         # 需求分析阶段产物
├── 02-design.md           # 方案设计阶段产物
├── 03-implementation.md   # 代码实现阶段产物
├── 04-verification.md     # 功能验证阶段产物
└── 05-summary.md          # 总结沉淀阶段产物
\`\`\`

### 错误日志结构

阶段中遇错误即时记录，不等总结：

\`\`\`
.self-workflow/errors/<workflow-id>/
├── errors.yaml            # 错误索引
├── 01-analysis-errors.md  # 阶段 1 错误详情
└── ...
\`\`\`

---

## 阶段 1：需求分析

**目标**：理解需求、识别约束、明确验收标准。

### 执行内容

1. **理解需求**：阅读并分析用户提供的特性描述，识别核心功能需求和边缘情况
2. **识别约束**：技术约束（语言、框架、现有架构）、业务约束（性能、安全、合规）
3. **定义验收标准**：每个功能点对应一条可测试的验收标准（Given-When-Then 格式优先）

### 输出产物

写入 \`.self-workflow/artifacts/<workflow-id>/01-analysis.md\`

产物格式：
\`\`\`markdown
# 需求分析 — <特性名称>

## 需求概述
<用自然语言描述需求>

## 功能清单
- [ ] <功能点 1>：<描述>
- [ ] <功能点 2>：<描述>

## 约束条件
- <约束 1>

## 验收标准
- [ ] <标准 1>：Given... When... Then...

## 不纳入范围
- <明确不做的内容>
\`\`\`

### 完成检查清单
- [ ] 需求理解文档已写入 \`01-analysis.md\`
- [ ] 功能清单覆盖所有核心需求
- [ ] 约束条件已识别
- [ ] 验收标准已定义且可测试

### 错误日志

如果在此阶段遇到问题，立即记录到：
\`.self-workflow/errors/<workflow-id>/01-analysis-errors.md\`

---

## Gate：分析审查（weight: light）

### 步骤 1：程序化验证
本阶段无代码产出，跳过程序化验证。

### 步骤 2：对抗性审查
调用 Review Agent 审查需求分析文档的完整性和一致性。如果 Review Agent 尚未就绪，由主 Agent 自行完成检查。

**审查要点**：需求理解是否与用户输入一致、功能清单是否覆盖所有需求、验收标准是否可测试。

### 步骤 3：人工确认
✅ **需要用户确认** — 展示需求分析文档给用户，确认理解正确。

### 通过条件
- [ ] 需求分析文档完整
- [ ] 用户已确认需求理解正确

**不通过** → 返回阶段 1 修正。

---

## 阶段 2：方案设计

**目标**：架构决策、接口设计、数据模型设计。

### 执行内容

1. **架构决策**：识别关键决策点，列出至少 2 个备选方案，评估 trade-off
2. **接口设计**：定义模块/组件之间的接口、输入输出格式
3. **数据模型设计**：新增/修改的数据结构

### 输出产物

写入 \`.self-workflow/artifacts/<workflow-id>/02-design.md\`

产物格式：
\`\`\`markdown
# 方案设计 — <特性名称>

## 架构决策记录（ADR）

### ADR-001：<决策标题>
**状态**：已选择 | 已提议
**背景**：<需要做决策的原因>
**备选方案**：方案 A（优缺点）、方案 B（优缺点）
**选择**：方案 A
**理由**：<选择理由>

## 接口设计
<模块/接口定义>

## 数据模型
<数据结构定义>
\`\`\`

### 完成检查清单
- [ ] 关键架构决策已记录（含 trade-off 评估）
- [ ] 接口设计已定义
- [ ] 备选方案至少 2 个

---

## Gate：设计审查（weight: full）

### 步骤 1：程序化验证
本阶段无代码产出，跳过程序化验证。

### 步骤 2：对抗性审查（Grill 风格）
调用 Review Agent 执行对抗性设计评审。对每个决策：分析备选方案、检查选择理由、挑战隐含假设、确认 trade-off。

审查报告格式：
\`\`\`yaml
review-report:
  phase: "design-review"
  findings:
    - severity: critical | warning | info
      location: "<决策 ID>"
      description: "<问题描述>"
      suggestion: "<改进建议>"
      status: blocking | non-blocking
  pass: true | false
\`\`\`

### 步骤 3：人工确认
✅ **可选** — 复杂设计需要用户确认。

### 通过条件
- [ ] 设计文档完成
- [ ] 对抗性审查通过（无 critical 问题）

**不通过** → 返回阶段 2 修正。

---

## 阶段 3：代码实现

**目标**：按设计进行编码、单元测试。

### 执行内容

1. **编码**：按设计文档实现，遵循项目编码规范
2. **单元测试**：新增代码必须有对应的单元测试
3. **自检**：运行 lint、typecheck

### 输出产物

写入 \`.self-workflow/artifacts/<workflow-id>/03-implementation.md\`

\`\`\`markdown
# 代码实现 — <特性名称>

## 变更清单
| 文件 | 变更类型 | 说明 |
|------|---------|------|

## 关键实现决策
- <决策 1>：<理由>

## 测试覆盖
| 测试文件 | 用例数 | 覆盖场景 |
\`\`\`

### 完成检查清单
- [ ] 所有功能代码已实现
- [ ] 单元测试已编写并通过
- [ ] lint 检查通过
- [ ] typecheck 通过

---

## Gate：实现审查（weight: full）

### 步骤 1：程序化验证
运行 \`npm run lint\`、\`npm run typecheck\`、\`npm run test\`。

**Ralph Loop**：失败后最多重试 3 次，3 次均失败 → 通知用户手动处理。

### 步骤 2：对抗性审查
Review Agent 审查代码质量、设计一致性、测试覆盖、安全漏洞。

### 步骤 3：人工确认
❌ 不需要。

### 通过条件
- [ ] 程序化验证全部通过
- [ ] 对抗性审查无 critical 问题

**不通过** → 返回阶段 3 修复。

---

## 阶段 4：功能验证

**目标**：运行完整测试、边界检查、确认功能可用。

### 执行内容

1. 运行完整测试套件（单元测试 + 集成测试）
2. 边界条件检查（空值、边界值、错误路径）
3. 验证验收标准是否全部满足

### 输出产物

写入 \`.self-workflow/artifacts/<workflow-id>/04-verification.md\`

\`\`\`markdown
# 功能验证 — <特性名称>

## 测试结果 | 通过 | 失败 | 跳过

## 验收标准验证
- [ ] <标准 1>：✅

## 边界测试
- <边界场景>：通过

## 已知问题
\`\`\`

---

## Gate：验证审查（weight: light）

### 步骤 1：程序化验证
运行完整测试套件。

### 步骤 2：对抗性审查
Review Agent 检查测试覆盖、边界条件处理、回归问题。

### 通过条件
- [ ] 完整测试套件通过
- [ ] 验收标准全部满足

**不通过** → 返回阶段 3 修复。

---

## 阶段 5：总结沉淀

**目标**：提炼经验、补充文档。

### 执行内容

1. 编写总结：回顾得失、记录经验和教训
2. 经验草稿：提取可复用方案，标记为 \`draft\`
3. 补充文档：更新 README 或 API 文档

### 输出产物

写入 \`.self-workflow/artifacts/<workflow-id>/05-summary.md\`

\`\`\`markdown
# 总结沉淀 — <特性名称>

## 工作流概况 | 周期 | 变更文件数

## 经验提炼
### 经验 1：<标题>
**类型**：解决方案 | 踩坑记录
**内容**：<具体经验>
**关联文件**：<路径>

## 遗留问题
\`\`\`

---

## Compound（自动执行）

工作流完成后：
1. 归档产物到 \`.self-workflow/artifacts/<workflow-id>/\`
2. 标记工作流状态为 \`completed\`
3. 经验草稿标记为 \`draft\` 等级

> 完整的 Compound（经验自动晋升、检索）将在 V2 实现。
`,

  "agents/review-agent.md": `---
description: 对抗性审查 Agent — 在 Phase Gate 处审查产出质量，无代码变更权限
mode: subagent
permission:
  edit: deny
  bash: deny
  read: allow
  glob: allow
  grep: allow
  list: allow
---

# Review Agent

你是一个独立的审查 Agent（Review Agent）。你的职责是在工作流的 Phase Gate 处审查产出质量。

## 核心原则

1. **只读**：你没有任何代码修改权限。你的输出是审查报告，不是代码变更。
2. **Grill 风格**：逐项挑战设计/实现决策，而不是泛泛确认。
3. **结构化输出**：所有审查结果以 YAML 格式的结构化报告输出。
4. **独立判断**：你不受主 Agent 的决策影响，独立评估产出质量。

## 审查流程

### 1. 审查准备

- 读取被审查的 Artifact（设计文档 / 代码 / 代码实现记录）
- 加载对应的 Spec 规则（如果存在）
- 识别关键决策点

### 2. 逐项审查

每次聚焦一个问题：

- **设计审查**：分析备选方案是否充分评估、选择理由是否成立、隐含假设是否被挑战、trade-off 是否被记录
- **实现审查**：检查代码质量、Spec 合规性、测试覆盖、安全漏洞
- **验证审查**：检查测试覆盖充分性、边界条件处理、回归问题

### 3. 输出审查报告

\`\`\`yaml
review-report:
  scope: "<审查范围>"
  workflow: "<workflow-id>"
  gate: "<gate-name>"
  summary: "<审查摘要>"
  findings:
    - severity: critical | warning | info
      location: "<文件路径:行号>"
      description: "<问题描述>"
      rule: "<规则 ID（如有 Spec）>"
      evidence: "<具体证据>"
      suggestion: "<改进建议>"
      status: blocking | non-blocking
  pass: true | false
  recommended-action: "<建议操作>"
\`\`\`

### 严重级别定义

| 级别 | 含义 | Phase Gate 行为 |
|------|------|----------------|
| critical | 阻断性问题（安全漏洞、功能错误、Spec 违规） | 不通过，必须修复 |
| warning | 非阻断性问题（质量、风格、覆盖不足） | 可通过，但记录 |
| info | 建议项 | 仅记录，不影响 Gate |

## 无 Spec 时的行为

如果项目没有定义 Spec，退化为通用质量审查：
- 代码风格一致性
- 常见反模式
- 安全漏洞
- 测试覆盖

## 审查维度

| 维度 | 检查内容 |
|------|---------|
| 规范遵循 | 是否符合项目 Spec（如有） |
| 质量检查 | 代码质量、测试覆盖、边界处理 |
| 安全审查 | 常见安全漏洞 |
| 设计一致性 | 是否与现有架构一致 |
| 文档完整性 | 相关文档是否同步更新 |
`,
};

// ─── Init Command ───────────────────────────────────────────────────────────

function printBanner() {
  console.log("");
  console.log("  ╔══════════════════════════════════════╗");
  console.log("  ║       Self-Workflow 安装器           ║");
  console.log("  ║      版本 0.1.0 · V1 预备            ║");
  console.log("  ╚══════════════════════════════════════╝");
  console.log("");
}

function printReport(targetDir, actions) {
  console.log("  📋 安装报告");
  console.log(`  目标目录：${targetDir}`);
  console.log(`  操作：${actions.length} 项`);
  console.log("");

  for (const action of actions) {
    const icon = action.type === "create" ? "  ✅" : "  ⚠️";
    console.log(`  ${icon}  ${action.message}`);
  }

  console.log("");
  console.log("  ────────────────────────────────────────────");
  console.log("  ✅ 安装完成，无需额外配置。");
  console.log("  📖 工作流指引：.self-workflow/guides/feat-workflow.md");
  console.log("  🛡️  Review Agent：.opencode/agents/review-agent.md");
  console.log("  ────────────────────────────────────────────");
  console.log("");
  console.log("  下一步：在 OpenCode 中输入 /feat <描述> 来启动你的第一个工作流。");
  console.log("");
}

function init(targetDir, dryRun) {
  const actions = [];

  // Resolve target
  const resolvedTarget = path.resolve(targetDir);

  if (!fs.existsSync(resolvedTarget)) {
    console.error(`❌ 目标目录不存在：${resolvedTarget}`);
    process.exit(1);
  }

  // ── Directories ─────────────────────────────────────

  const dirs = [
    ".self-workflow/guides",
    ".self-workflow/artifacts",
    ".self-workflow/errors",
    ".opencode/agents",
  ];

  for (const dir of dirs) {
    const fullPath = path.join(resolvedTarget, dir);
    if (!fs.existsSync(fullPath)) {
      actions.push({ type: "create", message: `创建目录 ${dir}/` });
      if (!dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    } else {
      actions.push({ type: "exists", message: `目录已存在 ${dir}/` });
    }
  }

  // ── Template files (skip agents, handled separately) ─

  for (const [templatePath, content] of Object.entries(TEMPLATES)) {
    if (templatePath.startsWith("agents/")) continue; // handled below
    const fullPath = path.join(resolvedTarget, ".self-workflow", templatePath);
    if (!fs.existsSync(fullPath)) {
      actions.push({ type: "create", message: `写入 .self-workflow/${templatePath}` });
      if (!dryRun) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content.trimStart(), "utf-8");
      }
    } else {
      actions.push({ type: "exists", message: `文件已存在 .self-workflow/${templatePath}（跳过）` });
    }
  }

  // Review Agent
  const agentPath = path.join(resolvedTarget, ".opencode/agents/review-agent.md");
  if (!fs.existsSync(agentPath)) {
    actions.push({ type: "create", message: "写入 .opencode/agents/review-agent.md" });
    if (!dryRun) {
      fs.mkdirSync(path.dirname(agentPath), { recursive: true });
      fs.writeFileSync(agentPath, TEMPLATES["agents/review-agent.md"].trimStart(), "utf-8");
    }
  } else {
    actions.push({ type: "exists", message: "文件已存在 .opencode/agents/review-agent.md（跳过）" });
  }

  // ── Report ──────────────────────────────────────────

  if (dryRun) {
    console.log("");
    console.log("  ⚠️  DRY-RUN 模式 — 未写入任何文件");
    console.log("");
  }

  printReport(resolvedTarget, actions);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(args) {
  const options = { command: null, target: process.cwd(), dryRun: false };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "--target" || arg === "-t") {
      options.target = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (!arg.startsWith("--")) {
      options.command = arg;
    }

    i++;
  }

  return options;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.command || options.command === "init") {
    printBanner();
    init(options.target, options.dryRun);
  } else {
    console.log(`未知命令：${options.command}`);
    console.log("用法：node index.js init [--target <dir>] [--dry-run]");
    process.exit(1);
  }
}

main();
