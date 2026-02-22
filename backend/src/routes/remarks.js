const express = require('express');
const router = express.Router({ mergeParams: true });
const { query } = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// GET /api/v1/inquiries/:id/remarks
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, u.full_name as created_by_name
       FROM inquiry_remarks r
       LEFT JOIN users u ON u.id = r.created_by
       WHERE r.inquiry_id = $1
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/inquiries/:id/remarks
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot add remarks', code: 'FORBIDDEN' });
    }
    const { remark } = req.body;
    if (!remark || !remark.trim()) {
      return res.status(400).json({ error: 'Remark text is required', code: 'VALIDATION_ERROR' });
    }

    const result = await query(
      `INSERT INTO inquiry_remarks (inquiry_id, remark, created_by) VALUES ($1, $2, $3)
       RETURNING id, inquiry_id, remark, created_by, created_at`,
      [req.params.id, remark.trim(), req.user.id]
    );

    await query(
      `INSERT INTO audit_log (inquiry_id, user_id, action) VALUES ($1, $2, 'remark_added')`,
      [req.params.id, req.user.id]
    );

    const withName = await query(
      `SELECT r.*, u.full_name as created_by_name FROM inquiry_remarks r
       LEFT JOIN users u ON u.id = r.created_by WHERE r.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(withName.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/remarks/:remarkId
const deleteRemark = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM inquiry_remarks WHERE id = $1', [req.params.remarkId]);
    if (!rows[0]) return res.status(404).json({ error: 'Remark not found', code: 'NOT_FOUND' });

    if (req.user.role !== 'admin' && rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own remarks', code: 'FORBIDDEN' });
    }

    await query('DELETE FROM inquiry_remarks WHERE id = $1', [req.params.remarkId]);
    res.json({ message: 'Remark deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { router, deleteRemark };
