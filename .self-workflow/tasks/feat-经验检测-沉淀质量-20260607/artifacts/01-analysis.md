# 阶段 1：需求分析 — V1.16+V1.17 经验复利机制

## 1. 功能清单

### V1.16：经验检测

| # | 功能点 | 说明 | 来源 |
|---|--------|------|------|
| F1 | 经验去重检测 | 自动扫描 `.self-workflow/docs/`，**Agent 语义判断**（非硬编码算法）。Skill 提供判断维度（标题相似性、主题重叠、内容重复程度），Agent 阅读后自行判定。详见 ADR-003 | todo #7（原 V1.13-1） |
| F2 | 经验一致性审查 skill | `exp-governance` skill：扫描 docs/ 下所有文档，检查 frontmatter 完整性、tag 规范、category 一致性、source 有效性。用户可通过自然语言触发（"审查经验"），Agent 在 Phase 5 通过 `skill(name="exp-governance")` 加载 | todo 新增（原 V1.13-2） |

### V1.17：经验沉淀质量

| # | 功能点 | 说明 | 来源 |
|---|--------|------|------|
| F3 | 经验重要程度评估 | 定义评估框架——不止"能不能复用"，还要评估"对项目推进的帮助性"；包含对 `docs/` 下每份文档的价值分级 | todo 新增 #7（原 V1.13-3） |
| F4 | 经验复利机制 | 刷新/去重/过时标记/晋升 full lifecycle | todo #7 完整版 + 新增 #12（原 V1.13-4） |

### 设计方向（用户指定，跨 V1.16+V1.17）

| 方向 | 说明 |
|------|------|
| D1 | 一致性审查/去重/刷新做成 skill —— **不仅 Agent 归档时使用，用户也可以手动触发**（skill 本身即是用户可调用的单元，无需额外 command。ADR-001 经 Gate 审查后确定为 skill-only） |
| D2 | 经验沉淀环节细化到工作流中 —— 为 V2.0 拆分阶段子 Agent 做准备 |
| D3 | 经验评估整理成 spec，放入 `default/` 目录 —— 后续再评估 default/ 下 spec 的质量和划分 |

## 2. 约束识别

### 技术约束

1. **安装器是唯一权威源**：所有修改 `configs/`、`specs/`、`.opencode/` 的文件必须通过 `packages/installer/templates/` 模板源 + MANIFEST 注册 → 运行 `init --force` 同步。`.self-workflow/docs/` 和 `.self-workflow/tasks/` 可直接编辑。
2. **Command 注册模式**：需在 `packages/installer/templates/commands/` 下创建 `.md` 文件，在 `index.js` 的 MANIFEST 中注册 `[".opencode/commands/xxx.md", "commands/xxx.md"]`
3. **Spec 注册模式**：需在 `packages/installer/templates/specs/default/` 下创建 `.md` 文件，在 MANIFEST 注册，使用 `type: spec`, `level: default`, `version`, `summary` 格式
4. **Skill 注册**：尚无模板 precedent。`.opencode/skills/` 目录由安装器创建（空）。探索方案：参考 OpenCode 官方文档 + 现有项目 skill（如 `review-work`、`git-master`）的 SKILL.md 结构，分析其注册和加载机制。Skill 用户可调用——无需额外 command
5. **现有 docs/ 结构**：4 个分类目录（实施经验/参考模式/错误经验/关键决策），共约 27 份文档，frontmatter 字段不完全一致（发现：`feat-command-实施经验.md` 缺少 `date` 字段）

### 业务约束

1. **docs/ 是运行时产物**：由工作流 Phase 5 直接写入，不可通过安装器覆盖（但与 configs/specs 不同，可直接编辑）
2. **docs/README.md 的"分类定义"段**是 Plugin 自动解析的权威源——新增分类需在此注册
3. **tag 约定**：英文小写优先，3-5 个为佳；中文仅用于领域特有名词
4. **quality 字段**：当前只有 `draft` / `verified`，生命周期不完整。扩展 quality 字段值（如新增 `outdated`/`archived`）需同步更新 `docs/README.md` 的字段定义表和 Plugin 的 frontmatter 解析逻辑

## 3. 验收标准

### F1 — 经验去重检测

- [ ] A1.1：存在 Agent 语义去重机制（经 ADR-003 决策，替代原算法方案）：
  - Agent 通过 `exp-governance` skill 加载审查指令后，阅读 docs/ 下全部文档
  - 基于语义理解判断文档是否重复（维度：标题相似性、主题重叠、内容重复程度）
  - 发现疑似重复时 MUST 输出具体判断理由，不能仅给结论
  - **Given** `.self-workflow/docs/` 下有文档
  - **When** Agent 执行 `exp-governance` skill 的去重维度
  - **Then** 输出疑似重复文档对，每条含判断维度和具体理由（阈值可在设计阶段调整，但必须显式定义）
- [ ] A1.2：检测结果以可读报告形式输出（Markdown），包含：疑似重复对、相似度指标、建议操作（合并/保留/区分标题）

### F2 — 经验一致性审查

- [ ] A2.1：存在 `exp-governance` skill（用户可通过自然语言触发，如"审查经验文档"；Agent 可通过 `skill(name="exp-governance")` 加载）
  - **Given** 用户在项目中 / Agent 在 Phase 5
  - **When** 用户说"审查经验"或 Agent 加载 skill
  - **Then** 执行 docs/ 完整扫描并输出审查报告
- [ ] A2.2：审查覆盖以下维度：
  - frontmatter 完整性（title/missing、category/missing、tags/missing、date/missing）
  - tag 规范（英文小写、无同义词重复、无大小写不一致）
  - category 一致性（category 字段值与所在目录名匹配）
  - source 有效性（source 引用的 task 目录存在）
  - quality 字段非空
- [ ] A2.3：Agent 在 Phase 5 总结时可自主调用审查机制（通过 `skill(name="exp-governance")`）

### F3 — 经验重要程度评估

- [ ] A3.1：存在 `specs/default/exp-governance.md`，**实质性**定义（不可为空 spec 形式化通过）：
  - 质量分级标准（至少定义 `draft`/`verified`/`outdated` 三级，每级含明确的转换条件——如：draft→verified 需经至少一次 Agent Review 且被 ≥1 份其他文档引用；verified→outdated 需 source 指向的 task 完成超过 30 天且无新引用）
  - 重要程度评估维度（复用性、对项目推进帮助性、覆盖场景广度）— 每维度含评分标准
  - 过时判定标准（时间 + 引用衰减 + 内容有效性检查）
  - ≥ 3 条 MUST 规则
- [ ] A3.2：`exp-governance` skill 审查报告中包含每份文档的质量/重要性评估

### F4 — 经验复利机制

> 复利 = 贬值预防 + 增值促进。V1.16+V1.17 优先实现贬值预防（去重、过时标记、质量治理）；增值维度（引用追踪、关联推荐）延后到 V2。

- [ ] A4.1：spec 定义完整的经验生命周期（节点 + 转换条件）：
  - 状态：draft → verified → outdated → (refreshed → verified | archived)
  - 每个状态转换有明确的触发条件（如 draft→verified 需经至少一次审查且被引用；verified→outdated 需 source task 完成超过 30 天且无活跃引用）
- [ ] A4.2：`exp-governance` skill 输出包含"建议操作"清单：哪些可晋升、哪些需刷新、哪些可标记过时
- [ ] A4.3：`feat-workflow.md` 阶段 5 增加经验治理子步骤，引用 `exp-governance` skill 和 `specs/default/exp-governance.md`。**修改路径**：编辑 `packages/installer/templates/configs/guides/feat-workflow.md`（模板源），再运行 `node packages/installer/index.js init --target . --force` 同步到运行时。禁止直接编辑 `.self-workflow/configs/guides/feat-workflow.md`（参考模式：安装器模板源 vs 运行时文件）

### D1 — Skill 作为唯一入口（经 Gate 1 审查推翻原双入口方案）

- [ ] D1.1：`exp-governance` skill 存在，用户可通过自然语言触发（如"审查经验文档"），Agent 在 Phase 5 可通过 `skill(name="exp-governance")` 加载
- [ ] D1.2：skill 的 description 注明触发关键词（"经验审查"、"exp-review"、"经验去重"、"经验质量"），确保 Agent 和用户都能发现
- [ ] D1.3：不创建独立 `/exp-review` command——skill 已覆盖用户手动触发和 Agent 自动调用两个场景

### D2 — 工作流集成

- [ ] D2.1：`feat-workflow.md` 阶段 5 增加经验治理子步骤（检查清单 + 可选 skill 调用）。**修改路径**：编辑 `packages/installer/templates/configs/guides/feat-workflow.md` → 运行 `init --force` 同步
- [ ] D2.2：治理环节与现有双级经验模型（task 级→doc 级）不冲突、有明确边界

### D3 — Spec 沉淀

- [ ] D3.1：`specs/default/exp-governance.md` 写入安装器模板源 → MANIFEST 注册 → `init --force` 同步
- [ ] D3.2：spec 内容遵循"规范而非步骤"原则（MUST/SHOULD/MAY 分层）
- [ ] D3.3：`specs/README.md` 的 default/ 分类无需修改——已包含

## 4. 不纳入范围

| 排除项 | 理由 |
|--------|------|
| 自动执行去重合并 | 去重建议需 Human 确认，V1 不做自动合并 |
| docs/ 内容语义分析/NLP | 去重检测使用基础文本相似度哈希（SimHash/MinHash），不引入语义分析或 NLP 模型 |
| 跨 docs/ 的引用关系图谱 | 属于 V1.14（延后），不在本次范围 |
| doc 级经验自动晋升 | 晋升仍由 Agent 提议 + Human 确认（现有机制），不改为自动 |
| V2.0 子 Agent 拆分 | 本次仅预留接口和结构化治理步骤，不实际拆分 |
| 修复现有 docs/ 文件的问题 | 审查工具建设，不批量修改已有文档 |

## 5. 现有关键发现

### docs/ frontmatter 不一致实例

扫描发现 `feat-command-实施经验.md` 缺少 `date` 字段——这正是一致性审查应检测的问题。

| 文件 | title | category | date | source | quality | tags |
|------|-------|----------|------|--------|---------|------|
| feat-command-实施经验.md | ✅ | ✅ | ❌ 缺失 | ✅ | ✅ draft | ✅ |
| gate-强制步骤-实施经验.md | ✅ | ✅ | ✅ | ✅ | ✅ draft | ✅ |
| phase-gate-验证不能形式化.md | ✅ | ✅ | ✅ | ✅ | ✅ draft | ✅ |
| 跨任务决策沉淀.md | ✅ | ✅ | ✅ | ✅ | ✅ verified | ✅ |

### 现有 quality 字段值分布

- `draft`: 大部分文档
- `verified`: 仅关键决策分类中的部分文档（`spec目录组织.md`、`跨任务决策沉淀.md` 等）
- 无 `outdated` / `archived` 状态——缺少降级路径

### Skill 模板空缺

`packages/installer/templates/skills/` 目录不存在——本次需创建首个 skill 模板。

## 6. 决策捕捉

- [x] ADR 已创建，见 `adrs/ADR-001-经验审查工具架构.md`、`adrs/ADR-002-单一审查命令设计.md`

**决策 1**（ADR-001）：Skill 作为唯一入口，不创建 Command
- 原方案考虑 Command+Skill 双入口，经 Gate 1 审查推翻
- skill 本身可被用户调用，无需额外 command
- 见 `adrs/ADR-001-经验审查工具架构.md`——按 `adr-complex-template.md` 格式重写

**决策 2**（ADR-002）：单一 skill 覆盖所有审查维度
- 去重、一致性审查、质量评估、复利建议合并为一个 `exp-governance` skill
- 分节输出，支持自然语言指定审查范围
- 见 `adrs/ADR-002-单一审查命令设计.md`——按 `adr-complex-template.md` 格式重写
