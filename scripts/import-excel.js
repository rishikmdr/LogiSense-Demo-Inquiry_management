#!/usr/bin/env node
/**
 * Historical data import script
 * Usage: node scripts/import-excel.js /path/to/EXPORT_BBK_FILE_016_NEW_REVISED.xlsx
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Add backend src to path
process.chdir(path.join(__dirname, '..', 'backend'));
const { pool } = require('./src/db/connection');
const { parseExcelFile } = require('./src/utils/excelParser');
const { generateRefNo } = require('./src/utils/refNoGenerator');
const { migrate } = require('./src/db/migrate');
const { seed } = require('./src/db/seed');

async function importExcel(filePath) {
  if (!filePath) {
    console.error('Usage: node scripts/import-excel.js /path/to/file.xlsx');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log('Running migrations and seed...');
  await migrate();
  await seed();

  const buffer = fs.readFileSync(filePath);
  console.log(`Parsing Excel file: ${filePath}`);
  const rows = parseExcelFile(buffer);
  console.log(`Found ${rows.length} valid rows to process`);

  // Get admin user id
  const adminRes = await pool.query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
  const adminId = adminRes.rows[0]?.id;

  const results = { imported: 0, skipped: 0, errors: [] };
  const client = await pool.connect();

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (i % 50 === 0 && i > 0) {
        console.log(`  Progress: ${i}/${rows.length} (${results.imported} imported, ${results.skipped} skipped)`);
      }

      try {
        if (row.ref_no) {
          const existing = await client.query('SELECT id FROM inquiries WHERE ref_no = $1', [row.ref_no]);
          if (existing.rows.length > 0) {
            results.skipped++;
            continue;
          }
        }

        const date = row.inquiry_date || new Date();
        const refNo = row.ref_no || await generateRefNo(date);

        const totalRate = row.rate_per_frt && row.volume_frt
          ? parseFloat(row.rate_per_frt) * parseFloat(row.volume_frt)
          : row.total_rate;
        const totalTarget = row.target_per_frt && row.volume_frt
          ? parseFloat(row.target_per_frt) * parseFloat(row.volume_frt)
          : row.total_target;

        const insertResult = await client.query(
          `INSERT INTO inquiries (
            ref_no, branch, sales_person, customer_name, inquiry_date,
            direction, pol, pod, cargo_description, no_of_packages,
            volume_frt, heavy_lifts, laycan, rate_per_frt, total_rate,
            target_per_frt, total_target, status, sales_support, customer_type,
            created_by, last_modified_by
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$21)
          ON CONFLICT (ref_no) DO NOTHING
          RETURNING id`,
          [
            refNo,
            (row.branch || 'MUMBAI').toUpperCase(),
            (row.sales_person || 'UNKNOWN').toUpperCase(),
            row.customer_name,
            date,
            (row.direction || 'UNKNOWN').toUpperCase(),
            (row.pol || 'UNKNOWN').toUpperCase(),
            (row.pod || 'UNKNOWN').toUpperCase(),
            row.cargo_description,
            row.no_of_packages || null,
            row.volume_frt || null,
            row.heavy_lifts,
            row.laycan,
            row.rate_per_frt || null,
            totalRate || null,
            row.target_per_frt || null,
            totalTarget || null,
            row.status || 'OPEN',
            row.sales_support,
            row.customer_type,
            adminId,
          ]
        );

        if (insertResult.rows.length === 0) {
          results.skipped++;
          continue;
        }

        const inquiryId = insertResult.rows[0].id;

        if (row.remarks && row.remarks.trim()) {
          await client.query(
            'INSERT INTO inquiry_remarks (inquiry_id, remark, created_by) VALUES ($1, $2, $3)',
            [inquiryId, row.remarks.trim(), adminId]
          );
        }

        results.imported++;
      } catch (rowErr) {
        results.errors.push({ row: i + 2, sheet: row.sheet, error: rowErr.message });
        if (results.errors.length <= 5) {
          console.warn(`  Row ${i + 2} error: ${rowErr.message}`);
        }
      }
    }
  } finally {
    client.release();
  }

  console.log('\n=== Import Complete ===');
  console.log(`✅ Imported: ${results.imported}`);
  console.log(`⚠️  Skipped:  ${results.skipped}`);
  console.log(`❌ Errors:   ${results.errors.length}`);
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((e) => console.log(`  Row ${e.row} (${e.sheet}): ${e.error}`));
  }

  await pool.end();
}

importExcel(process.argv[2]).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
