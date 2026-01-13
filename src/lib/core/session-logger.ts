/**
 * BREZ SESSION LOGGER
 * Captures every session's work, context, learnings, and decisions
 * This is the working memory that never forgets
 */

import * as fs from 'fs';
import * as path from 'path';

// ============ TYPES ============

export interface SessionEntry {
  id: string;
  timestamp: string;
  endTimestamp?: string;
  type: 'claude_code' | 'app_session' | 'api_call' | 'user_upload' | 'system_event';
  actor: {
    type: 'user' | 'ai' | 'system';
    id: string;
    name?: string;
  };
  context: {
    summary: string;
    filesRead: string[];
    filesModified: string[];
    filesCreated: string[];
    toolsUsed: string[];
    queriesAsked: string[];
  };
  learnings: Learning[];
  decisions: Decision[];
  dataIngested: DataIngestion[];
  tokensUsed?: number;
  status: 'active' | 'completed' | 'interrupted';
}

export interface Learning {
  id: string;
  timestamp: string;
  category: 'pattern' | 'insight' | 'rule' | 'correction' | 'discovery';
  content: string;
  confidence: number; // 0-1
  source: string;
  relatedFiles: string[];
  appliedTo?: string; // Which rule/system this was applied to
}

export interface Decision {
  id: string;
  timestamp: string;
  description: string;
  rationale: string;
  alternatives: string[];
  outcome?: 'success' | 'failure' | 'pending';
  impactMetrics?: Record<string, number>;
}

export interface DataIngestion {
  id: string;
  timestamp: string;
  source: string;
  fileType: string;
  fileName: string;
  size: number;
  recordCount?: number;
  summary: string;
  dataPoints: string[];
  storedPath: string;
}

export interface SessionLog {
  version: string;
  lastUpdated: string;
  totalSessions: number;
  sessions: SessionEntry[];
  learningsIndex: Record<string, Learning[]>;
  decisionsIndex: Record<string, Decision[]>;
}

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const SESSION_LOG_PATH = path.join(DATA_ROOT, 'sessions', 'session-log.json');
const LEARNINGS_PATH = path.join(DATA_ROOT, 'learnings');
const FILES_PATH = path.join(DATA_ROOT, 'files');
const INDEX_PATH = path.join(DATA_ROOT, 'index');

// ============ INITIALIZATION ============

export function initializeSupermindStorage(): void {
  const dirs = [
    DATA_ROOT,
    path.join(DATA_ROOT, 'sessions'),
    path.join(DATA_ROOT, 'sessions', 'archive'),
    LEARNINGS_PATH,
    path.join(LEARNINGS_PATH, 'patterns'),
    path.join(LEARNINGS_PATH, 'insights'),
    path.join(LEARNINGS_PATH, 'rules'),
    path.join(LEARNINGS_PATH, 'corrections'),
    FILES_PATH,
    path.join(FILES_PATH, 'uploads'),
    path.join(FILES_PATH, 'exports'),
    path.join(FILES_PATH, 'data-drops'),
    path.join(FILES_PATH, 'api-snapshots'),
    INDEX_PATH,
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Initialize session log if doesn't exist
  if (!fs.existsSync(SESSION_LOG_PATH)) {
    const initialLog: SessionLog = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: [],
      learningsIndex: {},
      decisionsIndex: {},
    };
    fs.writeFileSync(SESSION_LOG_PATH, JSON.stringify(initialLog, null, 2));
  }
}

// ============ SESSION MANAGEMENT ============

let currentSession: SessionEntry | null = null;

export function startSession(actor: SessionEntry['actor'], type: SessionEntry['type'] = 'claude_code'): SessionEntry {
  initializeSupermindStorage();

  const session: SessionEntry = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    type,
    actor,
    context: {
      summary: '',
      filesRead: [],
      filesModified: [],
      filesCreated: [],
      toolsUsed: [],
      queriesAsked: [],
    },
    learnings: [],
    decisions: [],
    dataIngested: [],
    status: 'active',
  };

  currentSession = session;

  // Add to log
  const log = loadSessionLog();
  log.sessions.push(session);
  log.totalSessions++;
  log.lastUpdated = new Date().toISOString();
  saveSessionLog(log);

  return session;
}

export function getCurrentSession(): SessionEntry | null {
  return currentSession;
}

export function updateSessionContext(updates: Partial<SessionEntry['context']>): void {
  if (!currentSession) return;

  if (updates.filesRead) {
    currentSession.context.filesRead = [...new Set([...currentSession.context.filesRead, ...updates.filesRead])];
  }
  if (updates.filesModified) {
    currentSession.context.filesModified = [...new Set([...currentSession.context.filesModified, ...updates.filesModified])];
  }
  if (updates.filesCreated) {
    currentSession.context.filesCreated = [...new Set([...currentSession.context.filesCreated, ...updates.filesCreated])];
  }
  if (updates.toolsUsed) {
    currentSession.context.toolsUsed = [...new Set([...currentSession.context.toolsUsed, ...updates.toolsUsed])];
  }
  if (updates.queriesAsked) {
    currentSession.context.queriesAsked = [...currentSession.context.queriesAsked, ...updates.queriesAsked];
  }
  if (updates.summary) {
    currentSession.context.summary = updates.summary;
  }

  persistCurrentSession();
}

export function addLearning(learning: Omit<Learning, 'id' | 'timestamp'>): Learning {
  const fullLearning: Learning = {
    ...learning,
    id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  if (currentSession) {
    currentSession.learnings.push(fullLearning);
    persistCurrentSession();
  }

  // Also persist to learnings index
  persistLearning(fullLearning);

  return fullLearning;
}

export function addDecision(decision: Omit<Decision, 'id' | 'timestamp'>): Decision {
  const fullDecision: Decision = {
    ...decision,
    id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  if (currentSession) {
    currentSession.decisions.push(fullDecision);
    persistCurrentSession();
  }

  return fullDecision;
}

export function addDataIngestion(ingestion: Omit<DataIngestion, 'id' | 'timestamp'>): DataIngestion {
  const fullIngestion: DataIngestion = {
    ...ingestion,
    id: `ingestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  if (currentSession) {
    currentSession.dataIngested.push(fullIngestion);
    persistCurrentSession();
  }

  return fullIngestion;
}

export function endSession(summary: string, tokensUsed?: number): SessionEntry | null {
  if (!currentSession) return null;

  currentSession.endTimestamp = new Date().toISOString();
  currentSession.context.summary = summary;
  currentSession.tokensUsed = tokensUsed;
  currentSession.status = 'completed';

  persistCurrentSession();

  const completed = currentSession;
  currentSession = null;

  return completed;
}

// ============ PERSISTENCE ============

function loadSessionLog(): SessionLog {
  try {
    const content = fs.readFileSync(SESSION_LOG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: [],
      learningsIndex: {},
      decisionsIndex: {},
    };
  }
}

function saveSessionLog(log: SessionLog): void {
  fs.writeFileSync(SESSION_LOG_PATH, JSON.stringify(log, null, 2));
}

function persistCurrentSession(): void {
  if (!currentSession) return;

  const log = loadSessionLog();
  const index = log.sessions.findIndex(s => s.id === currentSession!.id);
  if (index >= 0) {
    log.sessions[index] = currentSession;
  } else {
    log.sessions.push(currentSession);
  }
  log.lastUpdated = new Date().toISOString();
  saveSessionLog(log);
}

function persistLearning(learning: Learning): void {
  const categoryPath = path.join(LEARNINGS_PATH, learning.category + 's');
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }

  const fileName = `${learning.id}.json`;
  fs.writeFileSync(path.join(categoryPath, fileName), JSON.stringify(learning, null, 2));

  // Update learnings index
  const log = loadSessionLog();
  if (!log.learningsIndex[learning.category]) {
    log.learningsIndex[learning.category] = [];
  }
  log.learningsIndex[learning.category].push(learning);
  saveSessionLog(log);
}

// ============ QUERY FUNCTIONS ============

export function getRecentSessions(count: number = 10): SessionEntry[] {
  const log = loadSessionLog();
  return log.sessions.slice(-count);
}

export function getSessionsByDateRange(start: Date, end: Date): SessionEntry[] {
  const log = loadSessionLog();
  return log.sessions.filter(s => {
    const timestamp = new Date(s.timestamp);
    return timestamp >= start && timestamp <= end;
  });
}

export function getAllLearnings(): Learning[] {
  const log = loadSessionLog();
  return Object.values(log.learningsIndex).flat();
}

export function getLearningsByCategory(category: Learning['category']): Learning[] {
  const log = loadSessionLog();
  return log.learningsIndex[category] || [];
}

export function searchLearnings(query: string): Learning[] {
  const allLearnings = getAllLearnings();
  const lowerQuery = query.toLowerCase();
  return allLearnings.filter(l =>
    l.content.toLowerCase().includes(lowerQuery) ||
    l.source.toLowerCase().includes(lowerQuery)
  );
}

export function getSessionStats(): {
  totalSessions: number;
  totalLearnings: number;
  totalDecisions: number;
  totalFilesIngested: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const log = loadSessionLog();

  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalLearnings = 0;
  let totalDecisions = 0;
  let totalFilesIngested = 0;

  for (const session of log.sessions) {
    byType[session.type] = (byType[session.type] || 0) + 1;
    totalLearnings += session.learnings.length;
    totalDecisions += session.decisions.length;
    totalFilesIngested += session.dataIngested.length;

    for (const learning of session.learnings) {
      byCategory[learning.category] = (byCategory[learning.category] || 0) + 1;
    }
  }

  return {
    totalSessions: log.totalSessions,
    totalLearnings,
    totalDecisions,
    totalFilesIngested,
    byType,
    byCategory,
  };
}

// ============ EXPORT FOR CONTEXT WINDOWS ============

export function generateSessionSummary(sessionId: string): string {
  const log = loadSessionLog();
  const session = log.sessions.find(s => s.id === sessionId);
  if (!session) return '';

  const lines = [
    `## Session: ${session.id}`,
    `**Date**: ${session.timestamp}`,
    `**Type**: ${session.type}`,
    `**Actor**: ${session.actor.name || session.actor.id}`,
    '',
    `### Summary`,
    session.context.summary || 'No summary available',
    '',
  ];

  if (session.context.filesModified.length > 0) {
    lines.push(`### Files Modified`);
    session.context.filesModified.forEach(f => lines.push(`- ${f}`));
    lines.push('');
  }

  if (session.learnings.length > 0) {
    lines.push(`### Learnings`);
    session.learnings.forEach(l => lines.push(`- [${l.category}] ${l.content}`));
    lines.push('');
  }

  if (session.decisions.length > 0) {
    lines.push(`### Decisions`);
    session.decisions.forEach(d => lines.push(`- ${d.description}: ${d.rationale}`));
    lines.push('');
  }

  return lines.join('\n');
}

export function generateContextForNewSession(): string {
  const recentSessions = getRecentSessions(5);
  const allLearnings = getAllLearnings().slice(-20);
  const stats = getSessionStats();

  const lines = [
    `# BREZ Supermind Context`,
    `*Generated: ${new Date().toISOString()}*`,
    '',
    `## Stats`,
    `- Total Sessions: ${stats.totalSessions}`,
    `- Total Learnings: ${stats.totalLearnings}`,
    `- Total Decisions: ${stats.totalDecisions}`,
    `- Files Ingested: ${stats.totalFilesIngested}`,
    '',
    `## Recent Sessions`,
  ];

  for (const session of recentSessions) {
    lines.push(`- **${session.timestamp}**: ${session.context.summary || session.type}`);
  }

  lines.push('', `## Recent Learnings`);
  for (const learning of allLearnings) {
    lines.push(`- [${learning.category}] ${learning.content}`);
  }

  return lines.join('\n');
}

// Initialize on import
initializeSupermindStorage();
