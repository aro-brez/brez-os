#!/usr/bin/env npx ts-node
/**
 * BREZ Data Drop Ingestion Script
 * Run with: npx ts-node scripts/ingest-data-drop.ts <path-to-drop>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============ PATHS ============

const DATA_ROOT = path.join(process.env.HOME || '/tmp', '.brez-supermind');
const FILES_ROOT = path.join(DATA_ROOT, 'files');
const INDEX_PATH = path.join(DATA_ROOT, 'index', 'file-index.json');

// ============ TYPES ============

interface FileEntry {
  id: string;
  hash: string;
  originalName: string;
  storedPath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  source: string;
  category: string;
  tags: string[];
  summary: string;
  keyDataPoints: string[];
  relatedFiles: string[];
  processed: boolean;
  processingNotes: string[];
}

interface FileIndex {
  version: string;
  lastUpdated: string;
  totalFiles: number;
  totalSize: number;
  files: FileEntry[];
  byCategory: Record<string, string[]>;
  byTag: Record<string, string[]>;
  byHash: Record<string, string>;
}

// ============ CATEGORY DETECTION ============

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  financial: [/budget/i, /finance/i, /cash/i, /p&l/i, /wip/i, /expense/i, /revenue/i],
  retail: [/retail/i, /velocity/i, /wholesale/i, /by.?state/i, /by.?week/i],
  marketing: [/spend/i, /campaign/i, /ad\b/i, /meta/i, /cac/i, /roas/i],
  team: [/org\s*chart/i, /equity/i, /incentive/i, /department/i],
  brand: [/brand/i, /moodboard/i, /guideline/i],
  supermind: [/supermind/i, /ai/i, /export/i],
};

function detectCategory(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerName)) return category;
    }
  }
  return 'unknown';
}

function extractTags(fileName: string, category: string): string[] {
  const tags: string[] = [category];
  const name = fileName.toLowerCase();

  const yearMatch = name.match(/20\d{2}/);
  if (yearMatch) tags.push(yearMatch[0]);

  if (name.includes('draft')) tags.push('draft');
  if (name.includes('wip')) tags.push('wip');
  if (name.includes('weekly')) tags.push('weekly');
  if (name.includes('report')) tags.push('report');
  if (name.includes('dashboard')) tags.push('dashboard');

  return [...new Set(tags)];
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// ============ INDEX OPERATIONS ============

function loadIndex(): FileIndex {
  try {
    if (fs.existsSync(INDEX_PATH)) {
      const content = fs.readFileSync(INDEX_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error loading index:', e);
  }

  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalFiles: 0,
    totalSize: 0,
    files: [],
    byCategory: {},
    byTag: {},
    byHash: {},
  };
}

function saveIndex(index: FileIndex): void {
  const dir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

// ============ MAIN INGESTION ============

async function ingestFile(sourcePath: string, uploadedBy: string): Promise<FileEntry | null> {
  const index = loadIndex();

  // Compute hash
  const content = fs.readFileSync(sourcePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  // Check for duplicate
  if (index.byHash[hash]) {
    console.log(`  SKIP (duplicate): ${path.basename(sourcePath)}`);
    return null;
  }

  const originalName = path.basename(sourcePath);
  const stats = fs.statSync(sourcePath);
  const category = detectCategory(originalName);
  const tags = extractTags(originalName, category);

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
    uploadedBy,
    source: 'data_drop',
    category,
    tags,
    summary: `${category} file: ${originalName}`,
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

  console.log(`  ✓ ${originalName} [${category}] -> ${storedPath}`);

  return entry;
}

async function ingestDirectory(dirPath: string, uploadedBy: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    // Skip macOS metadata
    if (file.startsWith('._') || file === '__MACOSX' || file === '.DS_Store') {
      continue;
    }

    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      console.log(`\nDirectory: ${file}/`);
      const subEntries = await ingestDirectory(fullPath, uploadedBy);
      entries.push(...subEntries);
    } else {
      const entry = await ingestFile(fullPath, uploadedBy);
      if (entry) {
        entries.push(entry);
      }
    }
  }

  return entries;
}

// ============ CLI ============

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx ts-node scripts/ingest-data-drop.ts <path-to-drop> [uploader-name]');
    process.exit(1);
  }

  const dropPath = args[0];
  const uploadedBy = args[1] || 'aaron';

  if (!fs.existsSync(dropPath)) {
    console.error(`Path not found: ${dropPath}`);
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  BREZ SUPERMIND - Data Drop Ingestion                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\nSource: ${dropPath}`);
  console.log(`Uploader: ${uploadedBy}`);
  console.log(`Destination: ${FILES_ROOT}\n`);

  const stats = fs.statSync(dropPath);
  let entries: FileEntry[];

  if (stats.isDirectory()) {
    entries = await ingestDirectory(dropPath, uploadedBy);
  } else {
    const entry = await ingestFile(dropPath, uploadedBy);
    entries = entry ? [entry] : [];
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  INGESTION COMPLETE                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\nFiles ingested: ${entries.length}`);

  const categoryCounts: Record<string, number> = {};
  let totalSize = 0;
  for (const entry of entries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    totalSize += entry.size;
  }

  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count} files`);
  }

  console.log(`\nFiles stored in: ${FILES_ROOT}`);
  console.log(`Index updated: ${INDEX_PATH}`);
}

main().catch(console.error);
