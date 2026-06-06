使用中文进行交流

本项目是自举开发

不要修改.opencode中的文件，要通过安装器导入

修改 .self-workflow/configs/ 和 .self-workflow/specs/ 的文件前，先改 packages/installer/templates/ 中的模板源，再运行 node packages/installer/index.js init --target . --force 同步。
.tasks/ .docs/ 可直接修改。
