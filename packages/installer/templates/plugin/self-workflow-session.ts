// Self-Workflow Session Plugin
// 监听 session.created 事件，在 chat.system.transform 时注入文档索引到 system prompt。
// marker 检测确保跨 Plugin 重启不重复注入。
// V1.11: 新增 tool hook——注册 sw_task_list/create/read/phase_update 4 个内置工具。
import type { PluginInput, Hooks } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from "fs";
import { resolve, join, basename } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const DOCS_DIR = ".self-workflow/docs";
const MARKER = "<!-- SELF_WORKFLOW_DOCS_INDEX -->";

const SPECS_DIR = ".self-workflow/specs";
const SPECS_MARKER = "<!-- SELF_WORKFLOW_SPECS -->";

const TASKS_DIR = ".self-workflow/tasks";
const TEMPLATE_PATH = ".self-workflow/configs/tasks/feat-task.yaml";

let docsContent: string | null = null;
let specsContent: string | null = null;
let currentSessionID: string | null = null;

// ─── 通用工具函数 ────────────────────────────────────────────────────────────

function parseCategoryDescriptions(content: string): Record<string, string> {
  const map: Record<string, string> = {};
  const regex = /###\s+(.+?)\s*\/\s*\n+([^\n#]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    const desc = match[2].trim();
    if (name && desc) map[name] = desc;
  }
  return map;
}

function parseFrontmatter(content: string): { title?: string; tags: string[]; summary?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { tags: [] };
  const lines = match[1].split("\n");
  const result: { title?: string; tags: string[]; summary?: string } = { tags: [] };
  for (const line of lines) {
    if (line.startsWith("title:"))
      result.title = line.replace("title:", "").trim().replace(/^["']|["']$/g, "");
    if (line.startsWith("tags:")) {
      const tagStr = line.replace("tags:", "").trim();
      result.tags = tagStr.replace(/[\[\]]/g, "").split(",").map((t) => t.trim()).filter(Boolean);
    }
    if (line.startsWith("summary:"))
      result.summary = line.replace("summary:", "").trim().replace(/^["']|["']$/g, "");
  }
  return result;
}

// ─── 简易 YAML 解析器（task.yaml 专用，无外部依赖） ──────────────────────────

function taskYamlPath(directory: string, workflowId: string): string {
  return resolve(directory, TASKS_DIR, workflowId, "task.yaml");
}

function getNowISO(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "+08:00").replace("T", "T");
}

// ─── Tool: sw_task_list ──────────────────────────────────────────────────────

async function listTasks(directory: string, status?: string) {
  const tasksDir = resolve(directory, TASKS_DIR);
  if (!existsSync(tasksDir)) return [];

  const entries = readdirSync(tasksDir, { withFileTypes: true });
  const tasks: any[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const yamlPath = join(tasksDir, entry.name, "task.yaml");
    if (!existsSync(yamlPath)) continue;
    try {
      const content = readFileSync(yamlPath, "utf-8");
      const data = parseYaml(content);
      if (status && data.status !== status) continue;

      const phases = Array.isArray(data.phases) ? data.phases : [];
      let currentPhase = 1;
      for (const p of phases) {
        if (p.status && p.status !== "completed") { currentPhase = p.id ?? currentPhase; break; }
        currentPhase = (p.id ?? currentPhase) + 1;
      }

      tasks.push({
        workflowId: entry.name,
        title: data.title || "",
        status: data.status || "unknown",
        currentPhase: Math.min(currentPhase, 5),
        created: data.created || "",
        updated: data.updated || "",
        tags: data.tags || [],
      });
    } catch {
      // 跳过解析失败的任务
    }
  }

  return tasks;
}

// ─── Tool: sw_task_create ────────────────────────────────────────────────────

async function createTask(directory: string, slug: string, title: string, description?: string) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const workflowId = `feat-${slug}-${today}`;
  const taskDir = resolve(directory, TASKS_DIR, workflowId);

  if (existsSync(taskDir)) {
    return { error: `Task already exists: ${workflowId}` };
  }

  // 创建目录结构
  mkdirSync(taskDir, { recursive: true });
  mkdirSync(join(taskDir, "adrs"), { recursive: true });
  mkdirSync(join(taskDir, "logs"), { recursive: true });
  mkdirSync(join(taskDir, "artifacts"), { recursive: true });
  mkdirSync(join(taskDir, "errors"), { recursive: true });

  // 读取模板
  const templatePath = resolve(directory, TEMPLATE_PATH);
  if (!existsSync(templatePath)) {
    return { error: `Template not found: ${TEMPLATE_PATH}` };
  }

  let templateContent = readFileSync(templatePath, "utf-8");
  const now = getNowISO();

  // 填充模板占位符
  templateContent = templateContent
    .replace(/<slug>/g, slug)
    .replace(/<描述>/g, title)
    .replace(/<描述原文>/g, description || title)
    .replace(/<YYYY-MM-DD>/g, today.slice(0, 4) + "-" + today.slice(4, 6) + "-" + today.slice(6, 8))
    .replace(/<ISO 8601>/g, now)
    .replace(/<YYYYMMDD>/g, today);

  // 更新 workflow-id 行
  templateContent = templateContent.replace(
    /workflow-id:\s*<[^>]+>/,
    `workflow-id: ${workflowId}`
  );

  writeFileSync(join(taskDir, "task.yaml"), templateContent, "utf-8");
  writeFileSync(join(taskDir, "errors", "errors.yaml"), "errors: []\n", "utf-8");

  return {
    workflowId,
    path: `${TASKS_DIR}/${workflowId}/`,
    created: now,
  };
}

// ─── Tool: sw_task_read ──────────────────────────────────────────────────────

async function readTask(directory: string, workflowId: string) {
  const yamlPath = taskYamlPath(directory, workflowId);
  if (!existsSync(yamlPath)) {
    return { error: `Task not found: ${workflowId}` };
  }
  try {
    const content = readFileSync(yamlPath, "utf-8");
    return parseYaml(content);
  } catch (e: any) {
    return { error: `Failed to read task: ${e.message}` };
  }
}

// ─── Tool: sw_task_phase_update ──────────────────────────────────────────────

async function updatePhase(
  directory: string,
  workflowId: string,
  phaseId: number,
  status: string,
  gate?: string,
  checkpoint?: string
) {
  const yamlPath = taskYamlPath(directory, workflowId);
  if (!existsSync(yamlPath)) {
    return { error: `Task not found: ${workflowId}` };
  }

  try {
    const content = readFileSync(yamlPath, "utf-8");
    // 直接文本替换 phase 状态——避免完整 YAML rewrite 破坏格式
    let updated = content;
    const now = getNowISO();

    // 查找 phase 块并更新
    const phaseRegex = new RegExp(
      `(  - id:\\s*${phaseId}\\n[\\s\\S]*?)(?=\\n  - id:|\\n(?:experience-draft|structure:|milestones:|cross-refs:)|$)`,
      "m"
    );
    const match = updated.match(phaseRegex);
    if (!match) return { error: `Phase ${phaseId} not found in task.yaml` };

    let phaseBlock = match[0];

    // 更新 status
    phaseBlock = phaseBlock.replace(/status:\s*\w+/, `status: ${status}`);
    if (gate) {
      phaseBlock = phaseBlock.replace(/gate:\s*\w+/, `gate: ${gate}`);
    }
    // checkpoint 处理
    let warning: string | undefined;
    if (checkpoint && checkpoint.trim()) {
      if (/checkpoint:/.test(phaseBlock)) {
        phaseBlock = phaseBlock.replace(/checkpoint:\s*null\b/, `checkpoint: ${checkpoint}`);
      } else {
        // 旧模板无 checkpoint 字段：在 errors: 前插入；如 errors: 也不存在，在 artifact: 行后插入
        if (/errors:/.test(phaseBlock)) {
          phaseBlock = phaseBlock.replace(/(\n\s*errors:)/, `\n    checkpoint: ${checkpoint}$1`);
        } else {
          phaseBlock = phaseBlock.replace(/(\n\s*artifact:[^\n]*)/, `$1\n    checkpoint: ${checkpoint}`);
        }
      }
    }
    if (gate === "passed" && (!checkpoint || !checkpoint.trim())) {
      warning = "gate passed but checkpoint not provided";
    }
    // started 字段处理（幂等保护）
    if (status === "in_progress") {
      const hasValidStarted = /started:\s*\S/.test(phaseBlock) && !/started:\s*null/.test(phaseBlock);
      if (!hasValidStarted) {
        if (/started:\s*null/.test(phaseBlock)) {
          phaseBlock = phaseBlock.replace(/started:\s*null\b/, `started: ${now}`);
        } else {
          const statusLineIdx = phaseBlock.indexOf(`status: ${status}`);
          if (statusLineIdx !== -1) {
            const afterStatus = phaseBlock.indexOf("\n", statusLineIdx);
            phaseBlock = phaseBlock.slice(0, afterStatus) + `\n    started: ${now}` + phaseBlock.slice(afterStatus);
          }
        }
      }
    }
    // 设置 completed
    if (status === "completed" || status === "failed") {
      phaseBlock = phaseBlock.replace(/completed:\s*null/, `completed: ${now}`);
    }

    updated = updated.replace(phaseRegex, phaseBlock);
    // 更新顶层 updated
    updated = updated.replace(/updated:\s*.+$/, `updated: ${now}`);
    // 更新顶层 status
    if (status === "completed" && phaseId === 5) {
      updated = updated.replace(/^status:\s*.+$/m, `status: completed`);
    }

    writeFileSync(yamlPath, updated, "utf-8");
    const result: any = { updated: true, phase: { id: phaseId, status, gate: gate || null } };
    if (warning) result.warning = warning;
    return result;
  } catch (e: any) {
    return { error: `Failed to update phase: ${e.message}` };
  }
}

// ─── 现有 scan 函数 ──────────────────────────────────────────────────────────

function scanDocs(directory: string): string | null {
  const docsDir = resolve(directory, DOCS_DIR);
  if (!existsSync(docsDir)) return null;

  try {
    const readmePath = join(docsDir, "README.md");
    const readmeContent = existsSync(readmePath)
      ? readFileSync(readmePath, "utf-8")
      : "";
    const categoryDescriptions = parseCategoryDescriptions(readmeContent);
    if (Object.keys(categoryDescriptions).length === 0) return null;

    const categories = Object.keys(categoryDescriptions).filter((cat) => {
      const full = join(docsDir, cat);
      return existsSync(full) && statSync(full).isDirectory();
    });
    if (categories.length === 0) return null;

    const lines: string[] = [];
    lines.push(MARKER);
    lines.push("");
    lines.push("## Self-Workflow 经验文档索引");
    lines.push("");
    lines.push("docs/ 下的分类目录及其作用：");
    for (const cat of categories) {
      lines.push(`- ${cat}/ — ${categoryDescriptions[cat]}`);
    }
    lines.push("");

    for (const cat of categories) {
      const catDir = join(docsDir, cat);
      const files = readdirSync(catDir).filter((f) => f.endsWith(".md"));
      if (files.length === 0) continue;

      lines.push(`### ${cat}/`);
      for (const file of files) {
        try {
          const content = readFileSync(join(catDir, file), "utf-8");
          const fm = parseFrontmatter(content);
          const displayName = fm.title || basename(file, ".md");
          const tagStr = fm.tags.length > 0 ? ` [${fm.tags.join(", ")}]` : "";
          lines.push(`  ${displayName}${tagStr}`);
        } catch {
          lines.push(`  ${file}`);
        }
      }
      lines.push("");
    }

    lines.push("遇到相关主题时，用 Read 工具查看对应文档。无需加载全文到上下文。");
    return lines.join("\n");
  } catch {
    return null;
  }
}

function scanSpecs(directory: string): string | null {
  const specsDir = resolve(directory, SPECS_DIR);
  if (!existsSync(specsDir)) return null;

  try {
    const readmePath = join(specsDir, "README.md");
    const readmeContent = existsSync(readmePath)
      ? readFileSync(readmePath, "utf-8")
      : "";
    const categoryDescriptions = parseCategoryDescriptions(readmeContent);

    const defaultDir = join(specsDir, "default");
    if (!existsSync(defaultDir) || !statSync(defaultDir).isDirectory()) return null;

    const specFiles = readdirSync(defaultDir).filter((f) => f.endsWith(".md"));
    if (specFiles.length === 0) return null;

    const lines: string[] = [];
    lines.push(SPECS_MARKER);
    lines.push("");
    lines.push("## ⚠️ Self-Workflow 项目规范（必须遵守）");
    lines.push("");

    const defaultDesc = categoryDescriptions["default"];
    if (defaultDesc) {
      lines.push(defaultDesc);
    } else {
      lines.push("specs/default/ 下的规范**始终生效**，Agent 在每次会话中都必须遵守。");
    }
    lines.push("读取每个 spec 文件的 frontmatter 和内容，按遵循执行。");
    lines.push("");

    lines.push("### default/（始终生效）");
    lines.push("");

    for (const file of specFiles) {
      try {
        const content = readFileSync(join(defaultDir, file), "utf-8");
        const fm = parseFrontmatter(content);
        const fileName = basename(file, ".md");
        const tagStr = fm.tags.length > 0 ? ` [${fm.tags.join(", ")}]` : "";
        const summary = fm.summary || "";
        lines.push(`- **${fileName}**${tagStr} — ${summary}`);
      } catch {
        lines.push(`- ${basename(file, ".md")}`);
      }
    }

    lines.push("");
    lines.push("### 如何使用");
    lines.push("");
    lines.push("- default/ 下的 spec 始终生效，Agent 用 Read 工具查看完整内容");
    lines.push("- 其他 spec 按需加载：根据任务关键词匹配 spec 的 tags");
    lines.push("- 遇到不确定时主动查阅 spec 文件");

    return lines.join("\n");
  } catch {
    return null;
  }
}

// ─── Plugin Server ───────────────────────────────────────────────────────────

export const server = async (input: PluginInput): Promise<Hooks> => {
  const directory = input.directory;
  const client = input.client;

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        // 仅捕获主 session（无 parent_id），排除子 Agent session
        const props = event.properties as any;
        if (props.info && !props.info.parent_id) {
          currentSessionID = props.sessionID;
        }
        docsContent = scanDocs(directory);
        specsContent = scanSpecs(directory);
      }
    },

    // ── 内置工具 ──────────────────────────────────────────────────────
    tool: {
      sw_task_list: tool({
        description:
          "扫描 .self-workflow/tasks/*/task.yaml，返回所有任务状态。可选按 status 过滤。",
        args: {
          status: z
            .enum(["in_progress", "pending", "completed", "cancelled"])
            .optional()
            .describe("按任务状态过滤"),
        },
        async execute(args, ctx) {
          const tasks = await listTasks(ctx.directory, args.status);
          return { output: JSON.stringify(tasks, null, 2) };
        },
      }),

      sw_task_create: tool({
        description:
          "从 feat-task.yaml 模板创建完整 task 目录结构和初始化文件（task.yaml + errors.yaml）。",
        args: {
          slug: z.string().describe("任务 slug（如 'agent自主决策-feat增强'）"),
          title: z.string().describe("任务标题"),
          description: z.string().optional().describe("任务描述"),
        },
        async execute(args, ctx) {
          const result = await createTask(ctx.directory, args.slug, args.title, args.description);
          return { output: JSON.stringify(result, null, 2) };
        },
      }),

      sw_task_read: tool({
        description: "读取指定 task.yaml，返回解析后的结构化 JSON 数据。",
        args: {
          workflowId: z.string().describe("workflow-id（如 'feat-agent自主决策-feat增强-20260607'）"),
        },
        async execute(args, ctx) {
          const result = await readTask(ctx.directory, args.workflowId);
          return { output: JSON.stringify(result, null, 2) };
        },
      }),

      sw_task_phase_update: tool({
        description:
          "更新 task.yaml 中指定 phase 的 status/gate 和时间戳，自动设置 started/completed 时间。",
        args: {
          workflowId: z.string().describe("workflow-id"),
          phaseId: z.number().min(1).max(5).describe("阶段编号 1-5"),
          status: z.enum(["pending", "in_progress", "completed", "failed"]).describe("新状态"),
          gate: z.enum(["pending", "passed", "failed"]).optional().describe("Gate 状态（可选）"),
          checkpoint: z.string().optional().describe("Gate 通过时的 checkpoint SHA（git tag commit hash）"),
        },
        async execute(args, ctx) {
          const result = await updatePhase(
            ctx.directory,
            args.workflowId,
            args.phaseId,
            args.status,
            args.gate,
            args.checkpoint
          );
          return { output: JSON.stringify(result, null, 2) };
        },
      }),

      sw_session_rename: tool({
        description:
          "重命名当前 OpenCode session 标题。用于 /feat 启动时设置辨识度高的会话名（如 'feat-文档工具规范修补-20260607'）。",
        args: {
          title: z.string().describe("新的 session 标题"),
        },
        async execute(args, _ctx) {
          if (!currentSessionID) {
            return { output: JSON.stringify({ error: "No active session found. The plugin may not have captured the session ID yet." }) };
          }
          try {
            await client.session.update({
              sessionID: currentSessionID,
              title: args.title,
            });
            return { output: JSON.stringify({ success: true, title: args.title }) };
          } catch (e: any) {
            return { output: JSON.stringify({ error: `Failed to rename session: ${e.message}` }) };
          }
        },
      }),
    },

    // ── 现有 hooks ────────────────────────────────────────────────────

    "experimental.chat.system.transform": async (_input, output) => {
      if (!Array.isArray(output?.system)) return;

      let hasDocsMarker = false;
      for (const entry of output.system) {
        if (entry.includes(MARKER)) { hasDocsMarker = true; break; }
      }
      if (!hasDocsMarker) {
        const content = docsContent ?? scanDocs(directory);
        if (content) {
          if (output.system.length > 0) {
            output.system[output.system.length - 1] += "\n\n" + content;
          } else {
            output.system.push(content);
          }
        }
      }

      let hasSpecsMarker = false;
      for (const entry of output.system) {
        if (entry.includes(SPECS_MARKER)) { hasSpecsMarker = true; break; }
      }
      if (!hasSpecsMarker) {
        const specContent = specsContent ?? scanSpecs(directory);
        if (specContent) {
          if (output.system.length > 0) {
            output.system[output.system.length - 1] += "\n\n" + specContent;
          } else {
            output.system.push(specContent);
          }
        }
      }
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool !== "task") return;
      if (!output.args?.subagent_type) return;

      const docs = docsContent ?? scanDocs(directory);
      const specs = specsContent ?? scanSpecs(directory);
      const context = [specs, docs].filter(Boolean).join("\n\n");

      if (context) {
        output.args.prompt = `${context}\n\n---\n\n${output.args.prompt || ""}`;
      }
    },
  };
};
