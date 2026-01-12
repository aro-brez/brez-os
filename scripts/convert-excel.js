const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const basePath = '/Users/aaronnosbisch/Library/Mobile Documents/com~apple~CloudDocs/Stabilization plan';

const files = [
  'Aaron-data-2.xlsx',
  'Brez - Spend - By State - Platform.xlsx',
  'BREZ_Weekly_Velocity_2024_Corrected.xlsx',
  'BREZ_Weekly_Velocity_Complete_2025.xlsx'
];

console.log('=== EXCEL FILE ANALYSIS ===\n');

files.forEach(filename => {
  const filePath = path.join(basePath, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`FILE NOT FOUND: ${filename}\n`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`FILE: ${filename}`);
  console.log('='.repeat(60));

  try {
    const workbook = XLSX.readFile(filePath);

    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n--- SHEET: ${sheetName} ---`);
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length === 0) {
        console.log('  (empty sheet)');
        return;
      }

      // Show headers
      console.log(`Headers: ${JSON.stringify(data[0])}`);
      console.log(`Rows: ${data.length - 1}`);

      // Show first few data rows
      console.log('Sample data (first 5 rows):');
      data.slice(1, 6).forEach((row, i) => {
        console.log(`  Row ${i + 1}: ${JSON.stringify(row)}`);
      });
    });
  } catch (err) {
    console.log(`ERROR reading file: ${err.message}`);
  }
});

console.log('\n\n=== ANALYSIS COMPLETE ===');
