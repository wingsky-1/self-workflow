---
description: 快速创建 ADR（Architecture Decision Record），支持 simple/complex/review 三种模板，自动编号并更新 task.yaml
---

# /adr 命令

## 用法

```
/adr <simple|complex|review> <ADR 标题>
```

## 参数

| 参数 | 说明 |
|------|------|
| 模板类型 | `simple`（简单决策）、`complex`（复杂决策）、`review`（评审结果决策） |
| 标题 | ADR 的标题文字，简短描述决策内容 |

## 执行流程

### 步骤 1：识别当前 task

扫描 `.self-workflow/tasks/` 下所有 in_progress 的 task：

1. 读取每个 task 目录下的 `task.yaml`，筛选 `status: in_progress`
2. 如果有多个，取 `.started` 最近的那个
3. 如果没有 → 提示"没有进行中的 task，无法创建 ADR"

**目标 task 目录**：`.self-workflow/tasks/<task-id>/`

### 步骤 2：确定 ADR 编号

1. 检查目标 task 目录下是否有 `adrs/` 子目录，没有则创建
2. 扫描 `adrs/` 下已有的 ADR 文件，提取编号
3. 下一个编号 = max(existing IDs) + 1，格式化为 3 位（001、002...）

### 步骤 3：选择模板

根据用户指定的模板类型，读取对应模板文件：

| 模板类型 | 模板文件 |
|---------|---------|
| `simple` | `.self-workflow/configs/templates/adr-simple-template.md` |
| `complex` | `.self-workflow/configs/templates/adr-complex-template.md` |
| `review` | `.self-workflow/configs/templates/adr-review-template.md` |

### 步骤 4：填写模板

将模板中的占位符替换为实际内容：

- `<编号>` → 步骤 2 确定的编号
- `<标题>` → 用户提供的标题
- `<YYYY-MM-DD>` → 当前日期
- 其余字段（背景、决策、理由等）→ 通过 `question` 工具向用户收集

**simple 模板**：收集背景、决策、理由
**complex 模板**：收集背景、备选方案（至少 2 个）、选择、理由、影响、反对意见、关联
**review 模板**：收集背景、审查结论（引用审查报告）、决策、理由、讨论记录、影响、关联

### 步骤 5：写入文件

1. 写入 `.self-workflow/tasks/<task-id>/adrs/ADR-<编号>-<标题>.md`
2. 模板中未填写的可选字段可以省略

### 步骤 6：更新 task.yaml

1. 读取 `.self-workflow/tasks/<task-id>/task.yaml`
2. 在 `structure.adrs` 列表中添加新 ADR 文件名
3. 如果 `artifacts` 中不包含 `adrs/`，添加 `"adrs/"` 条目
4. 写入 task.yaml

### 步骤 7：输出结果

使用结构化格式报告结果：

```yaml
adr-created:
  id: "<编号>"
  title: "<标题>"
  type: "<模板类型>"
  path: ".self-workflow/tasks/<task-id>/adrs/ADR-<编号>-<标题>.md"
  task: "<task-id>"
```

## 错误处理

| 场景 | 行为 |
|------|------|
| 无 in_progress task | 提示"没有进行中的 task"，列出所有 task 状态 |
| adrs/ 目录不存在 | 自动创建 |
| 编号冲突 | 自动纠正（取 max+1，而非依赖文件数量） |
| task.yaml 不存在 | 提示先创建 task.yaml |

## 参考

- ADR 模板位置：`.self-workflow/configs/templates/adr-<type>-template.md`
- task.yaml 格式参考：`.self-workflow/tasks/<existing-task>/task.yaml`
