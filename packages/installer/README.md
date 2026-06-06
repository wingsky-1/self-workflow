# Self-Workflow Installer

## 目录架构

packages/installer/templates/     # 模板源（权威源）
    ├── agents/       → 通过 init --force → .opencode/agents/
    ├── commands/     → 通过 init --force → .opencode/commands/
    ├── skills/       → 通过 init --force → .opencode/skills/
    ├── plugin/       → 通过 init --force → .opencode/plugins/
    ├── configs/      → 通过 init --force → .self-workflow/configs/
    ├── docs/         → 通过 init --force → .self-workflow/docs/（骨架）
    ├── specs/        → 通过 init --force → .self-workflow/specs/
    └── tasks/        → 通过 init --force → .self-workflow/configs/tasks/（任务模板）

使用方法：
    node packages/installer/index.js init --target .     # 首次安装（不覆盖已有文件）
    node packages/installer/index.js init --target . --force  # 强制同步（覆盖已有文件）

运行时目录：
    .opencode/         # OpenCode 运行时文件（由安装器管理，禁止直接修改）
    .self-workflow/    # 工作流运行时文件
      ├── configs/     # 由安装器管理 → 修改需通过模板源
      ├── docs/        # 由工作流直接写入 → 可直接编辑
      ├── specs/       # 由安装器管理 → 修改需通过模板源
      └── tasks/       # 由工作流直接写入 → 可直接编辑
