# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠，已拒绝项标注 `[wontfix]` 并附拒绝理由
> V1.5 系列（V1.5.1~V1.5.3 + V1 → V1.5 修复）已全部关闭 ✔️
> V1.6 质量收尾已关闭 ✔️（7/9 项完成，2 项移除/移入 V1.8）
> V1.7 docs 结构 + 索引注入已关闭 ✔️（2/2 项完成）
> V1.8：specs 结构奠基（P2）🟢 — 已关闭 ✔️（4/4 项完成）
> V1.9 重构收尾已关闭 ✔️（4/4 项完成）

---

---

## V1.10：Gate + 审查增强（P2）🟢

> 提升门控和验证的实质审查能力。

1. 门控机制优化——文档变更和新增也需要进行审查
   → 来源：新增 #3

2. 各阶段验证能力增强——尤其对抗性审查，不要默认正确，用质疑的眼光审视结果
   → 来源：新增 #6

---

## V1.11：Agent 自主决策 + /feat 增强（P1）🟡

> 减少不必要的打断，让 Agent 更自主。

1. 评审问题给出 2~4 个可行方案，置信度 >95 则自动决策——减少不必要的 question 打断
   → 来源：新增 #3

2. /feat 增强——无输入时自动分析/认领任务
   → 来源：todo #18

3. /feat 增强——从 todo 领取任务结束后自动更新 todo 状态
   → 来源：新增 #8

4. todo 整理排期 command——Agent 可自主整理 todo、排期
   → 来源：新增 #1

---

## V1.12：经验质量 I —— 可发现性（P2）🟢

> 让经验和 tag 真正可被 Agent 检索匹配。

1. docs/ 文档 tag 质量治理——统一中英文、同义词→同一 tag、消除大小写不一致
   → 来源：V1.7 实施 + 新增 #9

2. 文档交叉引用机制——frontmatter 中加 `related:` 字段，Agent 按需追踪关联文档
   → 来源：V1.7 经验沉淀 + 新增 #10

3. 渐进式披露触发条件细化——READMe.md 每个分类增加"触发场景"描述
   → 来源：V1.7 注入机制讨论 + 新增 #11

---

## V1.13：经验质量 II —— 检测与生命周期（P2）🟢

> 经验库的质量保障和持续维护。

1. 经验去重检测——避免相同经验被反复沉淀
   → 来源：todo #7

2. 经验一致性审查 command——默认扫描 `.self-workflow/docs`，Agent 可在总结阶段自主执行
   → 来源：新增

3. 经验沉淀重要程度评估——不仅判断"能不能复用"，还要评估"对项目推进的帮助性"
   → 来源：新增 #7

4. 经验如何复利——刷新/去重/过时标记/晋升
   → 来源：todo #7 完整版 + 新增 #12

---

## Vx：远期愿景（P2）🟢

> 已识别但近期不排期。随框架成熟逐步拉入具体版本。

- 子 Agent 执行拆分——工作流阶段支持委托给子 Agent（来源：todo #14） <放到V2.0 子Agent架构>
- Review Agent 增强——适应不同场景，多维度评审，自发性深入挖掘（来源：新增 #1）<放到V2.1 子Agent架构优化>
- 工作流 Agent/Skill 打磨，参考业界优秀实践（来源：todo #17） <放到V2.1 子Agent架构优化>
- 每阶段专用 agent/skill——Adapter 编译能力（来源：todo #6） <放到V2.0 子Agent架构>
- 普通对话中识别工作流触发（来源：新增 #6） <放到V3.0 用户体验性优化>
- 老项目蒸馏 command——文档转 .self-workflow/docs 格式（来源：新增 #5） <放到V3.0 用户体验性优化>
- tag 权重/层级体系——同 tag 多文档时帮助 Agent 择优匹配（来源：新增 #13） <放到V3.2 用户体验性优化>

---

## 已关闭

<details>
<summary>V1.8：specs 结构奠基（feat-specs结构奠基-20260606 完成，4/4 项）</summary>

- [done] 文档受众分类 spec — `specs/default/doc-audience.md` + 推广参考模式 ✅
- [done] 通用 spec 结构 — `specs/default/` + `specs/README.md` 分类定义段 + Plugin 注入 ✅
- [done] agent-reasoning + interaction-protocol 降格为 spec — Skill 已删除，内容迁移至 `specs/default/`，双钩子注入架构 ✅
- [done] 关键决策自动记录→通用 spec — `specs/default/decision-record.md` + `docs/关键决策/` + ADR 晋升流程 + 废弃 `/adr` 命令 ✅

</details>

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
<summary>V1.9：重构收尾（feat-安装器重构-模板清理-20260606 完成，4/4 项）</summary>

- [done] task 模板从 feat command 移动到 templates——`feat-task.yaml` 独立文件，MANIFEST 部署 ✅
- [done] 任务标题/描述/commit msg 生成优化——语义 slug + 含阶段名的 commit msg ✅
- [done] checkpoint tag/commit ID 关联——phase schema 新增 `checkpoint` 字段 ✅
- [done] 三层目录清理——删除 `installer/.opencode/` + `.self-workflow/`（17 个死代码文件），`installer/README.md` 文档化 ✅

</details>

<details>
<summary>V1.7：docs 结构 + 索引注入（feat-开始v1-7-20260606 完成，2/2 项）</summary>

- [done] docs/ 目录结构梳理——建立 3 分类目录（实施经验/参考模式/错误经验）+ README.md 权威分类源 ✅
- [done] docs 索引在 session_start 时自动注入上下文——OpenCode Plugin（session.created + marker 检测 + 渐进式披露） ✅

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

1. 子 Agent 并行架构——增加并行开发能力（task 中记录执行 session）+ 上下文管理优化（切换子 Agent 后是否改善依赖上下文的问题）
   → 建议排入 V2.2 <子Agent架构>

2. 增加 debug 工作流——独立的调试工作流类型，支持错误定位和修复流程
   → 建议排入 V2.3 <debug工作流>

3. 开发 doctor 命令——检查用户对可定制文件的改动是否正确合理，会不会影响运行
   → 建议排入 V3.0 <用户体验性优化>

4. 安装能力增强——对于用户可定制的文件的变更要有变更查看能力，如创建 patch 由用户手动确认
   → 建议排入 V3.0 <用户体验性优化>

5. todo系统的介绍放到哪里合适，如何注入给主Agent，子Agent不需要 还是只给feat这类的工作流command注入呢
   → 建议排入 V1.11

6. 梳理现在在哪些场景会注入提示词，主Agent 子Agent 注入内容是否是对应目标需要的
   → 建议排入 V2.0 <子Agent架构>

7. 读取文件判断有没有正在执行的任务太浪费token了，大材小用，内置tool获取未完成的task信息列表；创建task基本目录也一样可以内置tool
   原则就是把确定性的事情交给代码实现，不确定的交给Agent实现，再分析当前还有哪些事情可以通过内置tool实现
   <优先级高>

8. 对于有歧义的输入要明确质疑询问，不要自作主张误解用户的意图。应该是spec内容，沉淀为合适的通用spec。
   <优先级高>

9. 任务下的logs和errors当前没有价值，应该重新思考这两个的定位
   → 建议排入 V2.0 <子Agent架构>
