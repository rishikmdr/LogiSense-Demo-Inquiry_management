const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/dashboard/kpis
router.get('/kpis', authenticate, async (req, res, next) => {
  try {
    const openRes = await query(
      `SELECT COUNT(*) as open_count,
        COALESCE(SUM(volume_frt), 0) as total_volume,
        COALESCE(SUM(total_rate), 0) as total_value
       FROM inquiries
       WHERE status NOT IN ('SECURED', 'LOST') AND is_deleted = false`
    );

    const weekRes = await query(
      `SELECT COUNT(*) as count FROM inquiries
       WHERE inquiry_date >= CURRENT_DATE - INTERVAL '7 days' AND is_deleted = false`
    );

    const securedMtdRes = await query(
      `SELECT COUNT(*) as count FROM inquiries
       WHERE status = 'SECURED'
         AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', NOW())
         AND is_deleted = false`
    );

    const atRiskRes = await query(
      `SELECT COUNT(*) as count FROM inquiries
       WHERE (
         (status = 'CLARIFICATIONS PENDING' AND updated_at < NOW() - INTERVAL '5 days')
         OR (status = 'OPEN' AND inquiry_date < CURRENT_DATE - INTERVAL '10 days'
             AND id NOT IN (SELECT DISTINCT inquiry_id FROM inquiry_remarks))
       ) AND is_deleted = false`
    );

    const consolidationRes = await query(
      `SELECT COUNT(DISTINCT direction || '|' || pod) as count
       FROM (
         SELECT direction, pod
         FROM inquiries
         WHERE status IN ('OPEN','INITIATED WORKING','CLARIFICATIONS PENDING','QUOTED','UNDER FIRM DISCUSSIONS')
           AND is_deleted = false
         GROUP BY direction, pod
         HAVING COUNT(*) >= 2
       ) sub`
    );

    res.json({
      open_inquiries: parseInt(openRes.rows[0].open_count),
      total_volume_open_frt: parseFloat(openRes.rows[0].total_volume),
      total_value_pipeline_usd: parseFloat(openRes.rows[0].total_value),
      inquiries_added_this_week: parseInt(weekRes.rows[0].count),
      inquiries_secured_this_month: parseInt(securedMtdRes.rows[0].count),
      at_risk_count: parseInt(atRiskRes.rows[0].count),
      consolidation_opportunities: parseInt(consolidationRes.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/pipeline
router.get('/pipeline', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total_rate), 0) as total_value
       FROM inquiries
       WHERE is_deleted = false
       GROUP BY status
       ORDER BY count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/by-route
router.get('/by-route', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT direction, status, COUNT(*) as count, COALESCE(SUM(volume_frt), 0) as total_volume
       FROM inquiries
       WHERE is_deleted = false AND status NOT IN ('LOST')
       GROUP BY direction, status
       ORDER BY direction, count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/activity
router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT al.*, u.full_name as user_name, i.ref_no
       FROM audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       LEFT JOIN inquiries i ON i.id = al.inquiry_id
       ORDER BY al.timestamp DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
