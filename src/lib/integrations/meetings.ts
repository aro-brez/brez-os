/**
 * BREZ Meeting Transcription Integration
 *
 * Integrates with Otter, Fireflies, and Avoma to automatically
 * flow meeting notes into the Supermind for reasoning.
 *
 * The system:
 * 1. Receives meeting transcripts via webhooks or API polling
 * 2. Extracts key information (decisions, action items, insights)
 * 3. Routes to appropriate Supermind functions
 * 4. Updates the change log and journey data
 */

import { supermind, Department } from "@/lib/ai/supermind";

// ============ TYPES ============

export type MeetingProvider = "otter" | "fireflies" | "avoma" | "manual";

export interface MeetingIntegrationConfig {
  provider: MeetingProvider;
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  syncFrequency: "realtime" | "hourly" | "daily";
  autoExtract: {
    decisions: boolean;
    actionItems: boolean;
    insights: boolean;
    metrics: boolean;
  };
}

export interface MeetingTranscript {
  id: string;
  provider: MeetingProvider;
  externalId: string;

  // Meeting metadata
  title: string;
  date: string;
  duration: number; // minutes
  participants: {
    name: string;
    email?: string;
    role?: string;
    department?: Department;
  }[];

  // Content
  summary?: string;
  transcript: string;
  topics?: string[];
  sentiment?: "positive" | "neutral" | "negative";

  // Extracted items (AI-generated)
  extracted: {
    decisions: ExtractedDecision[];
    actionItems: ExtractedActionItem[];
    insights: ExtractedInsight[];
    metrics: ExtractedMetric[];
    questions: ExtractedQuestion[];
  };

  // Processing status
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  error?: string;

  // Integration tracking
  syncedToSupermind: boolean;
  supermindUpdates?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface ExtractedDecision {
  id: string;
  text: string;
  context: string;
  owner?: string;
  department?: Department;
  impact?: string;
  approved: boolean;
  timestamp?: string;
}

export interface ExtractedActionItem {
  id: string;
  text: string;
  owner?: string;
  department?: Department;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  linkedGoalId?: string;
  converted: boolean;
  taskId?: string;
}

export interface ExtractedInsight {
  id: string;
  text: string;
  type: "market" | "customer" | "product" | "operational" | "financial";
  confidence: "high" | "medium" | "low";
  source: string; // Who said it
  relatedMetrics?: string[];
}

export interface ExtractedMetric {
  id: string;
  name: string;
  value: string;
  previousValue?: string;
  change?: string;
  source: string;
  category: string;
}

export interface ExtractedQuestion {
  id: string;
  question: string;
  context: string;
  askedBy: string;
  answered: boolean;
  answer?: string;
  department?: Department;
}

// ============ PROVIDER CONFIGS ============

export const PROVIDER_CONFIGS: Record<MeetingProvider, {
  name: string;
  description: string;
  setupUrl: string;
  webhookSupport: boolean;
  apiSupport: boolean;
}> = {
  otter: {
    name: "Otter.ai",
    description: "Real-time transcription with AI summaries",
    setupUrl: "https://otter.ai/integrations",
    webhookSupport: true,
    apiSupport: true,
  },
  fireflies: {
    name: "Fireflies.ai",
    description: "Meeting transcription with action items",
    setupUrl: "https://fireflies.ai/integrations",
    webhookSupport: true,
    apiSupport: true,
  },
  avoma: {
    name: "Avoma",
    description: "Conversation intelligence with coaching insights",
    setupUrl: "https://www.avoma.com/integrations",
    webhookSupport: true,
    apiSupport: true,
  },
  manual: {
    name: "Manual Entry",
    description: "Paste meeting notes directly",
    setupUrl: "",
    webhookSupport: false,
    apiSupport: false,
  },
};

// ============ SAMPLE DATA ============

const SAMPLE_MEETINGS: MeetingTranscript[] = [
  {
    id: "meeting-1",
    provider: "otter",
    externalId: "otter-abc123",
    title: "Weekly Growth Review",
    date: "2026-01-10T10:00:00Z",
    duration: 45,
    participants: [
      { name: "Aaron Nosbisch", role: "CEO", department: "exec" },
      { name: "Sarah Chen", role: "Growth Lead", department: "growth" },
      { name: "Mike Johnson", role: "Finance", department: "finance" },
    ],
    summary: "Reviewed Q1 goals, discussed CAC optimization strategy, and approved event budget increase.",
    transcript: "[Full transcript would be here...]",
    topics: ["CAC optimization", "Q1 goals", "Event marketing", "Budget allocation"],
    sentiment: "positive",
    extracted: {
      decisions: [
        {
          id: "dec-1",
          text: "Increase event sampling budget by 25% for Q1",
          context: "Based on ROI analysis showing 167% return on Venice sampling event",
          owner: "Aaron Nosbisch",
          department: "exec",
          impact: "Expected +$50K attributed revenue per month",
          approved: true,
        },
        {
          id: "dec-2",
          text: "Shift 15% of Meta spend to TikTok for testing",
          context: "TikTok showing better CPMs for target demographic",
          owner: "Sarah Chen",
          department: "growth",
          impact: "Potential 20% CAC reduction",
          approved: false,
        },
      ],
      actionItems: [
        {
          id: "ai-1",
          text: "Create Q1 event calendar with budget allocation",
          owner: "Sarah Chen",
          department: "growth",
          dueDate: "2026-01-17",
          priority: "high",
          converted: false,
        },
        {
          id: "ai-2",
          text: "Set up TikTok test campaign with $10K budget",
          owner: "Sarah Chen",
          department: "growth",
          dueDate: "2026-01-14",
          priority: "medium",
          converted: true,
          taskId: "task-123",
        },
      ],
      insights: [
        {
          id: "ins-1",
          text: "Customers acquired through events have 40% higher LTV than paid social",
          type: "customer",
          confidence: "high",
          source: "Mike Johnson",
          relatedMetrics: ["LTV", "CAC", "Event ROI"],
        },
      ],
      metrics: [
        {
          id: "met-1",
          name: "January CAC",
          value: "$48",
          previousValue: "$55",
          change: "-12.7%",
          source: "Sarah Chen",
          category: "acquisition",
        },
      ],
      questions: [
        {
          id: "q-1",
          question: "What's our cost per can at the upcoming SXSW event?",
          context: "Planning budget allocation",
          askedBy: "Aaron Nosbisch",
          answered: false,
          department: "ops",
        },
      ],
    },
    status: "completed",
    processedAt: "2026-01-10T11:00:00Z",
    syncedToSupermind: true,
    supermindUpdates: [
      "Added insight: Event customers 40% higher LTV",
      "Updated CAC metric: $55 → $48",
      "Created data request: SXSW cost per can",
    ],
    createdAt: "2026-01-10T10:45:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
];

// ============ MEETING INTEGRATION ENGINE ============

class MeetingIntegrationEngine {
  private meetings: MeetingTranscript[] = SAMPLE_MEETINGS;
  private configs: Map<MeetingProvider, MeetingIntegrationConfig> = new Map();

  constructor() {
    // Initialize with default configs
    this.configs.set("otter", {
      provider: "otter",
      enabled: false,
      syncFrequency: "realtime",
      autoExtract: {
        decisions: true,
        actionItems: true,
        insights: true,
        metrics: true,
      },
    });
    this.configs.set("fireflies", {
      provider: "fireflies",
      enabled: false,
      syncFrequency: "hourly",
      autoExtract: {
        decisions: true,
        actionItems: true,
        insights: true,
        metrics: true,
      },
    });
    this.configs.set("avoma", {
      provider: "avoma",
      enabled: false,
      syncFrequency: "daily",
      autoExtract: {
        decisions: true,
        actionItems: true,
        insights: true,
        metrics: true,
      },
    });
  }

  // ============ CONFIG MANAGEMENT ============

  getConfig(provider: MeetingProvider): MeetingIntegrationConfig | undefined {
    return this.configs.get(provider);
  }

  updateConfig(provider: MeetingProvider, updates: Partial<MeetingIntegrationConfig>): void {
    const current = this.configs.get(provider);
    if (current) {
      this.configs.set(provider, { ...current, ...updates });
    }
  }

  getEnabledProviders(): MeetingProvider[] {
    const enabled: MeetingProvider[] = [];
    this.configs.forEach((config, provider) => {
      if (config.enabled) enabled.push(provider);
    });
    return enabled;
  }

  // ============ MEETING MANAGEMENT ============

  getMeetings(limit: number = 10): MeetingTranscript[] {
    return this.meetings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  getMeetingById(id: string): MeetingTranscript | undefined {
    return this.meetings.find((m) => m.id === id);
  }

  getRecentMeetingsWithPendingItems(): MeetingTranscript[] {
    return this.meetings.filter((m) => {
      const hasUnapprovedDecisions = m.extracted.decisions.some((d) => !d.approved);
      const hasUnconvertedActions = m.extracted.actionItems.some((a) => !a.converted);
      const hasUnansweredQuestions = m.extracted.questions.some((q) => !q.answered);
      return hasUnapprovedDecisions || hasUnconvertedActions || hasUnansweredQuestions;
    });
  }

  // ============ EXTRACTION & SYNC ============

  async processMeeting(meeting: MeetingTranscript): Promise<MeetingTranscript> {
    // In production, this would call an AI service to extract items
    // For now, return the meeting with updated status
    const processed: MeetingTranscript = {
      ...meeting,
      status: "completed",
      processedAt: new Date().toISOString(),
    };

    return processed;
  }

  syncToSupermind(meeting: MeetingTranscript): {
    success: boolean;
    updates: string[];
  } {
    const updates: string[] = [];

    // Sync insights to Supermind
    for (const insight of meeting.extracted.insights) {
      supermind.synthesizeInsight(
        [meeting.title, insight.source],
        insight.text
      );
      updates.push(`Added insight: ${insight.text.substring(0, 50)}...`);
    }

    // Capture learnings
    for (const decision of meeting.extracted.decisions) {
      if (decision.approved && decision.impact) {
        supermind.captureLearning(
          `Decision: ${decision.text}`,
          decision.impact
        );
        updates.push(`Captured learning from decision: ${decision.text.substring(0, 30)}...`);
      }
    }

    // Mark as synced
    const meetingIndex = this.meetings.findIndex((m) => m.id === meeting.id);
    if (meetingIndex >= 0) {
      this.meetings[meetingIndex] = {
        ...this.meetings[meetingIndex],
        syncedToSupermind: true,
        supermindUpdates: updates,
        updatedAt: new Date().toISOString(),
      };
    }

    return { success: true, updates };
  }

  // ============ AGGREGATIONS ============

  getPendingDecisionsCount(): number {
    return this.meetings.reduce(
      (sum, m) => sum + m.extracted.decisions.filter((d) => !d.approved).length,
      0
    );
  }

  getPendingActionItemsCount(): number {
    return this.meetings.reduce(
      (sum, m) => sum + m.extracted.actionItems.filter((a) => !a.converted).length,
      0
    );
  }

  getUnansweredQuestionsCount(): number {
    return this.meetings.reduce(
      (sum, m) => sum + m.extracted.questions.filter((q) => !q.answered).length,
      0
    );
  }

  getInsightsByType(): Record<ExtractedInsight["type"], number> {
    const counts: Record<ExtractedInsight["type"], number> = {
      market: 0,
      customer: 0,
      product: 0,
      operational: 0,
      financial: 0,
    };

    for (const meeting of this.meetings) {
      for (const insight of meeting.extracted.insights) {
        counts[insight.type]++;
      }
    }

    return counts;
  }

  // ============ WEBHOOK HANDLERS ============

  handleOtterWebhook(payload: unknown): MeetingTranscript | null {
    // Parse Otter webhook payload
    // In production, this would map the Otter format to our format
    console.log("Received Otter webhook:", payload);
    return null;
  }

  handleFirefliesWebhook(payload: unknown): MeetingTranscript | null {
    // Parse Fireflies webhook payload
    console.log("Received Fireflies webhook:", payload);
    return null;
  }

  handleAvomaWebhook(payload: unknown): MeetingTranscript | null {
    // Parse Avoma webhook payload
    console.log("Received Avoma webhook:", payload);
    return null;
  }

  // ============ MANUAL ENTRY ============

  addManualMeeting(input: {
    title: string;
    date: string;
    duration: number;
    participants: string[];
    notes: string;
    decisions?: string[];
    actionItems?: string[];
  }): MeetingTranscript {
    const meeting: MeetingTranscript = {
      id: `meeting-${Date.now()}`,
      provider: "manual",
      externalId: "",
      title: input.title,
      date: input.date,
      duration: input.duration,
      participants: input.participants.map((name) => ({ name })),
      transcript: input.notes,
      extracted: {
        decisions: (input.decisions || []).map((text, i) => ({
          id: `dec-${Date.now()}-${i}`,
          text,
          context: "",
          approved: false,
        })),
        actionItems: (input.actionItems || []).map((text, i) => ({
          id: `ai-${Date.now()}-${i}`,
          text,
          priority: "medium" as const,
          converted: false,
        })),
        insights: [],
        metrics: [],
        questions: [],
      },
      status: "completed",
      processedAt: new Date().toISOString(),
      syncedToSupermind: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.meetings.push(meeting);
    return meeting;
  }
}

// Export singleton
export const meetingEngine = new MeetingIntegrationEngine();
