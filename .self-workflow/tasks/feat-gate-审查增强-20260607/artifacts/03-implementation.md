# 代码实现 — V1.10：Gate + 审查增强

> 工作流 ID：`feat-gate-审查增强-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T02:15:00+08:00

---

## 修改文件

| 文件 | 位置 | 变更类型 |
|------|------|---------|
| `feat-workflow.md` | `packages/installer/templates/configs/guides/feat-workflow.md`（模板源） | 8 处修改 |
| `feat-workflow.md` | `.self-workflow/configs/guides/feat-workflow.md`（部署副本） | 安装器同步 |

---

## 变更详情

### 1. Gate 1 — 对抗性提示词升级

**位置**：Gate：分析审查 → 步骤 2 → Review Agent 调用

- 确认式 "检查" → 对抗式 "攻击弱点"
- 新增 4 个攻击点：隐含期望、可测试性、不纳入范围合理性、约束遗漏
- 追加 COT：要求输出推理链

### 2. Gate 2 — 文档变更确认 + 反转说明检查

**位置**：Gate：设计审查 → 步骤 2 + 通过条件

- 对抗性审查提示词新增：推理链一致性检查（交叉对照 Phase 1 约束条件，如推翻前阶段结论则检查 ADR 反转说明）——来源：`gate-推理链一致性-错误经验.md`
- 通过条件新增：确认本阶段 docs/configs/specs 变更已 commit

### 3. Gate 3 — 对抗性提示词升级 + 交叉一致性

**位置**：Gate：实现审查 → 步骤 2 + 通过条件

- 确认式 → 对抗式（5 个攻击点：设计一致性、遗漏、隐性变更、代码质量、安全）
- 追加 COT
- 通过条件新增：交叉一致性（设计→实现逐项对照）、文档变更确认

### 4. Gate 4 — 对抗性提示词升级 + 验收对照

**位置**：Gate：验证审查 → 步骤 2 + 通过条件

- 确认式 → 对抗式（4 个攻击点：形式化验证、验收对照、反向检查、边界条件）
- 追加 COT
- 通过条件新增：验收标准对照（Phase 1→4）、文档变更确认

### 5. Phase 4 — 检查清单增强

**位置**：阶段 4 → 完成检查清单

- 新增：反向检查（验证新内容存在 + 旧内容不存在）
- 新增：运行时等价验证（非仅静态文件检查）

### 6. Compound — 文档变更审查

**位置**：Compound → 新增步骤 4

- 插入文档变更审查（git diff + 分类审查标准 + 严重级别）
- 原步骤 4-7 重新编号为 5-8
- git diff 含 fallback（Phase 1 tag 不存在时对比空树）

### 7. Quick Start — 更新

**位置**：快速入门（Agent 指引）→ 步骤 5

- "交叉引用检查" → "交叉引用检查 + 文档变更审查"

### 8. 版本号

`version: 0.3` → `version: 0.4`

---

## 安装器同步

```bash
node packages/installer/index.js init --target . --force
```

37 项操作，`feat-workflow.md` 已成功同步到 `.self-workflow/configs/guides/feat-workflow.md`。

---

## 决策捕捉

- [ ] 本阶段无架构决策（所有决策已在 Phase 2 通过 ADR-001/ADR-002 完成）
