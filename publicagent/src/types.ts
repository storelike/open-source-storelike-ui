export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface FaqEntry {
  id: number;
  question: string;
  answer: string;
  source?: string;
}

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmResponse {
  id: string;
  model: string;
  role: string;
  content: Array<{ type: "text"; text: string }>;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}
