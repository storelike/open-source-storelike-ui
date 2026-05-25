export interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export type ToolHandler = (input: Record<string, unknown>) => Promise<string>;

export interface AgentResult {
  reply: string;
  actions: Array<{
    tool: string;
    input: Record<string, unknown>;
    result: string;
  }>;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  auth_token: string;
  template?: string;
}

export interface ChatResponse {
  reply: string;
  actions?: Array<{
    tool: string;
    input: Record<string, unknown>;
    result: string;
  }>;
}

export interface LlmResponse {
  id: string;
  model: string;
  role: string;
  content: Array<TextBlock | ToolUseBlock>;
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | string | null;
  usage: { input_tokens: number; output_tokens: number };
}

export interface EditableConfig {
  allow: string[];
  deny: string[];
}

export interface ProductFrontmatter {
  slug: string;
  title: string;
  snippet: string;
  price: number;
  discount?: number;
  category: string;
  tags: string[];
  is_active: boolean;
  is_delivery: boolean;
}
