const express = require('express');
const router = express.Router();
const multer = require('multer');
const { query, pool } = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const { parseExcelFile } = require('../utils/excelParser');
const { generateRefNo } = require('../utils/refNoGenerator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('spreadsheet') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
});

// POST /api/v1/import/excel
router.post('/excel', authenticate, requireRole('admin', 'sales_support'), upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', code: 'VALIDATION_ERROR' });
  }

  const client = await pool.connect();
  const results = { imported: 0, skipped: 0, errors: [] };

  try {
    const rows = parseExcelFile(req.file.buffer);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Check for existing ref_no
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
            row.direction?.toUpperCase() || 'UNKNOWN',
            row.pol?.toUpperCase() || 'UNKNOWN',
            row.pod?.toUpperCase() || 'UNKNOWN',
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
            req.user.id,
          ]
        );

        if (insertResult.rows.length === 0) {
          results.skipped++;
          continue;
        }

        const inquiryId = insertResult.rows[0].id;

        // Insert remarks if present
        if (row.remarks && row.remarks.trim()) {
          await client.query(
            'INSERT INTO inquiry_remarks (inquiry_id, remark, created_by) VALUES ($1, $2, $3)',
            [inquiryId, row.remarks.trim(), req.user.id]
          );
        }

        results.imported++;
      } catch (rowErr) {
        results.errors.push({ row: i + 2, error: rowErr.message });
      }
    }

    res.json({
      message: 'Import completed',
      imported: results.imported,
      skipped: results.skipped,
      errors: results.errors,
      total_processed: rows.length,
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/v1/import/export-csv (export current filtered view)
router.get('/export-csv', authenticate, async (req, res, next) => {
  try {
    const { status, branch, direction, sales_person, date_from, date_to, search } = req.query;
    const conditions = ['is_deleted = false'];
    const params = [];
    let paramIdx = 1;

    if (status) { conditions.push(`status = ANY($${paramIdx++})`); params.push(status.split(',')); }
    if (branch) { conditions.push(`branch = ANY($${paramIdx++})`); params.push(branch.split(',')); }
    if (direction) { conditions.push(`direction = ANY($${paramIdx++})`); params.push(direction.split(',')); }
    if (sales_person) { conditions.push(`sales_person = ANY($${paramIdx++})`); params.push(sales_person.split(',')); }
    if (date_from) { conditions.push(`inquiry_date >= $${paramIdx++}`); params.push(date_from); }
    if (date_to) { conditions.push(`inquiry_date <= $${paramIdx++}`); params.push(date_to); }
    if (search) { conditions.push(`(customer_name ILIKE $${paramIdx} OR cargo_description ILIKE $${paramIdx})`); params.push(`%${search}%`); paramIdx++; }

    const result = await query(
      `SELECT ref_no, branch, sales_person, customer_name, inquiry_date, direction, pol, pod,
        cargo_description, no_of_packages, volume_frt, heavy_lifts, laycan,
        rate_per_frt, total_rate, target_per_frt, total_target,
        status, sales_support, customer_type, created_at
       FROM inquiries WHERE ${conditions.join(' AND ')}
       ORDER BY inquiry_date DESC`,
      params
    );

    const headers = [
      'Ref No', 'Branch', 'Sales Person', 'Customer Name', 'Date', 'Direction',
      'POL', 'POD', 'Cargo Description', 'Packages', 'Volume (FRT)', 'Heavy Lifts',
      'Laycan', 'Rate/FRT', 'Total Rate', 'Target/FRT', 'Total Target',
      'Status', 'Sales Support', 'Customer Type', 'Created At',
    ];

    const csvRows = [headers.join(',')];
    for (const row of result.rows) {
      const values = [
        row.ref_no, row.branch, row.sales_person,
        `"${(row.customer_name || '').replace(/"/g, '""')}"`,
        row.inquiry_date?.toISOString?.().split('T')[0] || '',
        row.direction, row.pol, row.pod,
        `"${(row.cargo_description || '').replace(/"/g, '""')}"`,
        row.no_of_packages || '', row.volume_frt || '', row.heavy_lifts || '',
        row.laycan || '', row.rate_per_frt || '', row.total_rate || '',
        row.target_per_frt || '', row.total_target || '',
        row.status, row.sales_support || '', row.customer_type || '',
        row.created_at?.toISOString?.() || '',
      ];
      csvRows.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inquiries-${Date.now()}.csv"`);
    res.send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
