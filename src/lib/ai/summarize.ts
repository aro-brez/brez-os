/**
 * Message Summarization for Owl API Context Compression
 *
 * Uses Anthropic Claude to summarize older messages into a MEMORY block
 * when context budget is exceeded.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Message } from "./context-budget";

const SUMMARIZATION_SYSTEM_PROMPT = `You are a conversation summarizer. Your job is to create a concise summary of the conversation history that preserves:
1. Key decisions made
2. Important facts and context established
3. User preferences and requirements mentioned
4. Any ongoing tasks or goals

Output ONLY the summary as bullet points. Be concise but comprehensive. Do not include any preamble or explanation.`;

export interface SummarizeResult {
  memoryBlock: string;
  originalMessageCount: number;
  estimatedTokensSaved: number;
}

/**
 * Summarize a list of messages into a MEMORY block
 */
export async function summarizeMessages(
  messages: Message[],
  anthropicClient: Anthropic
): Promise<SummarizeResult> {
  if (messages.length === 0) {
    return {
      memoryBlock: "",
      originalMessageCount: 0,
      estimatedTokensSaved: 0,
    };
  }

  // Format messages for summarization
  const conversationText = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  // Estimate original tokens (chars / 4 approximation)
  const originalTokens = Math.ceil(conversationText.length / 4);

  try {
    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SUMMARIZATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please summarize the following conversation:\n\n${conversationText}`,
        },
      ],
    });

    const summaryContent = response.content[0];
    if (summaryContent.type !== "text") {
      throw new Error("Unexpected response type from summarization");
    }

    const summary = summaryContent.text;
    const summaryTokens = Math.ceil(summary.length / 4);

    // Format as MEMORY block
    const memoryBlock = `[MEMORY - Summary of ${messages.length} earlier messages]\n${summary}\n[END MEMORY]`;

    return {
      memoryBlock,
      originalMessageCount: messages.length,
      estimatedTokensSaved: Math.max(0, originalTokens - summaryTokens - 50), // 50 tokens for MEMORY wrapper
    };
  } catch (error) {
    console.error("Failed to summarize messages:", error);
    // Fallback: create a simple count-based memory block
    const fallbackMemory = `[MEMORY - ${messages.length} earlier messages summarized]\nConversation history compressed. Key context may need to be re-established.\n[END MEMORY]`;
    return {
      memoryBlock: fallbackMemory,
      originalMessageCount: messages.length,
      estimatedTokensSaved: Math.max(0, originalTokens - 100),
    };
  }
}

/**
 * Create a compressed message array with MEMORY block prepended
 */
export async function compressConversation(
  toSummarize: Message[],
  toKeep: Message[],
  anthropicClient: Anthropic
): Promise<Message[]> {
  if (toSummarize.length === 0) {
    return toKeep;
  }

  const { memoryBlock } = await summarizeMessages(toSummarize, anthropicClient);

  // Prepend MEMORY block as a user message that the assistant has "seen"
  const memoryMessage: Message = {
    role: "user",
    content: memoryBlock,
  };

  // Add an acknowledgment from assistant to maintain alternating structure
  const ackMessage: Message = {
    role: "assistant",
    content: "I understand. I have the context from our earlier conversation.",
  };

  return [memoryMessage, ackMessage, ...toKeep];
}
