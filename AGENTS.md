使用中文进行交流，英文进行思考

本项目是自举开发

不要修改.opencode中的文件，要通过安装器导入

修改 .self-workflow/configs/ 和 .self-workflow/specs/ 的文件前，先改 packages/installer/templates/ 中的模板源，再运行 node packages/installer/index.js init --target . --force 同步。
.tasks/ .docs/ 可直接修改。

## Todo 体系
项目 todo 列表位于 `.self-workflow/todo.md`。
- P0 = 阻断框架成熟度（必须在本迭代完成）
- P1 = 质量改善（应在近期完成）
- P2 = 愿景（远期规划）
- 版本分组：`## Vx.y.z：标题（优先级）`
- 已完成项移入 `## 已关闭` 区域，使用 `<details>` 折叠
- 已拒绝项标注 `[wontfix]` 并附拒绝理由
- `## 新增（待评审排期）` 是未分配版本的"待办收件箱"——整理 todo 时必须保留此章节，不可随版本清理被删除
