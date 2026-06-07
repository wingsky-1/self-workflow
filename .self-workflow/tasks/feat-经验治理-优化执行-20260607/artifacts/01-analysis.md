# 01 - 需求分析

**任务**：经验治理优化执行——24 份文档 frontmatter/tag/source/quality 批量修复
**来源**：exp-governance 审查报告（2026-06-07）
**创建**：2026-06-07T14:29:32+08:00

---

## 功能清单

| ID | 功能 | 描述 | 涉及文档数 |
|----|------|------|-----------|
| F1 | 原始 ADR 添加 frontmatter | 2 份无 YAML frontmatter 的原始 ADR 副本（ADR-001/002）添加标准 frontmatter + 精炼内容 | 2 |
| F2 | 修复字段名错误 | 2 份文档使用 `created`/`related` 替代标准字段，修正为 `date`/`source`/`quality` | 2 |
| F3 | 补充缺失 date 字段 | 3 份实施经验文档缺少 `date` 字段 | 3 |
| F4 | 修复无效 source 路径 | 2 份文档的 `source` 指向不存在的任务目录 | 2 |
| F5 | 中文 tag 英文化 | 8 份文档（含 F2 中已修复的 1 份）的 tag 包含中文通用术语 | 8 |
| F6 | quality 批量晋升 | 本轮治理审查确认合格的 17 份 draft→verified（F1/F2 文档补全字段后一并晋升；F4 文档 source 修复后晋升） | 17 |

> 去重计算后实际修改文件数：22 个文件（部分文件涉及多项修复）

---

## 约束条件

| 约束 | 类型 | 说明 |
|------|------|------|
| C1 | 技术 | 修改 `.self-workflow/docs/` 可直接编辑（不在 installer MANIFEST 范围内） |
| C2 | 技术 | 仅修改 frontmatter 和内容精炼，不改变文档的实质经验内容 |
| C3 | 规范 | tag 英文化遵循 `docs/README.md` 约定——英文小写、中文仅领域特有名詞（`自举`保留） |
| C4 | 规范 | quality 晋升遵循 `specs/default/exp-governance.md`——本轮即为系统治理审查 |
| C5 | 规范 | 不自动修改内容（除非 Tier1 精炼 ADR 内容） |
| C6 | 项目 | 不修改 `.opencode/` 目录文件 |

---

## 验收标准

### F1：原始 ADR 添加 frontmatter

- [ ] **A1a**：`关键决策/对抗性审查提示词-Grill+COT策略.md` 具备完整 frontmatter（title/category/tags/date/source/quality）
- [ ] **A1b**：`关键决策/文档审查注入点-混合模式.md` 具备完整 frontmatter
- [ ] **A1c**：A1a 标题去掉 `ADR-002：` 前缀，背景段删除"V1.10 需求"等历史叙事
- [ ] **A1d**：A1b 标题去掉 `ADR-001：` 前缀，精炼历史语境

### F2：修复字段名错误

- [ ] **A2a**：`参考模式/LLM指令设计-语义优先于机械规则.md` 中 `created`→`date`，删除 `related`，补全 `source`/`quality`
- [ ] **A2b**：`参考模式/ADR与设计文档交叉一致性审查.md` 中 `created`→`date`，删除 `related`，补全 `source`/`quality`

### F3：补充缺失 date

- [ ] **A3a**：`实施经验/V1.5-实施经验.md` 添加 `date: 2026-06-06`
- [ ] **A3b**：`实施经验/V1-实施经验.md` 添加 `date: 2026-06-06`
- [ ] **A3c**：`实施经验/feat-command-实施经验.md` 添加 `date: 2026-06-06`

### F4：修复无效 source

- [ ] **A4a**：执行 `git log --all --oneline -- "*安装器重构*"` 查证原始 task 目录名
- [ ] **A4b**：`参考模式/验收验证的双重检查-存在与不存在.md` 的 `source` 指向存在的任务目录
- [ ] **A4c**：`错误经验/委托提示词歧义-提取不等于保留副本.md` 的 `source` 指向存在的任务目录

### F5：中文 tag 英文化

- [ ] **A5a**：8 份文档的所有中文通用 tag 已替换为英文小写
- [ ] **A5b**：`自举` tag 保留（领域特有名詞）
- [ ] **A5c**：不存在大小写不一致的 tag

### F6：quality 批量晋升

- [ ] **A6a**：17 份文档的 `quality` 从 `draft` 变更为 `verified`
- [ ] **A6b**：晋升后的文档均满足 verified 条件（经本轮治理审查、内容与规范一致、tags 可检索）

### 全局验收

- [ ] **G1**：全部 24 份文档（含 README.md 排除）frontmatter 字段完整（6 字段非空）
- [ ] **G2**：`lsp_diagnostics` 对 `.self-workflow/docs/` 无新增错误
- [ ] **G3**：无中文通用 tag 残留

---

## 不纳入范围

| 项 | 理由 |
|----|------|
| 修改 `.opencode/` 目录 | 项目约束——通过安装器管理 |
| 修改文档主体内容（除 Tier1 精炼外） | 本次仅治理 frontmatter 和格式，不改变经验实质 |
| 创建新经验文档 | 不属于优化计划范围 |
| 修改 `docs/README.md` | 格式约定无变化 |
| 自动归档 outdated 文档 | 需单独评估，非本轮目标 |
