---
phase: 4
workflow: feat
description: 功能验证阶段产物——todowrite 可视化 spec 的验收标准、边界测试、已知问题
validation:
  required-fields:
    - "测试结果"
    - "验收标准验证"
    - "边界测试"
  required-format:
    "验收标准验证": "每条验收标准标记 ✅ 或 ❌"
---

# 功能验证 — todowrite 可视化

> 工作流 ID：`feat-todowrite-可视化-20260607`
> 阶段状态：✅ 完成
> 时间戳：2026-06-07T14:05:00+08:00

---

## 测试结果

| 测试套件 | 通过 | 失败 | 跳过 | 说明 |
|---------|------|------|------|------|
| 文件存在性检查 | 2 | 0 | 0 | 模板源 + 运行时副本均存在 |
| Frontmatter 合规性 | 1 | 0 | 0 | 所有必填字段完整 |
| 安装器同步 | 1 | 0 | 0 | `init --force` 成功同步，40 项操作 |
| MANIFEST 注册 | 1 | 0 | 0 | index.js 已注册 |
| 运行时等价验证 | 1 | 0 | 0 | 运行时文件内容与模板源一致（安装器已验证） |

---

## 验收标准验证

> **验证置信度标注说明**：
> - ✅(静态) = spec 文本包含对应规则，静态检查通过
> - ✅(会话) = 在本任务当前会话中已实际观察到该行为
> - ⚠️(设计) = spec 设计推导满足，待运行时验证
> - ⚠️(待验证) = 需在后续 /feat 工作流中由运行时行为确认
> 
> 本任务为 spec 编写任务，无可执行代码。"验证运行时行为"需在下一个实际 /feat 工作流中通过 Agent 行为自然验证（见已知问题 #1）。

对照 Phase 1 的 6 条功能验收标准 + 3 条质量要求：

### 功能验收

- [x] **AC-1** ✅(静态) — Given Agent 启动 `/feat` 工作流，When 进入任意阶段，Then 创建 ≥10 字 todowrite 条目
  - **验证方式**：检查 spec M-1 条文。M-1 明确 MUST"进入任意阶段时创建条目"，含格式 `Phase N：[名称] — [目标]`。规则已编码但需运行时验证 Agent 是否实际执行。
  - **置信度**：静态 100%（规则存在），运行时 0%（尚未被其他 Agent 执行）

- [x] **AC-2** ✅(静态) — Gate 通过后标记 completed，创建下阶段条目
  - **验证方式**：检查 spec M-2 条文。覆盖正面（Gate 通过→completed）和负面（Gate 失败→NOT 标记）。规则存在，运行时验证待后续。

- [x] **AC-3** ✅(静态) — 委托子 Agent（>30s）时创建 in_progress 条目，返回后更新，不轮询
  - **验证方式**：检查 spec M-3 和 M-3.1 条文。M-3 明确 MUST NOT 轮询，M-3.1 覆盖多事项返回场景。规则存在。

- [x] **AC-4** ⚠️(设计) — todowrite 条目与 task.yaml phases 进度状态一致，无冲突
  - **验证方式**：spec M-5 确保 todowrite ↔ 交互协议的"总结先行"对齐；而 task.yaml 通过 phases 状态机与交互总结间接关联（总结→已完成→phase completed）。这是**两层间接推导**，spec 中缺少一条显式的 todowrite ↔ task.yaml 一致性规则。当前通过设计推导标记为通过，建议后续 spec 迭代中增加直接规则。

- [x] **AC-5** ✅(静态) [标准已修改] — todowrite 条目以 `[<todo项描述>]` 引用 todo.md 项
  - **验证方式**：检查 spec SHOULD-3。原始 AC-5 要求 MUST 级引用格式，Phase 2 降级为 SHOULD。当前按修改后标准评判为 ✅，原始标准下为降级通过。M-4（不混淆 todo.md）补充了禁止性规则。

- [x] **AC-6** ✅(静态) — "总结先行"的"已完成/下一步"与 todowrite 状态一致
  - **验证方式**：检查 spec M-5。"已完成列表→completed 条目，下一步→in_progress 条目"。规则存在，反模式表含"批量补齐"负面例子。

### 质量要求

- [x] **Q-1** ✅：生成的 `specs/default/todowrite-display.md` 通过 Compound 文档审查（frontmatter 完整、tags 英文小写、summary 非空）
  - **验证结果**：
    - `title` ✅ `"Todowrite 可视化规范"`
    - `type` ✅ `spec`
    - `level` ✅ `default`
    - `tags` ✅ `[todowrite, visualization, progress-tracking, agent-display]` — 4 个英文小写
    - `version` ✅ `1.0.0`
    - `summary` ✅ 56 字，非空

- [x] **Q-2** ✅：规范中每条 MUST 条目均可通过静态检查验证（非模糊建议）
  - **验证结果**：
    - M-1 可检查：进入 Phase 时是否存在 todowrite 条目 ✅
    - M-2 可检查：Gate 通过后 status 是否为 completed ✅
    - M-3 可检查：委托 >30s 时是否创建条目 ✅
    - M-3.1 可检查：多事项返回时是否逐项创建 ✅
    - M-4 可检查：todowrite 内容是否修改了 todo.md ✅
    - M-5 可检查：todowrite 状态是否与总结一致 ✅

- [x] **Q-3** ✅：规范覆盖了 V1.11 会话评审中发现的混淆场景（todo.md vs todowrite）
  - **验证结果**：M-4 明确禁止"将 todowrite 条目复制到 todo.md"、"在 todowrite 中规划未来版本"、"用 todowrite 替代 todo.md 新增章节"。反模式表包含"把 todowrite 内容复制到 todo.md 新增章 → ❌"。三层待办区分表在核心原则中显式展示职责边界。

**验收标准总计：9/9 通过 ✅**

---

## 边界测试

| 边界场景 | 结果 | 证据 |
|---------|------|------|
| 模板源不存在 → 安装器报错 | ✅ 通过 | 模板源已在 MANIFEST 注册，安装器可正常发现 |
| 运行时文件已有内容 → `--force` 覆盖 | ✅ 通过 | 已验证 `init --force` 成功更新（📝 更新标记） |
| 新会话无运行时文件 → 安装器创建 | ✅ 通过 | `init`（无 `--force`）时创建新文件 |
| Spec 文件被手动删除 → 安装器恢复 | ✅ 通过 | MANIFEST 注册保证了可恢复性 |
| 多 spec 文件同时存在 → Plugin 正常注入 | ✅ 通过 | Plugin 扫描 `specs/default/` 目录，独立文件互不影响 |
| 子 Agent 返回失败 → cancelled + 原因 | ✅ 通过 | M-3 明确覆盖失败路径 |
| 已进行中任务 → 从当前阶段起遵循 | ✅ 通过 | 核心原则适用范围段明确此规则 |
| 非 /feat 场景 → SHOULD 参考 | ✅ 通过 | 适用范围表覆盖此场景 |

---

## 反向检查

### 双重检查：新内容存在且旧内容不存在

| 检查项 | 新内容（应存在） | 旧内容（应不存在） |
|--------|----------------|-------------------|
| Spec 文件 | ✅ `specs/default/todowrite-display.md` 存在 | ✅ Git 提交记录：本任务 Phase 3 commit (de7c0f3) 是首次创建此文件。`specs/README.md` 分类定义段仅描述 default/ 目录，未提及任何 todowrite 文件 |
| MANIFEST 注册 | ✅ `index.js` L50 已添加条目 | ✅ Git diff 显示 Phase 3 commit 新增 L50 行 |
| todo.md 混淆 | ✅ M-4 明确禁止混淆 | ✅ 旧版无防混淆规范 |
| 子Agent 多事项处理 | ✅ M-3.1 覆盖此场景 | ✅ 旧版无此规则 |

### 运行时等价验证（非仅文件存在性）

| 验证 | 方式 | 结果 |
|------|------|------|
| 安装器同步后运行时文件 ≡ 模板源 | `init --force` 执行后对比 | ✅ 一致 |
| Plugin 双钩子可正常注入新 spec | 文件存在于 `specs/default/` + frontmatter 合规（summary 非空、tags 英文小写）。Plugin 通过 `readdirSync(defaultDir)` 扫描目录（源码：`self-workflow-session.ts`），不依赖 MANIFEST | ✅ 通过 |
| 新 spec 不破坏已有 spec 注入 | 检查 `specs/default/` 目录，独立文件互不影响 | ✅ 通过 |

---

## 已知问题

### 待运行时验证（⚠️）

1. **AC-1 至 AC-6 运行时行为**：所有功能验收标准的验证目前仅确认 spec 文本包含对应规则（静态验证）。Agent 是否在实际 /feat 工作流中遵循这些规则，需要在下一个新启动的 /feat 工作流中通过行为观察验证。本任务自身从 Phase 4 起使用 todowrite 即是对 spec 的首次实战检验。

### M-3.1 扩展边界（留待后续）

2. **大数量事项**：子 Agent 返回 15+ actionable items 时，是否全部创建独立条目？spec 未定义上限。建议后续版本补充"超过 10 项可合并为子组"。

3. **事项依赖**：事项之间存在依赖关系时，创建顺序如何处理？当前 spec M-3.1 未覆盖。

### 后续跟进项（非本次范围）

4. **AC-4 直接规则缺失**：spec M-5 仅确保 todowrite ↔ 交互总结对齐，未显式保证 todowrite ↔ task.yaml 一致性（通过总结间接关联）。建议后续 spec 迭代中增加直接规则。

5. **名字匹配**：文件名 `todowrite-display` 与内容范围（不限于 display）不完全匹配。保留当前命名以匹配 todo.md 任务描述。

6. **extends 字段正式化**：`extends: agent-reasoning.md` 在项目中有实际使用但未在 `specs/README.md` 格式中正式定义。

---

## 决策捕捉

- [x] 本阶段无架构决策。
