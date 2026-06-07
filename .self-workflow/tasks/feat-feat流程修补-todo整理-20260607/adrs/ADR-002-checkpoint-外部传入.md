# ADR-002：checkpoint 参数外部传入方案

## 背景

`sw_task_phase_update` 工具在 Gate 通过时需写入 checkpoint SHA，但当前实现不包含此逻辑。Phase 1 技术约束曾假设「工具中集成 child_process.execSync 执行 git 命令」，但 Human 后续决策指定「checkpoint 由外部传入」——与 Phase 1 初始约束方向相反，构成约束条件反转。

反转理由：工具职责应保持单一（YAML 写入），不应跨域到 git 操作；Agent 按 feat-workflow.md Checkpoint 章节已在执行 git 操作（commit + tag + rev-parse），传入 SHA 无额外成本；避免 CI/容器环境 git 不可用导致工具崩溃。

## 决策

`sw_task_phase_update` 函数签名新增 `checkpoint?: string` 可选参数。Agent 在 Gate 通过时先执行 `git tag` + `git rev-parse` 获取 SHA，再调用工具时传入 `checkpoint=<sha>`。工具仅负责写入 SHA 到 task.yaml 的对应 phase 块。

**程序化防护**：当 `gate === "passed"` 但 `checkpoint` 未传入或为空时，工具返回 warning（不阻断流程，但提示 Agent 可能遗漏；warning 写入 errors.yaml）。

## 理由

1. Human 明确指定「checkpoint 由外部传入」
2. 工具职责单一——`sw_task_phase_update` 的职责是更新 task.yaml，不应跨域到 git
3. Agent 已在执行 git 操作——传入 SHA 零额外成本
4. 避免 CI/容器环境 git 不可用时工具崩溃
5. 增加程序化防护后，Agent 遗漏 checkpoint 时有 warning 提示——兼顾灵活性和可靠性

## 关联

- 关联 ADR：ADR-001（Phase 4→5 文档同步）
- 关联需求：Bug 修复 checkpoint 未记录（todo #5）
- 反向覆盖：替代 01-analysis.md 第 68 行"工具中集成 execSync"的初始约束
- 关联文件：`packages/installer/templates/plugin/self-workflow-session.ts` 第 177-236 行
