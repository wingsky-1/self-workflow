# 需求分析：V1.8 — specs 结构奠基

> workflow-id: feat-specs结构奠基-20260606
> 阶段：1/5 — 需求分析
> 创建时间：2026-06-06
> 修订：2026-06-06（根据 Human 反馈重排功能优先级 + 修正需求方向）

---

## 1. 背景

`.self-workflow/specs/` 目前是一个骨架目录——仅包含一个 34 行的 `README.md`，定义了 MUST / SHOULD / MAY 三级规范体系，但**零条实际规范**。同时，项目中已有大量隐式的"规范"以不同形式散落：

- **Skill 形式**：`agent-reasoning`、`interaction-protocol` 两个 Skill 定义了 Agent 行为约束，但存放在 `.opencode/skills/`，依赖于 `/feat` 命令显式加载，而非始终生效
- **工作流规则**：`feat-workflow.md` 中内嵌了大量行为准则（决策捕捉、Gate 量化公式、Checkpoint 机制等），但未提取为可复用的规范
- **文档约定**：docs/ 的经验分类、frontmatter 格式、渐进式披露等都是约定俗成，缺少规范级别的定义
- **ADR 模型**：决策记录机制（`/adr` 命令 + 工作流检查清单）分散在多处，可靠性和可复用性不足

V1.8 的目标是建立 **specs 体系基础**——让规范成为框架的一等公民，为后续的经验质量、审查增强、Agent 自主决策等版本打好基础。

---

## 2. 功能清单

> **依赖关系**：F1（spec 结构）是所有后续 spec 的基础，F2/F3/F4 均建立在 F1 定义的框架之上。

### F1：沉淀通用 spec 结构 ⭐ 基础

**来源**：todo.md 新增 #2

**优先级**：最高 — F2/F3/F4 均依赖此结构

**现状**：
- `specs/README.md` 仅定义了 MUST/SHOULD/MAY 三级概念框架（空骨架）
- `docs/需求草案.md` 第 668-704 行有完整的 YAML 格式 specs 愿景（分文件、分层级、按需加载）
- `docs/` 经验目录已有成熟的三分类结构（实施经验/参考模式/错误经验），可作为组织参考，插件已实现 docs/ 的自动索引注入
- 安装器模板源 `packages/installer/templates/specs/` 仅有相同空骨架

**目标**：
- 定义 specs 目录的文件组织规则（多文件、多级索引、可扩展）
- 定义单个 spec 文件的标准结构（frontmatter + 分类 + 规则条目格式）
- **增加 `default/` 子目录**：存放始终生效、影响 flow 运行的关键 spec（如 agent-reasoning、interaction-protocol），Agent 应重点遵守
- 参考 docs/ 的加载机制，设计 specs/ 如何被 Agent 发现和使用（如插件索引注入或显式引用）
- 决定格式：YAML（需求草案愿景）vs Markdown（当前 README.md 形式）→ 设计阶段决策
- 确保安装器模板源 `packages/installer/templates/specs/` 同步更新

### F2：文档受众分类 spec

**来源**：todo.md V1.6 #7（移入 V1.8） + V1.6 分析文档 AC-8

**Human 反馈**：
> 不要修改文档，仅在 spec 中明确告知 Agent 如何分辨文档的受众。精确告知 .self-workflow 目录下的文档受众。并按照不同受众角度指导 Agent 如何编写/评审文档。

**现状**：
- 所有 `.self-workflow/docs/` 文件的 frontmatter 均无 `audience` 字段
- 插件注入索引时不区分受众，Agent 无法判断哪些文档是给谁的
- 存在隐式的分层映射（`docs/` 项目根 → Human 参考，`.self-workflow/docs/` → Agent 复用的经验，`specs/` → Agent 强制遵守），但未形式化

**目标**（修订后）：
- 仅在 spec 中告知 Agent **如何分辨** `.self-workflow/` 下各目录/文档的受众（不修改现有文档）
- 精确列出 `.self-workflow/` 下各目录的默认受众映射表
- 按受众角度指导 Agent：
  - **面向 Agent 的文档**：如何编写（格式、frontmatter、粒度）、如何检索使用
  - **面向 Human 的文档**：如何编写（语言、结构、易于理解）
  - **面向 Both 的文档**：如何兼顾双方需求
- 指导 Agent 在**评审文档**时，按受众视角评估文档质量

### F3：agent-reasoning + interaction-protocol 降格为 spec

**来源**：todo.md 新增 #2

**Human 反馈**：
> spec 加载机制单独考虑，可参考 docs 加载机制。建议增加 default 目录，重点提示 Agent 要遵守这部分 spec（影响 flow 运行的关键 spec）。

**现状**：
- 两个 Skill 位于 `.opencode/skills/`，内容完整（共 ~75 行，含 MUST/NOT MUST 规则 + 决策流程 + 示例）
- 内容完全可平移为 spec 格式，无需语义变更
- 当前加载路径：`feat.md` 步骤 6 中的 `load_skills=['interaction-protocol', 'agent-reasoning']`
- 安装器通过 MANIFEST 部署到 `.opencode/skills/`
- 验收标准 M0-1（interaction-protocol 已安装且生效）、M0-2（agent-reasoning 已安装且生效）检查文件在 `.opencode/skills/` 路径存在

**目标**（修订后）：
- 将两个 Skill 的 MUST/NOT MUST 规则翻译为 `.self-workflow/specs/default/` 下的规范文件（属于 F1 定义的 default 目录，表示始终生效）
- 设计 spec 加载机制：参考 docs/ 的插件索引注入模式，使关键 spec 能被 Agent 自动发现和遵守
- 更新安装器 MANIFEST：目标路径从 `.opencode/skills/` 改为 `.self-workflow/specs/default/`
- 更新 `feat.md` 的加载指令：从 `load_skills` 改为引用 specs/ 下的规范
- 更新验收标准 M0-1/M0-2 的路径检查
- 决定：Skill 文件是否保留空包装器作为兼容过渡 → 设计阶段决策

### F4：关键决策自动记录 → 通用 spec

**来源**：todo.md 新增 #4 + 新增 #3

**Human 反馈**：
> 不需要补充 review 模板了（已删除）。生命周期额外考虑——感觉要在 docs 下也增加关键决策目录，沉淀重大影响的决策。

**现状**：
- `/adr` 命令完整（7 步，默认 auto 模式 + 降级交互），有 simple/complex 两套模板
- `feat-workflow.md` 每阶段含"决策捕捉"和"决策声明"检查清单
- ADR-003（关键决策即时归档）定义了主动识别概念，但该 ADR 已在 V1.6 被标记为"被超驰(overridden)"，其内容不作为当前权威来源
- ADR 仅存在于 `tasks/<id>/adrs/` 中（任务级），无跨任务的决策沉淀机制
- 无 ADR lifecycle 管理（只有"创建"，无"更新/废弃/晋升"）

**目标**（修订后）：
- 将当前分散的决策记录规则（`/adr` 命令 + 工作流检查清单）提取为统一的 `decision-record-spec`
- 定义 ADR 创建触发条件（明确的"何时必须创建"规则，而非"建议"）
- 在 `.self-workflow/docs/` 下新增 **关键决策目录**（如 `关键决策/`），用于沉淀重大影响的跨任务决策——从 `tasks/<id>/adrs/` 中晋升有广泛参考价值的 ADR
- 定义 ADR lifecycle：创建（任务内）→ 沉淀（晋升到 docs/关键决策/）→ 废弃/更新
- 确保 spec 级别规则对所有任务生效（不仅仅是 `/feat` 工作流内部）
- **不纳入**：review 模板（已删除，不再补充）

---

## 3. 约束条件

### 技术约束

1. **安装器自举**：所有 `.self-workflow/specs/` 的修改必须先改 `packages/installer/templates/specs/` 模板源，再运行 `node packages/installer/index.js init --target . --force` 同步
2. **Spec 加载机制**：当前 OpenCode 的 Skill 系统通过 `load_skills` 加载 `.opencode/skills/` 下的文件。spec 文件移到 `.self-workflow/specs/` 后，需要重新设计加载方式——参考 docs/ 的插件索引注入机制（`self-workflow-session.ts` 在会话启动时扫描并注入索引）
3. **文件格式**：当前 README.md 是 Markdown，需求草案愿景是 YAML。需要统一格式或提供互操作性方案
4. **Gate 读取**：`feat-workflow.md:647` 标注 specs/ 读取为"V2 功能"。Gate 目前不读取 specs/ 内容进行验证。V1.8 仅写入 spec 内容，Gate 集成留给 V1.10+
5. **Skill 向后兼容**：OpenCode 的 skill 系统是否支持从 `.self-workflow/specs/` 路径加载，需要在设计阶段确认。如果不行，可能需要保留 `.opencode/skills/` 下的空包装器

### 业务约束

1. **不过度设计**：V1.8 是 specs 体系的"奠基"（P2 🟢），不应追求 V2 的完整 YAML 规范体系。应建立最小可用的结构
2. **向后兼容**：降格为 spec 的两个 Skill 需要保持等效的约束力（Agent 行为不变）
3. **不可破坏现有工作流**：`/feat` 命令、Gate 审查、ADR 创建等已有流程不能因 spec 迁移而中断
4. **不修改现有文档**：F2（受众分类）仅定义 spec 告知 Agent 如何判断，不批量修改现有 docs/ 文件

---

## 4. 验收标准

### F1：通用 spec 结构

- **AC-1.1**：Given `.self-workflow/specs/` 目录，When 新 spec 需要添加，Then 有明确的文件添加规则（命名、目录位置——含 `default/` 子目录、frontmatter 格式要求）
- **AC-1.2**：Given 一个 spec 文件，When 解析其内容，Then 规则条目遵循统一格式（含 level MUST/SHOULD/MAY、描述、适用范围）
- **AC-1.3**：Given `specs/README.md`，When 读取，Then 它作为所有 spec 的索引入口，列出各子目录的用途和所有生效的 spec 文件
- **AC-1.4**：Given 安装器 `packages/installer/templates/specs/`，When 运行 `init --force`，Then 所有 spec 模板（含 `default/` 子目录）正确部署到 `.self-workflow/specs/`
- **AC-1.5**：Given `specs/default/` 目录，When Agent 执行任何工作流任务，Then default/ 下的 spec 能被发现和引用（通过插件索引注入或显式引用机制）

### F2：文档受众分类 spec

- **AC-2.1**：Given `specs/` 中的受众分类 spec，When Agent 遇到 `.self-workflow/` 下的文档，Then spec 中有精确的目录→受众映射表，Agent 可据此判断
- **AC-2.2**：Given 受众分类 spec，When Agent 需要**编写**新文档，Then spec 中有面向不同受众（Human/Agent/Both）的编写指南
- **AC-2.3**：Given 受众分类 spec，When Agent 需要**评审**文档，Then spec 中有按受众视角的评审检查项（如"面向 Human 的文档是否避免了技术黑话？""面向 Agent 的文档是否有清晰的 frontmatter？"）
- **AC-2.4**：Given 受众分类 spec，When 有人问".self-workflow/ 下各个目录分别是谁看的"，Then spec 给出了清晰的答案

### F3：Skill 降格为 spec

- **AC-3.1**：Given `agent-reasoning` 和 `interaction-protocol` 原有的 MUST 规则，When 读取 `specs/default/` 下的对应 spec 文件，Then 规则内容完整保留（含 MUST/NOT MUST 分类），语义不变
- **AC-3.2**：Given `/feat` 命令执行，When 进入阶段 1，Then Agent 仍然遵循原来的行为约束（委托优先、question 工具优先、总结先行等）——约束力不变
- **AC-3.3**：Given 安装器部署，When 运行 `init --force`，Then 两个 spec 文件部署到 `specs/default/`（而非 `.opencode/skills/`），MANIFEST 已更新
- **AC-3.4**：Given 原有验收检查（M0-1=interaction-protocol 生效性，M0-2=agent-reasoning 生效性），When 检查生效性，Then 检查项指向新的 `specs/default/` 路径且检查通过

### F4：决策自动记录 spec

- **AC-4.1**：Given `decision-record-spec`，When Agent 在任务中做架构选择/方向性决策，Then spec 中有明确的触发条件描述（何时必须创建 ADR）
- **AC-4.2**：Given `.self-workflow/docs/` 下新增的**关键决策目录**，When 某任务的 ADR 具有跨任务参考价值，Then 有明确的晋升规则（从 `tasks/<id>/adrs/` → `docs/关键决策/`）
- **AC-4.3**：Given ADR lifecycle spec，When ADR 创建后，Then spec 定义了生命周期阶段：创建 → 引用 → 沉淀（晋升到 docs/关键决策/）→ 废弃/更新
- **AC-4.4**：Given 任意任务的工作流执行，When Gate 审查时，Then 审查方向包含"是否存在应记录但未记录的决策"

---

## 5. 不纳入范围

> V1.8 是 P2 🟢（奠基），以下内容明确不纳入：

1. **V2 级 YAML 规范体系**：`需求草案.md` 中描述的分文件 YAML（`coding-style.yaml`、`architecture.yaml` 等）、分层披露、按需加载——留到 V2
2. **Spec 自动晋升系统**：`ROADMAP.md` 中的"项目自有 spec → 晋升到 installer/specs/ 通用化"——不纳入
3. **Gate 读取 specs/ 进行实质审查**：`feat-workflow.md:647` 标注为"V2 功能"——V1.8 仅写入 spec 内容，不实现 Gate 对 spec 的自动化读取
4. **批量修改已有 docs/ 文档**：不在已有文档的 frontmatter 中补充 audience 字段（F2 仅定义 spec 指导 Agent 判断，不做文档迁移）
5. **决策自动记录的程序化执行**：仅写 spec 定义触发条件，不做自动检测/强制创建的程序化实现
6. **Review 模板（`adr-review-template.md`）**：已删除，不再补充
7. **会话启动时自动注入 specs/**：当前插件只注入 docs/ 索引 — specs/ 注入不在 V1.8 范围（但设计 spec 结构时应预留加载扩展点）

---

## 6. 调研发现总结

### Specs 现状
- `.self-workflow/specs/` 仅含 34 行骨架 `README.md`（MUST/SHOULD/MAY 三段全部为空）
- 安装器模板源 `packages/installer/templates/specs/` 相同
- 跨代码库 16 处引用，多数指向"V2 功能"或"待填充"

### Docs 加载机制（可参考）
- `self-workflow-session.ts` Plugin 在会话启动时扫描 `docs/README.md` 获取分类信息，遍历子目录解析 frontmatter，注入索引到 system prompt
- 此模式可复用为 specs/ 的加载机制（扫描 `specs/README.md` → 注入 default/ 下的关键 spec）

### Skills 分析
- `agent-reasoning`（38 行，4 MUST + 2 NOT MUST + 1 流程图）：内容是"委托决策"规范
- `interaction-protocol`（37 行，6 MUST + 2 NOT MUST + 示例）：内容是"交互规范"
- 两者内容均可无损平移为 `specs/default/` 下的规范文件

### ADR 体系
- 7 个已完成任务共产出 29 个 ADR，分布在各自 `tasks/<id>/adrs/` 下
- `/adr` 命令完整（simple/complex 两套模板），但 review 模板已删除
- ADR-003 在 V1.6 已标记为"被超驰"，其"主动识别"概念仅作参考，不作为当前权威来源
- 缺少跨任务决策沉淀机制：重要 ADR 埋没在任务目录中，无法被其他任务检索复用

### 受众分类
- 当前零受众标注（无任何 frontmatter 含 `audience` 字段）
- 存在隐式分层映射（项目 `docs/` → Human，`.self-workflow/docs/` → Agent，`AGENTS.md` → Both），但 Agent 无法程序化判断

---

## 7. 决策捕捉

- [x] 本阶段无架构决策 — 需求分析阶段仅收集信息、明确范围。以下架构决策留到阶段 2（方案设计）：
  - spec 文件格式（Markdown vs YAML）
  - `default/` 目录的具体加载机制（插件注入 vs 显式引用 vs 两者结合）
  - Skill 文件的兼容过渡方案（完全移除 vs 空包装器 vs 符号链接）
  - docs/关键决策/ 目录的晋升标准（什么算"重大影响"）
