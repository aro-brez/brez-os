/**
 * BREZ SUPERMIND CORE
 * The operating system for the collective intelligence
 *
 * This is the central nervous system that:
 * 1. Manages sessions and context across conversations
 * 2. Stores and indexes all files for instant recall
 * 3. Maintains persistent memory that never forgets
 * 4. Learns from every interaction without hallucinating
 * 5. Synthesizes information to find source of truth
 */

// Re-export core modules with explicit naming to avoid conflicts
export {
  type SessionEntry,
  type Learning,
  type Decision,
  type DataIngestion,
  type SessionLog,
  initializeSupermindStorage,
  startSession,
  getCurrentSession,
  updateSessionContext,
  addLearning as addSessionLearning,
  addDecision as addSessionDecision,
  addDataIngestion,
  endSession,
  getRecentSessions,
  getSessionsByDateRange,
  getAllLearnings as getAllSessionLearnings,
  getLearningsByCategory,
  searchLearnings,
  getSessionStats,
  generateSessionSummary,
  generateContextForNewSession,
} from './session-logger';

export {
  type FileEntry,
  type FileCategory,
  type ExtractedData,
  type FileIndex,
  type StoreFileOptions,
  storeFile,
  storeDataDrop,
  getFileById,
  getFilesByCategory,
  getFilesByTag,
  searchFiles,
  getRecentFiles,
  getFileStats,
  updateFileContext,
  generateFileContext,
} from './file-manager';

export {
  type ContinuityLedger,
  type Goal,
  type Task,
  type Blocker,
  type KeyDecision,
  type Handoff,
  type PrioritizedAction,
  type CompressedLearning,
  type Pattern,
  type Correction,
  type SourceOfTruth,
  type Contradiction,
  type MemoryState,
  createLedger,
  updateLedger,
  addTask,
  completeTask,
  addDecision as addMemoryDecision,
  createHandoff,
  consumeHandoff,
  getLatestHandoff,
  addLearning as addMemoryLearning,
  addPattern,
  addCorrection,
  setTruth,
  getTruth,
  getTruthsByDomain,
  getContradictions,
  generateMemoryContext,
  getActiveLedger,
  getMemoryStats,
} from './persistent-memory';

export {
  type VerificationResult,
  type Insight,
  type Source,
  type DataRequest,
  type SynthesisResult,
  // Note: verifyClaim, recognizePattern exported via wrapper functions below
  learnFromObservation,
  // Note: applyCorrection exported via correctMistake wrapper below
  synthesizeInformation,
  requestData,
  answerRequest,
  getPendingRequests,
  extractSessionLearnings,
  generateClarifyingQuestions,
  establishTruth,
  queryTruth,
  generateLearningContext,
} from './learning-engine';

import * as SessionLogger from './session-logger';
import * as FileManager from './file-manager';
import * as PersistentMemory from './persistent-memory';
import * as LearningEngine from './learning-engine';
import * as fs from 'fs';
import * as path from 'path';

// ============ SUPERMIND INTERFACE ============

export interface SupermindContext {
  session: SessionLogger.SessionEntry | null;
  ledger: PersistentMemory.ContinuityLedger | null;
  handoff: PersistentMemory.Handoff | null;
  fileStats: ReturnType<typeof FileManager.getFileStats>;
  memoryStats: ReturnType<typeof PersistentMemory.getMemoryStats>;
  pendingRequests: LearningEngine.DataRequest[];
  recentLearnings: PersistentMemory.CompressedLearning[];
  activePatterns: PersistentMemory.Pattern[];
}

export interface SupermindConfig {
  dataRoot: string;
  autoBackup: boolean;
  backupInterval: number; // minutes
  maxSessionHistory: number;
  maxLearnings: number;
}

const DEFAULT_CONFIG: SupermindConfig = {
  dataRoot: path.join(process.env.HOME || '/tmp', '.brez-supermind'),
  autoBackup: true,
  backupInterval: 60,
  maxSessionHistory: 100,
  maxLearnings: 1000,
};

// ============ INITIALIZATION ============

let initialized = false;
let config = DEFAULT_CONFIG;

export function initializeSupermind(customConfig?: Partial<SupermindConfig>): void {
  if (initialized) return;

  config = { ...DEFAULT_CONFIG, ...customConfig };

  // Ensure all directories exist
  SessionLogger.initializeSupermindStorage();

  // Load any pending handoffs
  const handoff = PersistentMemory.getLatestHandoff();
  if (handoff) {
    console.log(`Found pending handoff from session: ${handoff.fromSessionId}`);
    console.log(`Next steps: ${handoff.nextSteps.join(', ')}`);
  }

  initialized = true;
  console.log('BREZ Supermind initialized');
}

// ============ SESSION LIFECYCLE ============

export function startSupermindSession(
  actorName: string,
  goals: string[]
): { session: SessionLogger.SessionEntry; ledger: PersistentMemory.ContinuityLedger } {
  initializeSupermind();

  // Start session
  const session = SessionLogger.startSession(
    { type: 'user', id: actorName, name: actorName },
    'claude_code'
  );

  // Create ledger
  const ledger = PersistentMemory.createLedger(session.id, goals);

  // Consume any pending handoff
  const pendingHandoff = PersistentMemory.getLatestHandoff();
  if (pendingHandoff && !pendingHandoff.consumedAt) {
    PersistentMemory.consumeHandoff(pendingHandoff.id, session.id);

    // Apply learnings from handoff
    console.log(`Consumed handoff: ${pendingHandoff.learnings.length} learnings loaded`);
  }

  return { session, ledger };
}

export function endSupermindSession(
  summary: string,
  tokensUsed?: number
): { session: SessionLogger.SessionEntry | null; handoff: PersistentMemory.Handoff } {
  const session = SessionLogger.endSession(summary, tokensUsed);

  // Extract learnings from session
  if (session) {
    LearningEngine.extractSessionLearnings(summary);
  }

  // Create handoff for next session
  const handoff = PersistentMemory.createHandoff(session?.id || 'unknown');

  return { session, handoff };
}

// ============ CONTEXT GENERATION ============

export function getSupermindContext(): SupermindContext {
  initializeSupermind();

  return {
    session: SessionLogger.getCurrentSession(),
    ledger: PersistentMemory.getActiveLedger(),
    handoff: PersistentMemory.getLatestHandoff(),
    fileStats: FileManager.getFileStats(),
    memoryStats: PersistentMemory.getMemoryStats(),
    pendingRequests: LearningEngine.getPendingRequests(),
    recentLearnings: [], // Would come from memory state
    activePatterns: [], // Would come from memory state
  };
}

export function generateFullContext(): string {
  initializeSupermind();

  const sections = [
    '# BREZ SUPERMIND CONTEXT',
    `*Generated: ${new Date().toISOString()}*`,
    '',
    SessionLogger.generateContextForNewSession(),
    '',
    FileManager.generateFileContext(),
    '',
    PersistentMemory.generateMemoryContext(),
    '',
    LearningEngine.generateLearningContext(),
  ];

  return sections.join('\n');
}

// ============ FILE OPERATIONS ============

export async function ingestFile(
  filePath: string,
  uploadedBy: string
): Promise<FileManager.FileEntry> {
  initializeSupermind();

  const entry = await FileManager.storeFile(filePath, {
    source: 'claude_code',
    uploadedBy,
  });

  // Log to session
  SessionLogger.updateSessionContext({
    filesRead: [filePath],
  });

  // Learn from the file
  LearningEngine.learnFromObservation(
    `Ingested file: ${entry.originalName} (${entry.category})`,
    entry.storedPath,
    'discovery',
    0.8
  );

  return entry;
}

export async function ingestDataDrop(
  dropPath: string,
  uploadedBy: string
): Promise<FileManager.FileEntry[]> {
  initializeSupermind();

  console.log(`Ingesting data drop from: ${dropPath}`);

  const entries = await FileManager.storeDataDrop(dropPath, uploadedBy);

  // Log to session
  SessionLogger.updateSessionContext({
    filesRead: entries.map(e => e.originalName),
  });

  // Learn from the data drop
  const categoryCounts: Record<string, number> = {};
  for (const entry of entries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
  }

  const categorySummary = Object.entries(categoryCounts)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(', ');

  LearningEngine.learnFromObservation(
    `Ingested data drop with ${entries.length} files: ${categorySummary}`,
    dropPath,
    'discovery',
    0.9
  );

  console.log(`Ingested ${entries.length} files`);

  return entries;
}

// ============ LEARNING OPERATIONS ============

export function learn(
  observation: string,
  source: string,
  category: PersistentMemory.CompressedLearning['category'] = 'insight'
): PersistentMemory.CompressedLearning {
  return LearningEngine.learnFromObservation(observation, source, category);
}

export function recognizePattern(
  name: string,
  description: string,
  context: string
): PersistentMemory.Pattern {
  return LearningEngine.recognizePattern(name, description, context);
}

export function correctMistake(
  original: string,
  corrected: string,
  reason: string
): PersistentMemory.Correction {
  return LearningEngine.applyCorrection(original, corrected, reason);
}

export function askForData(
  domain: string,
  question: string,
  priority: LearningEngine.DataRequest['priority'] = 'medium'
): LearningEngine.DataRequest {
  return LearningEngine.requestData(domain, question, priority);
}

// ============ TRUTH OPERATIONS ============

export function establishFact(
  domain: string,
  key: string,
  value: unknown,
  source: string,
  confidence: number = 1.0
): PersistentMemory.SourceOfTruth {
  return LearningEngine.establishTruth(
    domain,
    key,
    value,
    source,
    'user_confirmed',
    confidence
  );
}

export function queryFact(domain: string, key: string): unknown | undefined {
  return LearningEngine.queryTruth(domain, key);
}

export function verifyClaim(claim: string, domain: string): LearningEngine.VerificationResult {
  return LearningEngine.verifyClaim(claim, domain);
}

// ============ SEARCH & SYNTHESIS ============

export function searchKnowledge(query: string): {
  files: FileManager.FileEntry[];
  synthesis: LearningEngine.SynthesisResult;
  questions: string[];
} {
  const files = FileManager.searchFiles(query);
  const synthesis = LearningEngine.synthesizeInformation(query, files.map(f => f.originalName));
  const questions = LearningEngine.generateClarifyingQuestions(query);

  return { files, synthesis, questions };
}

// ============ BACKUP ============

export function backupSupermind(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(config.dataRoot, 'backups', timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Copy all data
  const sourceDirs = ['sessions', 'memory', 'files', 'index', 'learning'];
  for (const dir of sourceDirs) {
    const srcPath = path.join(config.dataRoot, dir);
    const destPath = path.join(backupDir, dir);

    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    }
  }

  console.log(`Backup created: ${backupDir}`);
  return backupDir;
}

// ============ STATS ============

export function getSupermindStats(): {
  sessions: ReturnType<typeof SessionLogger.getSessionStats>;
  files: ReturnType<typeof FileManager.getFileStats>;
  memory: ReturnType<typeof PersistentMemory.getMemoryStats>;
  pendingRequests: number;
} {
  return {
    sessions: SessionLogger.getSessionStats(),
    files: FileManager.getFileStats(),
    memory: PersistentMemory.getMemoryStats(),
    pendingRequests: LearningEngine.getPendingRequests().length,
  };
}

// Auto-initialize on import
initializeSupermind();
