// =============================================================================
// BREZ DATA MEMORY - Persistent Storage Layer
// =============================================================================
// This system NEVER forgets. All uploaded data is versioned and stored.
// Context learned from data is preserved and tested for improvements.
//
// When Brittani uploads data:
// 1. Data is validated and stored with timestamp
// 2. Previous version is archived (never deleted)
// 3. Context/learnings are extracted and stored
// 4. Optimizer auto-recalculates
// 5. Next data need is surfaced
// =============================================================================

export interface DataUpload {
  id: string;
  source: string; // Team member who provided it
  category: DataCategory;
  uploadedBy: string; // Usually "Brittani"
  uploadedAt: string; // ISO timestamp
  data: Record<string, unknown>;
  rawInput?: string; // Original format if pasted/uploaded
  validated: boolean;
  validationErrors: string[];
  version: number;
}

export interface LearnedContext {
  id: string;
  category: DataCategory;
  insight: string;
  confidence: number; // 0-100
  learnedAt: string;
  validatedBy?: string; // If manually confirmed
  supersededBy?: string; // If a newer learning replaces this
  testResults: TestResult[];
}

export interface TestResult {
  testedAt: string;
  hypothesis: string;
  result: 'confirmed' | 'refuted' | 'inconclusive';
  evidence: string;
}

export type DataCategory =
  | 'cash_flow'
  | 'dtc_ads'
  | 'retail_velocity'
  | 'inventory'
  | 'cogs'
  | 'retention'
  | 'cm_dollars'
  | 'production'
  | 'ap_aging'
  | 'ar_collections';

export type TeamMember =
  | 'brian' // CRO - Retail
  | 'dan' // COO - Ops/Cash
  | 'cramer' // Finance
  | 'david' // Paid Ads
  | 'nick' // Retention
  | 'travis' // Product
  | 'abla' // VP Finance
  | 'niall' // VP Sales
  | 'alan'; // Head of Growth

// =============================================================================
// DATA MEMORY STORE
// =============================================================================

export const DATA_MEMORY: {
  uploads: DataUpload[];
  learnings: LearnedContext[];
  lastSyncedAt: string;
} = {
  uploads: [],
  learnings: [],
  lastSyncedAt: new Date().toISOString(),
};

// =============================================================================
// UPLOAD ARCHIVE - Never delete, always version
// =============================================================================

export const UPLOAD_ARCHIVE: {
  [category in DataCategory]: {
    current: DataUpload | null;
    history: DataUpload[];
    lastUpdated: string | null;
    updateFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
    owner: TeamMember;
    backupOwner: TeamMember;
  };
} = {
  cash_flow: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'dan',
    backupOwner: 'abla',
  },
  dtc_ads: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'david',
    backupOwner: 'alan',
  },
  retail_velocity: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'brian',
    backupOwner: 'niall',
  },
  inventory: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'dan',
    backupOwner: 'dan',
  },
  cogs: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'monthly',
    owner: 'travis',
    backupOwner: 'dan',
  },
  retention: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'monthly',
    owner: 'nick',
    backupOwner: 'alan',
  },
  cm_dollars: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'cramer',
    backupOwner: 'abla',
  },
  production: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'monthly',
    owner: 'dan',
    backupOwner: 'travis',
  },
  ap_aging: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'abla',
    backupOwner: 'dan',
  },
  ar_collections: {
    current: null,
    history: [],
    lastUpdated: null,
    updateFrequency: 'weekly',
    owner: 'abla',
    backupOwner: 'brian',
  },
};

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Store new data upload - archives previous version, never deletes
 */
export function storeUpload(
  category: DataCategory,
  data: Record<string, unknown>,
  source: TeamMember,
  uploadedBy: string = 'Brittani',
  rawInput?: string
): DataUpload {
  const archive = UPLOAD_ARCHIVE[category];

  // Archive current version if exists
  if (archive.current) {
    archive.history.push(archive.current);
  }

  // Create new upload
  const upload: DataUpload = {
    id: `${category}_${Date.now()}`,
    source,
    category,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    data,
    rawInput,
    validated: false,
    validationErrors: [],
    version: archive.history.length + 1,
  };

  // Validate
  const validation = validateUpload(category, data);
  upload.validated = validation.valid;
  upload.validationErrors = validation.errors;

  // Store
  archive.current = upload;
  archive.lastUpdated = upload.uploadedAt;
  DATA_MEMORY.uploads.push(upload);
  DATA_MEMORY.lastSyncedAt = new Date().toISOString();

  // Extract learnings
  const learnings = extractLearnings(category, data, archive.history);
  learnings.forEach(l => DATA_MEMORY.learnings.push(l));

  return upload;
}

/**
 * Validate upload based on category schema
 */
function validateUpload(
  category: DataCategory,
  data: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (category) {
    case 'cash_flow':
      if (!data.weeklyForecast) errors.push('Missing weeklyForecast array');
      if (!data.currentBalance) errors.push('Missing currentBalance');
      break;
    case 'dtc_ads':
      if (!data.platforms) errors.push('Missing platforms breakdown');
      if (!data.period) errors.push('Missing period (WTD/MTD)');
      break;
    case 'retail_velocity':
      if (!data.retailers) errors.push('Missing retailers array');
      if (!data.alphaLow) errors.push('Missing alphaLow (sell-thru only)');
      if (!data.alphaHigh) errors.push('Missing alphaHigh (sell-thru + wholesale)');
      break;
    case 'cm_dollars':
      if (!data.weeklyData) errors.push('Missing weeklyData array');
      if (!data.segments) errors.push('Missing segments (new/sub/nonSub)');
      break;
    case 'retention':
      if (!data.cohorts) errors.push('Missing cohorts array');
      if (!data.churnRate) errors.push('Missing churnRate');
      break;
    case 'inventory':
      if (!data.skuBurnRates) errors.push('Missing skuBurnRates array');
      break;
    case 'cogs':
      if (!data.skuCogs) errors.push('Missing skuCogs breakdown');
      break;
    case 'production':
      if (!data.schedule) errors.push('Missing production schedule');
      if (!data.paymentDates) errors.push('Missing payment dates');
      break;
    case 'ap_aging':
      if (!data.vendors) errors.push('Missing vendors array');
      if (!data.totalAP) errors.push('Missing totalAP');
      break;
    case 'ar_collections':
      if (!data.outstanding) errors.push('Missing outstanding AR');
      if (!data.dso) errors.push('Missing DSO');
      break;
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extract learnings from new data compared to history
 */
function extractLearnings(
  category: DataCategory,
  newData: Record<string, unknown>,
  history: DataUpload[]
): LearnedContext[] {
  const learnings: LearnedContext[] = [];

  if (history.length === 0) return learnings;

  const previous = history[history.length - 1];

  // Compare and extract patterns
  switch (category) {
    case 'dtc_ads': {
      const newPlatforms = newData.platforms as Record<string, { cac: number }> | undefined;
      const oldPlatforms = previous.data.platforms as Record<string, { cac: number }> | undefined;

      if (newPlatforms && oldPlatforms) {
        for (const [platform, data] of Object.entries(newPlatforms)) {
          const oldData = oldPlatforms[platform];
          if (oldData && data.cac < oldData.cac * 0.9) {
            learnings.push({
              id: `learning_${Date.now()}_${platform}`,
              category,
              insight: `${platform} CAC improved ${Math.round((1 - data.cac / oldData.cac) * 100)}% week-over-week`,
              confidence: 70,
              learnedAt: new Date().toISOString(),
              testResults: [],
            });
          }
        }
      }
      break;
    }
    case 'cm_dollars': {
      const newCM = newData.totalCM as number | undefined;
      const oldCM = previous.data.totalCM as number | undefined;

      if (newCM && oldCM && newCM > oldCM * 1.05) {
        learnings.push({
          id: `learning_${Date.now()}_cm_growth`,
          category,
          insight: `CM$ growing ${Math.round((newCM / oldCM - 1) * 100)}% - CM$ strategy working`,
          confidence: 80,
          learnedAt: new Date().toISOString(),
          testResults: [],
        });
      }
      break;
    }
    // Add more category-specific learning extraction
  }

  return learnings;
}

/**
 * Get all learnings for a category, sorted by confidence
 */
export function getLearnings(category?: DataCategory): LearnedContext[] {
  let learnings = DATA_MEMORY.learnings;

  if (category) {
    learnings = learnings.filter(l => l.category === category);
  }

  // Filter out superseded learnings
  learnings = learnings.filter(l => !l.supersededBy);

  return learnings.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Test a learning hypothesis against new data
 */
export function testLearning(
  learningId: string,
  hypothesis: string,
  result: 'confirmed' | 'refuted' | 'inconclusive',
  evidence: string
): void {
  const learning = DATA_MEMORY.learnings.find(l => l.id === learningId);

  if (learning) {
    learning.testResults.push({
      testedAt: new Date().toISOString(),
      hypothesis,
      result,
      evidence,
    });

    // Adjust confidence based on test results
    if (result === 'confirmed') {
      learning.confidence = Math.min(100, learning.confidence + 10);
    } else if (result === 'refuted') {
      learning.confidence = Math.max(0, learning.confidence - 20);
    }
  }
}

/**
 * Get upload history for a category
 */
export function getUploadHistory(category: DataCategory): DataUpload[] {
  const archive = UPLOAD_ARCHIVE[category];
  const history = [...archive.history];
  if (archive.current) {
    history.push(archive.current);
  }
  return history.sort((a, b) =>
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Get current data for a category
 */
export function getCurrentData(category: DataCategory): DataUpload | null {
  return UPLOAD_ARCHIVE[category].current;
}

/**
 * Get staleness in days for a category
 */
export function getStalenessDays(category: DataCategory): number {
  const lastUpdated = UPLOAD_ARCHIVE[category].lastUpdated;
  if (!lastUpdated) return Infinity;

  const now = new Date();
  const updated = new Date(lastUpdated);
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if category needs update based on frequency
 */
export function needsUpdate(category: DataCategory): boolean {
  const archive = UPLOAD_ARCHIVE[category];
  const staleDays = getStalenessDays(category);

  switch (archive.updateFrequency) {
    case 'daily':
      return staleDays >= 1;
    case 'weekly':
      return staleDays >= 7;
    case 'monthly':
      return staleDays >= 30;
    case 'as_needed':
      return staleDays >= 90; // Flag if 3+ months
  }
}

// =============================================================================
// MEMORY SUMMARY
// =============================================================================

export function getMemorySummary() {
  const categories = Object.keys(UPLOAD_ARCHIVE) as DataCategory[];

  return {
    totalUploads: DATA_MEMORY.uploads.length,
    totalLearnings: DATA_MEMORY.learnings.length,
    activeLearnings: DATA_MEMORY.learnings.filter(l => !l.supersededBy).length,
    lastSynced: DATA_MEMORY.lastSyncedAt,
    categorySummary: categories.map(cat => ({
      category: cat,
      hasData: UPLOAD_ARCHIVE[cat].current !== null,
      versions: UPLOAD_ARCHIVE[cat].history.length + (UPLOAD_ARCHIVE[cat].current ? 1 : 0),
      lastUpdated: UPLOAD_ARCHIVE[cat].lastUpdated,
      staleDays: getStalenessDays(cat),
      needsUpdate: needsUpdate(cat),
      owner: UPLOAD_ARCHIVE[cat].owner,
    })),
  };
}
