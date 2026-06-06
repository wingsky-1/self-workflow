// Self-Workflow Session Plugin
// 监听 session.created 事件，在 chat.system.transform 时注入文档索引到 system prompt。
// marker 检测确保跨 Plugin 重启不重复注入。
import type { PluginInput, Hooks } from "@opencode-ai/plugin";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { resolve, join, basename } from "path";

const DOCS_DIR = ".self-workflow/docs";
const MARKER = "<!-- SELF_WORKFLOW_DOCS_INDEX -->";

const SPECS_DIR = ".self-workflow/specs";
const SPECS_MARKER = "<!-- SELF_WORKFLOW_SPECS -->";

let docsContent: string | null = null;
let specsContent: string | null = null;

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
      result.tags = tagStr
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (line.startsWith("summary:"))
      result.summary = line.replace("summary:", "").trim().replace(/^["']|["']$/g, "");
  }
  return result;
}

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
          const tagStr =
            fm.tags.length > 0 ? ` [${fm.tags.join(", ")}]` : "";
          lines.push(`  ${displayName}${tagStr}`);
        } catch {
          lines.push(`  ${file}`);
        }
      }
      lines.push("");
    }

    lines.push(
      "遇到相关主题时，用 Read 工具查看对应文档。无需加载全文到上下文。"
    );

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

export const server = async (input: PluginInput): Promise<Hooks> => {
  const directory = input.directory;

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        docsContent = scanDocs(directory);
        specsContent = scanSpecs(directory);
      }
    },

    "experimental.chat.system.transform": async (_input, output) => {
      if (!Array.isArray(output?.system)) return;

      // 注入 docs 索引（独立检查，不阻断 specs 注入）
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

      // 注入 specs 索引（独立检查，不阻断 docs 注入）
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

    // 子 Agent 上下文注入（Trellis 模式：拦截 Task 工具调用，修改 prompt）
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "task") return;
      if (!output.args?.subagent_type) return;

      // 注入 docs 和 specs 到子 Agent 的 prompt 开头
      const docs = docsContent ?? scanDocs(directory);
      const specs = specsContent ?? scanSpecs(directory);
      const context = [specs, docs].filter(Boolean).join("\n\n");

      if (context) {
        output.args.prompt = `${context}\n\n---\n\n${output.args.prompt || ""}`;
      }
    },
  };
};
