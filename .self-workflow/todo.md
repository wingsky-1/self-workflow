# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠（`[done]`），已拒绝项标注 `[wontfix]` 并附拒绝理由

---

## V1.5.1：Gate 强制步骤（P0）

1. Gate 通过条件增加"Git tag 已创建"强制检查项 <P0>
   → 来源：feat-v1.5剩余问题修复评审 P1 ❌——3/5 tag 缺失
   → 修复位置：feat-workflow.md 所有 Gate 的"通过条件" + Compound 补建逻辑

2. 阶段结束时，如有决策则 adrs/ 下必须有 ADR 文件（非空，含来源引用+决策理由）<P0>
   → 来源：feat-v1.5剩余问题修复评审 P3 ❌ + V1-3 ❌——Agent 写了检查章节但不创建文件
   → 修复位置：feat-workflow.md 阶段执行内容 + Gate 通过条件

3. Gate 入口强制计算 scope+risk+user-signal 三维分值 <P0>
   → 来源：feat-v1.5剩余问题修复评审 P4 ⚠️ + V15-6 ⚠️——Gate 3/4 未量化
   → 修复位置：feat-workflow.md 每个 Gate 步骤开头

---

## V1.5.2：Todo 体系优化（P1）

4. todo.md 增加优先级(P0/P1/P2)和版本标记 <P1>
5. 已完成/已拒绝项归档机制 <P1>
   → 来源：todo #16
6. task.yaml 和 workflow.yaml 的关系——定位是什么，是否冗余 <P1>
   → 来源：todo #2
7. /feat command 和 feat-workflow 的关系澄清 <P1>
   → 来源：todo #19

---

## V1.5.3：实测验证 + 工具规范（P1）

8. 新会话实测 /feat 完整流程（含 Review Agent 调用）<P1>
   → 来源：T4 ⏳
9. question 工具触发规则精细化——"确认/拒绝"场景也应用 question <P1>
   → 来源：feat-v1.5剩余问题修复评审 A2 ⚠️

---

## V1.6：经验初步（P2）

10. spec/docs 索引在 session_start 时自动注入上下文 <P2>
    → 来源：todo #20
11. 经验去重检测——避免相同经验被反复沉淀 <P2>
    → 来源：todo #7
12. 子 Agent 执行拆分——工作流阶段支持委托给子 Agent <P2>
    → 来源：todo #14
13. 工作流 Agent/Skill 打磨，参考业界优秀实践 <P2>
    → 来源：todo #17

---

## V2+（愿景）

14. /feat 增强——无输入时自动分析/认领任务；无目标任务时检查 todo 创建需求文档 <P2>
    → 来源：todo #18
15. 经验如何复利——刷新/去重/过时标记/晋升 <P2>
    → 来源：todo #7 完整版
16. 每阶段专用 agent/skill——Adapter 编译能力 <P2>
    → 来源：todo #6
17. 安装时命名冲突——hook/agent/skill/command 可能与用户已有文件重名 <P2>
    → 来源：todo #8

---

## 已关闭

<details>
<summary>V1.5 修复项（feat-v1.5剩余问题修复-20260606 完成）</summary>

- [done] feat-workflow 做成 slash command → ✅ `/feat` 已实现 (todo #1)
- [done] ADR 编号 per-task 独立 → ✅ 确认已是 per-task (todo #3)
- [done] /adr 去类型参数，Agent 判断 → ✅ 已重构为默认 auto (todo #5)
- [done] Review Agent 强制调用 → ✅ 5 处 task() 代码块 (todo #10)
- [done] Gate 权重优先级声明 → ✅ 量化覆盖声明 (todo #11)
- [done] 双级经验模型入 workflow → ✅ Phase 5 已拆分 (todo #12)
- [done] /adr 定位调整 → ✅ 默认 auto + 降级交互 (todo #13)

</details>

<details>
<summary>V1 已完成（20260606-V1实现）</summary>

- [done] checkpoint 配合每阶段 commit → ✅ Git tag 机制 (todo #4)
- [done] 经验分级设计 → ✅ `.self-workflow/docs/经验分级与加载指引.md` (todo #9)

</details>

<!-- wontfix 示例格式：
- [wontfix] 功能描述 → 拒绝理由：xxxx (todo #N)
-->

1. Review Agent 需要增强，以适应不同的场景。还要支持更多维度的评审，以及根据评审内容和结果自发的深入挖掘。
2. 沉淀通用sepc，设计spec结构。支持多级索引目录加载机制（渐进式加载 类别索引（考虑db） 文件头摘要），spec易读性（人类 Agent），可审计性（阅读spec时记录到task中或显式的记录哪些工作基于哪些spec约束），可拓展性（用户执行创建增加约束）。
3. 评审出来的问题给出2~4个可行的解决方案供用户选择，如果推荐方案置信度 >95 则不需要用户确认，仅记录决策点。
4. 搞清楚哪些文档是给人看的、哪些是Agent看的、哪些是都会看的，应该怎么编写更合适。（可以沉淀通用spec，指导Agent编写/评审文档）
5. 对于老项目，提供蒸馏command，可以将项目中已有的文档转为 .self-workflow/docs。（体验性功能，优先级低）
