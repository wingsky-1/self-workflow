---
phase: 5
workflow: feat
description: 总结沉淀阶段产物——todowrite 可视化任务回顾、经验提取、ADR 晋升评估
---

# 总结沉淀 — todowrite 可视化

> 工作流 ID：`feat-todowrite-可视化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T14:40:00+08:00

---

## 本次得与失

### 做得好的 ✅

1. **三层待办区分是核心价值**：Phase 1 用户指出 `todo.md` 是项目级、`todowrite` 是 Agent 级——这个区分贯穿了整个 spec，成为所有 MUST 规则的锚点
2. **Gate 审查发现真问题**：
   - Gate 1：Review Agent 发现 AC-3 与 agent-reasoning 冲突（critical），修复后 spec 与已有规范无矛盾
   - Gate 2：Grill 审查发现 ADR-002 缺决策清单、ADR-003 缺失败场景，补充后 spec 边界更完整
   - Gate 3：发现 S-1 决策清单缺 3 行（子Agent返回/失败/Gate内多轮），补齐后发现表格覆盖完整
   - Gate 4：指出验证形式化问题——所有 AC 仅"检查 spec 文本"未验证运行时行为，修正为置信度标注
3. **用户实时输入直接进入 spec**：Phase 3 用户提出子 Agent 多事项处理需求，立即补充为 M-3.1，避免了"先完成再改单"的迭代成本
4. **安装器 MANIFEST 注册**：新 spec 文件的完整部署链路（模板源 → MANIFEST → 安装器 → 运行时）已验证

### 可改进的 ⚠️

1. **验证的先天局限**：spec 编写任务无代码可执行，所有 AC 的"运行时验证"需依赖后续 /feat 工作流。虽然标注了置信度，但理想的验证方式是在本任务结尾实际启动一次新的 /feat 并观察 spec 是否生效——这需要新的会话实例，当前流程不支持
2. **AC-4 的间接保证**：todowrite ↔ task.yaml 一致性通过交互总结间接关联，spec 中缺少直接规则。应在后续迭代中补增
3. **设计→实现 drift**：Phase 2 的设计文档与 Phase 3 的实际实现存在若干差异（MUST 顺序、核心原则扩展、反模式段追加）。虽然最终实现优于设计、差异可接受，但反向同步设计文档的流程缺失
4. **任务级 todowrite 验证时机过早**：当前 spec 承诺"Phase 4 起使用 todowrite"，但所有产物和审查已经完成，实际使用留给下一任务——形成了一个测试盲区

---

## 跨任务可复用经验

### 经验 1：新 spec 文件的安装器注册流程

**适用场景**：任何需要在 `.self-workflow/specs/default/` 下新增 spec 文件的任务。

**模式**：
1. 在 `packages/installer/templates/specs/default/` 下创建模板源
2. 在 `packages/installer/index.js` MANIFEST 数组中注册（`[".self-workflow/specs/default/<file>", "specs/default/<file>"]`）
3. 运行 `node packages/installer/index.js init --target . --force` 同步

**教训**：如果跳过步骤 2，安装器不会同步新文件——必须同时在两个位置写入（模板源 + MANIFEST）。

### 经验 2：spec-only 任务的验证策略

**适用场景**：以 spec 文件为唯一交付物的任务（无运行时代码）。

**模式**：
- **静态验证**（可达）：检查文件存在性、frontmatter 合规性、安装器同步正确性、规则覆盖验收标准
- **运行时验证**（不可达）：Agent 实际执行 spec 行为 → 需新 /feat 工作流中验证
- **处理方式**：标注每条 AC 的验证置信度（✅静态 / ⚠️设计推导 / ⚠️待验证），避免"全部 ✅"的假象（违反 Phase Gate 验证不能形式化原则）

### 经验 3：Gate 审查的"修复→重审"效率

**本次统计**：
- Gate 1：1 critical + 5 warning → 修复后 1 轮重审通过
- Gate 2：3 warning（方向）+ 1 critical + 2 warning（Grill）→ 修复后通过
- Gate 3：1 warning → 修复后通过
- Gate 4：1 critical（形式化验证）→ 修复后通过

每个 Gate 都在第一轮审查中发现真问题。这验证了"对抗性审查"的有效性——若无 Gate，AC-3 与 agent-reasoning 的冲突、MANIFEST 注册遗漏、验证形式化等问题会直接进入生产。

---

## 经验草稿

### draft-experience：Spec 编写任务中的验收标准分层

**来源任务**：`feat-todowrite-可视化-20260607`

**问题**：spec 编写任务中，验收标准要求"Agent 行为"（如"创建 todowrite 条目"），但交付物是 spec 文件而非运行时代码。验证方式只能检查 spec 文本是否包含规则，无法验证 Agent 是否实际执行。全部标记 ✅ 是形式化验证。

**方案**：为每条 AC 标注验证置信度：
- ✅(静态) — spec 文本包含对应规则
- ✅(会话) — 当前会话已观察到该行为
- ⚠️(设计) — spec 设计推导满足，间接保证
- ⚠️(待验证) — 需运行时行为确认

**适用场景**：任何以 spec/文档/配置为交付物的任务。

---

## ADR 晋升检查

按 `specs/default/decision-record.md` 的晋升标准，评估本任务 3 个 ADR 是否值得晋升到 `docs/关键决策/`：

| ADR | 标题 | 晋升评估 |
|-----|------|---------|
| ADR-001 | Spec 文件定位 | ❌ 不晋升 — 决策局限于 todowrite spec 的定位，非跨任务通用决策 |
| ADR-002 | 条目粒度策略 | ❌ 不晋升 — 混合粒度决策绑定 todowrite 工具特性，通用性不足 |
| ADR-003 | 子Agent隔离策略 | ❌ 不晋升 — 平台行为（Agent 独立 todowrite 空间）已是事实，非项目决策 |

**结论**：本任务无需要晋升的 ADR。

---

## 决策捕捉

- [x] 本阶段无新架构决策。
