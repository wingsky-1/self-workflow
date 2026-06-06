# 总结沉淀：V1.8 — specs 结构奠基

> workflow-id: feat-specs结构奠基-20260606
> 阶段：5/5 — 总结沉淀

---

## 本次得与失

### 做得好的

1. **调研充分**：Phase 1 并发 4 个 explore agent，覆盖 specs/skills/ADR/受众 四个维度，产出详实的 01-analysis.md
2. **决策记录完整**：5 个 ADR 覆盖所有架构选择（格式、加载、目录、迁移、沉淀），每个 ADR 包含备选方案分析
3. **Human 深度参与**：F2 受众方向修正、ADR-004 直接删除决策、spec 注入强调 default 目录——Human 反馈及时且关键
4. **自举验证通过**：安装器模板源 → init --force → 运行时部署，零错误
5. **双钩子注入架构**：采纳 Trellis 模式，同时覆盖主 Agent（system.transform）和子 Agent（tool.execute.before）

### 可改进的

1. **ADR-008 超驰迟发现**：方向审查阶段才发现与 ADR-008 的矛盾，应在方案设计初期主动扫描现有 ADR 一致性
2. **子 Agent 注入风险**：ADR-004 最初低估了子 Agent spec 继承风险，对抗性审查后才升级为 critical 并增加验证 checkpoint
3. **docs/README.md 遗漏**：设计文档正文提到但未列入修改模板清单，审查时才被指出

---

## 经验草稿

### 可复用的实施经验

1. **多 ADR 并发创建模式**：Phase 2 设计阶段同时产出 5 个 ADR，每个 ADR 对应一个架构决策点。模式：识别决策 → 备选方案分析 → Human 确认 → 写入 ADR。

2. **插件双钩子注入模式**：确保上下文覆盖所有 Agent（主 + 子）需要两个钩子：`experimental.chat.system.transform`（主 Agent）+ `tool.execute.before`（子 Agent Task 拦截）。单一钩子无法保证完整覆盖。

3. **安装器模板源修改 → init --force 部署流程**：本次验证了完整的自举链——修改 `packages/installer/templates/` 下的模板源 → 更新 MANIFEST → 运行 `init --force` → 运行时文件更新。

### 可沉淀的参考模式

1. **Spec 文件格式规范**：YAML frontmatter（title/type/level/tags/summary）+ Markdown body（MUST/SHOULD/MAY 分类），与 docs/ 经验文档格式一致

2. **ADR 超驰模式**：当新 ADR 推翻旧 ADR 的决策时，必须在"关联"段中显式声明"超驰：ADR-XXX"并给出推翻理由

---

## ADR 晋升检查

本次产出的 5 个 ADR：

| ADR | 主题 | 跨任务？ | 框架级？ | 晋升建议 |
|-----|------|---------|---------|---------|
| ADR-001 | Spec 文件格式 | ✅ 是 | ✅ 是 | **建议晋升** — 定义所有 spec 的格式标准 |
| ADR-002 | Spec 加载机制 | ✅ 是 | ✅ 是 | **建议晋升** — 定义插件注入架构 |
| ADR-003 | Spec 目录结构 | ✅ 是 | ✅ 是 | 可选 — 与 ADR-001/002 高度关联 |
| ADR-004 | Skill 迁移方案 | ✅ 是 | ⚠️ 一次性的迁移决策 | 不建议 — 迁移完成后即无参考价值 |
| ADR-005 | 决策沉淀方案 | ✅ 是 | ✅ 是 | **建议晋升** — 定义跨任务 ADR 管理流程 |

---

## 决策捕捉

- [x] 本阶段无新架构决策
