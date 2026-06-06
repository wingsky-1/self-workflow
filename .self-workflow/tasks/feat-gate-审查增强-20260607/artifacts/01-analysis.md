# 需求分析 — V1.10：Gate + 审查增强

> 工作流 ID：`feat-gate-审查增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T01:00:00+08:00

---

## 需求概述

V1.10 是 P2 优先级版本，聚焦于提升 `/feat` 工作流的 Gate 审查质量。两个核心方向：

1. **门控机制优化**：当前 Gate 只审查阶段产物（`artifacts/*.md`），`docs/`、`configs/`、`specs/` 的文档变更在审查范围之外，成为审查盲区。
2. **对抗性审查增强**：Review Agent 的审查偏向"确认正确"而非"尝试证伪"。Gate 1/3/4 使用确认式提示词，易产生通过但遗漏实质性问题的假阴性。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P2 | 文档变更纳入 Gate 审查范围 | Gate 审查时检测本阶段是否产生文档变更（docs/、configs/、specs/），如有则纳入审查 | 主要影响 Phase 5（总结沉淀）和 Compound |
| P2 | 对抗性审查提示词升级 | 将 Gate 1/3/4 的 Review Agent 提示词从确认式改为 Grill 对抗式 | Gate 2 已有 Grill 风格，扩展到其余 Gate |
| P2 | 交叉阶段一致性检查 | 各 Gate 增加交叉对照前置阶段的约束/结论，不再孤立审查当前阶段产物 | 已有 Gate 2 方向审查和错误经验文档支撑 |
| P2 | Phase 4 验证深度增强 | 验收验证增加"反向检查"（验证旧内容已移除）+ "运行时等价验证"（不仅静态检查文件存在） | 已有参考模式"双重检查"和错误经验支撑 |

---

## 约束条件

### 技术约束

- **Review Agent 是内置 Agent 类型**（`subagent_type="review-agent"`），无 `.opencode/` 下的自定义配置。只能通过 `task()` 调用的 prompt 参数影响其行为，不能修改其系统级配置。
- **`feat-workflow.md` 通过安装器模板源同步**（`packages/installer/templates/configs/guides/feat-workflow.md` → `node packages/installer/index.js init --target . --force`）。修改需改模板源而非部署副本。
- **`review-report-template.md` 是模板文件**，修改后不影响已生成的报告，仅影响未来生成的报告格式。
- **向后兼容**：现有已完成或进行中的工作流不应受本次变更影响。Gate 审查增强是"新增能力"而非"改变行为"——已有流程的审查严格度只增不减。
- **Gate weight 与文档审查的关系**：文档变更审查不受 Gate weight 量化的 skip/light 影响——即使 weight=skip 或 light（跳过对抗性审查），如果有文档变更，文档审查仍作为独立检查项执行。这确保"审查严格度只增不减"。

### 业务约束

- P2 版本，不阻碍当前 P1 版本（V1.11）推进。改动应小而精准，避免过度工程化。
- 所有变更最终作用于 Agent 的**行为**（提示词、检查清单），不涉及新代码/新工具开发。

---

## 验收标准

### 功能验收

#### F1：文档变更纳入审查

- [ ] **F1a**：Given 任何阶段（Phase 1-5）产生了 `docs/`、`configs/` 或 `specs/` 文件的变更，When 进入下一个 Gate 审查，Then 审查清单包含文档变更检测项，Review Agent 收到对应的文档审查指令。
- [ ] **F1b**：Given Phase 5 总结沉淀产生了文档变更（最常见的文档产出阶段），When 进入 Compound 归档，Then Compound 的交叉引用检查步骤包含文档变更审查（frontmatter、tag、受众一致性）。
- [ ] **F1c**：Given 文档变更被纳入审查，When Review Agent 执行审查，Then 针对不同文档类型执行对应检查：`docs/` → frontmatter 完整性 + tag 规范性 + 受众正确性 + 交叉引用有效性；`configs/` → YAML/格式正确性 + 与模板源一致性；`specs/` → frontmatter 层级合规性 + summary 字段存在性。

#### F2：对抗性审查提示词升级

- [ ] **F2a**：Given Gate 1（分析审查）的 Review Agent 调用，When Agent 发送 prompt，Then prompt 包含"尝试证伪而非确认"的 Grill 风格指令。
- [ ] **F2b**：Given Gate 3（实现审查）的 Review Agent 调用，When Agent 发送 prompt，Then prompt 包含"假设实现有缺陷，找出问题"的对抗性指令。
- [ ] **F2c**：Given Gate 4（验证审查）的 Review Agent 调用，When Agent 发送 prompt，Then prompt 包含"验收标准是否真正被验证（而非形式化通过）"的质疑指令。

#### F3：交叉阶段一致性检查

- [ ] **F3a**：Given Gate 2（设计审查）已存在方向审查（Phase 1→2 交叉对照），When 其他 Gate 执行，Then Gate 3 增加 Phase 2→3 的一致性检查（设计 vs 实现），Gate 4 增加 Phase 1→4 的验收标准对照。
- [ ] **F3b**：Given 任何 Gate 的审查步骤，When 当前阶段决策推翻了前阶段结论，Then 审查提示词要求检查 ADR 中是否有显式的"反转说明"（按 `gate-推理链一致性` 错误经验的模板）。

#### F4：Phase 4 验证深度增强

- [ ] **F4a**：Given Phase 4 验收验证，When 验收标准涉及"删除/替换/清理"类变更，Then 验证检查清单要求同时做"正向检查（新内容存在）"和"反向检查（旧内容不存在）"。
- [ ] **F4b**：Given Phase 4 验证涉及外部平台约定（如 OpenCode Plugin 目录名），Then 验证检查清单要求确认平台约定（如运行时等价验证），而非仅静态文件存在性检查。

---

## 不纳入范围

- **不改 Review Agent 内部逻辑**：Review Agent 是 OpenCode 内置 Agent，不在本项目修改范围内。仅改变调用时的 prompt 指令。
- **不创建新的 Agent 类型**：不创建"文档审查 Agent"等新 Agent，复用现有 Review Agent。
- **不修改 `feat.md` 命令本身**：除非发现命令级 Gate 指令与 workflow 指引冲突，否则仅修改 `feat-workflow.md`。
- **不实施实时文档变更监控**：不在每个文件写入时触发审查，仅在 Gate 入口做阶段级检查。实时监控属于 V2 子 Agent 架构范畴。
- **不引入新的依赖或工具**：纯流程和提示词改进。

---

## 决策捕捉

- [ ] **本阶段无架构决策**：本阶段识别了以下需要在 Phase 2 中决策的关键问题，但需求分析阶段本身不做架构决策——仅"识别待决策问题"不构成 ADR 触发条件。ADR 将在 Phase 2 方案设计阶段创建。
  1. 文档变更审查的注入点选择——在 Gate 入口统一检测 vs 在 Compound 集中审查 → Phase 2 ADR-001
  2. 对抗性审查提示词的改写策略——统一 Grill 模板 vs 按 Gate 差异化定制 → Phase 2 ADR-002

---

## 相关文档

| 文档 | 关联 |
|------|------|
| `.self-workflow/docs/错误经验/gate-推理链一致性-错误经验.md` | F3b 的反转说明模板来源 |
| `.self-workflow/docs/错误经验/phase-gate-验证不能形式化.md` | F4b 的运行时等价验证来源 |
| `.self-workflow/docs/参考模式/ADR与设计文档交叉一致性审查.md` | F3 的三层交叉验证模式 |
| `.self-workflow/docs/参考模式/验收验证的双重检查-存在与不存在.md` | F4a 的双重检查模式 |
| `.self-workflow/configs/guides/feat-workflow.md` | 主要修改目标文件 |
| `.self-workflow/configs/templates/review-report-template.md` | 可能需要更新以支持对抗性审查输出 |
