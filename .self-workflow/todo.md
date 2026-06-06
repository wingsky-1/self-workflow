# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠，已拒绝项标注 `[wontfix]` 并附拒绝理由
> V1.5 系列（V1.5.1~V1.5.3 + V1 → V1.5 修复）已全部关闭 ✔️

---

## V1.6：质量收尾（P0/P1 + 小 P2）

> V1.5 五轮迭代后质量审计发现的 7 个具体问题 + 3 项低成本的 P2 改进。本轮后框架进入稳定态。

### P0：阻断成熟度（2 项）🔴

1. feat.md 前置检查移除已弃用的 `workflow-metadata-template.yaml`
   → 来源：质量审计（`feat.md:43`）

2. 经验文档命名符合 ADR-003 约定（3 个文件重命名）
   → 来源：质量审计

### P1：质量改善（4 项）🟡

3. 文档中 `workflow.yaml` 引用更新（6 份文档）
   → 来源：质量审计

4. 文档中旧 `docs/todo.md` 路径更新为 `.self-workflow/todo.md`（3 份文档）
   → 来源：质量审计

5. catchup.md 修复 `plan.md` 引用
   → 来源：质量审计（`catchup.md:20`）

6. 修复 `feat-先做v1-5-2的需求/task.yaml` 的重复 `artifacts` 键
   → 来源：质量审计

### P2：低成本改进（3 项）🟢

7. 文档受众分类——区分 Human 阅读/Agent 阅读/共读，指导编写格式
   → 来源：新增 #4

8. ADR-003（元数据模板填充策略）标记为"被超驰"
   → 来源：质量审计

9. 删除 `adr-review-template.md` 并更新相关文档
   → 来源：新增待评审

---

## V1.7：docs 结构 + 索引注入（P2）🟢

> 先把 `.self-workflow/docs/` 的经验资产结构化，建立自动加载机制。specs 留到 V1.8。

10. docs/ 目录结构梳理——当前 9 份经验文档平铺无分类，需建立分类目录 + 索引
    → 来源：质量审计 + todo #20

11. docs 索引在 session_start 时自动注入上下文——新会话启动时 Agent 能自动读取相关经验
    → 来源：todo #20

12. 文档受众分类落实——docs/ 中每篇文档标注 Human/Agent/共读，指导 Agent 按需加载
    → 来源：V1.6 延续

---

## V1.8：specs 结构 + 经验质量（P2）🟢

> docs 就绪后，建立 specs 体系并提升经验库质量。

13. 沉淀通用 spec 结构——可拓展性（用户创建约束）、多级索引目录
    → 来源：新增 #2

14. 经验去重检测——避免相同经验被反复沉淀
    → 来源：todo #7

15. 经验一致性审查 command——默认扫描 `.self-workflow/docs`，Agent 可在总结阶段自主执行
    → 来源：新增

---

## Vx：远期愿景（P2）🟢

> 已识别但近期不排期。随框架成熟逐步拉入具体版本。

- 子 Agent 执行拆分——工作流阶段支持委托给子 Agent（来源：todo #14）
- Review Agent 增强——适应不同场景，多维度评审，自发性深入挖掘（来源：新增 #1）
- 评审问题给出 2~4 个可行方案，置信度 >95 则自动决策（来源：新增 #3）
- 工作流 Agent/Skill 打磨，参考业界优秀实践（来源：todo #17）
- 经验如何复利——刷新/去重/过时标记/晋升（来源：todo #7 完整版）
- 每阶段专用 agent/skill——Adapter 编译能力（来源：todo #6）
- /feat 增强——无输入时自动分析/认领任务（来源：todo #18）
- 普通对话中识别工作流触发（来源：新增 #6）
- 老项目蒸馏 command——文档转 .self-workflow/docs 格式（来源：新增 #5）
- checkpoint tag/commit ID 关联到任务阶段（来源：新增 #7）

---

## 已关闭

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

- _暂无。有新想法时在此追加。_
