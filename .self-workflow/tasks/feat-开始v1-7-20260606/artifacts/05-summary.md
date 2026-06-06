# 总结沉淀 — V1.7：docs 结构 + 索引注入

> 工作流 ID：`feat-开始v1-7-20260606`
> 阶段状态：✅ 完成
> 时间戳：2026-06-06T23:30:00+08:00

---

## 本次得与失

### 产出

| 类别 | 内容 |
|------|------|
| 目录结构 | docs/ 从 9 文件平铺 → 3 分类目录 + README.md |
| 文档统一 | 全部 9 份文档统一为 YAML frontmatter 格式 |
| Plugin | `.opencode/plugin/self-workflow-session.ts`，事件驱动 + marker 检测 |
| 安装器 | MANIFEST 新增 5 条映射，EMPTY_DIRS 新增 plugin/ |
| 决策 | ADR-001(Plugin)、ADR-002(超驰ADR-003目录分类)、ADR-003(marker检测) |

### 设计演进

1. **AGENTS.md 注入 → Plugin 注入**：用户明确不修改未来用户 AGENTS.md，Plugin 方案满足需求
2. **单 chat.system.transform → 事件驱动 + marker 检测**：参考 context-mode 等生产项目后，采用 `session.created` + marker 检测两阶段方案
3. **index.yaml → 目录扫描 + frontmatter → README.md 权威源**：零维护索引设计，文件即索引
4. **4 分类 → 3 分类 + 根 README**：加载指引合并入 README.md，避免单文件分类

### 踩坑

- OpenCode Plugin API 的 `event` hook 对 `session.created` 有已知 bug (#14808)，需要 `chat.system.transform` 作为兜底
- `output.system.push()` 在 vLLM/Qwen 等后端会因单 system message 限制而失败 → 改为合并到 `output.system[last]`

---

## 经验草稿

### doc 级经验（写入 `.self-workflow/docs/`）

本次产出了 1 份可跨任务复用的参考模式：

- **`参考模式/plugin-session-inject-pattern.md`**：OpenCode Plugin 会话启动注入模式

---

## 决策捕捉

| ADR | 决策 | 状态 |
|-----|------|------|
| ADR-001 | Plugin + chat.system.transform 注入方案 | 已采纳 |
| ADR-002 | 超驰 ADR-003，转向目录分类 | 已采纳 |
| ADR-003 | marker 检测作为注入去重策略 | 已采纳 |

- [x] **决策声明**：ADR 已创建，见 adrs/ 目录
- [x] 本阶段无新增架构决策
