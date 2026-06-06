1. feat-workflow 怎么触发，应该做成 slash command？当前没有合理的触发机制
   → ✅ [feat-command-需求设计.md] `/feat` 命令提供触发入口，自动创建目录+元数据+加载工作流指引

2. feat-quality-v15-20260606 没有按照预设的命名规则，以及生成了workflow.yaml 应该如何约束？提供创建任务的确定性的js脚本吗？
   → 🔗 [feat-command-需求设计.md] `/feat` 命令自动生成 workflow-id（feat-<slug>-<YYYYMMDD>），强制命名规则
   → ❓ 确定性创建脚本（node script）尚未覆盖，当前依赖 Agent 执行 Command 指令

3. ADR的编号应该每个task独立开，不要全局递增
   → ❌ 不在 /feat 范围，需单独修复 `/adr` 命令的编号逻辑

4. checkpoint机制应该配合每阶段commit来达成
   → ✅ [feat-workflow.md v0.2] 已采用 Git tag + commit 机制，需自举验证确认实际运行效果

5. adr命令不要提供类型参数，由agent判断
   → ❌ 不在 /feat 范围，需单独修复 `/adr` 命令

6. 每阶段没有明确的指导，全靠主Agent的能力来兜底，如何增强 每阶段提供 agent/skill？
   → ❌ V2 范围，需 Adapter 编译能力（将工作流阶段映射为专用 Skill）

7. 经验如何复利，当前只有沉淀，没有刷新。经验可能过时，也有可能反复沉淀
   → ❌ V2 范围，需经验回滚机制 + 去重检测 + 过时标记

8. 安装时命名冲突问题如何解决（优先级低）

9. .self-workflow/docs 要增加分级，如 错误经验 实施经验 参考模式 等分类，结合实际需要再思考分类原则。以及如何注入提示词让Agent识别需要查看经验，渐进式披露（节约上下文）
