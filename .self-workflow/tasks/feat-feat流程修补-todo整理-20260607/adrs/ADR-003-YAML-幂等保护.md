# ADR-003：YAML 重复字段修复方案选择

## 背景

`updatePhase` 函数的文本替换方式已在 3 个任务文件中产生重复 `started:` 字段。需要修复逻辑防止未来再次出现。可选方案：仅增加幂等保护（最小改动），或改为 YAML 结构化解析（根本修复）。

## 决策

选择方案 A：仅增加幂等保护——通过精确正则边界检查，防止重复 `started:` 字段产生。

具体实现：
- `hasValidStarted` 双重检测：`started:` 存在且非 null → 跳过所有操作（幂等）
- 仅 `started: null` 时执行替换
- 替换 regex 使用 `/started:\s*null\b/`（`\b` 边界保护，防止 inline comment 被误删）
- 旧模板无 `started:` 字段时在 `status:` 行后插入（向后兼容，增加防御性 `statusLineIdx !== -1` 检查）

## 理由

1. 01-analysis.md 不纳入范围已明确排除「完整的 YAML 结构化替换重构」
2. 已知问题是 `started:` 重复——方案 A 精准解决，改动量最小（~5 行）
3. 完整 YAML 重构延后至子Agent架构版本（v2.x 技术债务）
4. 3 个受影响的历史文件通过 AC4b 覆盖（手动修复脚本）

## 后果

- 正面：改动最小、风险最低、快速交付
- 负面：未来可能在其他字段出现类似问题（需后续版本增加结构性防御）
- 延后：YAML 结构化重构列入 v2.x

## 关联

- 关联需求：Bug 修复 YAML 重复字段（todo #5）
- 不纳入范围：完整的 YAML 结构化替换重构（01-analysis.md）
- 关联文件：`packages/installer/templates/plugin/self-workflow-session.ts` 第 211-217 行
