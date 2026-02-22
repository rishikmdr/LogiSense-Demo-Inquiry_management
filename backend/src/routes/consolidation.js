const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/consolidation-opportunities
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT direction, pod, pol,
        COUNT(*) as inquiry_count,
        COALESCE(SUM(volume_frt), 0) as total_volume_frt,
        COALESCE(SUM(total_rate), 0) as total_value,
        json_agg(json_build_object(
          'id', id,
          'ref_no', ref_no,
          'sales_person', sales_person,
          'customer_name', customer_name,
          'volume_frt', volume_frt,
          'status', status,
          'laycan', laycan,
          'inquiry_date', inquiry_date
        ) ORDER BY inquiry_date DESC) as inquiries
       FROM inquiries
       WHERE status IN ('OPEN','INITIATED WORKING','CLARIFICATIONS PENDING','QUOTED','UNDER FIRM DISCUSSIONS')
         AND is_deleted = false
       GROUP BY direction, pod, pol
       HAVING COUNT(*) >= 2
       ORDER BY COUNT(*) DESC, total_volume_frt DESC`
    );

    const groups = result.rows.map((row) => ({
      direction: row.direction,
      pod: row.pod,
      pol: row.pol,
      inquiry_count: parseInt(row.inquiry_count),
      total_volume_frt: parseFloat(row.total_volume_frt),
      total_value: parseFloat(row.total_value),
      inquiries: row.inquiries,
      potential_saving_note: `${row.inquiry_count} shipments on same route — possible consolidation`,
    }));

    res.json({ groups });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
