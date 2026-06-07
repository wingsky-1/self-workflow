# Todo

> 版本标记：P0=阻断框架成熟度 / P1=质量改善 / P2=愿景
> 归档规则：已完成项保留但折叠，已拒绝项标注 `[wontfix]` 并附拒绝理由
> V1.5 系列（V1.5.1~V1.5.3 + V1 → V1.5 修复）已全部关闭 ✔️
> V1.6 质量收尾已关闭 ✔️（7/9 项完成，2 项移除/移入 V1.8）
> V1.7 docs 结构 + 索引注入已关闭 ✔️（2/2 项完成）
> V1.8：specs 结构奠基（P2）🟢 — 已关闭 ✔️（4/4 项完成）
> V1.9：重构收尾已关闭 ✔️（4/4 项完成）
> V1.10 Gate+审查增强已关闭 ✔️（2/2 项完成）
> V1.11：/feat 增强 + todo 管理 + 内置工具已关闭 ✔️（6/6 项完成）
> V1.15：todowrite 可视化已关闭 ✔️（2/2 项完成）
> V1.16：经验检测已关闭 ✔️（2/2 项完成）
> V1.17：经验沉淀质量已关闭 ✔️（2/2 项完成）
> V1.13 tag 治理：已完成 ✔️（两期经验治理实现 tag 英文化+统一，见 feat-经验治理-优化执行-20260607）
> V1.14 交叉引用：部分完成 ⚠️（body-end `## 关联经验` 已落地 11 份文档；frontmatter `related:` 字段待 V2）

---

---

## V1.18：核心特性实现方案（P2）🟢

> 文档化核心特性实现方案，减少 Agent 开发时重复读代码分析。

1. docs下增加核心特性实现方案——将框架关键实现思路文档化 [done]
   → 来源：新增 #1

---

## V1.19：/feat 流程修补 + todo 整理（P1/P2）🟢

> P1: 修复 Phase 4→5 文档更新步骤缺失 + Phase 3 文档编辑类任务产物规则；P2: 减少上下文污染。

1. /feat Phase 4→5 增加文档更新步骤——防止实现与文档不一致
   → 来源：新增 #6

2. todo 已关闭版本迁移至 done.md——减少会话上下文污染
   → 来源：新增 #3

3. [流程] Phase 3 文档编辑类任务产物规则——纯文档编辑 /feat 任务允许省略 03-implementation.md，但 MUST 在 checklist 中写一句省略理由 (P2)
   → 来源：一期评审短板（跳过 03-implementation.md 无说明）
   <不是好的想法，建议拆分doc工作流，不是当前要考虑的内容>

---

## V1.21：Gate + 流程纪律强化（P0/P1）🟢

> P0: Gate 纪律——不通过绝对不进入下一阶段；P1: 产物自查 + 提交前自检清单，降低返工率。

1. [流程] Phase Gate 纪律强化——Gate 未通过绝对不进入下一阶段，后台审查≠跳过 Gate (P0)
   → 来源：V1.16+V1.17 会话评审 #1

2. [流程] 产物自查——提交 Gate 审查前，逐项对照设计文档/模板/规范检查一致性（降低返工率）(P1)
   → 来源：V1.16+V1.17 会话评审 #6（一次正确率 33%）

3. [流程] Gate 提交前自检清单——Agent 提交 Gate 审查前 MUST 检查：task.yaml structure 已同步、ADR frontmatter/引用完整、产物 frontmatter 合规 (P1)
   → 来源：V1.15 会话评审（36%一次正确率）+ V1.16+V1.17 会话评审 #6（33%一次正确率），共同模式：文档合规类缺陷占比最高

4. [流程] Gate 量化强制输出——即使 weight=light/skip，Agent MUST 在 Gate 入口输出一行 `scope=X, risk=Y, user-signal=Z → weight=light`。两期治理任务均在 Gate 3/4 跳过了此 MUST 规则 (P0)
   → 来源：一期评审（Gate 合规 7/10）+ 二期评审（Gate 合规 6/10），共同模式：快轨化时省略量化输出

---

## V1.22：文档/工具规范修补（P1/P2）🟢

> P1: ADR 先于产物 + todowrite 即时启动；P2: 内置工具优先 + session 辨识度 + 术语规范。

1. [流程] ADR/方案文档先于产物——先创建 ADR 文件(按模板) + 方案分析文档归档到 adrs/，产物文档仅引用摘要不内联。Phase 2 结束时主动归档，不需 Human 提醒 (P1)
   → 来源：V1.16+V1.17 会话评审 #4（重复犯"内联ADR"错误）+ 二期评审短板（方案归档需 Human 提醒）

2. [工具] todowrite 即时启动——Phase 1 入口即创建条目，不延迟到用户提醒后 (P1)
   → 来源：V1.16+V1.17 会话评审 #3

3. [工具] 内置工具优先——Agent 执行操作前应检查项目是否有内置工具（如 sw*task*\* 系列），避免手工重复实现 (P2)
   → 来源：V1.15 会话评审 #1（未用 sw_task_create 手动创建目录）

4. [工具] /feat 开始时 session 重命名为任务名称——提高 session 辨识度 (P2)
   → 来源：原 V1.20 #2

5. [规范] doc-audience 术语检查——新建 spec/docs 时检查术语是否为领域已有概念（非自创词）(P2)
   → 来源：V1.16+V1.17 会话评审 #9（"策展"→"治理"）

---

## V1.23：迭代报告反哺框架描述（P2）🟢

> 梳理 `docs/迭代报告/` 中的共性失败模式，反哺优化框架 spec/command/agent/skill/hook 的描述。

1. 结合 docs/迭代报告 优化框架自带的 spec command agent skill hook 等描述 (P2)
   → 来源：新增 #1（迭代报告已积累 4 份会话评审，7 维度评分 + 共性失败模式）

---

## V1.24：治理工具链增强（P1）🟢

> P1: exp-governance skill 自动化 + Phase 5 经验去重前置检查。

1. [工具] exp-governance skill 自动化增强——一致性审查增加正则扫描中文 tag（`^tags:.*[\u4e00-\u9fa5]`）、自动检查 source 目录存在性（预扫描 tasks/ 列表比对）(P1)
   → 来源：一期评审（一次性正确率 87.5%——人工检查遗漏 3 份文档）+ 框架分析 4.1

2. [流程] Phase 5 经验去重前置——写入新经验前 MUST grep 检查是否与已有 docs/ 重复（title 关键词 + tag 交集 ≥2 作为信号）。避免"写入后才在审查时发现重复"的返工 (P1)
   → 来源：框架分析 4.1

---

## Vx：远期愿景（P2）🟢

> 已识别但近期不排期。随框架成熟逐步拉入具体版本。

- 子 Agent 执行拆分——工作流阶段支持委托给子 Agent（来源：todo #14） <放到V2.0 子Agent架构>
- Review Agent 增强——适应不同场景，多维度评审，自发性深入挖掘（来源：新增 #1）<放到V2.1 子Agent架构优化>
- 工作流 Agent/Skill 打磨，参考业界优秀实践（来源：todo #17） <放到V2.1 子Agent架构优化>
- 每阶段专用 agent/skill——Adapter 编译能力（来源：todo #6） <放到V2.0 子Agent架构>
- 普通对话中识别工作流触发（来源：新增 #6） <放到V3.0 用户体验性优化>
- 老项目蒸馏 command——文档转 .self-workflow/docs 格式（来源：新增 #5） <放到V3.0 用户体验性优化>
- 增加周报/日报 command——方便回顾和汇报进展（来源：原 V1.20 #1）<放到V3.0 用户体验性优化>
- tag 权重/层级体系——同 tag 多文档时帮助 Agent 择优匹配（来源：新增 #13） <放到V3.2 用户体验性优化>
- 子 Agent 并行架构——增加并行开发能力 + 上下文管理优化（来源：新增 #1）<放到V2.2 子Agent架构>
- debug 工作流——独立的调试工作流类型，支持错误定位和修复流程（来源：新增 #2）<放到V2.3 debug工作流>
- doctor 命令——检查用户对可定制文件的改动是否正确合理（来源：新增 #3）<放到V3.0 用户体验性优化>
- 安装能力增强——用户可定制文件变更查看（patch 手动确认）（来源：新增 #4）<放到V3.0 用户体验性优化>
- 提示词注入场景梳理——主Agent/子Agent 注入内容是否对应目标需要（来源：新增 #6）<放到V2.0 子Agent架构>
- logs/errors 定位重思考——任务下 logs 和 errors 当前无价值，重新定位（来源：新增 #9）<放到V2.0 子Agent架构>
- 评审问题自动决策——置信度 >95% 时给出方案并自动抉择，减少 question 打断（来源：新增 #1）<放到V3.0 用户体验性优化>
- /feat 无人值守模式——Agent 自主完成全流程，用户事后评审（来源：新增 #2）<放到V3.0 用户体验性优化>
- 经验 freshness 监控——verified 文档在 source task 完成 30 天后自动标记"建议重审"（来源：框架分析 3.2）<放到V2.0 子Agent架构>
- Compound 自动晋升——feat-workflow Compound 阶段自动运行 exp-governance 轻量版（仅检查本任务 draft 文档是否可晋升）（来源：框架分析 4.2）<放到V2.0 子Agent架构>
- 经验→spec 晋升管道——参考模式中经多次验证的模式自动化发布为 spec/template（来源：框架分析 4.2）<放到V2.1 子Agent架构优化>
- 关系分析 Agent——子 Agent 并行逐对通读做合并/引用关系判断（同根异面/互补/因果链/同域互补）（来源：两期治理实战）<放到V2.0 子Agent架构>

---

## 延后（待设计/更多观察）

> 已识别方向但暂不启动——部分需收集更多实际场景，部分需仔细设计。

### V1.12 延后：流程纪律（原 P1）

> Gate 审查合规性增强 + 实现阶段要严控。→ 已通过 V1.21 #4（Gate 量化强制输出）部分解决。

- [postponed] Gate 审查合规性增强——Agent 跳过 Gate 对抗性审查步骤直接展示结果 → 来源：新增 #4
- [postponed] 实现阶段要严控——Agent 先实现后解释，缺少方案确认环节 → 来源：新增 #6

### V1.13 延后：文档 tag 质量治理（原 P1）✔️ 已完成

> ✅ 两期经验治理（feat-经验治理-优化执行 + feat-经验治理-合并引用-20260607）实现了全部 tag 英文化、统一大小写。仅保留 `自举`（领域特有名詞）。

### V1.14 延后：经验可发现性（原 P2）⚠️ 部分完成

> body-end `## 关联经验` 节已落地 11 份文档；frontmatter `related:` 字段待 V2。

- [done] 文档交叉引用机制——body-end `## 关联经验` 格式已标准化（含"与本文的差异"约束）
- [postponed] 渐进式披露触发条件细化——READMe.md 每个分类增加"触发场景"描述 → 来源：V1.7 注入机制讨论 + 新增 #11

---

## 新增（待评审排期）

> 未分配版本的临时想法。评审后可排入具体版本或标记 [wontfix]。
>
> ⚠️ 此章节是"待办收件箱"——后续修改 todo 时须保留，不应随版本整理被删除。

1. 评审哪些docs经验具有普适性，适合沉淀为spec，为后续用户安装后提供规范

2. [规范] docs/README.md 引用格式标准化——定义 "## 关联经验" 节的格式规范（文档名+目录+差异说明），当前 11 份文档已使用此格式但未写入规范 (P2)
   → 来源：docs 质量评审

3. [规范] ROADMAP 更新——经验复利闭环实际进度超前，V2 主题应从"经验初步"修正为"治理自动化" (P2)
   <不需要接纳，有相关计划，用户自主执行>

4. [BUG] 由tool推进task状态后，checkpoint未记录，yaml存在重复字段

5. [优化] 优化现有的spec，参考业界优秀的command skill spec，汲取优秀实践
   <联网搜索>

---

## 已关闭

<details>
<summary>V1.17：经验沉淀质量（P2）🟢 — 2/2 项完成 (feat-经验检测-沉淀质量-20260607)</summary>

> 经验库的持续治理机制。

- [done] 经验沉淀重要程度评估——spec `exp-governance.md` 定义 5 级生命周期和评估维度
  → 来源：新增 #7（原 V1.13-3）

- [done] 经验如何复利——quality 生命周期（draft/verified/outdated/refreshed/archived）+ 去重 + 晋升
  → 来源：todo #7 完整版 + 新增 #12（原 V1.13-4）

</details>

<details>
<summary>V1.16：经验检测（P2）🟢 — 2/2 项完成 (feat-经验检测-沉淀质量-20260607)</summary>

> 经验库的自动化质量检测——去重 + 一致性审查。

- [done] 经验去重检测——避免相同经验被反复沉淀（Agent 语义判断，见 ADR-003）
  → 来源：todo #7（原 V1.13-1）

- [done] 经验治理 skill (exp-governance)——默认扫描 `.self-workflow/docs`，Agent 可在总结阶段自主执行，用户可通过自然语言触发
  → 来源：新增（原 V1.13-2）

</details>

<details>
<summary>V1.15：todowrite 可视化（P2）🟢 — 2/2 项完成</summary>

- [done] todowrite 使用模式设计——何时展示、展示粒度、与 todo 体系和 task.yaml 的配合 → 来源：新增 #5
- [done] 沉淀 spec——todowrite 使用规范形成 default/ spec → 来源：新增 #5

</details>

<details>
<summary>V1.11：/feat 增强 + todo 管理 + 内置工具（P1）🟡 — 6/6 项完成</summary>

- [done] /feat 增强——无输入时自动分析/认领任务 → 来源：todo #18
- [done] /feat 增强——从 todo 领取任务结束后自动更新 todo 状态 → 来源：新增 #8
- [done] todo 整理排期 command——Agent 可自主整理 todo、排期 → 来源：新增 #1
- [done] todo 系统注入机制——确定 todo 介绍注入到哪些场景（主Agent / feat command / 子Agent）→ 来源：新增 #5
- [done] 歧义澄清 spec——Agent 遇到歧义输入时必须质疑询问，不自作主张 → 沉淀为 default/ spec → 来源：新增 #8
- [done] 内置 tool 化——确定性操作由内置 tool 实现（获取未完成 task 列表、创建 task 目录等），减少 token 浪费 → 来源：新增 #7

</details>

<details>
<summary>V1.10：Gate + 审查增强（feat-gate-审查增强-20260607 完成，2/2 项）</summary>

- [done] 门控机制优化——文档变更和新增纳入审查范围（Gate确认+Compound审查） ✅
- [done] 对抗性审查增强——Gate 1/3/4 提示词 Grill+COT 升级，Gate 2 反转说明检查 ✅

</details>

<details>
<summary>V1.9：重构收尾（feat-安装器重构-模板清理-20260606 完成，4/4 项）</summary>

- [done] task 模板从 feat command 移动到 templates——`feat-task.yaml` 独立文件，MANIFEST 部署 ✅
- [done] 任务标题/描述/commit msg 生成优化——语义 slug + 含阶段名的 commit msg ✅
- [done] checkpoint tag/commit ID 关联——phase schema 新增 `checkpoint` 字段 ✅
- [done] 三层目录清理——删除 `installer/.opencode/` + `.self-workflow/`（17 个死代码文件），`installer/README.md` 文档化 ✅

</details>

<details>
<summary>V1.8：specs 结构奠基（feat-specs结构奠基-20260606 完成，4/4 项）</summary>

- [done] 文档受众分类 spec — `specs/default/doc-audience.md` + 推广参考模式 ✅
- [done] 通用 spec 结构 — `specs/default/` + `specs/README.md` 分类定义段 + Plugin 注入 ✅
- [done] agent-reasoning + interaction-protocol 降格为 spec — Skill 已删除，内容迁移至 `specs/default/`，双钩子注入架构 ✅
- [done] 关键决策自动记录→通用 spec — `specs/default/decision-record.md` + `docs/关键决策/` + ADR 晋升流程 + 废弃 `/adr` 命令 ✅

</details>

<details>
<summary>V1.7：docs 结构 + 索引注入（feat-开始v1-7-20260606 完成，2/2 项）</summary>

- [done] docs/ 目录结构梳理——建立 3 分类目录（实施经验/参考模式/错误经验）+ README.md 权威分类源 ✅
- [done] docs 索引在 session_start 时自动注入上下文——OpenCode Plugin（session.created + marker 检测 + 渐进式披露） ✅

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
