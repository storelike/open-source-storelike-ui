import type {
  Message,
  ToolDefinition,
  ToolHandler,
  AgentResult,
  LlmResponse,
  TextBlock,
  ToolUseBlock,
  ToolResultBlock,
} from "./types.js";

export async function runAgentLoop(
  llmUrl: string,
  messages: Message[],
  systemPrompt: string,
  tools: ToolDefinition[],
  toolHandlers: Map<string, ToolHandler>,
  maxIterations: number = 10
): Promise<AgentResult> {
  const actions: AgentResult["actions"] = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const response = await fetch(`${llmUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        system: systemPrompt,
        tools,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${errorText}`);
    }

    const llmData: LlmResponse = (await response.json()) as LlmResponse;

    // If end_turn, extract text and return
    if (llmData.stop_reason === "end_turn" || llmData.stop_reason === "max_tokens") {
      const replyText = llmData.content
        .filter((block): block is TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      return { reply: replyText, actions };
    }

    // If tool_use, execute tools and continue
    if (llmData.stop_reason === "tool_use") {
      // Add the assistant message with all content blocks
      messages.push({
        role: "assistant",
        content: llmData.content,
      });

      const toolUseBlocks = llmData.content.filter(
        (block): block is ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: ToolResultBlock[] = [];

      for (const toolUse of toolUseBlocks) {
        const handler = toolHandlers.get(toolUse.name);

        let resultText: string;
        let isError = false;

        if (!handler) {
          resultText = `Error: Unknown tool "${toolUse.name}"`;
          isError = true;
        } else {
          try {
            resultText = await handler(toolUse.input);
          } catch (err: unknown) {
            resultText = `Error: ${err instanceof Error ? err.message : "Unknown error"}`;
            isError = true;
          }
        }

        actions.push({
          tool: toolUse.name,
          input: toolUse.input,
          result: resultText,
        });

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: resultText,
          is_error: isError,
        });
      }

      // Add tool results as a user message (Anthropic API format)
      messages.push({
        role: "user",
        content: toolResults,
      });

      continue;
    }

    // Unknown stop reason — extract any text and return
    const fallbackReply = llmData.content
      .filter((block): block is TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return { reply: fallbackReply || "Agent loop ended unexpectedly.", actions };
  }

  return {
    reply: "I reached the maximum number of steps. Please try breaking your request into smaller tasks.",
    actions,
  };
}
