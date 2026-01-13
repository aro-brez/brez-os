/**
 * BREZ PERSISTENT MEMORY
 * The never-forgetting brain that compounds knowledge across sessions
 *
 * Key Principles (from state-of-the-art research):
 * 1. COMPOUND, DON'T COMPACT - Extract learnings, don't lose them
 * 2. CONTINUITY LEDGERS - Within-session state tracking
 * 3. HANDOFF MECHANISM - Between-session knowledge transfer
 * 4. SOURCE OF TRUTH VERIFICATION - Never hallucinate, always verify
 * 5. SELF-LEARNING - Get smarter without fooling itself
 */

import * as fs from 'fs';
import * as path from 'path';

// ============ TYPES ============

export interface ContinuityLedger {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'interrupted';

  // Goals and Progress
  goals: Goal[];
  tasks: Task[];
  blockers: Blocker[];

  // Context
  activeFiles: string[];
  keyDecisions: KeyDecision[];
  openQuestions: string[];

  // Metrics
  tokensUsed: number;
  toolCalls: number;
  filesModified: number;
}

export interface Goal {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number; // 0-100
  subGoals?: Goal[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  blockedBy?: string;
  completedAt?: string;
  outcome?: string;
}

export interface Blocker {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  identifiedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface KeyDecision {
  id: string;
  question: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  timestamp: string;
  confidence: number;
  verified: boolean;
  verificationSource?: string;
}

export interface Handoff {
  id: string;
  fromSessionId: string;
  toSessionId?: string;
  createdAt: string;
  consumedAt?: string;

  // What was accomplished
  completedTasks: string[];
  keyOutcomes: string[];

  // What's next
  nextSteps: string[];
  prioritizedActions: PrioritizedAction[];

  // What was learned
  learnings: CompressedLearning[];
  patterns: Pattern[];
  corrections: Correction[];

  // Context to preserve
  criticalContext: string[];
  activeWorkstreams: string[];
  openItems: string[];
}

export interface PrioritizedAction {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  dependencies: string[];
  estimatedComplexity: 'trivial' | 'small' | 'medium' | 'large';
}

export interface CompressedLearning {
  id: string;
  category: 'pattern' | 'insight' | 'rule' | 'correction' | 'discovery';
  content: string;
  confidence: number;
  source: string;
  appliedTo?: string;
  verified: boolean;
  verificationMethod?: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  context: string;
  reliability: number; // 0-1
}

export interface Correction {
  id: string;
  original: string;
  corrected: string;
  reason: string;
  timestamp: string;
  appliedTo: string[];
}

export interface SourceOfTruth {
  id: string;
  domain: string;
  key: string;
  value: unknown;
  source: string;
  lastVerified: string;
  verificationMethod: 'api' | 'file' | 'user_confirmed' | 'calculated' | 'inferred';
  confidence: number;
  contradictions: Contradiction[];
}

export interface Contradiction {
  id: string;
  sourceA: string;
  sourceB: string;
  valueA: unknown;
  valueB: unknown;
  identifiedAt: string;
  resolvedAt?: string;
  resolution?: string;
  resolvedValue?: unknown;
}

export interface MemoryState {
  version: string;
  lastUpdated: string;

  // Current Session
  activeLedger: ContinuityLedger | null;

  // Handoffs
  pendingHandoffs: Handoff[];
  consumedHandoffs: string[]; // IDs

  // Accumulated Knowledge
  learnings: CompressedLearning[];
  patterns: Pattern[];
  corrections: Correction[];

  // Source of Truth
  truths: SourceOfTruth[];

  // Stats
  totalSessions: number;
  totalLearnings: number;
  totalPatterns: number;
  totalCorrections: number;
}

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const MEMORY_PATH = path.join(DATA_ROOT, 'memory');
const LEDGERS_PATH = path.join(MEMORY_PATH, 'ledgers');
const HANDOFFS_PATH = path.join(MEMORY_PATH, 'handoffs');
const TRUTHS_PATH = path.join(MEMORY_PATH, 'truths');
const STATE_PATH = path.join(MEMORY_PATH, 'state.json');

// ============ INITIALIZATION ============

function ensureDirectories(): void {
  const dirs = [MEMORY_PATH, LEDGERS_PATH, HANDOFFS_PATH, TRUTHS_PATH];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function loadState(): MemoryState {
  ensureDirectories();
  try {
    const content = fs.readFileSync(STATE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      activeLedger: null,
      pendingHandoffs: [],
      consumedHandoffs: [],
      learnings: [],
      patterns: [],
      corrections: [],
      truths: [],
      totalSessions: 0,
      totalLearnings: 0,
      totalPatterns: 0,
      totalCorrections: 0,
    };
  }
}

function saveState(state: MemoryState): void {
  state.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// ============ CONTINUITY LEDGER ============

export function createLedger(sessionId: string, goals: string[]): ContinuityLedger {
  const state = loadState();

  const ledger: ContinuityLedger = {
    id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    goals: goals.map((g, i) => ({
      id: `goal_${i}`,
      description: g,
      status: 'pending',
      progress: 0,
    })),
    tasks: [],
    blockers: [],
    activeFiles: [],
    keyDecisions: [],
    openQuestions: [],
    tokensUsed: 0,
    toolCalls: 0,
    filesModified: 0,
  };

  state.activeLedger = ledger;
  state.totalSessions++;
  saveState(state);

  // Also save to file
  const ledgerPath = path.join(LEDGERS_PATH, `${ledger.id}.json`);
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

  return ledger;
}

export function updateLedger(updates: Partial<ContinuityLedger>): ContinuityLedger | null {
  const state = loadState();
  if (!state.activeLedger) return null;

  Object.assign(state.activeLedger, updates, { updatedAt: new Date().toISOString() });
  saveState(state);

  // Update file
  const ledgerPath = path.join(LEDGERS_PATH, `${state.activeLedger.id}.json`);
  fs.writeFileSync(ledgerPath, JSON.stringify(state.activeLedger, null, 2));

  return state.activeLedger;
}

export function addTask(task: Omit<Task, 'id'>): Task {
  const state = loadState();
  if (!state.activeLedger) throw new Error('No active ledger');

  const fullTask: Task = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  state.activeLedger.tasks.push(fullTask);
  state.activeLedger.updatedAt = new Date().toISOString();
  saveState(state);

  return fullTask;
}

export function completeTask(taskId: string, outcome: string): Task | null {
  const state = loadState();
  if (!state.activeLedger) return null;

  const task = state.activeLedger.tasks.find(t => t.id === taskId);
  if (!task) return null;

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.outcome = outcome;
  state.activeLedger.updatedAt = new Date().toISOString();
  saveState(state);

  return task;
}

export function addDecision(decision: Omit<KeyDecision, 'id' | 'timestamp' | 'verified'>): KeyDecision {
  const state = loadState();
  if (!state.activeLedger) throw new Error('No active ledger');

  const fullDecision: KeyDecision = {
    ...decision,
    id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    verified: false,
  };

  state.activeLedger.keyDecisions.push(fullDecision);
  state.activeLedger.updatedAt = new Date().toISOString();
  saveState(state);

  return fullDecision;
}

// ============ HANDOFF MECHANISM ============

export function createHandoff(fromSessionId: string): Handoff {
  const state = loadState();

  const ledger = state.activeLedger;
  const completedTasks = ledger?.tasks.filter(t => t.status === 'completed').map(t => t.description) || [];
  const pendingTasks = ledger?.tasks.filter(t => t.status !== 'completed').map(t => t.description) || [];

  const handoff: Handoff = {
    id: `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromSessionId,
    createdAt: new Date().toISOString(),
    completedTasks,
    keyOutcomes: ledger?.goals.filter(g => g.status === 'completed').map(g => g.description) || [],
    nextSteps: pendingTasks,
    prioritizedActions: pendingTasks.map((t, i) => ({
      action: t,
      priority: i === 0 ? 'high' as const : 'medium' as const,
      rationale: 'Pending from previous session',
      dependencies: [],
      estimatedComplexity: 'medium' as const,
    })),
    learnings: state.learnings.slice(-10), // Last 10 learnings
    patterns: state.patterns.slice(-5), // Last 5 patterns
    corrections: state.corrections.slice(-5), // Last 5 corrections
    criticalContext: ledger?.keyDecisions.map(d => `${d.question}: ${d.decision}`) || [],
    activeWorkstreams: ledger?.goals.filter(g => g.status === 'in_progress').map(g => g.description) || [],
    openItems: ledger?.openQuestions || [],
  };

  state.pendingHandoffs.push(handoff);

  // Close current ledger
  if (state.activeLedger) {
    state.activeLedger.status = 'completed';
    state.activeLedger = null;
  }

  saveState(state);

  // Save handoff file
  const handoffPath = path.join(HANDOFFS_PATH, `${handoff.id}.json`);
  fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2));

  return handoff;
}

export function consumeHandoff(handoffId: string, toSessionId: string): Handoff | null {
  const state = loadState();

  const handoffIndex = state.pendingHandoffs.findIndex(h => h.id === handoffId);
  if (handoffIndex < 0) return null;

  const handoff = state.pendingHandoffs[handoffIndex];
  handoff.toSessionId = toSessionId;
  handoff.consumedAt = new Date().toISOString();

  // Move to consumed
  state.pendingHandoffs.splice(handoffIndex, 1);
  state.consumedHandoffs.push(handoffId);

  saveState(state);

  return handoff;
}

export function getLatestHandoff(): Handoff | null {
  const state = loadState();
  return state.pendingHandoffs[state.pendingHandoffs.length - 1] || null;
}

// ============ LEARNING & PATTERNS ============

export function addLearning(learning: Omit<CompressedLearning, 'id' | 'verified'>): CompressedLearning {
  const state = loadState();

  const fullLearning: CompressedLearning = {
    ...learning,
    id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    verified: false,
  };

  // Check for duplicates
  const isDuplicate = state.learnings.some(
    l => l.content.toLowerCase() === fullLearning.content.toLowerCase()
  );

  if (!isDuplicate) {
    state.learnings.push(fullLearning);
    state.totalLearnings++;
    saveState(state);
  }

  return fullLearning;
}

export function addPattern(pattern: Omit<Pattern, 'id' | 'occurrences' | 'firstSeen' | 'lastSeen' | 'reliability'>): Pattern {
  const state = loadState();

  // Check if pattern exists
  const existing = state.patterns.find(p => p.name === pattern.name);

  if (existing) {
    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
    existing.reliability = Math.min(1, existing.reliability + 0.1);
    saveState(state);
    return existing;
  }

  const fullPattern: Pattern = {
    ...pattern,
    id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    occurrences: 1,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    reliability: 0.5,
  };

  state.patterns.push(fullPattern);
  state.totalPatterns++;
  saveState(state);

  return fullPattern;
}

export function addCorrection(correction: Omit<Correction, 'id' | 'timestamp'>): Correction {
  const state = loadState();

  const fullCorrection: Correction = {
    ...correction,
    id: `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  state.corrections.push(fullCorrection);
  state.totalCorrections++;
  saveState(state);

  // Apply correction to learnings if applicable
  for (const learningId of correction.appliedTo) {
    const learning = state.learnings.find(l => l.id === learningId);
    if (learning) {
      learning.content = correction.corrected;
      learning.verified = true;
      learning.verificationMethod = 'correction';
    }
  }

  saveState(state);

  return fullCorrection;
}

// ============ SOURCE OF TRUTH ============

export function setTruth(
  domain: string,
  key: string,
  value: unknown,
  source: string,
  verificationMethod: SourceOfTruth['verificationMethod'],
  confidence: number = 1.0
): SourceOfTruth {
  const state = loadState();

  // Check for existing truth
  const existingIndex = state.truths.findIndex(t => t.domain === domain && t.key === key);

  if (existingIndex >= 0) {
    const existing = state.truths[existingIndex];

    // Check for contradiction
    if (JSON.stringify(existing.value) !== JSON.stringify(value)) {
      const contradiction: Contradiction = {
        id: `contradiction_${Date.now()}`,
        sourceA: existing.source,
        sourceB: source,
        valueA: existing.value,
        valueB: value,
        identifiedAt: new Date().toISOString(),
      };
      existing.contradictions.push(contradiction);

      // Resolve based on confidence and recency
      if (confidence >= existing.confidence) {
        contradiction.resolvedAt = new Date().toISOString();
        contradiction.resolution = 'New value has higher or equal confidence';
        contradiction.resolvedValue = value;
        existing.value = value;
        existing.source = source;
        existing.confidence = confidence;
      }
    }

    existing.lastVerified = new Date().toISOString();
    existing.verificationMethod = verificationMethod;
    saveState(state);

    return existing;
  }

  // Create new truth
  const truth: SourceOfTruth = {
    id: `truth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    domain,
    key,
    value,
    source,
    lastVerified: new Date().toISOString(),
    verificationMethod,
    confidence,
    contradictions: [],
  };

  state.truths.push(truth);
  saveState(state);

  // Also save to file
  const truthPath = path.join(TRUTHS_PATH, `${domain}_${key}.json`);
  fs.writeFileSync(truthPath, JSON.stringify(truth, null, 2));

  return truth;
}

export function getTruth(domain: string, key: string): SourceOfTruth | undefined {
  const state = loadState();
  return state.truths.find(t => t.domain === domain && t.key === key);
}

export function getTruthsByDomain(domain: string): SourceOfTruth[] {
  const state = loadState();
  return state.truths.filter(t => t.domain === domain);
}

export function getContradictions(): Contradiction[] {
  const state = loadState();
  return state.truths.flatMap(t => t.contradictions.filter(c => !c.resolvedAt));
}

// ============ CONTEXT GENERATION ============

export function generateMemoryContext(): string {
  const state = loadState();

  const lines = [
    `# BREZ Supermind Memory`,
    `*Last Updated: ${state.lastUpdated}*`,
    '',
    `## Stats`,
    `- Sessions: ${state.totalSessions}`,
    `- Learnings: ${state.totalLearnings}`,
    `- Patterns: ${state.totalPatterns}`,
    `- Corrections: ${state.totalCorrections}`,
    '',
  ];

  // Active Ledger
  if (state.activeLedger) {
    lines.push(`## Active Session`);
    lines.push(`- Goals: ${state.activeLedger.goals.map(g => `${g.description} (${g.progress}%)`).join(', ')}`);
    lines.push(`- Tasks: ${state.activeLedger.tasks.filter(t => t.status !== 'completed').length} pending`);
    lines.push('');
  }

  // Pending Handoffs
  if (state.pendingHandoffs.length > 0) {
    lines.push(`## Pending Handoffs`);
    const latest = state.pendingHandoffs[state.pendingHandoffs.length - 1];
    lines.push(`### From Session: ${latest.fromSessionId}`);
    lines.push(`**Next Steps:**`);
    latest.nextSteps.forEach(s => lines.push(`- ${s}`));
    lines.push(`**Critical Context:**`);
    latest.criticalContext.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  // Recent Learnings
  lines.push(`## Recent Learnings`);
  state.learnings.slice(-10).forEach(l => {
    const verified = l.verified ? '✓' : '?';
    lines.push(`- [${l.category}] ${verified} ${l.content}`);
  });
  lines.push('');

  // Key Patterns
  lines.push(`## Key Patterns`);
  state.patterns.sort((a, b) => b.occurrences - a.occurrences).slice(0, 5).forEach(p => {
    lines.push(`- **${p.name}** (${p.occurrences}x, ${(p.reliability * 100).toFixed(0)}% reliable): ${p.description}`);
  });
  lines.push('');

  // Recent Corrections
  if (state.corrections.length > 0) {
    lines.push(`## Recent Corrections`);
    state.corrections.slice(-5).forEach(c => {
      lines.push(`- "${c.original}" → "${c.corrected}" (${c.reason})`);
    });
    lines.push('');
  }

  // Unresolved Contradictions
  const contradictions = getContradictions();
  if (contradictions.length > 0) {
    lines.push(`## Unresolved Contradictions`);
    contradictions.forEach(c => {
      lines.push(`- ${c.sourceA} says "${c.valueA}" but ${c.sourceB} says "${c.valueB}"`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export function getActiveLedger(): ContinuityLedger | null {
  const state = loadState();
  return state.activeLedger;
}

export function getMemoryStats(): {
  totalSessions: number;
  totalLearnings: number;
  totalPatterns: number;
  totalCorrections: number;
  totalTruths: number;
  pendingHandoffs: number;
  unresolvedContradictions: number;
} {
  const state = loadState();
  return {
    totalSessions: state.totalSessions,
    totalLearnings: state.totalLearnings,
    totalPatterns: state.totalPatterns,
    totalCorrections: state.totalCorrections,
    totalTruths: state.truths.length,
    pendingHandoffs: state.pendingHandoffs.length,
    unresolvedContradictions: getContradictions().length,
  };
}
