import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { loadEditable, isAllowed } from "../editable-checker.js";
import type { ToolDefinition, ToolHandler } from "../types.js";

const DEFAULT_STORE_URL = "http://store-sqlite:3001";

export const writeFileDefinition: ToolDefinition = {
  name: "write_file",
  description:
    "Write content to a file in the template. Path is relative to the template root. Only files on the allow list (and not on the deny list) can be written.",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Relative path to the file within the template directory",
      },
      content: {
        type: "string",
        description: "The full content to write to the file",
      },
    },
    required: ["path", "content"],
  },
};

export function createWriteFileHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const filePath = input.path as string;
    const content = input.content as string;

    if (!filePath || content === undefined) {
      throw new Error("path and content are required");
    }

    if (filePath.includes("..")) {
      throw new Error("Path traversal is not allowed");
    }

    const editable = await loadEditable(templatePath);
    if (!isAllowed(editable, filePath)) {
      throw new Error(`File "${filePath}" is not allowed to be written (denied or not on allow list)`);
    }

    const absolutePath = join(templatePath, filePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf-8");

    // Log to audit
    const storeUrl = process.env.STORE_URL ?? DEFAULT_STORE_URL;
    try {
      await fetch(`${storeUrl}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: "owneragent",
          action: "write_file",
          target: filePath,
          diff: `Wrote ${content.length} bytes to ${filePath}`,
        }),
      });
    } catch {
      // Audit failure should not block the write
    }

    return JSON.stringify({ success: true });
  };
}
