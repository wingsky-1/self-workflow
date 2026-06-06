# 需求分析 — V1.7：docs 结构 + 索引注入

> 工作流 ID：`feat-开始v1-7-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T21:20:00+08:00

---

## 需求概述

V1.7 是 P2 级别的质量改善版本，主题为 **"docs 结构 + 索引注入"**。核心目标是将 `.self-workflow/docs/` 中的经验资产从"平铺的知识库"升级为"结构化、可自动索引、新会话自动注入"的框架级资产体系。

当前状态：9 份经验文档平铺在 `docs/` 根目录，无分类子目录。唯一的索引文件（`经验分级与加载指引.md`）是手动维护的表格。没有任何自动注入机制——Agent 能否加载相关经验完全取决于其自律。

V1.7 不仅要整理当前文档，更要**建立一套框架级分类与索引机制**——使后续用户（以及 Agent）生成的新经验文档能自动落入合适分类、索引自动更新、新会话启动时自动获取摘要。

---

## 功能清单

| 优先级 | 功能点 | 描述 | 备注 |
|--------|--------|------|------|
| P2 | docs/ 分类目录结构 | 建立分类子目录（实施经验/参考模式/错误经验），迁移现有 9 份文档，修正文件名-内容分类不一致问题 | 来自 todo V1.7 #1；需在安装器模板中新增分类目录模板 |
| P2 | 文档索引文件（index.yaml） | 创建独立索引文件（YAML 格式），列出各分类下所有文档及其摘要。独立维护，不嵌入 AGENTS.md | 索引需包含：文件名、分类、摘要、标签、日期；替代当前手动维护的表格 |
| P2 | 安装器模板新增 docs/ 资产 | 在 `packages/installer/templates/docs/` 下创建分类目录模板 + 经验分级指引 + index.yaml 模板，扩展 MANIFEST 和 EMPTY_DIRS | 当前安装器仅创建空 `docs/` 目录，不包含任何模板 |
| P2 | 渐进式披露三层设计 | L1 索引（session_start 自动注入，≤4000 tokens）、L2 元数据（按需按分类加载）、L3 全文（任务触发按关键词匹配加载） | 来自 todo V1.7 #2；需确保上下文长度可控 |
| P2 | session_start 索引注入机制 | 会话启动时 Agent 读取 `docs/index.yaml` 获取文档摘要列表，AGENTS.md 仅作指针（1 行指令）。不将索引内容嵌入 AGENTS.md | 对标 V1.6 验收标准；注入内容量化可控 |
| P2 | 文档格式统一 | 统一 9 份现有文档的前端元数据格式（YAML frontmatter），确保索引可解析 | 当前混用 YAML 前置元数据块 和 Markdown 引用行两种格式 |
| P2 | 文件命名规范落地 | 修正文件名与内容分类不一致的问题（如 `gate-推理链一致性-实施经验.md` 内容为错误经验），并对齐命名规范 | 需在迁移阶段一并修正 |

---

## 约束条件

### 技术约束

- **OpenCode 无文件级 `on:session-start` hook**：审计确认需通过 Plugin API 监听 `session.created` SSE 事件或 slash command。V1 采用 Plugin 方案（Human 决策）
- **不修改未来用户的 AGENTS.md**（硬约束）：注入逻辑封装在 Plugin 中，AGENTS.md 保持不变
- **AGENTS.md 不作为注入载体**：索引内容独立存储于 `docs/index.yaml`，Plugin 负责读取并注入到会话上下文
- **上下文长度必须可控**：注入内容须量化约束——索引文件按文档数量线性增长，需设计上限（如每文档 ≤ 100 字摘要，总索引 ≤ 4000 tokens）
- **渐进式披露分层设计**（详见下文）：三层结构——L1 索引（会话启动注入）、L2 元数据（按需加载）、L3 全文（任务触发加载）
- **安装器模板优先**：所有 `.self-workflow/` 和 `.opencode/` 的修改必须通过 `packages/installer/templates/` 模板源进行，通过 `init --force` 同步
- **现有文件保护**：`init --force` 会覆盖目标文件，迁移现有 docs 内容时需注意不丢失数据
- **Windows 环境**：路径分隔符、文件系统大小写敏感性需兼容

### 业务约束

- **不修改 `.opencode/` 目录**（按 AGENTS.md 规则）：修改通过安装器模板源 → 运行安装器 `init --force` 同步
- **P2 优先级**：不阻断 V1.8（specs 结构）发布，但 V1.7 的输出是 V1.8 的基础
- **框架级设计**：不是一次性整理，而是为未来所有用户提供可工作的默认分类和索引机制

---

## 验收标准

### 功能验收：docs/ 分类目录结构

- [ ] **AC-D1**：Given docs/ 目录，When 运行 `init --force` 后，Then 存在 `docs/实施经验/`、`docs/参考模式/`、`docs/错误经验/` 三个子目录（含 `.gitkeep`）
- [ ] **AC-D2**：Given 现有 9 份经验文档，When 迁移完成后，Then 所有文档按分类位于对应子目录中，文件名与内容分类一致
- [ ] **AC-D3**：Given docs/ 目录，When Agent 或用户查看目录结构，Then 能通过子目录名称理解分类含义（无需额外文档即可推断）

### 功能验收：文档索引文件

- [ ] **AC-I1**：Given docs/ 目录，When 有文档被添加/移除，Then 索引文件包含所有文档的摘要条目（文件名、分类、摘要、标签、日期）
- [ ] **AC-I2**：Given 索引文件，When Agent 读取，Then 能以结构化格式（YAML/JSON）解析并按标签/分类过滤
- [ ] **AC-I3**：Given 索引文件，When 新会话启动，Then Agent 优先读取索引而非遍历全目录文件列表

### 功能验收：session_start 索引注入 + 渐进式披露

- [ ] **AC-S1**：Given 新会话启动，When Agent 初始化，Then 读取 `docs/index.yaml` 获取所有文档摘要（仅索引条目，非全文）
- [ ] **AC-S2**：Given 注入的索引，When Agent 处理相关任务（如涉及安装器），Then 能通过关键词匹配找到对应经验文档并按需加载 L2 元数据/L3 全文
- [ ] **AC-S3**：Given N 份文档（N ≤ 50），When 计算索引大小，Then index.yaml ≤ 4000 tokens（每文档摘要 ≤ 80 tokens，字段：文件名、分类、一句话摘要、标签）
- [ ] **AC-S4**：Given 渐进式披露设计，When Agent 需要某文档详细信息，Then 不会一次性加载所有文档全文——必须通过分类/关键词过滤后按需加载

### 功能验收：安装器模板

- [ ] **AC-M1**：Given 安装器模板源 `packages/installer/templates/docs/`，When 查看，Then 包含分类目录结构和索引模板
- [ ] **AC-M2**：Given 安装器 MANIFEST，When `init --force` 运行，Then `docs/` 下的模板文件被正确同步到 `.self-workflow/docs/`
- [ ] **AC-M3**：Given `init --force`，When 覆盖已有 docs/ 目录，Then 保留用户已有的文档内容，不被模板覆盖（模板仅提供初始结构和索引框架）

### 质量要求

- [ ] 所有 9 份文档的 frontmatter 格式统一为 YAML 前置元数据块
- [ ] 索引文件格式设计可扩展（支持未来 specs/ 索引、多级标签、权重等字段）
- [ ] Plugin 正确监听 `session.created` 事件并注入索引摘要到 Agent 上下文
- [ ] 渐进式披露 L1→L2→L3 各层触发条件明确、可被 Agent 稳定解析和执行

---

## 不纳入范围

- **specs/ 索引注入**：V1.7 聚焦 docs/，specs/ 留到 V1.8
- **将索引内容写入 AGENTS.md**：硬约束——Plugin 封装注入逻辑，AGENTS.md 保持不变
- **数据库 MCP 方案**：todo 补充说明中提及"需不需要引入数据库 MCP"，此项作为后续补强，不在 V1.7 初版范围
- **经验去重检测**：已规划到 V1.8
- **经验一致性审查 command**：已规划到 V1.8
- **经验自动晋升（draft → verified）**：V2 范围
- **索引自动生成脚本**：V1 初版可接受手动维护索引 + 模板提供初始结构，自动生成留到后续版本
- **文档受众分类 spec**：已规划到 V1.8

---

## 关键设计决策点（待阶段 2 确定）

以下问题在需求阶段已识别但留到方案设计阶段决策：

1. **注入机制的"触发器"（已决策）**：采用 OpenCode Plugin 监听 `session.created` SSE 事件，自动触发 `docs/index.yaml` 读取和注入。不修改 AGENTS.md。
2. **索引格式与存储位置**：YAML（可读性好，Agent 友好）vs JSON（通用性，脚本友好）？存储于 `docs/index.yaml` 独立文件
3. **渐进式披露三层设计**：
   - **L1 索引层**（session_start 注入）：`docs/index.yaml`，含所有文档的 文件名、分类、一句话摘要（≤80 字）、标签。上限：50 文档 × 80 tokens ≈ 4000 tokens
   - **L2 元数据层**（按需加载）：单个文档的完整 frontmatter（含详细摘要、关联任务、日期、适用场景），由 Agent 在关键词匹配后按分类目录加载
   - **L3 全文层**（任务触发加载）：完整文档内容，由 Agent 在特定任务场景触发（如调试安装器 → 加载 `installer-错误经验.md` 全文）
3. **上下文长度控制策略**：
   - L1 索引：总量控制，随着文档增长需设计分页/分分类加载。当前 9 份文档远未触及上限
   - 单文档摘要字段长度约束：≤100 中文字符
   - 未来扩展：标签过滤 → 仅注入匹配当前会话上下文的文档子集
4. **索引更新机制**：手动维护（Agent 在阶段 5 更新 index.yaml）vs 半自动（installer 扫描 docs/ 生成）vs 全自动（Git hook）。V1 初版手动维护
5. **Plugin 位置与分发**：Plugin 代码放在哪里？`packages/installer/templates/plugin/` → 安装器同步到 `.opencode/plugin/`？需确认 OpenCode Plugin 的注册机制

---

## 决策声明

- [ ] 本阶段无架构决策
