# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠，已拒绝项标注 `[wontfix]` 并附拒绝理由
> V1.5 系列（V1.5.1~V1.5.3 + V1 → V1.5 修复）已全部关闭 ✔️
> V1.6 质量收尾已关闭 ✔️（7/9 项完成，2 项移除/移入 V1.8）

---

## V1.7：docs 结构 + 索引注入（P2）🟢

> 先把 `.self-workflow/docs/` 的经验资产结构化，建立自动加载机制。specs 留到 V1.8。

1. docs/ 目录结构梳理——当前 9 份经验文档平铺无分类，需建立分类目录 + 索引
   → 来源：质量审计 + todo #20
   <补充说明>：不仅仅是对当前的文档进行分类，而是站在框架的角度为以后的用户所生成的文档建立分类/索引机制

2. docs 索引在 session_start 时自动注入上下文——新会话启动时 Agent 能自动读取相关经验
   → 来源：todo #20
   <补充说明>：考虑渐进式披露（上下文长度），需不需要引入数据库 MCP 还是先实现初版，这些作为后续补强

---

## V1.8：specs 结构 + 经验质量 + 文档受众（P2）🟢

> docs 就绪后，建立 specs 体系、提升经验库质量。含 V1.6 移入的文档受众分类（需 spec 级设计）。

1. 文档受众分类 spec——形成 spec 指导 Agent 认识哪些文档（docs/ specs/）受众是谁（Human/Agent/共读），站在受众角度编写/评审文档
   → 来源：V1.6 #7（理解偏差修正——非"标注"而是"spec 级设计"）

2. 沉淀通用 spec 结构——可拓展性（用户创建约束）、多级索引目录
   → 来源：新增 #2

3. 经验去重检测——避免相同经验被反复沉淀
   → 来源：todo #7

4. 经验一致性审查 command——默认扫描 `.self-workflow/docs`，Agent 可在总结阶段自主执行
   → 来源：新增

5. agent-reasoning + interaction-protocol 降格为 spec——当前以 skill 形式存在（`.opencode/skills/`），但二者定义的是 Agent 基础行为规范（委托优先、交互协议），应属于始终生效的通用 spec，而非按需加载的 skill
   → 来源：新增 #2

---

## V1.9：简单重构优化（P2）🟢

> 低成本改进项收拢——Agent 自主判断能力增强、命令体验打磨。

1. 评审问题给出 2~4 个可行方案，置信度 >95 则自动决策——减少不必要的 question 打断
   → 来源：新增 #3

2. /feat 增强——无输入时自动分析/认领任务
   → 来源：todo #18

3. checkpoint tag/commit ID 关联到任务阶段——task.yaml 中记录每个 Gate checkpoint 对应的 commit SHA
   → 来源：新增 #7

4. 任务标题/描述/commit msg 生成优化——提升辨识度和可读性，不用硬规则约束 slug，发挥 Agent 能力简洁易懂地生成
   → 来源：新增 #1

---

## Vx：远期愿景（P2）🟢

> 已识别但近期不排期。随框架成熟逐步拉入具体版本。

- 子 Agent 执行拆分——工作流阶段支持委托给子 Agent（来源：todo #14） <放到V2.0 子Agent架构>
- Review Agent 增强——适应不同场景，多维度评审，自发性深入挖掘（来源：新增 #1）<放到V2.1 子Agent架构优化>
- 工作流 Agent/Skill 打磨，参考业界优秀实践（来源：todo #17） <放到V2.1 子Agent架构优化>
- 经验如何复利——刷新/去重/过时标记/晋升（来源：todo #7 完整版） <放到V1.10 Skill优化>
- 每阶段专用 agent/skill——Adapter 编译能力（来源：todo #6） <放到V2.0 子Agent架构>
- 普通对话中识别工作流触发（来源：新增 #6） <放到V3.0 用户体验性优化>
- 老项目蒸馏 command——文档转 .self-workflow/docs 格式（来源：新增 #5） <放到V3.0 用户体验性优化>

---

## 已关闭

<details>
<summary>V1.6：质量收尾（feat-开始v1-6版本-20260606 完成，7/9 项，2 项移除/移入 V1.8）</summary>

- [done] feat.md 前置检查移除已弃用的 `workflow-metadata-template.yaml` ✅
- [done] 经验文档命名符合 ADR-003 约定（3 个文件重命名） ✅
- [removed] 文档中 `workflow.yaml` 引用更新 — 用户决定不再处理
- [done] 文档中旧 `docs/todo.md` 路径更新为 `.self-workflow/todo.md`（3 份文档） ✅
- [done] catchup.md 修复 `plan.md` 引用 ✅
- [done] 修复 `feat-先做v1-5-2的需求/task.yaml` 的重复 `artifacts` 键 ✅
- [moved to V1.8] 文档受众分类 — 需形成 spec 级设计
- [done] ADR-003（元数据模板填充策略）标记为"被超驰" ✅
- [done] 删除 `adr-review-template.md` 并更新相关文档 + 安装器 index.js ✅

</details>

<details>
<summary>V1.5.3：验收标准修订 + 迭代审查（20260606 完成）</summary>

- [done] 验收标准 P3 证据标准改为检查 adrs/ 目录实际文件 ✅
- [done] 验收标准增加第六层：框架兜底有效性 D1/D2/D3 ✅
- [done] 验收标准 P1 允许 Compound 补建 tag ✅
- [done] 验收标准 A3 增加"已触发但执行失败⏳"状态 ✅
- [done] 验收标准 S2 放宽新会话实测时机 ✅
- [done] question 工具触发规则精细化（确认/拒绝/方向确认场景）✅
- [done] A2 交互点清单扩充确认/拒绝场景 ✅

</details>

<details>
<summary>V1.5.2：Todo 体系优化（feat-V1.5.2-Todo体系优化-20260606 完成，86.8% 0❌）</summary>

- [done] todo.md 增加优先级(P0/P1/P2)和版本标记 ✅
- [done] 已完成/已拒绝项归档机制 ✅
- [done] task.yaml 和 workflow.yaml 关系澄清（workflow.yaml 已废弃）✅
- [done] /feat command 和 feat-workflow 的关系澄清 ✅

</details>

<details>
<summary>V1.5.1：Gate 强制步骤（feat-v1-5-1-gate强制步骤-20260606 完成，97.6%）</summary>

- [done] F1: Gate 通过条件增加"Git tag 已创建"强制检查项 + Compound 补建逻辑 ✅ — feat-workflow.md v0.3
- [done] F2: 阶段结束时如有决策则 adrs/ 下必须有 ADR 文件 ✅ — 5阶段检查清单措辞改为存在性断言 + 决策声明
- [done] F3: Gate 入口强制计算 scope+risk+user-signal 三维分值并显式输出 ✅ — 4 Gate入口含量化计算块

</details>

<details>
<summary>V1.5 修复项（feat-v1.5剩余问题修复-20260606 完成，71% 4❌）</summary>

- [done] feat-workflow 做成 slash command → ✅ `/feat` 已实现
- [done] ADR 编号 per-task 独立 + /adr 去类型参数 + 定位调整 ✅
- [done] Review Agent 强制调用 + Gate 权重优先级声明 ✅
- [done] 双级经验模型入 workflow ✅

</details>

<details>
<summary>V1 已完成（20260606-V1实现）</summary>

- [done] checkpoint 配合每阶段 commit → ✅ Git tag 机制
- [done] 经验分级设计 → ✅ `.self-workflow/docs/经验分级与加载指引.md`

</details>

---

## 新增（待评审排期）

> 未分配版本的临时想法。评审后可排入具体版本或标记 [wontfix]。
>
> ⚠️ 此章节是"待办收件箱"——后续修改 todo 时须保留，不应随版本整理被删除。

1. 增加todo整理排期的command
