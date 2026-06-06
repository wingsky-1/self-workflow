1. feat-workflow 怎么触发，应该做成 slash command？当前没有合理的触发机制
   → ✅ `/feat` 命令已实现并安装，通过 V1.5 自举评审（34/38=89.5%）。见 `docs/feat-command-需求设计.md`
   → ⚠️ 待新会话实测验证（OpenCode 在启动时加载命令定义，当前会话无法验证）

2. feat-quality-v15-20260606 没有按照预设的命名规则，以及生成了workflow.yaml 应该如何约束？提供创建任务的确定性的js脚本吗？
   → 🔗 `/feat` 命令自动生成 workflow-id（feat-<slug>-<YYYYMMDD>），强制命名规则
   → ❓ 确定性创建脚本（node script）尚未覆盖，当前依赖 Agent 执行 Command 指令

3. ADR的编号应该每个task独立开，不要全局递增
   → ❌ 不在 /feat 范围，需单独修复 `/adr` 命令的编号逻辑

4. checkpoint机制应该配合每阶段commit来达成
   → ✅ `feat-workflow.md` v0.2 + 本次自举验证：5 个 Git tag checkpoint 全部创建（ph1~ph5）

5. adr命令不要提供类型参数，由agent判断
   → ❌ 不在 /feat 范围，需单独修复 `/adr` 命令
   → 📋 V1.5 验收标准 v1.2 明确"Agent 自主归档为主，/adr 兜底"——命令的交互式填写模式需调整

6. 每阶段没有明确的指导，全靠主Agent的能力来兜底，如何增强 每阶段提供 agent/skill？
   → ❌ V2 范围，需 Adapter 编译能力（将工作流阶段映射为专用 Skill）

7. 经验如何复利，当前只有沉淀，没有刷新。经验可能过时，也有可能反复沉淀
   → ❌ V2 范围，需经验回滚机制 + 去重检测 + 过时标记
   → ⚠️ 本次已确立双级经验模型（task级上下文保留 + doc级跨任务复用），但缺少过时检查和去重

8. 安装时命名冲突问题如何解决（优先级低）
   → ✅ `/feat` 命令步骤 1 已包含冲突检测 + 追加序号（-2, -3...），最多 10 次报错

9. .self-workflow/docs 要增加分级，如 错误经验/实施经验/参考模式 等分类。以及如何注入提示词让Agent识别需要查看经验，渐进式披露（节约上下文）
   → 📋 待设计：分类原则 + 渐进式注入 + Agent 自动识别 → 见 `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` §三

10. (新增) Review Agent 在 4 个 Gate 中均未被实际调用——全部由主 Agent 自审代替。流程定义了"调用 Review Agent"但无强制执行机制
    → 📋 需短期修复：feat-workflow.md 各 Gate 中显式写入 `task(subagent_type="review-agent")`
    → 详见 `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` F2

11. (新增) Gate 声明权重 vs 量化结果冲突：设计审查 Gate 声明 full，量化 0→light。优先级未在 `feat-workflow.md` 中显式定义
    → 📋 需在 `feat-workflow.md` 中声明"量化结果覆盖声明权重"
    → 详见 `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` F1

12. (新增) 双级经验模型未在 workflow Phase 5 中体现——只提"经验草稿"，未区分 task 级和 doc 级
    → 📋 需在 `feat-workflow.md` Phase 5 检查清单中拆分两条
    → 详见 `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` F3

13. (新增) `/adr` 命令定位调整——从"手动触发工具"变为"兜底机制"，去掉类型参数（simple|complex|review），由 Agent 判断
    → 📋 需同步更新 `.opencode/commands/adr.md` 和安装器模板
    → 详见 `docs/V1.5/迭代需求/V1.5-剩余问题-20260606.md` F4
