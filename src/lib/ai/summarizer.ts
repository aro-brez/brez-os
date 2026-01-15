/**
 * Rules-based Summarizer (V1)
 * V2 will integrate with Claude API for intelligent summarization
 */

import { Huddle, Task, Department } from "../data/schemas";
import { devStore } from "../data/devStore";

export interface HuddleSummary {
  summary: string;
  decisions: string[];
  actionItems: {
    text: string;
    assignee?: string;
    dueDate?: string;
  }[];
  keyTopics: string[];
}

/**
 * Extract action items from text (simple pattern matching)
 */
function extractActionItems(text: string): { text: string; assignee?: string }[] {
  const items: { text: string; assignee?: string }[] = [];
  const lines = text.split(/[\n.]/);

  // Patterns that indicate action items
  const actionPatterns = [
    /(?:TODO|Action|Task|Follow[- ]?up):\s*(.+)/i,
    /(?:@\w+)\s+(?:will|should|needs? to|to)\s+(.+)/i,
    /(?:We need to|Need to|Should|Must|Will)\s+(.+)/i,
    /(?:\[Action\]|\[TODO\])\s*(.+)/i,
  ];

  // Pattern to extract assignee
  const assigneePattern = /@(\w+)/;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) return;

    for (const pattern of actionPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const assigneeMatch = trimmed.match(assigneePattern);
        items.push({
          text: match[1]?.trim() || trimmed,
          assignee: assigneeMatch ? assigneeMatch[1] : undefined,
        });
        break;
      }
    }
  });

  return items;
}

/**
 * Extract decisions from text
 */
function extractDecisions(text: string): string[] {
  const decisions: string[] = [];
  const lines = text.split(/[\n]/);

  const decisionPatterns = [
    /(?:Decision|Decided|Agreed|We will|Going forward):\s*(.+)/i,
    /(?:\[Decision\])\s*(.+)/i,
    /(?:Final decision|Conclusion):\s*(.+)/i,
  ];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    for (const pattern of decisionPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        decisions.push(match[1]?.trim() || trimmed);
        break;
      }
    }
  });

  return decisions;
}

/**
 * Extract key topics/themes from text
 */
function extractKeyTopics(text: string): string[] {
  const topicKeywords = [
    "CAC", "conversion", "revenue", "growth", "retail", "DTC",
    "inventory", "cash", "budget", "marketing", "ads", "creative",
    "subscription", "churn", "velocity", "margin", "customer",
  ];

  const mentioned = new Set<string>();
  const lower = text.toLowerCase();

  topicKeywords.forEach((keyword) => {
    if (lower.includes(keyword.toLowerCase())) {
      mentioned.add(keyword);
    }
  });

  return Array.from(mentioned).slice(0, 5);
}

/**
 * Generate a simple summary (V1: template-based)
 */
function generateSummary(text: string, decisions: string[], actionItems: { text: string }[]): string {
  const wordCount = text.split(/\s+/).length;
  const duration = Math.ceil(wordCount / 150); // Rough estimate: 150 words per minute

  let summary = `Meeting covered ${extractKeyTopics(text).join(", ") || "various topics"}.`;

  if (decisions.length > 0) {
    summary += ` ${decisions.length} decision(s) were made.`;
  }

  if (actionItems.length > 0) {
    summary += ` ${actionItems.length} action item(s) identified.`;
  }

  summary += ` Estimated discussion time: ${duration} minutes.`;

  return summary;
}

/**
 * Process huddle notes/transcript and generate summary
 */
export function summarizeHuddle(notes: string, transcript?: string): HuddleSummary {
  const fullText = [notes, transcript].filter(Boolean).join("\n\n");

  const actionItems = extractActionItems(fullText);
  const decisions = extractDecisions(fullText);
  const keyTopics = extractKeyTopics(fullText);
  const summary = generateSummary(fullText, decisions, actionItems);

  return {
    summary,
    decisions,
    actionItems,
    keyTopics,
  };
}

/**
 * Create tasks from huddle action items
 */
export function createTasksFromHuddle(
  huddle: Huddle,
  channelDepartment: Department
): Task[] {
  const users = devStore.getUsers();
  const createdTasks: Task[] = [];

  huddle.actionItems.forEach((item) => {
    if (item.taskId) return; // Already has a task

    // Try to find assignee by name
    let ownerId: string | null = null;
    if (item.assigneeId) {
      ownerId = item.assigneeId;
    } else {
      // Try to match from text patterns like "@sarah" or "Sarah will"
      const nameMatch = item.text.match(/@?([A-Z][a-z]+)/);
      if (nameMatch) {
        const user = users.find((u) =>
          u.name.toLowerCase().includes(nameMatch[1].toLowerCase())
        );
        if (user) ownerId = user.id;
      }
    }

    const task = devStore.addTask({
      title: item.text.slice(0, 100),
      description: `From huddle: ${huddle.title}`,
      ownerId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 1 week
      status: "todo",
      priority: "medium",
      department: channelDepartment,
      goalId: null,
      projectId: null,
      attachments: [],
    });

    createdTasks.push(task);
  });

  return createdTasks;
}

/**
 * Generate channel update message from huddle
 */
export function generateHuddleUpdateMessage(summary: HuddleSummary, huddleTitle: string): string {
  let message = `**Huddle Summary: ${huddleTitle}**\n\n`;
  message += `${summary.summary}\n\n`;

  if (summary.decisions.length > 0) {
    message += `**Decisions:**\n`;
    summary.decisions.forEach((d, i) => {
      message += `${i + 1}. ${d}\n`;
    });
    message += "\n";
  }

  if (summary.actionItems.length > 0) {
    message += `**Action Items:**\n`;
    summary.actionItems.forEach((item, i) => {
      const assignee = item.assignee ? ` (@${item.assignee})` : "";
      message += `${i + 1}. ${item.text}${assignee}\n`;
    });
  }

  return message;
}

/**
 * V2 Interface - Will be replaced with Claude API integration
 */
export async function summarizeWithAI(
  _notes: string,
  _transcript?: string
): Promise<HuddleSummary> {
  // V2: Will integrate with Claude API for intelligent summarization
  // Currently uses rules-based extraction as fallback
  return summarizeHuddle(_notes, _transcript);
}

/**
 * Analyze customer feedback and generate insights
 */
export interface CustomerInsights {
  topComplaints: { theme: string; count: number; examples: string[] }[];
  topPraises: { theme: string; count: number; examples: string[] }[];
  priceSensitivity: { mentions: string[]; averagePrice?: number };
  overallSentiment: { positive: number; neutral: number; negative: number };
}

export function analyzeCustomerFeedback(): CustomerInsights {
  const messages = devStore.getCustomerMessages();

  // Count themes by sentiment
  const complaintThemes = new Map<string, { count: number; examples: string[] }>();
  const praiseThemes = new Map<string, { count: number; examples: string[] }>();
  const priceMentions: string[] = [];

  let positive = 0, neutral = 0, negative = 0;

  messages.forEach((msg) => {
    // Count sentiment
    if (msg.sentiment === "positive") positive++;
    else if (msg.sentiment === "negative") negative++;
    else neutral++;

    // Collect price mentions
    priceMentions.push(...msg.pricesMentioned);

    // Categorize themes
    const themeMap = msg.sentiment === "negative" ? complaintThemes : praiseThemes;
    msg.themes.forEach((theme) => {
      const existing = themeMap.get(theme) || { count: 0, examples: [] };
      existing.count++;
      if (existing.examples.length < 2) {
        existing.examples.push(msg.content.slice(0, 100));
      }
      themeMap.set(theme, existing);
    });
  });

  // Sort and format results
  const sortedComplaints = Array.from(complaintThemes.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([theme, data]) => ({ theme, ...data }));

  const sortedPraises = Array.from(praiseThemes.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([theme, data]) => ({ theme, ...data }));

  // Calculate average price mentioned
  const prices = priceMentions
    .map((p) => parseFloat(p.replace(/[$,]/g, "")))
    .filter((p) => !isNaN(p));
  const avgPrice = prices.length > 0
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : undefined;

  return {
    topComplaints: sortedComplaints,
    topPraises: sortedPraises,
    priceSensitivity: { mentions: priceMentions, averagePrice: avgPrice },
    overallSentiment: { positive, neutral, negative },
  };
}
