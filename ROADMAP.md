# Self-Workflow 项目路线图

> 版本：v1.0
> 最后更新：2026-06-06
> 对应需求草案：v0.1

---

## 路线图总览

```
V0 (当前) ───→ V1 ───→ V2 ───→ V3+
概念验证        记住上一次     经验复利      平台化
                2026 Q3       2026 Q4       2027+
```

| 版本 | 核心主题 | 一句话描述 |
|------|---------|-----------|
| **V0** | 概念验证 | 需求定义 + 设计哲学验证 |
| **V1** | 记住上一次 | 零配置安装 → 跑通一个工作流 → 会话恢复 → 错误不重复 |
| **V2** | 经验复利 | 经验沉淀 → 全工作流覆盖 → Spec 规范系统 |
| **V3+** | 平台化 | 自定义 DSL → 多 Agent 适配 → 团队协作 |

---

## V0 — 概念验证（当前状态）

**目标**：验证 Self-Workflow 的设计哲学、三层约束模型、Phase Gate 机制的合理性。

**状态：✅ 已完成**

### 交付物

| 交付物 | 状态 | 说明 |
|--------|------|------|
| 需求草案 v0.1 | ✅ 完成 | 1243 行需求规格说明，覆盖产品定位、架构、工作流定义 |
| 对抗性评审 R1 | ✅ 通过 | 信任/验证张力、三层约束时序、Review Agent 角色、Session 定义 |
| 对抗性评审 R2 | ✅ 通过 | Review Agent 对话模型、无 Spec 降级路径、Skill/YAML 关系 |
| 对抗性评审 R3 | ✅ 通过 | Spec→lint 映射降级、Ralph Loop N 值、经验晋升标准、回滚机制 |
| 对抗性评审 R4 | ✅ 通过 | Gate weight 轻重级别、Quick Mode、Doc/Debug 工作流优化 |
| 对抗性评审 R5 | ✅ 通过 | 非侵入原则、证据模型、工作流生命周期、术语一致性 |
| V1 优化评审 | ✅ 通过 | Planning with Files 对比 → 轻量启动、Session 恢复、错误显式化、适用边界 |
| 项目路线图 | ✅ 完成 | 本文件 |

### 关键决策（V0 确立）

1. **文件系统即磁盘**：所有重要信息写入文件，不依赖 Agent 上下文记忆
2. **三层约束模型**：Trust (Layer 1) → Programmatic Gate (Layer 2) → Adversarial Gate (Layer 3)
3. **渐进式采用**：从 Markdown 指引起步，按需升级到 YAML+Adapter
4. **Markdown 优先（V1）**：最小化认知成本和平台依赖

---

## V1 — "记住上一次"（2026 Q3）

**目标**：让用户从"每次会话从零开始"变为"Agent 记得上一次做了什么"。

**状态：🔜 待实现**

### 核心设计原则

| 原则 | 含义 |
|------|------|
| **零配置可用** | 安装即用，无需任何配置。Spec 是可选增值层 |
| **Markdown 优先** | 工作流指引输出为 Markdown，Agent 直接读取，用户可直接编辑 |
| **轻量 Gate** | V1 通过 Markdown Check-list 和 Review Agent 实现对抗性审查雏形 |
| **错误即时记录** | 遇到错误立刻写日志，不等工作流完成 |

### 功能特性清单

#### P0（必须交付）

- [ ] **安装器**：`self-workflow init`
  - 创建 `.self-workflow/` 目录（guides/ + artifacts/ + errors/）
  - 运行 Adapter V1：YAML → Markdown 指引
  - 生成 Review Agent 定义（`.opencode/agents/review-agent.yaml`）
  - 输出安装报告
- [ ] **Adapter V1（YAML → Markdown）**
  - 读取内建工作流 YAML 定义
  - 渲染为 `.self-workflow/guides/*.md`（Markdown 工作流指引）
  - 包含：阶段划分、Check-list、产物模板
- [ ] **feat 工作流可用**
  - Markdown 指引可被 Agent 读取执行
  - 包含 5 个阶段：需求分析 → 方案设计 → 代码实现 → 功能验证 → 总结沉淀
  - 每个阶段输出产物到 `.self-workflow/artifacts/`
- [ ] **产物归档**
  - Agent 自动写入 `.self-workflow/artifacts/<workflow-instance>/`
  - 包含各阶段 Markdown 产物
  - 支持通过自然语言查询历史记录
- [ ] **错误日志**
  - 阶段中即时记录错误到 `.self-workflow/errors/<workflow-instance>/`
  - 错误记录包含：问题描述、根因、解决方案、时间戳
  - 与产物分离管理，便于 Catchup 快速检索
- [ ] **Session Catchup**
  - `on:session-start` 自动扫描 `.self-workflow/artifacts/` 和 `.self-workflow/errors/`
  - 检测 in_progress / cancelled / stuck 状态的工作流
  - 生成 Catchup 摘要（进度恢复建议 + 未解决错误提醒）
  - 不阻塞用户操作，摘要仅作为上下文加载

#### P1（重要）

- [ ] **Review Agent 定义**
  - `.opencode/agents/review-agent.yaml`
  - 无代码变更权限，只读审查
  - 输出结构化审查报告（YAML 格式）
  - Grill 风格：逐项审查设计/实现正确性
- [ ] **动态 Gate 降级**
  - Agent 根据变更复杂度自动调整 Gate 重量
  - 简单变更 → light/skip，复杂变更 → full
  - 无需用户预先判断

#### P2（锦上添花）

- [ ] **debug 工作流 Markdown 指引**
- [ ] **doc 工作流 Markdown 指引**
- [ ] **review 工作流 Markdown 指引**
- [ ] **Gate Check-list 模板**：每个阶段产出自检表，Agent 在阶段转换前自行检查

### 验收标准

- [ ] `self-workflow init` 在空项目中运行 < 1 秒，无需联网
- [ ] 安装后即可使用 `/feat` 完成一个完整工作流（Agent 读取 Markdown 指引执行）
- [ ] 工作流产物自动写入 `.self-workflow/artifacts/`，可通过自然语言查询
- [ ] 阶段中遇到的错误即时记录到 `.self-workflow/errors/`
- [ ] 新会话启动时自动生成 Catchup 摘要，包含进行中工作流和未解决错误
- [ ] Review Agent 可在 Phase Gate 处输出结构化审查报告
- [ ] 无 Spec 时工作流仍可正常运行（退化为项目文件管理）

### 前提条件：OpenCode 能力审计

在进入 V1 实现之前，需完成以下审计：

- [ ] Hook 机制：`on:session-start`、`on:phase-complete` 等 lifecycle hook 是否支持？
- [ ] Sub-agent 机制：是否能派生子 Agent 执行独立任务（如 Review Agent）？
- [ ] Slash Command：command 的定义格式和能力边界如何？
- [ ] Skill 系统：Skill 的触发条件和执行方式是什么？
- [ ] 文件读写权限：Agent 是否能自由读写 `.self-workflow/` 目录？
- [ ] 输出：审计报告，明确适配器的能力边界

---

## V2 — "经验复利"（2026 Q4）

**目标**：每次工作流让下一次同类任务更简单。经验可沉淀、可检索、可信赖。

**状态：📋 规划中**

### 核心增强

| 相比 V1 | V2 新增 |
|---------|--------|
| 工作流指引 | Compound 流程自动提取经验 |
| 单一 feat 工作流 | 全部四种工作流（feat/debug/doc/review） |
| 无 Spec | Spec 规范系统（可选，正式引入） |
| Markdown check-list | Hook 自动触发 + Slash Command |
| 经验 draft 收集 | 经验审查晋升 + 自动检索 |

### 功能特性清单

#### Compound 经验沉淀

- [ ] **Compound 流程**：工作流完成时自动提取经验草稿（draft）
- [ ] **经验质量分级**：draft / verified / promoted / elevated
- [ ] **经验审查晋升**：Review Agent 将 draft → verified
- [ ] **经验自动检索**：工作流启动时推荐 verified 等级经验
- [ ] **经验回滚**：后续审查发现经验有误 → 自动降级
- [ ] **无 Spec 时经验降级**：无 Spec 时经验永不自动晋升 verified，仅手动确认

#### 全工作流覆盖

- [ ] debug 工作流完整实现（问题复现 → 根因分析 → 方案制定 → 修复 → 回归验证）
- [ ] doc 工作流完整实现（缺口分析 → 内容撰写 → 格式审查 → 内容审核 → 归档）
- [ ] review 工作流完整实现（独立审查，Grill 风格）
- [ ] 四种工作流的 Phase Gate 重量差异化配置

#### Adapter V2（YAML → 原生配置）

- [ ] 编译目标：Skill / Hook / Command / Agent 定义
- [ ] 输出 `opencode.jsonc` 主配置
- [ ] 与 V1 Markdown 指引共存：Markdown 指南从 YAML 自动同步
- [ ] 向后兼容：V1 安装可无损升级到 V2

#### Spec 规范系统

- [ ] `.self-workflow/specs/` 目录规范定义
- [ ] MUST / SHOULD / MAY 三级约束
- [ ] `enforcement: lint` → Layer 2 程序化门自动捕获
- [ ] `enforcement: review` → Layer 3 对抗性审查发现
- [ ] 渐进式披露：按工作流类型和阶段加载相关 Spec

### 验收标准

- [ ] 工作流完成时自动提取经验草稿（draft）
- [ ] Review Agent 可将 draft 审查晋升为 verified
- [ ] 工作流启动时自动检索并推荐 verified 等级经验
- [ ] 四种工作流均可通过 Slash Command 触发
- [ ] V1 安装可无损升级到 V2
- [ ] Spec 规范可通过 Phase Gate 执行（lint 或 review）
- [ ] 无 Spec 时所有功能降级运行，不报错

---

## V3+ — "平台化"（2027+）

**目标**：让 Self-Workflow 适应任意项目类型和团队规模。

**状态：🔮 远期规划**

### 方向

| 方向 | 说明 | 优先级 |
|------|------|--------|
| **自定义工作流 DSL** | 用户可定义自己的阶段、Gate 规则和产物模板 | P0 |
| **多 Agent 适配** | 支持 Cursor、Copilot、Claude Code 等 | P1 |
| **团队协作** | 共享 Spec、经验库、工作流模板 | P1 |
| **工作流模板市场** | 社区贡献的预置工作流 | P2 |
| **并发工作流** | git worktree 模式隔离多个并行工作流 | P2 |
| **插件机制** | 第三方插件扩展 Phase Gate 和 Compound 流程 | P3 |

### 关键考虑

- V3+ 的所有功能都建立在 V2 的基础设施之上（YAML 工作流定义、Adapter 编译层、经验知识库）
- 多 Agent 适配依赖各平台的能力边界，需要逐个审计
- 团队协作需要引入 .self-workflow/ 的 Git 集成策略

---

## 版本对比总结

| 维度 | V0 | V1 | V2 | V3+ |
|------|----|----|----|-----|
| **用户获得的价值** | 设计哲学 | 会话不丢、错误不重犯 | 经验复利、规范约束 | 全场景适配 |
| **安装时间** | — | < 1秒 | < 3秒 | — |
| **需用户配置** | — | ❌ 无需 | ⚠️ 可选 | ⚠️ 可选 |
| **工作流形式** | 文档定义 | Markdown 指引 | YAML + 原生配置 | DSL 自定义 |
| **工作流数量** | 4 (定义) | 1 (feat) | 4 (feat/debug/doc/review) | 不限 |
| **对抗性审查** | 概念 | 初版 Review Agent | 成熟 Review Agent | 可扩展 Gate |
| **经验系统** | 概念 | 错误日志 + draft 收集 | 完整四级晋升 | 平台化共享 |
| **Spec 系统** | 概念 | — | MUST/SHOULD/MAY | 团队共享 |
| **平台绑定** | — | OpenCode only | OpenCode | 多 Agent |

---

## 里程碑时间线

```
2026-06                       2026-09                        2026-12                        2027+
  │                             │                              │                              │
  ▼                             ▼                              ▼                              ▼
┌───────┐                ┌─────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  V0   │                │       V1        │          │       V2         │          │      V3+         │
│ 概念  │ ─── 审计 ───→  │   记住上一次     │ ──────→ │    经验复利       │ ──────→ │     平台化        │
│ 验证  │                │                 │          │                  │          │                  │
│       │                │ 里程碑 M1:       │          │ 里程碑 M3:       │          │ 里程碑 M5:       │
│ 需求  │                │ init 跑通        │          │ Compound 闭环    │          │ 自定义 DSL       │
│ 评审  │                │ feat 工作流完成   │          │ 四种工作流完成    │          │ 多Agent适配      │
│ 优化  │                │                  │          │                  │          │                  │
└───────┘                │ 里程碑 M2:       │          │ 里程碑 M4:       │          │ 里程碑 M6:       │
                         │ Session Catchup  │          │ Spec + V2 Adapter│          │ 团队协作         │
                         │ Review Agent     │          │ V1→V2 升级路径   │          │                  │
                         └─────────────────┘          └──────────────────┘          └──────────────────┘
```

### V1 里程碑分解

| 里程碑 | 功能 | 预计周期 |
|--------|------|---------|
| **M0** | OpenCode 能力审计 | 1 周 |
| **M1** | 安装器 + Adapter V1 + feat 工作流 + 产物归档 | 3 周 |
| **M2** | 错误日志 + Session Catchup + Review Agent | 2 周 |
| **总计** | V1 完整交付 | 6 周 |

### V2 里程碑分解

| 里程碑 | 功能 | 预计周期 |
|--------|------|---------|
| **M3** | Compound 流程 + 经验质量分级 + 经验审查晋升 | 3 周 |
| **M4** | debug/doc/review 工作流 + Spec 系统 + Adapter V2 + V1→V2 升级 | 4 周 |
| **总计** | V2 完整交付 | 7 周 |

---

## 附录：版本代号

| 版本 | 代号 | 含义 |
|------|------|------|
| V0 | Mnemosyne | 记忆女神——需求的原初形态 |
| V1 | Clio | 历史女神——记住过去 |
| V2 | Sophia | 智慧女神——经验转化为智慧 |
| V3+ | Prometheus | 先知——无限可能 |
