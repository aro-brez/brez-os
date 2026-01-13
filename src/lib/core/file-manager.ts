/**
 * BREZ FILE MANAGER
 * Stores, indexes, and contextualizes all files for the Supermind
 * Every file ever uploaded becomes part of the collective memory
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { addDataIngestion } from './session-logger';

// ============ TYPES ============

export interface FileEntry {
  id: string;
  hash: string; // SHA-256 for deduplication
  originalName: string;
  storedPath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  source: 'claude_code' | 'app_upload' | 'api_sync' | 'data_drop' | 'export';

  // Contextualization
  category: FileCategory;
  tags: string[];
  summary: string;
  keyDataPoints: string[];

  // Relationships
  relatedFiles: string[];
  supersedes?: string; // ID of file this replaces
  supersededBy?: string; // ID of file that replaced this

  // Processing
  processed: boolean;
  processingNotes: string[];
  extractedData?: ExtractedData;
}

export type FileCategory =
  | 'financial'
  | 'retail'
  | 'marketing'
  | 'product'
  | 'team'
  | 'brand'
  | 'legal'
  | 'operations'
  | 'customer'
  | 'supermind'
  | 'unknown';

export interface ExtractedData {
  type: 'spreadsheet' | 'document' | 'image' | 'pdf' | 'json' | 'other';
  sheetNames?: string[];
  rowCount?: number;
  columnHeaders?: string[];
  dateRange?: { start: string; end: string };
  keyMetrics?: Record<string, number | string>;
  textContent?: string;
}

export interface FileIndex {
  version: string;
  lastUpdated: string;
  totalFiles: number;
  totalSize: number;
  files: FileEntry[];
  byCategory: Record<FileCategory, string[]>;
  byTag: Record<string, string[]>;
  byHash: Record<string, string>; // hash -> id for dedup
}

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const FILES_ROOT = path.join(DATA_ROOT, 'files');
const INDEX_PATH = path.join(DATA_ROOT, 'index', 'file-index.json');

// ============ CATEGORY DETECTION ============

const CATEGORY_PATTERNS: Record<FileCategory, RegExp[]> = {
  financial: [
    /budget/i, /finance/i, /cash/i, /p&l/i, /profit/i, /loss/i, /revenue/i,
    /expense/i, /ap\b/i, /ar\b/i, /payable/i, /receivable/i, /wip/i,
  ],
  retail: [
    /retail/i, /velocity/i, /wholesale/i, /store/i, /door/i, /sell.?through/i,
    /inventory/i, /sku/i, /by.?state/i, /by.?week/i,
  ],
  marketing: [
    /spend/i, /campaign/i, /ad\b/i, /meta/i, /google/i, /tiktok/i,
    /cac/i, /roas/i, /creative/i, /influencer/i,
  ],
  product: [
    /product/i, /formula/i, /ingredient/i, /sku/i, /flavor/i,
    /packaging/i, /label/i,
  ],
  team: [
    /org\s*chart/i, /equity/i, /incentive/i, /department/i, /team/i,
    /employee/i, /hire/i, /compensation/i,
  ],
  brand: [
    /brand/i, /moodboard/i, /guideline/i, /logo/i, /color/i,
    /typography/i, /asset/i,
  ],
  legal: [
    /legal/i, /contract/i, /agreement/i, /compliance/i, /regulatory/i,
    /thc/i, /fda/i,
  ],
  operations: [
    /ops/i, /operation/i, /fulfillment/i, /shipping/i, /production/i,
    /supply/i, /vendor/i, /3pl/i,
  ],
  customer: [
    /customer/i, /review/i, /feedback/i, /nps/i, /support/i, /ticket/i,
    /churn/i, /retention/i, /subscription/i,
  ],
  supermind: [
    /supermind/i, /claude/i, /ai/i, /export/i, /session/i, /learning/i,
  ],
  unknown: [],
};

function detectCategory(fileName: string, content?: string): FileCategory {
  const textToSearch = `${fileName} ${content || ''}`.toLowerCase();

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (category === 'unknown') continue;
    for (const pattern of patterns) {
      if (pattern.test(textToSearch)) {
        return category as FileCategory;
      }
    }
  }

  return 'unknown';
}

function extractTags(fileName: string, category: FileCategory): string[] {
  const tags: string[] = [category];
  const name = fileName.toLowerCase();

  // Year tags
  const yearMatch = name.match(/20\d{2}/);
  if (yearMatch) tags.push(yearMatch[0]);

  // Common tags
  if (name.includes('draft')) tags.push('draft');
  if (name.includes('wip')) tags.push('wip');
  if (name.includes('final')) tags.push('final');
  if (name.includes('weekly')) tags.push('weekly');
  if (name.includes('monthly')) tags.push('monthly');
  if (name.includes('daily')) tags.push('daily');
  if (name.includes('report')) tags.push('report');
  if (name.includes('analysis')) tags.push('analysis');
  if (name.includes('dashboard')) tags.push('dashboard');

  return [...new Set(tags)];
}

// ============ FILE OPERATIONS ============

function loadIndex(): FileIndex {
  try {
    const content = fs.readFileSync(INDEX_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalFiles: 0,
      totalSize: 0,
      files: [],
      byCategory: {} as Record<FileCategory, string[]>,
      byTag: {},
      byHash: {},
    };
  }
}

function saveIndex(index: FileIndex): void {
  const dir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

function computeHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// ============ PUBLIC API ============

export interface StoreFileOptions {
  source: FileEntry['source'];
  uploadedBy: string;
  tags?: string[];
  summary?: string;
  category?: FileCategory;
}

export async function storeFile(
  sourcePath: string,
  options: StoreFileOptions
): Promise<FileEntry> {
  const index = loadIndex();

  // Compute hash for deduplication
  const hash = computeHash(sourcePath);

  // Check for duplicate
  if (index.byHash[hash]) {
    const existingFile = index.files.find(f => f.id === index.byHash[hash]);
    if (existingFile) {
      console.log(`File already exists: ${existingFile.originalName}`);
      return existingFile;
    }
  }

  const originalName = path.basename(sourcePath);
  const stats = fs.statSync(sourcePath);
  const category = options.category || detectCategory(originalName);
  const tags = [...(options.tags || []), ...extractTags(originalName, category)];

  // Create storage path
  const dateStr = new Date().toISOString().split('T')[0];
  const storageDir = path.join(FILES_ROOT, category, dateStr);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const ext = path.extname(originalName);
  const storedName = `${fileId}${ext}`;
  const storedPath = path.join(storageDir, storedName);

  // Copy file
  fs.copyFileSync(sourcePath, storedPath);

  // Create entry
  const entry: FileEntry = {
    id: fileId,
    hash,
    originalName,
    storedPath,
    mimeType: getMimeType(originalName),
    size: stats.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: options.uploadedBy,
    source: options.source,
    category,
    tags,
    summary: options.summary || `${category} file: ${originalName}`,
    keyDataPoints: [],
    relatedFiles: [],
    processed: false,
    processingNotes: [],
  };

  // Update index
  index.files.push(entry);
  index.totalFiles++;
  index.totalSize += stats.size;
  index.byHash[hash] = fileId;

  if (!index.byCategory[category]) {
    index.byCategory[category] = [];
  }
  index.byCategory[category].push(fileId);

  for (const tag of tags) {
    if (!index.byTag[tag]) {
      index.byTag[tag] = [];
    }
    index.byTag[tag].push(fileId);
  }

  index.lastUpdated = new Date().toISOString();
  saveIndex(index);

  // Log ingestion
  addDataIngestion({
    source: options.source,
    fileType: getMimeType(originalName),
    fileName: originalName,
    size: stats.size,
    summary: entry.summary,
    dataPoints: entry.keyDataPoints,
    storedPath: entry.storedPath,
  });

  return entry;
}

export async function storeDataDrop(
  dropPath: string,
  uploadedBy: string
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];

  const files = fs.readdirSync(dropPath);
  for (const file of files) {
    // Skip macOS metadata
    if (file.startsWith('._') || file === '__MACOSX' || file === '.DS_Store') {
      continue;
    }

    const fullPath = path.join(dropPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively process directories
      const subEntries = await storeDataDrop(fullPath, uploadedBy);
      entries.push(...subEntries);
    } else {
      try {
        const entry = await storeFile(fullPath, {
          source: 'data_drop',
          uploadedBy,
        });
        entries.push(entry);
        console.log(`Stored: ${file}`);
      } catch (error) {
        console.error(`Failed to store ${file}:`, error);
      }
    }
  }

  return entries;
}

export function getFileById(id: string): FileEntry | undefined {
  const index = loadIndex();
  return index.files.find(f => f.id === id);
}

export function getFilesByCategory(category: FileCategory): FileEntry[] {
  const index = loadIndex();
  const ids = index.byCategory[category] || [];
  return ids.map(id => index.files.find(f => f.id === id)).filter(Boolean) as FileEntry[];
}

export function getFilesByTag(tag: string): FileEntry[] {
  const index = loadIndex();
  const ids = index.byTag[tag] || [];
  return ids.map(id => index.files.find(f => f.id === id)).filter(Boolean) as FileEntry[];
}

export function searchFiles(query: string): FileEntry[] {
  const index = loadIndex();
  const lowerQuery = query.toLowerCase();

  return index.files.filter(f =>
    f.originalName.toLowerCase().includes(lowerQuery) ||
    f.summary.toLowerCase().includes(lowerQuery) ||
    f.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    f.keyDataPoints.some(dp => dp.toLowerCase().includes(lowerQuery))
  );
}

export function getRecentFiles(count: number = 10): FileEntry[] {
  const index = loadIndex();
  return [...index.files]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, count);
}

export function getFileStats(): {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  recentUploads: number;
} {
  const index = loadIndex();

  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let recentUploads = 0;

  for (const file of index.files) {
    byCategory[file.category] = (byCategory[file.category] || 0) + 1;
    bySource[file.source] = (bySource[file.source] || 0) + 1;

    if (new Date(file.uploadedAt).getTime() > weekAgo) {
      recentUploads++;
    }
  }

  return {
    totalFiles: index.totalFiles,
    totalSize: index.totalSize,
    byCategory,
    bySource,
    recentUploads,
  };
}

export function updateFileContext(
  id: string,
  updates: Partial<Pick<FileEntry, 'summary' | 'keyDataPoints' | 'tags' | 'relatedFiles' | 'extractedData'>>
): FileEntry | undefined {
  const index = loadIndex();
  const file = index.files.find(f => f.id === id);

  if (!file) return undefined;

  if (updates.summary) file.summary = updates.summary;
  if (updates.keyDataPoints) file.keyDataPoints = updates.keyDataPoints;
  if (updates.tags) {
    // Update tag index
    for (const tag of updates.tags) {
      if (!file.tags.includes(tag)) {
        file.tags.push(tag);
        if (!index.byTag[tag]) index.byTag[tag] = [];
        index.byTag[tag].push(id);
      }
    }
  }
  if (updates.relatedFiles) file.relatedFiles = updates.relatedFiles;
  if (updates.extractedData) {
    file.extractedData = updates.extractedData;
    file.processed = true;
  }

  index.lastUpdated = new Date().toISOString();
  saveIndex(index);

  return file;
}

export function generateFileContext(): string {
  const stats = getFileStats();
  const recent = getRecentFiles(10);

  const lines = [
    `# BREZ File Repository`,
    `*Updated: ${new Date().toISOString()}*`,
    '',
    `## Stats`,
    `- Total Files: ${stats.totalFiles}`,
    `- Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
    `- Recent Uploads (7 days): ${stats.recentUploads}`,
    '',
    `## By Category`,
  ];

  for (const [category, count] of Object.entries(stats.byCategory)) {
    lines.push(`- ${category}: ${count} files`);
  }

  lines.push('', `## Recent Files`);
  for (const file of recent) {
    lines.push(`- **${file.originalName}** [${file.category}] - ${file.summary}`);
  }

  return lines.join('\n');
}
