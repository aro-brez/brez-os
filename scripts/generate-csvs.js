const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const basePath = '/Users/aaronnosbisch/Library/Mobile Documents/com~apple~CloudDocs/Stabilization plan';
const outputPath = '/Users/aaronnosbisch/brez-growth-generator/data';

// Helper to convert Excel serial date to YYYY-MM-DD
function excelDateToString(serial) {
  if (typeof serial === 'string') {
    // Already a date string, try to parse
    if (serial.match(/^\d{4}-\d{2}-\d{2}/)) {
      return serial.split('T')[0];
    }
    // Try parsing other formats
    const d = new Date(serial);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return null;
  }
  if (typeof serial !== 'number') return null;

  // Excel serial date to JS date
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

// Helper to get Monday of week for a given week number in a year
function getWeekStart(year, weekNum) {
  // Jan 1 of that year
  const jan1 = new Date(year, 0, 1);
  // Days to add to get to that week's Monday
  const daysToAdd = (weekNum - 1) * 7 - jan1.getDay() + 1;
  const result = new Date(year, 0, 1 + daysToAdd);
  return result.toISOString().split('T')[0];
}

console.log('=== GENERATING CSVs ===\n');

// 1. Generate weekly_retail_velocity.csv from BREZ_Weekly_Velocity_Complete_2025.xlsx
try {
  const velocityPath = path.join(basePath, 'BREZ_Weekly_Velocity_Complete_2025.xlsx');
  const wb = XLSX.readFile(velocityPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Find header row (contains "Week Start")
  let headerIdx = data.findIndex(row => row[0] === 'Week Start');
  if (headerIdx === -1) headerIdx = 3; // fallback

  const rows = [];
  for (let i = headerIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    let weekStart = row[0];
    // Clean up the date string (remove $ and other chars)
    if (typeof weekStart === 'string') {
      weekStart = weekStart.replace(/[^\d-]/g, '');
    }

    // Parse revenue (remove $ and commas)
    let revenue = row[2];
    if (typeof revenue === 'string') {
      revenue = parseFloat(revenue.replace(/[$,]/g, '')) || 0;
    }

    const units = parseInt(row[3]) || 0;
    const doors = parseInt(row[4]) || 0;

    if (weekStart && revenue > 0) {
      rows.push({ week_start: weekStart, retail_revenue: revenue, units, doors });
    }
  }

  // Sort by date
  rows.sort((a, b) => a.week_start.localeCompare(b.week_start));

  // Write CSV
  const csv = 'week_start,retail_revenue,units,doors\n' +
    rows.map(r => `${r.week_start},${r.retail_revenue},${r.units},${r.doors}`).join('\n');

  fs.writeFileSync(path.join(outputPath, 'weekly_retail_velocity.csv'), csv);
  console.log(`✓ weekly_retail_velocity.csv: ${rows.length} rows`);
  console.log(`  Date range: ${rows[0]?.week_start} to ${rows[rows.length-1]?.week_start}`);
} catch (err) {
  console.log(`✗ weekly_retail_velocity.csv failed: ${err.message}`);
}

// 2. Generate weekly_spend.csv from Aaron-data-2.xlsx
try {
  const dataPath = path.join(basePath, 'Aaron-data-2.xlsx');
  const wb = XLSX.readFile(dataPath);

  // Use Summary Sheet - has Weekly Spend data
  const sheet = wb.Sheets['Summary Sheet'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = [];
  // Data starts at row 1 (after header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row[0] === undefined || row[0] === null) continue;

    const weekNum = parseInt(row[0]);
    const weeklySpend = parseFloat(row[1]) || 0;

    if (weekNum >= 1 && weekNum <= 52 && weeklySpend > 0) {
      // Determine year based on context (2025 for recent data)
      const year = weekNum >= 36 ? 2025 : 2025; // All seems to be 2025 data
      const weekStart = getWeekStart(year, weekNum);
      rows.push({ week_start: weekStart, spend_total: Math.round(weeklySpend * 100) / 100 });
    }
  }

  // Remove duplicates (keep first occurrence)
  const uniqueRows = [];
  const seen = new Set();
  for (const row of rows) {
    if (!seen.has(row.week_start)) {
      seen.add(row.week_start);
      uniqueRows.push(row);
    }
  }

  // Sort by date
  uniqueRows.sort((a, b) => a.week_start.localeCompare(b.week_start));

  // Write CSV
  const csv = 'week_start,spend_total\n' +
    uniqueRows.map(r => `${r.week_start},${r.spend_total}`).join('\n');

  fs.writeFileSync(path.join(outputPath, 'weekly_spend.csv'), csv);
  console.log(`✓ weekly_spend.csv: ${uniqueRows.length} rows`);
  console.log(`  Date range: ${uniqueRows[0]?.week_start} to ${uniqueRows[uniqueRows.length-1]?.week_start}`);
} catch (err) {
  console.log(`✗ weekly_spend.csv failed: ${err.message}`);
}

// 3. Also extract key metrics from Summary Sheet for reference
try {
  const dataPath = path.join(basePath, 'Aaron-data-2.xlsx');
  const wb = XLSX.readFile(dataPath);
  const sheet = wb.Sheets['Summary Sheet'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Get averages from recent weeks (last 12 weeks of data)
  const recentRows = data.slice(1, 13).filter(row => row && row[0]);

  if (recentRows.length > 0) {
    const avgCAC = recentRows.reduce((sum, row) => sum + (parseFloat(row[4]) || 0), 0) / recentRows.length;
    const avgAOV = recentRows.reduce((sum, row) => sum + (parseFloat(row[5]) || 0), 0) / recentRows.length;
    const avgMargin = recentRows.reduce((sum, row) => sum + (parseFloat(row[6]) || 0), 0) / recentRows.length;
    const avgSubShare = recentRows.reduce((sum, row) => sum + (parseFloat(row[7]) || 0), 0) / recentRows.length;

    console.log('\n📊 Key Metrics from Recent Data (last 12 weeks):');
    console.log(`   Average CAC: $${avgCAC.toFixed(2)}`);
    console.log(`   Average AOV: $${avgAOV.toFixed(2)}`);
    console.log(`   Average DTC Margin: ${(avgMargin * 100).toFixed(1)}%`);
    console.log(`   Average Sub Share: ${(avgSubShare * 100).toFixed(1)}%`);
  }
} catch (err) {
  console.log(`Could not extract metrics: ${err.message}`);
}

// 4. Generate combined spend data from Brez - Spend - By State - Platform.xlsx
try {
  const spendPath = path.join(basePath, 'Brez - Spend - By State - Platform.xlsx');
  const wb = XLSX.readFile(spendPath);
  const sheet = wb.Sheets['Summary'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    // Parse week label like "1 - 2024" or "1 - 2025"
    const label = String(row[0]);
    const match = label.match(/(\d+)\s*-\s*(\d{4})/);
    if (!match) continue;

    const weekNum = parseInt(match[1]);
    const year = parseInt(match[2]);

    // Sum up all platform spends (META, Google, AppLovin, TikTokShop)
    let totalSpend = 0;
    for (let j = 1; j <= 4; j++) {
      const val = parseFloat(row[j]);
      if (!isNaN(val)) totalSpend += val;
    }

    if (totalSpend > 0) {
      const weekStart = getWeekStart(year, weekNum);
      rows.push({ week_start: weekStart, spend_total: Math.round(totalSpend * 100) / 100, label });
    }
  }

  // Sort by date
  rows.sort((a, b) => a.week_start.localeCompare(b.week_start));

  // Write CSV (comprehensive spend by platform)
  const csv = 'week_start,spend_total\n' +
    rows.map(r => `${r.week_start},${r.spend_total}`).join('\n');

  fs.writeFileSync(path.join(outputPath, 'weekly_spend_by_platform.csv'), csv);
  console.log(`\n✓ weekly_spend_by_platform.csv: ${rows.length} rows`);
  console.log(`  Date range: ${rows[0]?.week_start} to ${rows[rows.length-1]?.week_start}`);
} catch (err) {
  console.log(`✗ weekly_spend_by_platform.csv failed: ${err.message}`);
}

console.log('\n=== CSV GENERATION COMPLETE ===');
console.log(`\nFiles saved to: ${outputPath}`);
console.log('Upload these CSVs in the app using the Data Uploads section!');
