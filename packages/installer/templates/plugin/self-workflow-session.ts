// Self-Workflow Session Plugin
// 监听 session.created 事件，在 chat.system.transform 时注入文档索引到 system prompt。
// marker 检测确保跨 Plugin 重启不重复注入。
import type { PluginInput, Hooks } from "@opencode-ai/plugin";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { resolve, join, basename } from "path";

const DOCS_DIR = ".self-workflow/docs";
const MARKER = "<!-- SELF_WORKFLOW_DOCS_INDEX -->";

let docsContent: string | null = null;

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

function parseFrontmatter(content: string): { title?: string; tags: string[] } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { tags: [] };
  const lines = match[1].split("\n");
  const result: { title?: string; tags: string[] } = { tags: [] };
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

export const server = async (input: PluginInput): Promise<Hooks> => {
  const directory = input.directory;

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        docsContent = scanDocs(directory);
      }
    },

    "experimental.chat.system.transform": async (_input, output) => {
      if (!Array.isArray(output?.system)) return;

      for (const entry of output.system) {
        if (entry.includes(MARKER)) return;
      }

      const content = docsContent ?? scanDocs(directory);
      if (!content) return;

      if (output.system.length > 0) {
        output.system[output.system.length - 1] += "\n\n" + content;
      } else {
        output.system.push(content);
      }
    },
  };
};
