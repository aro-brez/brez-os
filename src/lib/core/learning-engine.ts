/**
 * BREZ LEARNING ENGINE
 * Self-improving AI that never hallucinates
 *
 * Core Principles:
 * 1. VERIFY BEFORE TRUST - Every claim needs a source
 * 2. SYNTHESIZE, DON'T INVENT - Connect dots, don't make them up
 * 3. ADMIT UNCERTAINTY - "I don't know" is a valid answer
 * 4. SEEK CLARITY - Ask for data when unclear
 * 5. LEARN FROM CORRECTIONS - Mistakes become improvements
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  addLearning,
  addPattern,
  addCorrection,
  setTruth,
  getTruth,
  getContradictions,
  type CompressedLearning,
  type Pattern,
  type Correction,
} from './persistent-memory';
import { searchFiles } from './file-manager';

// ============ TYPES ============

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  sources: string[];
  contradictions: string[];
  missingData: string[];
  recommendation: 'trust' | 'verify_manually' | 'reject' | 'needs_more_data';
}

export interface Insight {
  id: string;
  timestamp: string;
  type: 'observation' | 'inference' | 'recommendation' | 'question';
  content: string;
  confidence: number;
  sources: Source[];
  verified: boolean;
  verificationDetails?: VerificationResult;
}

export interface Source {
  type: 'file' | 'api' | 'user' | 'calculated' | 'inferred';
  reference: string;
  timestamp: string;
  reliability: number;
}

export interface DataRequest {
  id: string;
  timestamp: string;
  domain: string;
  question: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'answered' | 'automated';
  answer?: unknown;
  answeredBy?: string;
  answeredAt?: string;
}

export interface SynthesisResult {
  conclusion: string;
  confidence: number;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  assumptions: string[];
  gaps: string[];
  recommendation: string;
}

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const LEARNING_PATH = path.join(DATA_ROOT, 'learning');
const INSIGHTS_PATH = path.join(LEARNING_PATH, 'insights');
const REQUESTS_PATH = path.join(LEARNING_PATH, 'data-requests');

// ============ INITIALIZATION ============

function ensureDirectories(): void {
  const dirs = [LEARNING_PATH, INSIGHTS_PATH, REQUESTS_PATH];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// ============ VERIFICATION ENGINE ============

/**
 * Verify a claim against known sources of truth
 * NEVER trust unverified claims
 */
export function verifyClaim(
  claim: string,
  domain: string,
  expectedValue?: unknown
): VerificationResult {
  ensureDirectories();

  const result: VerificationResult = {
    verified: false,
    confidence: 0,
    sources: [],
    contradictions: [],
    missingData: [],
    recommendation: 'needs_more_data',
  };

  // Check sources of truth
  const truths = [];
  try {
    const truthsPath = path.join(DATA_ROOT, 'memory', 'truths');
    if (fs.existsSync(truthsPath)) {
      const files = fs.readdirSync(truthsPath);
      for (const file of files) {
        if (file.startsWith(domain)) {
          const content = fs.readFileSync(path.join(truthsPath, file), 'utf-8');
          truths.push(JSON.parse(content));
        }
      }
    }
  } catch {
    // No truths found
  }

  if (truths.length > 0) {
    result.sources.push(...truths.map(t => t.source));
    result.confidence += 0.3;
  }

  // Check related files
  const relatedFiles = searchFiles(claim);
  if (relatedFiles.length > 0) {
    result.sources.push(...relatedFiles.slice(0, 3).map(f => f.originalName));
    result.confidence += 0.2;
  }

  // Check for contradictions
  const contradictions = getContradictions();
  const relevantContradictions = contradictions.filter(c =>
    String(c.valueA).toLowerCase().includes(claim.toLowerCase()) ||
    String(c.valueB).toLowerCase().includes(claim.toLowerCase())
  );

  if (relevantContradictions.length > 0) {
    result.contradictions.push(
      ...relevantContradictions.map(c => `${c.sourceA} vs ${c.sourceB}`)
    );
    result.confidence -= 0.2;
  }

  // Determine recommendation
  if (result.confidence >= 0.7 && result.contradictions.length === 0) {
    result.verified = true;
    result.recommendation = 'trust';
  } else if (result.confidence >= 0.4) {
    result.recommendation = 'verify_manually';
  } else if (result.contradictions.length > 0) {
    result.recommendation = 'reject';
  } else {
    result.missingData.push(`Need more data about: ${domain}`);
    result.recommendation = 'needs_more_data';
  }

  return result;
}

/**
 * Learn from a verified observation
 * Only learns things that have been verified
 */
export function learnFromObservation(
  observation: string,
  source: string,
  category: CompressedLearning['category'],
  confidence: number = 0.5
): CompressedLearning {
  // Verify before learning
  const verification = verifyClaim(observation, category);

  // Adjust confidence based on verification
  const adjustedConfidence = Math.min(
    1,
    confidence * (verification.verified ? 1.2 : 0.7)
  );

  const learning = addLearning({
    category,
    content: observation,
    confidence: adjustedConfidence,
    source,
  });

  // Save insight
  const insight: Insight = {
    id: learning.id,
    timestamp: new Date().toISOString(),
    type: 'observation',
    content: observation,
    confidence: adjustedConfidence,
    sources: [{ type: 'file', reference: source, timestamp: new Date().toISOString(), reliability: adjustedConfidence }],
    verified: verification.verified,
    verificationDetails: verification,
  };

  const insightPath = path.join(INSIGHTS_PATH, `${insight.id}.json`);
  fs.writeFileSync(insightPath, JSON.stringify(insight, null, 2));

  return learning;
}

/**
 * Recognize and record a pattern
 * Patterns must be seen multiple times to be trusted
 */
export function recognizePattern(
  name: string,
  description: string,
  context: string
): Pattern {
  return addPattern({
    name,
    description,
    context,
  });
}

/**
 * Apply a correction when we got something wrong
 * This is how the system improves
 */
export function applyCorrection(
  original: string,
  corrected: string,
  reason: string,
  affectedItems: string[] = []
): Correction {
  return addCorrection({
    original,
    corrected,
    reason,
    appliedTo: affectedItems,
  });
}

// ============ SYNTHESIS ENGINE ============

/**
 * Synthesize information from multiple sources
 * Connect dots, don't make them up
 */
export function synthesizeInformation(
  topic: string,
  sources: string[]
): SynthesisResult {
  ensureDirectories();

  const result: SynthesisResult = {
    conclusion: '',
    confidence: 0,
    supportingEvidence: [],
    contradictoryEvidence: [],
    assumptions: [],
    gaps: [],
    recommendation: '',
  };

  // Gather evidence from files
  const files = searchFiles(topic);
  for (const file of files.slice(0, 10)) {
    result.supportingEvidence.push(`File: ${file.originalName} - ${file.summary}`);
  }

  // Check for contradictions
  const contradictions = getContradictions();
  for (const c of contradictions) {
    if (
      String(c.valueA).toLowerCase().includes(topic.toLowerCase()) ||
      String(c.valueB).toLowerCase().includes(topic.toLowerCase())
    ) {
      result.contradictoryEvidence.push(
        `Contradiction: ${c.sourceA} says "${c.valueA}" but ${c.sourceB} says "${c.valueB}"`
      );
    }
  }

  // Calculate confidence
  const evidenceScore = Math.min(1, result.supportingEvidence.length * 0.1);
  const contradictionPenalty = result.contradictoryEvidence.length * 0.15;
  result.confidence = Math.max(0, evidenceScore - contradictionPenalty);

  // Identify gaps
  if (result.supportingEvidence.length === 0) {
    result.gaps.push(`No data found about: ${topic}`);
  }
  if (result.contradictoryEvidence.length > 0) {
    result.gaps.push('Contradictions need resolution');
  }

  // Generate conclusion
  if (result.confidence >= 0.7) {
    result.conclusion = `Based on ${result.supportingEvidence.length} sources, the evidence supports conclusions about ${topic}`;
    result.recommendation = 'Proceed with confidence, monitor for new data';
  } else if (result.confidence >= 0.4) {
    result.conclusion = `Partial evidence available for ${topic}, but gaps exist`;
    result.recommendation = 'Seek additional data before making major decisions';
  } else {
    result.conclusion = `Insufficient evidence to draw conclusions about ${topic}`;
    result.recommendation = 'Do not act on this topic until more data is gathered';
  }

  // Note assumptions
  if (result.supportingEvidence.length > 0 && result.contradictoryEvidence.length > 0) {
    result.assumptions.push('Assuming more recent data takes precedence');
  }

  return result;
}

// ============ DATA REQUESTS ============

/**
 * Request data when we don't know something
 * Honest about what we don't know
 */
export function requestData(
  domain: string,
  question: string,
  priority: DataRequest['priority'] = 'medium'
): DataRequest {
  ensureDirectories();

  const request: DataRequest = {
    id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    domain,
    question,
    priority,
    status: 'pending',
  };

  const requestPath = path.join(REQUESTS_PATH, `${request.id}.json`);
  fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));

  return request;
}

export function answerRequest(
  requestId: string,
  answer: unknown,
  answeredBy: string
): DataRequest | null {
  const requestPath = path.join(REQUESTS_PATH, `${requestId}.json`);

  try {
    const content = fs.readFileSync(requestPath, 'utf-8');
    const request: DataRequest = JSON.parse(content);

    request.status = 'answered';
    request.answer = answer;
    request.answeredBy = answeredBy;
    request.answeredAt = new Date().toISOString();

    fs.writeFileSync(requestPath, JSON.stringify(request, null, 2));

    return request;
  } catch {
    return null;
  }
}

export function getPendingRequests(): DataRequest[] {
  ensureDirectories();

  const requests: DataRequest[] = [];

  try {
    const files = fs.readdirSync(REQUESTS_PATH);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(path.join(REQUESTS_PATH, file), 'utf-8');
        const request: DataRequest = JSON.parse(content);
        if (request.status === 'pending') {
          requests.push(request);
        }
      }
    }
  } catch {
    // No requests
  }

  return requests.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============ SELF-IMPROVEMENT ============

/**
 * Analyze recent sessions and extract learnings
 * This is how the system gets smarter
 */
export function extractSessionLearnings(sessionSummary: string): CompressedLearning[] {
  const learnings: CompressedLearning[] = [];

  // Extract patterns (things mentioned multiple times)
  const words = sessionSummary.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 5) { // Only meaningful words
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  // Find repeated concepts
  for (const [word, count] of Object.entries(wordCount)) {
    if (count >= 3) {
      const pattern = recognizePattern(
        `frequent_${word}`,
        `The term "${word}" appeared ${count} times in this session`,
        sessionSummary.substring(0, 200)
      );
      console.log(`Pattern recognized: ${pattern.name}`);
    }
  }

  // Extract any explicit learnings (lines starting with "Learned:" or "Note:")
  const lines = sessionSummary.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().startsWith('learned:') || line.toLowerCase().startsWith('note:')) {
      const learning = learnFromObservation(
        line.replace(/^(learned:|note:)\s*/i, ''),
        'session_analysis',
        'discovery',
        0.6
      );
      learnings.push(learning);
    }
  }

  return learnings;
}

/**
 * Generate questions when we're uncertain
 * Seek clarity, don't guess
 */
export function generateClarifyingQuestions(topic: string): string[] {
  const questions: string[] = [];

  // Check what we don't know about this topic
  const synthesis = synthesizeInformation(topic, []);

  if (synthesis.gaps.length > 0) {
    for (const gap of synthesis.gaps) {
      questions.push(`Can you provide data about: ${gap}?`);
    }
  }

  if (synthesis.contradictoryEvidence.length > 0) {
    questions.push(`There are contradictions about ${topic}. Which source should we trust?`);
  }

  if (synthesis.confidence < 0.5) {
    questions.push(`I have low confidence about ${topic}. What's the authoritative source?`);
  }

  // Also check for pending data requests
  const pendingRequests = getPendingRequests();
  for (const request of pendingRequests) {
    if (request.domain.toLowerCase().includes(topic.toLowerCase())) {
      questions.push(`Previously asked: ${request.question}`);
    }
  }

  return questions;
}

// ============ TRUTH ESTABLISHMENT ============

/**
 * Establish a source of truth from verified data
 * Only call this with verified information
 */
export function establishTruth(
  domain: string,
  key: string,
  value: unknown,
  source: string,
  verificationMethod: 'api' | 'file' | 'user_confirmed' | 'calculated' | 'inferred',
  confidence: number = 1.0
) {
  return setTruth(domain, key, value, source, verificationMethod, confidence);
}

/**
 * Query the source of truth
 * Returns undefined if we don't know
 */
export function queryTruth(domain: string, key: string): unknown | undefined {
  const truth = getTruth(domain, key);
  return truth?.value;
}

// ============ CONTEXT GENERATION ============

export function generateLearningContext(): string {
  ensureDirectories();

  const pendingRequests = getPendingRequests();

  const lines = [
    `# BREZ Learning Engine Status`,
    `*Generated: ${new Date().toISOString()}*`,
    '',
  ];

  // Pending data requests
  if (pendingRequests.length > 0) {
    lines.push(`## Pending Data Requests`);
    for (const request of pendingRequests.slice(0, 5)) {
      lines.push(`- [${request.priority}] ${request.domain}: ${request.question}`);
    }
    lines.push('');
  }

  // Recent insights
  try {
    const insightFiles = fs.readdirSync(INSIGHTS_PATH).slice(-10);
    if (insightFiles.length > 0) {
      lines.push(`## Recent Insights`);
      for (const file of insightFiles) {
        const content = fs.readFileSync(path.join(INSIGHTS_PATH, file), 'utf-8');
        const insight: Insight = JSON.parse(content);
        const verified = insight.verified ? '✓' : '?';
        lines.push(`- [${verified}] ${insight.content} (${(insight.confidence * 100).toFixed(0)}%)`);
      }
      lines.push('');
    }
  } catch {
    // No insights
  }

  lines.push(`## Operating Principles`);
  lines.push(`1. Never claim certainty without verified sources`);
  lines.push(`2. Ask for data when uncertain`);
  lines.push(`3. Learn from corrections`);
  lines.push(`4. Synthesize, don't invent`);
  lines.push(`5. Admit "I don't know" when appropriate`);

  return lines.join('\n');
}
