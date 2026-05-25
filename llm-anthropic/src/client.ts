import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  Tool,
  ContentBlock,
} from "@anthropic-ai/sdk/resources/messages.js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

let client: Anthropic;

function getClient(): Anthropic {
  if (client) return client;
  client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
  return client;
}

export interface ChatRequest {
  messages: MessageParam[];
  system?: string;
  tools?: Tool[];
  max_tokens?: number;
}

export interface ChatResponse {
  id: string;
  model: string;
  role: string;
  content: ContentBlock[];
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const model = process.env.LLM_MODEL ?? DEFAULT_MODEL;
  const maxTokens = request.max_tokens ?? 4096;

  const params: Anthropic.MessageCreateParams = {
    model,
    max_tokens: maxTokens,
    messages: request.messages,
  };

  if (request.system) {
    params.system = request.system;
  }

  if (request.tools && request.tools.length > 0) {
    params.tools = request.tools;
  }

  const response = await getClient().messages.create(params);

  return {
    id: response.id,
    model: response.model,
    role: response.role,
    content: response.content,
    stop_reason: response.stop_reason,
    usage: response.usage,
  };
}
