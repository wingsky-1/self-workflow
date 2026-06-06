# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠，已拒绝项标注 `[wontfix]` 并附拒绝理由

---

## V1.5.1：Gate 强制步骤（P0）🔴

1. feat-workflow.md：Gate 通过条件增加"Git tag 已创建"强制检查项 + Compound 补建逻辑
   → 来源：feat-v1.5剩余问题修复 P1 ❌——3/5 tag 缺失

2. feat-workflow.md：阶段结束时如有决策则 adrs/ 下必须有 ADR 文件（非空，含来源引用+决策理由）
   → 来源：feat-v1.5剩余问题修复 P3 ❌ + V1-3 ❌——Agent 写了检查章节但不创建文件

3. feat-workflow.md：Gate 入口强制计算 scope+risk+user-signal 三维分值并显式输出
   → 来源：feat-v1.5剩余问题修复 P4 ⚠️ + V15-6 ⚠️——Gate 3/4 未量化

---

## V1.5.3：验收标准修订 + 迭代审查（P1）🟡

> 方式：用户手动触发评审——每轮对话后基于验收标准审查 Agent 产出，持续迭代发现框架问题。

4. 验收标准 P3 证据标准从"检查文档章节"改为"检查 adrs/ 目录实际文件"
   → 来源：验收标准优化分析 §2.2——Agent 把"写了检查结论"等同于"完成了决策捕捉"

5. 验收标准增加第六层：框架兜底有效性（D1 ADR缺失时Gate是否拦截 / D2 tag缺失时Compound是否补建 / D3 安装器覆盖后是否有恢复）
   → 来源：验收标准优化分析 §2.6

6. 验收标准 P1 允许 Compound 补建 tag（补建后仍计 ✅）
   → 来源：验收标准优化分析 §2.3

7. 验收标准 A3 增加"已触发但执行失败（⏳）"状态——区分框架触发和环境执行
   → 来源：验收标准优化分析 §2.4

8. 验收标准 S2 放宽"新会话实测"至"下一任务启动时验证"
   → 来源：验收标准优化分析 §2.5

9. question 工具触发规则精细化——"确认/拒绝"类交互场景也应用 question
   → 来源：feat-v1.5剩余问题修复 A2 ⚠️

---

## V1.6：经验初步 + spec 结构（P2）🟢

10. spec/docs 索引在 session_start 时自动注入上下文
    → 来源：todo #20

11. 经验去重检测——避免相同经验被反复沉淀
    → 来源：todo #7

12. 经验一致性审查 command——可指定目录运行（默认 `.self-workflow/docs`），Agent 也可在总结阶段自主执行，确保经验准确性、消除矛盾
    → 来源：新增

13. 沉淀通用 spec 结构——支持多级索引目录加载、可审计性（阅读记录）、可拓展性（用户创建约束）
    → 来源：新增 #2

14. 文档受众分类——区分 Human 阅读/Agent 阅读/共读，指导编写格式
    → 来源：新增 #4（优先级高，当前文档不适合对应群体阅读）

---

## V1.7：Agent 能力增强（P2）🟢

15. 子 Agent 执行拆分——工作流阶段支持委托给子 Agent
    → 来源：todo #14

16. Review Agent 增强——适应不同场景，支持多维度评审，自发性深入挖掘
    → 来源：新增 #1

17. 评审问题给出 2~4 个可行方案供选择（置信度 >95 则自动决策，仅记录决策点）
    → 来源：新增 #3

---

## V2：体验与复利（P2）🟢

18. 工作流 Agent/Skill 打磨，参考业界优秀实践
    → 来源：todo #17

19. 经验如何复利——刷新/去重/过时标记/晋升
    → 来源：todo #7 完整版

20. 每阶段专用 agent/skill——Adapter 编译能力
    → 来源：todo #6

21. /feat 增强——无输入时自动分析/认领任务；无目标任务时检查 todo 创建需求文档
    → 来源：todo #18

---

## V2+：探索性功能（P2）🟢

22. 普通对话中识别工作流触发——有无可闭环的设计方案
    → 来源：新增 #6

23. 老项目蒸馏 command——将已有文档转为 .self-workflow/docs 格式
    → 来源：新增 #5（体验性功能，优先级低）

24. checkpoint tag/commit ID 关联到任务阶段——方便后续回退
    → 来源：新增 #7（优先级低，当前有命名规则）

---

## 已关闭

<details>
<summary>V1.5.2：Todo 体系优化（feat-V1.5.2-Todo体系优化-20260606 完成，86.8% 0❌）</summary>

- [done] todo.md 增加优先级(P0/P1/P2)和版本标记 ✅
- [done] 已完成/已拒绝项归档机制 ✅
- [done] task.yaml 和 workflow.yaml 关系澄清（workflow.yaml 已废弃）✅
- [done] /feat command 和 feat-workflow 的关系澄清 ✅

</details>

<details>
<summary>V1.5 修复项（feat-v1.5剩余问题修复-20260606 完成，71% 4❌）</summary>

- [done] feat-workflow 做成 slash command → ✅ `/feat` 已实现
- [done] ADR 编号 per-task 独立 → ✅ 确认已是 per-task
- [done] /adr 去类型参数，Agent 判断 → ✅ 已重构为默认 auto
- [done] Review Agent 强制调用 → ✅ 5 处 task() 代码块
- [done] Gate 权重优先级声明 → ✅ 量化覆盖声明
- [done] 双级经验模型入 workflow → ✅ Phase 5 已拆分
- [done] /adr 定位调整 → ✅ 默认 auto + 降级交互

</details>

<details>
<summary>V1 已完成（20260606-V1实现）</summary>

- [done] checkpoint 配合每阶段 commit → ✅ Git tag 机制
- [done] 经验分级设计 → ✅ `.self-workflow/docs/经验分级与加载指引.md`

</details>

<!-- wontfix 示例格式：
- [wontfix] 功能描述 → 拒绝理由：xxxx
-->
