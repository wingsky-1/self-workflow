# ADR-004：Skill → Spec 迁移方案 —— 直接删除

## 背景

`agent-reasoning` 和 `interaction-protocol` 两个 Skill 当前存放在 `.opencode/skills/`，通过 `/feat` 命令的 `load_skills` 参数和 `task()` 委托中的 `load_skills` 参数加载。这些 Skill 的内容将迁移到 `specs/default/`。

Human 已确认：spec 不是 Skill，应通过插件注入 system prompt 而非 `load_skills` 加载。降格后直接删除对应的 Skill 文件，不保留冗余包装器。

## 备选方案

### 方案 A：完全删除 Skill，纯 spec 注入

- 删除 `.opencode/skills/agent-reasoning/SKILL.md` 和 `interaction-protocol/SKILL.md`
- 移除安装器 MANIFEST 中的 skill 部署条目
- 更新 `feat.md` 中所有 `load_skills` 引用
- 完全依赖 ADR-002 的插件注入机制

✅ 干净，无冗余文件
✅ 单一真相源（spec 是唯一权威）
⚠️ 需确保插件注入覆盖所有场景（子 Agent 委托等）

### 方案 B：保留空包装器（Skill 引用 Spec）

> ❌ Human 否决。理由：降格为 spec 就直接删除，不需要冗余过渡。

### 方案 C：渐进式迁移（标记为 deprecated）

> ❌ 同上。降格就是彻底迁移，不需要 deprecated 标记期。

## 决策

**选择方案 A**：完全删除 Skill 文件，spec 通过插件注入 system prompt 作为唯一加载路径。

### 影响分析

删除 `load_skills` 引用后，需要确保以下场景仍有 spec 约束力：

| 场景 | 原来（Skill） | 现在（Spec 注入） | 保障 |
|------|-------------|-----------------|------|
| 主 Agent（/feat 流程） | `load_skills` 加载 | Plugin 注入 system prompt | ✅ 插件始终在 system.transform 时注入 |
| 子 Agent（`task()` 委托） | `load_skills=['agent-reasoning']` 携带 | 子 Agent 也有 system prompt（继承自主 Agent） | ⚠️ 需验证子 Agent 是否继承 spec 注入内容 |
| 手工对话（非 /feat） | 不加载 Skill | Plugin 注入 system prompt | ✅ 插件在所有会话中生效 |

**子 Agent spec 继承验证**：如果子 Agent 的 system prompt 不继承主 Agent 的插件注入内容，需要在 `task()` 调用的 prompt 中显式引用 spec 或要求子 Agent 先读取 spec 文件。

### 迁移步骤

1. 创建 `specs/default/agent-reasoning.md` 和 `specs/default/interaction-protocol.md`——完整规范内容（新格式）
2. 修改 `feat.md`——移除 `load_skills` 参数中的 skill 引用，改为说明 spec 已通过插件注入
3. 从安装器 MANIFEST 中移除 `.opencode/skills/` 相关条目
4. 新增 `specs/default/` 条目到 MANIFEST
5. 更新验收标准 M0-1/M0-2——改为检查 `specs/default/` 路径
6. 运行 `init --force` 同步——安装器会自动删除旧的 skill 文件并部署新的 spec 文件

### 风险与缓解

| 风险 | 严重度 | 缓解 |
|------|--------|------|
| 子 Agent 不继承 spec 注入 | 🔴 critical | **(a)** Phase 3 验证：先创建测试 spec + 启动 task() 子 Agent + 检查 system prompt 是否含 `SPECS_MARKER`。**(b)** 若验证不通过，feat.md 嵌入强制指令：所有 task() prompt 尾部追加 "Read `.self-workflow/specs/default/` 并严格遵守"。**(c)** 验证通过前 skills 不删除。 |
| 插件注入失败导致 spec 丢失 | 🟡 medium | spec 文件仍在磁盘上，Agent 可手动读取；Gate 审查会检查 spec 是否被遵守 |
| 旧会话缓存 | 🟢 low | 旧会话重启后插件重新注入，自动获取新 spec |

### 迁移步骤（含验证 checkpoint）

```
Step 1:  创建 specs/default/agent-reasoning.md（完整内容，新格式）
Step 2:  创建 specs/default/interaction-protocol.md（完整内容，新格式）
Step 3:  新增 specs/default/ 条目到 MANIFEST + 运行 init --force 部署
Step 4:  🔴 验证：启动新会话 → 检查 system prompt 含 SPECS_MARKER
Step 5:  🔴 验证：创建 task() 子 Agent → 检查子 Agent system prompt 是否继承 spec 注入
         → 通过则继续 → 不通过则在 feat.md 嵌入 task() 强制指令
Step 6:  删除 .opencode/skills/agent-reasoning/SKILL.md
Step 7:  删除 .opencode/skills/interaction-protocol/SKILL.md
Step 8:  从 MANIFEST 移除 skill 条目 + 运行 init --force 部署
Step 9:  更新 feat.md → 移除 load_skills=['agent-reasoning', 'interaction-protocol'] 引用
Step 10: 更新验收标准 M0-1/M0-2 → 检查 specs/default/ 路径
```

## 理由

1. **单一真相源**：specs/default/ 是 Agent 行为规范的唯一权威来源，不存在两份拷贝
2. **减少维护负担**：不需要同步维护 Skill 包装器 + spec 两份内容
3. **Human 明确决策**："降级为 spec 就直接删除对应的 skill"
4. **插件注入已覆盖主要场景**：system prompt 注入适用于主 Agent，子 Agent 通过 prompt 指令补充

## 关联

- 依赖：ADR-002（加载机制）— 插件注入是 spec 的唯一加载路径
- 依赖：ADR-003（目录结构）— `specs/default/` 是 spec 的目标路径
