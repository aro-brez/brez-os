/**
 * BREZ COMMUNICATION LEARNING LAYER
 *
 * This system continuously improves the communication experience by:
 * 1. Tracking usage patterns and effectiveness
 * 2. Learning from user feedback
 * 3. Monitoring external tools (Slack, Asana, etc.) for best practices
 * 4. Adapting to team size and structure changes
 * 5. A/B testing communication patterns
 *
 * The goal: Make BREZ communication the best ever made, always evolving.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Thread,
  ThreadType,
  ThreadAnalytics,
  getThreadAnalytics,
  getActiveThreads,
} from './thread-system';

// ============ TYPES ============

export interface UsageEvent {
  id: string;
  timestamp: string;
  userId: string;
  eventType: UsageEventType;
  entityType: 'thread' | 'message' | 'decision' | 'group';
  entityId: string;
  metadata?: Record<string, unknown>;
  sessionDuration?: number; // minutes
}

export type UsageEventType =
  | 'thread_created'
  | 'thread_viewed'
  | 'thread_resolved'
  | 'thread_archived'
  | 'message_sent'
  | 'message_read'
  | 'decision_made'
  | 'decision_viewed'
  | 'ai_summary_requested'
  | 'ai_summary_viewed'
  | 'notification_clicked'
  | 'notification_dismissed'
  | 'search_performed'
  | 'filter_applied'
  | 'catch_up_used';

export interface UserFeedback {
  id: string;
  timestamp: string;
  userId: string;
  type: 'satisfaction' | 'feature_request' | 'bug_report' | 'suggestion';
  rating?: number; // 1-5
  content: string;
  context?: {
    page: string;
    threadId?: string;
    feature?: string;
  };
  status: 'new' | 'reviewed' | 'implemented' | 'declined';
  response?: string;
}

export interface ExternalToolInsight {
  id: string;
  timestamp: string;
  source: 'slack' | 'asana' | 'linear' | 'notion' | 'discord' | 'other';
  category: 'feature' | 'best_practice' | 'trend' | 'user_preference';
  title: string;
  description: string;
  relevanceScore: number; // 0-100
  implementationPriority: 'high' | 'medium' | 'low' | 'backlog';
  notes?: string;
  implemented: boolean;
  implementedAt?: string;
}

export interface CommunicationPattern {
  id: string;
  name: string;
  description: string;
  detectedAt: string;
  frequency: number; // times per week
  effectiveness: number; // 0-100
  recommendations: string[];
  affectedUsers: string[];
  autoOptimizations?: string[];
}

export interface TeamDynamics {
  teamSize: number;
  departments: string[];
  activeUsers: number;
  communicationVolume: number; // messages per day
  responseTime: {
    average: number; // minutes
    p50: number;
    p90: number;
  };
  peakHours: number[];
  collaborationScore: number; // 0-100
  siloRisk: number; // 0-100 (higher = more silos)
}

export interface OptimizationSuggestion {
  id: string;
  timestamp: string;
  type: 'notification' | 'grouping' | 'archiving' | 'membership' | 'workflow';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  affectedUsers: number;
  expectedImprovement: string;
  autoApplicable: boolean;
  status: 'suggested' | 'approved' | 'applied' | 'rejected';
}

export interface LearningState {
  lastUpdated: string;
  usageEvents: UsageEvent[];
  feedback: UserFeedback[];
  externalInsights: ExternalToolInsight[];
  detectedPatterns: CommunicationPattern[];
  teamDynamics: TeamDynamics;
  optimizationSuggestions: OptimizationSuggestion[];
  weeklyDigests: WeeklyDigest[];
  effectiveness: {
    overallScore: number;
    contextSwitchingReduction: number;
    resolutionTimeImprovement: number;
    decisionVelocity: number;
    userSatisfaction: number;
  };
}

export interface WeeklyDigest {
  weekOf: string;
  analytics: ThreadAnalytics;
  highlights: string[];
  concerns: string[];
  suggestions: string[];
  externalUpdates: string[];
}

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const LEARNING_PATH = path.join(DATA_ROOT, 'communication-learning');

// ============ INITIALIZATION ============

function ensureDirectories(): void {
  const dirs = [
    LEARNING_PATH,
    path.join(LEARNING_PATH, 'events'),
    path.join(LEARNING_PATH, 'feedback'),
    path.join(LEARNING_PATH, 'insights'),
    path.join(LEARNING_PATH, 'digests'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

let learningState: LearningState | null = null;

function loadState(): LearningState {
  if (learningState) return learningState;

  ensureDirectories();
  const statePath = path.join(LEARNING_PATH, 'state.json');

  try {
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf-8');
      learningState = JSON.parse(content);
      return learningState!;
    }
  } catch {
    console.log('Creating new learning state');
  }

  learningState = {
    lastUpdated: new Date().toISOString(),
    usageEvents: [],
    feedback: [],
    externalInsights: [],
    detectedPatterns: [],
    teamDynamics: {
      teamSize: 60,
      departments: ['Growth', 'Retail', 'Operations', 'Product', 'Marketing', 'Finance'],
      activeUsers: 0,
      communicationVolume: 0,
      responseTime: { average: 0, p50: 0, p90: 0 },
      peakHours: [],
      collaborationScore: 0,
      siloRisk: 0,
    },
    optimizationSuggestions: [],
    weeklyDigests: [],
    effectiveness: {
      overallScore: 50,
      contextSwitchingReduction: 0,
      resolutionTimeImprovement: 0,
      decisionVelocity: 0,
      userSatisfaction: 0,
    },
  };

  return learningState;
}

function saveState(): void {
  ensureDirectories();
  const state = loadState();
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(
    path.join(LEARNING_PATH, 'state.json'),
    JSON.stringify(state, null, 2)
  );
}

// ============ USAGE TRACKING ============

export function trackEvent(
  userId: string,
  eventType: UsageEventType,
  entityType: UsageEvent['entityType'],
  entityId: string,
  metadata?: Record<string, unknown>
): UsageEvent {
  const state = loadState();

  const event: UsageEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    eventType,
    entityType,
    entityId,
    metadata,
  };

  state.usageEvents.push(event);

  // Keep only last 30 days of events
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  state.usageEvents = state.usageEvents.filter(
    e => new Date(e.timestamp) > thirtyDaysAgo
  );

  saveState();

  // Analyze patterns after significant events
  if (state.usageEvents.length % 100 === 0) {
    analyzePatterns();
  }

  return event;
}

// ============ FEEDBACK COLLECTION ============

export function submitFeedback(
  userId: string,
  type: UserFeedback['type'],
  content: string,
  rating?: number,
  context?: UserFeedback['context']
): UserFeedback {
  const state = loadState();

  const feedback: UserFeedback = {
    id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    type,
    rating,
    content,
    context,
    status: 'new',
  };

  state.feedback.push(feedback);
  saveState();

  // Auto-generate suggestions from feedback
  if (type === 'feature_request' || type === 'suggestion') {
    generateSuggestionFromFeedback(feedback);
  }

  return feedback;
}

function generateSuggestionFromFeedback(feedback: UserFeedback): void {
  const state = loadState();

  // Simple keyword-based suggestion generation
  const keywords = feedback.content.toLowerCase();

  let suggestionType: OptimizationSuggestion['type'] = 'workflow';
  if (keywords.includes('notification') || keywords.includes('alert')) {
    suggestionType = 'notification';
  } else if (keywords.includes('group') || keywords.includes('team')) {
    suggestionType = 'grouping';
  } else if (keywords.includes('archive') || keywords.includes('clean')) {
    suggestionType = 'archiving';
  }

  const suggestion: OptimizationSuggestion = {
    id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type: suggestionType,
    title: `From feedback: ${feedback.content.slice(0, 50)}...`,
    description: feedback.content,
    impact: 'medium',
    effort: 'medium',
    affectedUsers: 1,
    expectedImprovement: 'User-requested improvement',
    autoApplicable: false,
    status: 'suggested',
  };

  state.optimizationSuggestions.push(suggestion);
  saveState();
}

// ============ EXTERNAL TOOL MONITORING ============

export function addExternalInsight(
  source: ExternalToolInsight['source'],
  category: ExternalToolInsight['category'],
  title: string,
  description: string,
  relevanceScore: number
): ExternalToolInsight {
  const state = loadState();

  const insight: ExternalToolInsight = {
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    source,
    category,
    title,
    description,
    relevanceScore,
    implementationPriority: relevanceScore > 80 ? 'high' : relevanceScore > 50 ? 'medium' : 'low',
    implemented: false,
  };

  state.externalInsights.push(insight);
  saveState();

  return insight;
}

/**
 * Scan for updates from external tools (would be automated in production)
 */
export async function scanExternalToolUpdates(): Promise<ExternalToolInsight[]> {
  const insights: ExternalToolInsight[] = [];

  // These would come from actual API calls or web scraping in production
  // For now, we define the patterns to track

  const trackedPatterns = [
    {
      source: 'slack' as const,
      patterns: [
        'Slack AI updates',
        'Slack Lists improvements',
        'Canvas features',
        'Workflow Builder updates',
        'Huddles improvements',
      ],
    },
    {
      source: 'asana' as const,
      patterns: [
        'Asana AI updates',
        'Workload improvements',
        'Timeline features',
        'Integration updates',
        'Goals tracking',
      ],
    },
    {
      source: 'linear' as const,
      patterns: [
        'Linear AI features',
        'Cycles improvements',
        'Projects updates',
        'Triage features',
      ],
    },
    {
      source: 'notion' as const,
      patterns: [
        'Notion AI improvements',
        'Database features',
        'Projects templates',
        'Automation features',
      ],
    },
  ];

  // Log what we're tracking
  console.log('Tracking external tool patterns:');
  for (const tool of trackedPatterns) {
    console.log(`  ${tool.source}: ${tool.patterns.length} patterns`);
  }

  return insights;
}

// ============ PATTERN ANALYSIS ============

export function analyzePatterns(): CommunicationPattern[] {
  const state = loadState();
  const patterns: CommunicationPattern[] = [];

  // Analyze response time patterns
  const responsePattern = analyzeResponseTimes(state);
  if (responsePattern) patterns.push(responsePattern);

  // Analyze thread lifecycle patterns
  const lifecyclePattern = analyzeThreadLifecycle(state);
  if (lifecyclePattern) patterns.push(lifecyclePattern);

  // Analyze engagement patterns
  const engagementPattern = analyzeEngagement(state);
  if (engagementPattern) patterns.push(engagementPattern);

  // Analyze silo patterns
  const siloPattern = analyzeSilos(state);
  if (siloPattern) patterns.push(siloPattern);

  state.detectedPatterns = patterns;
  saveState();

  return patterns;
}

function analyzeResponseTimes(state: LearningState): CommunicationPattern | null {
  const messageEvents = state.usageEvents.filter(e => e.eventType === 'message_sent');
  if (messageEvents.length < 10) return null;

  // Calculate response times
  const responseTimes: number[] = [];
  for (let i = 1; i < messageEvents.length; i++) {
    const prev = new Date(messageEvents[i - 1].timestamp);
    const curr = new Date(messageEvents[i].timestamp);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60); // minutes
    if (diff < 60) { // Only count if within an hour (likely a response)
      responseTimes.push(diff);
    }
  }

  if (responseTimes.length === 0) return null;

  const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

  return {
    id: `pattern_response_${Date.now()}`,
    name: 'Response Time Pattern',
    description: `Average response time is ${avgResponse.toFixed(1)} minutes`,
    detectedAt: new Date().toISOString(),
    frequency: messageEvents.length / 7, // per week
    effectiveness: avgResponse < 15 ? 80 : avgResponse < 30 ? 60 : 40,
    recommendations: avgResponse > 30
      ? ['Consider setting response time expectations', 'Use @mentions for urgent items']
      : ['Response times are healthy', 'Continue current communication patterns'],
    affectedUsers: [...new Set(messageEvents.map(e => e.userId))],
  };
}

function analyzeThreadLifecycle(state: LearningState): CommunicationPattern | null {
  const threadEvents = state.usageEvents.filter(
    e => e.eventType === 'thread_created' || e.eventType === 'thread_resolved'
  );
  if (threadEvents.length < 5) return null;

  const created = threadEvents.filter(e => e.eventType === 'thread_created').length;
  const resolved = threadEvents.filter(e => e.eventType === 'thread_resolved').length;
  const resolutionRate = resolved / Math.max(created, 1);

  return {
    id: `pattern_lifecycle_${Date.now()}`,
    name: 'Thread Lifecycle Pattern',
    description: `${(resolutionRate * 100).toFixed(0)}% of threads are being resolved`,
    detectedAt: new Date().toISOString(),
    frequency: created / 7,
    effectiveness: resolutionRate > 0.8 ? 90 : resolutionRate > 0.5 ? 70 : 50,
    recommendations: resolutionRate < 0.5
      ? ['Review active threads for stale conversations', 'Encourage thread resolution']
      : ['Thread completion rate is healthy'],
    affectedUsers: [...new Set(threadEvents.map(e => e.userId))],
  };
}

function analyzeEngagement(state: LearningState): CommunicationPattern | null {
  const viewEvents = state.usageEvents.filter(e => e.eventType === 'thread_viewed');
  const readEvents = state.usageEvents.filter(e => e.eventType === 'message_read');

  if (viewEvents.length < 10) return null;

  const uniqueUsers = new Set(viewEvents.map(e => e.userId));
  const activeRatio = uniqueUsers.size / state.teamDynamics.teamSize;

  return {
    id: `pattern_engagement_${Date.now()}`,
    name: 'Engagement Pattern',
    description: `${(activeRatio * 100).toFixed(0)}% of team is actively engaging with threads`,
    detectedAt: new Date().toISOString(),
    frequency: viewEvents.length / 7,
    effectiveness: activeRatio > 0.7 ? 90 : activeRatio > 0.5 ? 70 : 50,
    recommendations: activeRatio < 0.5
      ? ['Consider reducing notification noise', 'Improve thread discoverability', 'Send weekly digest to inactive users']
      : ['Engagement levels are healthy'],
    affectedUsers: [...uniqueUsers],
  };
}

function analyzeSilos(state: LearningState): CommunicationPattern | null {
  // This would analyze cross-department communication in production
  // For now, return a placeholder pattern

  return {
    id: `pattern_silos_${Date.now()}`,
    name: 'Silo Detection',
    description: 'Monitoring cross-department communication patterns',
    detectedAt: new Date().toISOString(),
    frequency: 0,
    effectiveness: 70,
    recommendations: [
      'Encourage cross-functional threads for major initiatives',
      'Auto-add relevant stakeholders from other departments',
    ],
    affectedUsers: [],
  };
}

// ============ OPTIMIZATION SUGGESTIONS ============

export function generateOptimizations(): OptimizationSuggestion[] {
  const state = loadState();
  const analytics = getThreadAnalytics();
  const suggestions: OptimizationSuggestion[] = [];

  // Suggest archiving old resolved threads
  if (analytics.resolvedThreads > 50) {
    suggestions.push({
      id: `opt_archive_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'archiving',
      title: 'Archive old resolved threads',
      description: `${analytics.resolvedThreads} resolved threads could be archived to reduce clutter`,
      impact: 'medium',
      effort: 'low',
      affectedUsers: 0,
      expectedImprovement: 'Reduced cognitive load, cleaner workspace',
      autoApplicable: true,
      status: 'suggested',
    });
  }

  // Suggest notification optimization based on feedback
  const notificationComplaints = state.feedback.filter(
    f => f.content.toLowerCase().includes('notification') && f.type !== 'suggestion'
  );
  if (notificationComplaints.length > 3) {
    suggestions.push({
      id: `opt_notifications_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'notification',
      title: 'Optimize notification settings',
      description: 'Multiple users have mentioned notification issues',
      impact: 'high',
      effort: 'medium',
      affectedUsers: notificationComplaints.length,
      expectedImprovement: '30% reduction in notification fatigue',
      autoApplicable: false,
      status: 'suggested',
    });
  }

  // Suggest grouping changes based on usage
  if (analytics.averageParticipantsPerThread > 10) {
    suggestions.push({
      id: `opt_groups_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'grouping',
      title: 'Create smaller focused groups',
      description: 'Threads have many participants - consider smaller groups for focused discussions',
      impact: 'medium',
      effort: 'medium',
      affectedUsers: Math.floor(analytics.activeThreads * 5),
      expectedImprovement: 'Faster decisions, more focused conversations',
      autoApplicable: false,
      status: 'suggested',
    });
  }

  state.optimizationSuggestions = [
    ...state.optimizationSuggestions.filter(s => s.status !== 'suggested'),
    ...suggestions,
  ];
  saveState();

  return suggestions;
}

// ============ WEEKLY DIGEST ============

export function generateWeeklyDigest(): WeeklyDigest {
  const state = loadState();
  const analytics = getThreadAnalytics();

  const weekOf = new Date().toISOString().split('T')[0];

  const highlights: string[] = [];
  const concerns: string[] = [];
  const suggestions: string[] = [];

  // Analyze and generate highlights
  if (analytics.decisionsLogged > 10) {
    highlights.push(`${analytics.decisionsLogged} decisions logged this week`);
  }
  if (analytics.averageResolutionTime < 24) {
    highlights.push(`Fast thread resolution: ${analytics.averageResolutionTime.toFixed(1)} hours average`);
  }

  // Analyze and generate concerns
  if (analytics.activeThreads > 100) {
    concerns.push(`${analytics.activeThreads} active threads may be causing noise`);
  }
  if (analytics.averageMessagesPerThread > 50) {
    concerns.push('Some threads have very long conversations - consider breaking into sub-threads');
  }

  // Generate suggestions
  const optimizations = generateOptimizations();
  for (const opt of optimizations.filter(o => o.status === 'suggested').slice(0, 3)) {
    suggestions.push(opt.title);
  }

  // External updates (would come from scanning in production)
  const externalUpdates = state.externalInsights
    .filter(i => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(i.timestamp) > weekAgo;
    })
    .map(i => `${i.source}: ${i.title}`);

  const digest: WeeklyDigest = {
    weekOf,
    analytics,
    highlights,
    concerns,
    suggestions,
    externalUpdates,
  };

  state.weeklyDigests.push(digest);

  // Keep only last 12 weeks
  state.weeklyDigests = state.weeklyDigests.slice(-12);

  saveState();

  return digest;
}

// ============ EFFECTIVENESS SCORING ============

export function updateEffectivenessScore(): void {
  const state = loadState();
  const analytics = getThreadAnalytics();

  // Calculate context switching reduction (based on consolidated threads)
  const contextSwitchingReduction = Math.min(100,
    (analytics.averageParticipantsPerThread / 5) * 20 + // Right-sized participation
    (analytics.decisionsLogged / Math.max(analytics.activeThreads, 1)) * 30 // Decisions per thread
  );

  // Calculate resolution time improvement (target: <24 hours)
  const resolutionTimeImprovement = Math.min(100,
    analytics.averageResolutionTime > 0
      ? (24 / analytics.averageResolutionTime) * 50
      : 50
  );

  // Calculate decision velocity
  const decisionVelocity = Math.min(100,
    (analytics.decisionsLogged / 7) * 10 // Decisions per day normalized
  );

  // Calculate user satisfaction from feedback
  const recentFeedback = state.feedback.filter(f => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    return new Date(f.timestamp) > weekAgo && f.rating;
  });
  const userSatisfaction = recentFeedback.length > 0
    ? (recentFeedback.reduce((sum, f) => sum + (f.rating || 3), 0) / recentFeedback.length) * 20
    : 50;

  // Overall score
  const overallScore = (
    contextSwitchingReduction * 0.3 +
    resolutionTimeImprovement * 0.25 +
    decisionVelocity * 0.25 +
    userSatisfaction * 0.2
  );

  state.effectiveness = {
    overallScore: Math.round(overallScore),
    contextSwitchingReduction: Math.round(contextSwitchingReduction),
    resolutionTimeImprovement: Math.round(resolutionTimeImprovement),
    decisionVelocity: Math.round(decisionVelocity),
    userSatisfaction: Math.round(userSatisfaction),
  };

  saveState();
}

// ============ PUBLIC API ============

export function getLearningState(): LearningState {
  return loadState();
}

export function getEffectivenessScore(): LearningState['effectiveness'] {
  const state = loadState();
  return state.effectiveness;
}

export function getPendingSuggestions(): OptimizationSuggestion[] {
  const state = loadState();
  return state.optimizationSuggestions.filter(s => s.status === 'suggested');
}

export function approveSuggestion(suggestionId: string): void {
  const state = loadState();
  const suggestion = state.optimizationSuggestions.find(s => s.id === suggestionId);
  if (suggestion) {
    suggestion.status = 'approved';
    saveState();
  }
}

export function applySuggestion(suggestionId: string): void {
  const state = loadState();
  const suggestion = state.optimizationSuggestions.find(s => s.id === suggestionId);
  if (suggestion) {
    suggestion.status = 'applied';
    saveState();
  }
}

export function getRecentFeedback(limit: number = 20): UserFeedback[] {
  const state = loadState();
  return state.feedback
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getExternalInsights(
  source?: ExternalToolInsight['source'],
  limit: number = 20
): ExternalToolInsight[] {
  const state = loadState();
  let insights = state.externalInsights;

  if (source) {
    insights = insights.filter(i => i.source === source);
  }

  return insights
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function initializeLearningLayer(): void {
  loadState();
  console.log('BREZ Communication Learning Layer initialized');

  // Run initial analysis
  analyzePatterns();
  updateEffectivenessScore();
  generateOptimizations();
}
