import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadEditable, isAllowed } from "../editable-checker.js";
import type { ToolDefinition, ToolHandler } from "../types.js";

export const readFileDefinition: ToolDefinition = {
  name: "read_file",
  description:
    "Read the contents of a file from the template. Path is relative to the template root. Only files on the allow list can be read.",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Relative path to the file within the template directory",
      },
    },
    required: ["path"],
  },
};

export function createReadFileHandler(templatePath: string): ToolHandler {
  return async (input: Record<string, unknown>): Promise<string> => {
    const filePath = input.path as string;

    if (!filePath) {
      throw new Error("path is required");
    }

    // Prevent path traversal
    if (filePath.includes("..")) {
      throw new Error("Path traversal is not allowed");
    }

    const editable = await loadEditable(templatePath);
    if (!isAllowed(editable, filePath)) {
      throw new Error(`File "${filePath}" is not on the allow list`);
    }

    const absolutePath = join(templatePath, filePath);
    const content = await readFile(absolutePath, "utf-8");
    return content;
  };
}
