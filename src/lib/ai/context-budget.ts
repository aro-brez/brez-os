/**
 * Context Budget Management for Owl API
 *
 * Implements token estimation and budget checking to ensure
 * we stay within 90% of the model's context limit.
 */

// Environment variable defaults
const DEFAULT_CONTEXT_LIMIT_TOKENS = 200000;
const DEFAULT_USABLE_RATIO = 0.9;
const DEFAULT_KEEP_LAST_N = 12;

export interface ContextBudgetConfig {
  contextLimitTokens: number;
  usableRatio: number;
  keepLastN: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface BudgetCheckResult {
  withinBudget: boolean;
  estimatedTokens: number;
  budgetTokens: number;
  needsCompression: boolean;
}

/**
 * Get context budget configuration from environment variables
 */
export function getContextBudgetConfig(): ContextBudgetConfig {
  return {
    contextLimitTokens: parseInt(
      process.env.OWL_CONTEXT_LIMIT_TOKENS || String(DEFAULT_CONTEXT_LIMIT_TOKENS),
      10
    ),
    usableRatio: parseFloat(
      process.env.OWL_USABLE_RATIO || String(DEFAULT_USABLE_RATIO)
    ),
    keepLastN: parseInt(
      process.env.OWL_KEEP_LAST_N || String(DEFAULT_KEEP_LAST_N),
      10
    ),
  };
}

/**
 * Estimate token count using chars / 4 approximation
 * This is a fast heuristic that works well for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate total tokens for a system prompt and message array
 */
export function estimateTotalTokens(
  systemPrompt: string,
  messages: Message[]
): number {
  let totalChars = systemPrompt.length;

  for (const msg of messages) {
    // Add role overhead (~4 chars per message for role tokens)
    totalChars += 4;
    totalChars += msg.content.length;
  }

  return estimateTokens(totalChars.toString()) + Math.ceil(totalChars / 4);
}

/**
 * Check if the current context is within budget
 */
export function checkBudget(
  systemPrompt: string,
  messages: Message[],
  config?: ContextBudgetConfig
): BudgetCheckResult {
  const cfg = config || getContextBudgetConfig();
  const budgetTokens = Math.floor(cfg.contextLimitTokens * cfg.usableRatio);
  const estimatedTokens = estimateTotalTokens(systemPrompt, messages);

  return {
    withinBudget: estimatedTokens <= budgetTokens,
    estimatedTokens,
    budgetTokens,
    needsCompression: estimatedTokens > budgetTokens,
  };
}

/**
 * Split messages into those to summarize and those to keep verbatim
 */
export function splitMessagesForCompression(
  messages: Message[],
  keepLastN?: number
): { toSummarize: Message[]; toKeep: Message[] } {
  const cfg = getContextBudgetConfig();
  const keep = keepLastN ?? cfg.keepLastN;

  if (messages.length <= keep) {
    return {
      toSummarize: [],
      toKeep: messages,
    };
  }

  const splitIndex = messages.length - keep;
  return {
    toSummarize: messages.slice(0, splitIndex),
    toKeep: messages.slice(splitIndex),
  };
}
