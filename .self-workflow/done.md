# Done

> 已关闭版本归档。所有已完成版本段从 `.self-workflow/todo.md` 迁移至此。
> 当前活跃版本见 [todo.md](todo.md)。

---

## 已关闭

<details>
<summary>V1.21：Gate + 流程纪律强化（P0/P1）🟢 — 6/6 项完成 (feat-Gate流程纪律强化-20260607)</summary>

> P0: Gate 纪律——不通过绝对不进入下一阶段；P1: 产物自查 + 提交前自检清单，降低返工率。

- [done] Phase Gate 纪律强化——4 Gate + Phase 3 入口增加 MUST NOT 阻断式措辞（7 处）✅
- [done] 产物自查——每个 Gate 增加"前置检查"段（量化输出 + 产物自查 + 自检清单 + 程序化验证声明，共 4 Gate × 4 项）✅
- [done] Gate 提交前自检清单——前置检查段包含 task.yaml/ADR/frontmatter 三项固定检查 ✅
- [done] Gate 量化强制输出——量化输出移至前置检查段首位，标记"即使 weight=skip 也不可省略" ✅
- [done] 实现阶段严控——Phase 3 入口增加方案确认段（MUST NOT 确认前修改文件）✅
- [done] Gate 程序化验证跳过显式声明——Gate 3/4 前置检查段增加跳过理由模板 ✅
- [done] 附加：review-agent 提示词更新——4 个 Gate 增加 Gate 纪律检查项 ✅
- [done] 附加：feat.md 系统约束段同步 + gate-审查机制实现方案.md 架构概览更新 ✅

</details>

<details>
<summary>V1.19：/feat 流程修补 + todo 整理（P1/P2）🟢 — 5/5 项完成，含 1 项 wontfix (feat-feat流程修补-todo整理-20260607)</summary>

> P1: 修复 Phase 4→5 文档更新步骤缺失 + Phase 3 文档编辑类任务产物规则；P2: 减少上下文污染。

- [done] /feat Phase 4→5 增加文档更新步骤——防止实现与文档不一致 ✅
  → 来源：新增 #6
- [done] todo 已关闭版本迁移至 done.md——减少会话上下文污染 ✅
  → 来源：新增 #3
- [wontfix] Phase 3 文档编辑类任务产物规则——纯文档编辑 /feat 任务允许省略 03-implementation.md
  → 来源：一期评审短板 | 拒绝理由：建议拆分 doc 工作流，非当前版本范围
- [done] /feat 工作流强制更新 todo——Agent 在 /feat 任务完成后 MUST 更新 todo.md 中的对应版本项状态 ✅
  → 来源：新增 #7
- [done] tool 推进 task 状态后 checkpoint 未记录 + yaml 重复字段修复 ✅
  → 来源：新增 #4（原 V1.25）

</details>

<details>
<summary>V1.18：核心特性实现方案（P2）🟢 — 1/1 项完成 (feat-核心特性-实现方案-文档化-20260607)</summary>

> 文档化核心特性实现方案，减少 Agent 开发时重复读代码分析。

- [done] docs下增加核心特性实现方案——新增 实现方案/ 分类 + spec + 模板 + 9份示范文档 → 来源：新增 #1
- [done] 引导机制——spec `implementation-documentation.md` + feat-workflow Phase 2/3/5 检查点 + Gate non-blocking 兜底
- [done] 经验治理——30份文档通过 exp-governance 审查，去重/合并/引用全部落实

</details>

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
<summary>V1.13：文档 tag 质量治理（P1）🟢 — 2/2 项完成</summary>

> ✅ 两期经验治理（feat-经验治理-优化执行 + feat-经验治理-合并引用-20260607）实现全部 tag 英文化、统一大小写。仅保留 `自举`（领域特有名词）。

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
