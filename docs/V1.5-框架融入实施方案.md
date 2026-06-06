# ADR 融入框架实施方案

> 版本：v0.1
> 目标：将 V1 验证通过的 5 条 ADR 融入 Self-Workflow 框架
> 方式：利用 OpenCode 的 Skill / Command / Agent / Hook 能力

---

## 一、总览

5 条 ADR 按融入方式分为三类：

| 融入方式 | 对应 ADR | 产出物 |
|---------|---------|--------|
| **Skill**（约束 Agent 行为） | ADR-001 交互式问答、ADR-007 委托质疑 | 2 个 Skill 定义 |
| **Command**（用户显式触发） | ADR-003 决策归档 | 1 个 Command 定义 |
| **Templates + 强制流程** | ADR-005 task.yaml、ADR-006 目录分层 | 已有，纳入工作流强制 |

---

## 二、Skill：约束 Agent 行为

### 2.1 `interaction-protocol` Skill

**用途**：始终加载，指导 Agent 如何与用户交互。

**对应 ADR**：ADR-001（交互式问答优先）

**内容**：

```markdown
---
name: interaction-protocol
description: 交互规范——与用户交互时必须遵守的规则。Use for every session.
---

# 交互协议

## 选项选择

涉及 2 个以上选项时，必须使用 `question` 工具，而非纯文本列举。

✅ 正确：
<question questions=[...]>

❌ 错误：
"您想选 A 还是 B？"

## 总结先行

询问用户是否继续前，先总结已完成内容，再说明下一步。
格式：已完成：X、Y → 下一步：做 A（涉及 B、C）

## 排除项

开放式提问（"还有什么？"）不需要使用 question 工具。
```

**安装位置**：`packages/installer/templates/skills/interaction-protocol/SKILL.md`
**部署到**：`.opencode/skills/interaction-protocol/SKILL.md`

### 2.2 `agent-reasoning` Skill

**用途**：始终加载，指导 Agent 的思考方式和任务分解原则。

**对应 ADR**：ADR-007（委托优先原则）

**内容**：

```markdown
---
name: agent-reasoning
description: Agent 推理原则——先质疑、再委托、后验证。Use for every session.
---

# Agent 推理原则

## 先质疑，再执行

收到 Human 的方向后，必须先独立思考：
1. 这个方向合理吗？有没有明显的问题？
2. 有更好的方案吗？
3. Human 考虑过 X 吗？

质疑不是对抗。质疑通过后再执行。

## 委托优先

主 Agent 的上下文只保留决策链路，不保留执行细节。

**自己做**（不需要委托）：
- 读已知路径的文件
- 简单 grep 搜索
- 单文件 typo 修复
- 查看 git 状态

**委托出去**（并行或专业任务）：
- 并行独立任务 → background agents
- 专业领域 → specialist agents（explore/librarian/oracle）
- 上下文隔离 → fresh sub-agent

**粒度判断**：执行 > 30 秒 → 委托；< 5 秒 → 自己做。

## 委托后验证

委托不是丢出去不管。必须验证结果：
- 结果符合预期？→ 继续
- 结果有问题？→ 重新委托或自行修复
- 需要整合？→ 主 Agent 做 final touch
```

**安装位置**：`packages/installer/templates/skills/agent-reasoning/SKILL.md`
**部署到**：`.opencode/skills/agent-reasoning/SKILL.md`

---

## 三、Command：决策即时归档

### 3.1 `/adr` Command

**用途**：用户或 Agent 触发，快速创建标准格式的 ADR 文件。

**对应 ADR**：ADR-003（关键决策即时归档）

**工作流程**：

```
/adr <标题>
  ↓
1. 解析标题，生成 ADR ID（自动递增）
2. 从模板创建 ADR 文件
3. 写入 tasks/<当前任务>/adrs/
4. 更新 task.yaml artifacts 列表
5. 打开编辑器让用户/Agent 填写内容
```

**Command 定义**（`.opencode/commands/adr.md`）：

```markdown
---
description: 创建架构决策记录（ADR）。使用当前 task 目录下的模板自动生成标准格式文件。
argument-hint: <决策标题>
---

<command-instruction>
1. 确定当前 task：扫描 .self-workflow/tasks/ 下 status=in_progress 的 task
2. 确定 ADR ID：读取 task 内 adrs/ 目录的现有文件，自增编号
3. 从 .self-workflow/configs/templates/ 复制 ADR 模板
4. 写入 tasks/<task-id>/adrs/ADR-<编号>-<标题>.md
5. 更新 task.yaml 的 artifacts 和 structure.adrs 列表
6. 提示用户/Agent 填写：背景、决策、理由、影响、关联
</command-instruction>
```

---

## 四、工作流强制（已有，需更新）

### 4.1 task.yaml 创建强制

**当前状态**：task.yaml 模板在安装器中，但工作流未强制创建。

**更新**：在 feat-workflow.md 的"快速入门"中将"创建 task.yaml"列为启动步骤，Review Agent 检查 task 目录是否包含 task.yaml。

### 4.2 决策捕捉嵌入阶段流程

**当前状态**：V2 需求设计中有此计划，但未实施。

**更新**：每个阶段末尾嵌入"决策捕捉"步骤——Agent 自问是否有值得记录的决策，有则执行 `/adr`。

---

## 五、与现有框架的关系

```
installer/
└── templates/
    ├── skills/
    │   ├── interaction-protocol/SKILL.md   ← 新增（ADR-001）
    │   └── agent-reasoning/SKILL.md        ← 新增（ADR-007）
    ├── commands/
    │   └── adr.md                          ← 新增（ADR-003）
    ├── configs/
    │   ├── guides/feat-workflow.md          ← 更新（强制 task.yaml + 决策捕捉）
    │   └── templates/...                    ← 已有
    ├── specs/README.md                      ← 已有（待填充）
    └── agents/review-agent.md               ← 已有
```

---

## 六、验收标准

- [ ] `interaction-protocol` skill 加载后，Agent 使用 question 工具的频率显著提升
- [ ] `agent-reasoning` skill 加载后，Agent 在收到方向时会先质疑再执行
- [ ] `/adr` 命令能正确创建 ADR 文件到当前 task 的 adrs/ 目录
- [ ] `/adr` 命令能自动更新 task.yaml 的 artifacts 列表
- [ ] feat-workflow.md 的每个阶段末尾包含决策捕捉步骤
- [ ] Review Agent 在 Gate 中检查 task.yaml 是否存在

## 七、未解决问题

- Skills 是否需要在 opencode.json 中注册才能始终加载？还是放在 `.opencode/skills/` 目录即可自动生效？
- `/adr` 命令如何识别"当前 task"——取最近一个 in_progress 的 task？
- 决策捕捉步骤如果每阶段都执行是否过于频繁？是否需要 Human 确认后再创建 ADR？
