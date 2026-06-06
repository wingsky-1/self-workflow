#!/usr/bin/env node

/**
 * Self-Workflow 安装器
 *
 * 职责：创建项目的工作流目录结构，复制模板文件。
 * 不包含业务逻辑——所有模板内容在 templates/ 目录中维护。
 *
 * Usage:
 *   node index.js init                     # 安装到当前目录
 *   node index.js init --target <dir>      # 安装到指定目录
 *   node index.js init --dry-run           # 预览模式
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, "templates");

// ─── File manifest ──────────────────────────────────────────────────────────

const MANIFEST = [
  // target-path                            source-path (relative to templates/)
  [".self-workflow/configs/guides/feat-workflow.md",     "configs/guides/feat-workflow.md"],
  [".self-workflow/configs/templates/analysis-template.md",    "configs/templates/analysis-template.md"],
  [".self-workflow/configs/templates/design-template.md",        "configs/templates/design-template.md"],
  [".self-workflow/configs/templates/review-report-template.md", "configs/templates/review-report-template.md"],
  [".self-workflow/configs/templates/summary-template.md",  "configs/templates/summary-template.md"],
  [".self-workflow/configs/templates/implementation-template.md", "configs/templates/implementation-template.md"],
  [".self-workflow/configs/templates/verification-template.md", "configs/templates/verification-template.md"],
  [".self-workflow/configs/templates/error-log-template.md", "configs/templates/error-log-template.md"],
  [".self-workflow/configs/templates/workflow-metadata-template.yaml", "configs/templates/workflow-metadata-template.yaml"],
  [".opencode/agents/review-agent.md",        "agents/review-agent.md"],
];

const EMPTY_DIRS = [
  ".self-workflow/configs/guides",
  ".self-workflow/configs/templates",
  ".self-workflow/tasks",
  ".self-workflow/docs",
  ".self-workflow/specs",
  ".opencode/agents",
];

// ─── Init Command ───────────────────────────────────────────────────────────

function init(targetDir, dryRun) {
  const resolvedTarget = path.resolve(targetDir);
  const actions = [];

  if (!fs.existsSync(resolvedTarget)) {
    console.error(`❌ 目标目录不存在：${resolvedTarget}`);
    process.exit(1);
  }

  // ── Empty directories ──────────────────────────────

  for (const dir of EMPTY_DIRS) {
    const fullPath = path.join(resolvedTarget, dir);
    if (!fs.existsSync(fullPath)) {
      actions.push({ type: "create", message: `创建目录 ${dir}/` });
      if (!dryRun) fs.mkdirSync(fullPath, { recursive: true });
    } else {
      actions.push({ type: "exists", message: `目录已存在 ${dir}/` });
    }
  }

  // ── Template files ─────────────────────────────────

  for (const [targetRelPath, sourceRelPath] of MANIFEST) {
    const targetPath = path.join(resolvedTarget, targetRelPath);
    const sourcePath = path.join(TEMPLATES_DIR, sourceRelPath);

    if (!fs.existsSync(sourcePath)) {
      actions.push({ type: "error", message: `模板缺失：${sourceRelPath}` });
      continue;
    }

    if (!fs.existsSync(targetPath)) {
      const content = fs.readFileSync(sourcePath, "utf-8");
      actions.push({ type: "create", message: `写入 ${targetRelPath}` });
      if (!dryRun) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content, "utf-8");
      }
    } else {
      actions.push({ type: "exists", message: `文件已存在 ${targetRelPath}（跳过）` });
    }
  }

  // ── Report ─────────────────────────────────────────

  const hasErrors = actions.some((a) => a.type === "error");

  if (dryRun) {
    console.log("\n  ⚠️  DRY-RUN 模式 — 未写入任何文件\n");
  }

  console.log("\n  📋 安装报告");
  console.log(`  目标目录：${resolvedTarget}`);
  console.log(`  操作：${actions.length} 项\n`);

  for (const action of actions) {
    const icon =
      action.type === "create" ? "  ✅" :
      action.type === "exists" ? "  ⚠️" :
      "  ❌";
    console.log(`  ${icon}  ${action.message}`);
  }

  console.log("\n  ────────────────────────────────────────────");

  if (hasErrors) {
    console.log("  ⚠️  安装完成，但有错误（见上）。");
  } else {
    console.log("  ✅ 安装完成，无需额外配置。");
    console.log("  📖 工作流指引：.self-workflow/configs/guides/feat-workflow.md");
    console.log("  🛡️  Review Agent：.opencode/agents/review-agent.md");
  }

  console.log("  ────────────────────────────────────────────\n");
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(args) {
  const options = { command: null, target: process.cwd(), dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--target" || arg === "-t") {
      options.target = args[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (!arg.startsWith("--")) {
      options.command = arg;
    }
  }

  return options;
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options.command || options.command === "init") {
    console.log("");
    console.log("  ╔══════════════════════════════════════╗");
    console.log("  ║       Self-Workflow 安装器           ║");
    console.log("  ║      版本 0.1.0 · V1 预备            ║");
    console.log("  ╚══════════════════════════════════════╝");
    init(options.target, options.dryRun);
  } else {
    console.error(`未知命令：${options.command}`);
    console.error("用法：node index.js init [--target <dir>] [--dry-run]");
    process.exit(1);
  }
}

main();
