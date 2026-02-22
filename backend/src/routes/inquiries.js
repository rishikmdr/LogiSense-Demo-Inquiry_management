const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateRefNo } = require('../utils/refNoGenerator');
const { findPotentialDuplicates } = require('../utils/duplicateDetector');

const ACTIVE_STATUSES = ['OPEN', 'INITIATED WORKING', 'CLARIFICATIONS PENDING', 'QUOTED', 'UNDER FIRM DISCUSSIONS', 'BUDGETARY'];

// POST /api/v1/inquiries/check-duplicate (before /:id routes)
router.post('/check-duplicate', authenticate, async (req, res, next) => {
  try {
    const { pol, pod, direction, cargo_description, laycan, excludeId } = req.body;
    const result = await findPotentialDuplicates({ pol, pod, direction, cargo_description, laycan, excludeId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/inquiries
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      status, branch, direction, sales_person, customer_type,
      date_from, date_to, search,
      sort_by = 'updated_at', sort_order = 'desc',
      page = 1, per_page = 50,
      include_secured = 'true',
    } = req.query;

    const conditions = ['i.is_deleted = false'];
    const params = [];
    let paramIdx = 1;

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      conditions.push(`i.status = ANY($${paramIdx++})`);
      params.push(statuses);
    } else if (include_secured === 'false') {
      conditions.push(`i.status NOT IN ('SECURED', 'LOST')`);
    }

    if (branch) {
      const branches = branch.split(',').map((b) => b.trim());
      conditions.push(`i.branch = ANY($${paramIdx++})`);
      params.push(branches);
    }

    if (direction) {
      const dirs = direction.split(',').map((d) => d.trim());
      conditions.push(`i.direction = ANY($${paramIdx++})`);
      params.push(dirs);
    }

    if (sales_person) {
      const sps = sales_person.split(',').map((s) => s.trim());
      conditions.push(`i.sales_person = ANY($${paramIdx++})`);
      params.push(sps);
    }

    if (customer_type) {
      conditions.push(`i.customer_type = $${paramIdx++}`);
      params.push(customer_type.trim());
    }

    if (date_from) {
      conditions.push(`i.inquiry_date >= $${paramIdx++}`);
      params.push(date_from);
    }

    if (date_to) {
      conditions.push(`i.inquiry_date <= $${paramIdx++}`);
      params.push(date_to);
    }

    if (search) {
      conditions.push(`(
        i.customer_name ILIKE $${paramIdx} OR
        i.cargo_description ILIKE $${paramIdx} OR
        i.pol ILIKE $${paramIdx} OR
        i.pod ILIKE $${paramIdx} OR
        i.ref_no ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSortFields = ['inquiry_date', 'updated_at', 'created_at', 'status', 'ref_no', 'customer_name', 'volume_frt', 'total_rate'];
    const sortField = allowedSortFields.includes(sort_by) ? `i.${sort_by}` : 'i.updated_at';
    const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';

    const pageNum = Math.max(1, parseInt(page));
    const perPageNum = Math.min(200, Math.max(1, parseInt(per_page)));
    const offset = (pageNum - 1) * perPageNum;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM inquiries i ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get latest remark per inquiry
    const dataResult = await query(
      `SELECT i.*,
        (SELECT r.remark FROM inquiry_remarks r WHERE r.inquiry_id = i.id ORDER BY r.created_at DESC LIMIT 1) as last_remark,
        (SELECT r.created_at FROM inquiry_remarks r WHERE r.inquiry_id = i.id ORDER BY r.created_at DESC LIMIT 1) as last_remark_at,
        EXISTS(SELECT 1 FROM duplicate_group_members dgm WHERE dgm.inquiry_id = i.id) as is_in_duplicate_group
       FROM inquiries i
       ${where}
       ORDER BY ${sortField} ${sortDir} NULLS LAST
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, perPageNum, offset]
    );

    // Summary stats
    const summaryResult = await query(
      `SELECT
        COALESCE(SUM(volume_frt), 0) as total_volume_frt,
        COALESCE(SUM(total_rate), 0) as total_value_usd,
        COUNT(*) FILTER (WHERE status = 'OPEN') as open_count,
        COUNT(*) FILTER (WHERE status = 'QUOTED') as quoted_count,
        COUNT(*) FILTER (WHERE status = 'INITIATED WORKING') as initiated_count,
        COUNT(*) FILTER (WHERE status = 'CLARIFICATIONS PENDING') as clarifications_count,
        COUNT(*) FILTER (WHERE status = 'BUDGETARY') as budgetary_count,
        COUNT(*) FILTER (WHERE status = 'UNDER FIRM DISCUSSIONS') as under_firm_count,
        COUNT(*) FILTER (WHERE status = 'SECURED') as secured_count,
        COUNT(*) FILTER (WHERE status = 'LOST') as lost_count
       FROM inquiries i ${where}`,
      params
    );
    const s = summaryResult.rows[0];

    res.json({
      data: dataResult.rows,
      pagination: {
        page: pageNum,
        per_page: perPageNum,
        total,
        total_pages: Math.ceil(total / perPageNum),
      },
      summary: {
        total_volume_frt: parseFloat(s.total_volume_frt),
        total_value_usd: parseFloat(s.total_value_usd),
        by_status: {
          OPEN: parseInt(s.open_count),
          'INITIATED WORKING': parseInt(s.initiated_count),
          'CLARIFICATIONS PENDING': parseInt(s.clarifications_count),
          BUDGETARY: parseInt(s.budgetary_count),
          QUOTED: parseInt(s.quoted_count),
          'UNDER FIRM DISCUSSIONS': parseInt(s.under_firm_count),
          SECURED: parseInt(s.secured_count),
          LOST: parseInt(s.lost_count),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/inquiries
router.post('/', authenticate, async (req, res, next) => {
  if (req.user.role === 'viewer') {
    return res.status(403).json({ error: 'Viewers cannot create inquiries', code: 'FORBIDDEN' });
  }

  try {
    const {
      branch, sales_person, customer_name, inquiry_date,
      direction, pol, pod, cargo_description, no_of_packages,
      volume_frt, heavy_lifts, laycan, rate_per_frt,
      target_per_frt, status = 'OPEN', sales_support,
      customer_type, has_photographs = false, has_technical_diagrams = false,
    } = req.body;

    if (!branch || !sales_person || !direction || !pol || !pod) {
      return res.status(400).json({ error: 'Required fields missing: branch, sales_person, direction, pol, pod', code: 'VALIDATION_ERROR' });
    }

    const date = inquiry_date ? new Date(inquiry_date) : new Date();
    const refNo = await generateRefNo(date);

    const totalRate = rate_per_frt && volume_frt ? parseFloat(rate_per_frt) * parseFloat(volume_frt) : null;
    const totalTarget = target_per_frt && volume_frt ? parseFloat(target_per_frt) * parseFloat(volume_frt) : null;

    const result = await query(
      `INSERT INTO inquiries (
        ref_no, branch, sales_person, customer_name, inquiry_date,
        direction, pol, pod, cargo_description, no_of_packages,
        volume_frt, heavy_lifts, laycan, rate_per_frt, total_rate,
        target_per_frt, total_target, status, sales_support, customer_type,
        has_photographs, has_technical_diagrams, created_by, last_modified_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$23)
      RETURNING *`,
      [
        refNo, branch.toUpperCase(), sales_person.toUpperCase(), customer_name, date,
        direction.toUpperCase(), pol.toUpperCase(), pod.toUpperCase(),
        cargo_description, no_of_packages || null,
        volume_frt || null, heavy_lifts, laycan,
        rate_per_frt || null, totalRate,
        target_per_frt || null, totalTarget,
        status, sales_support, customer_type, has_photographs, has_technical_diagrams,
        req.user.id,
      ]
    );

    await query(
      `INSERT INTO audit_log (inquiry_id, user_id, action, new_value) VALUES ($1, $2, 'created', $3)`,
      [result.rows[0].id, req.user.id, refNo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/inquiries/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT i.*,
        u1.full_name as created_by_name,
        u2.full_name as modified_by_name
       FROM inquiries i
       LEFT JOIN users u1 ON u1.id = i.created_by
       LEFT JOIN users u2 ON u2.id = i.last_modified_by
       WHERE i.id = $1 AND i.is_deleted = false`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Inquiry not found', code: 'NOT_FOUND' });
    }

    const remarks = await query(
      `SELECT r.*, u.full_name as created_by_name
       FROM inquiry_remarks r
       LEFT JOIN users u ON u.id = r.created_by
       WHERE r.inquiry_id = $1
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );

    const dupGroup = await query(
      `SELECT dgm2.inquiry_id, i.ref_no, i.status
       FROM duplicate_group_members dgm1
       JOIN duplicate_group_members dgm2 ON dgm2.group_id = dgm1.group_id AND dgm2.inquiry_id != $1
       JOIN inquiries i ON i.id = dgm2.inquiry_id
       WHERE dgm1.inquiry_id = $1`,
      [req.params.id]
    );

    res.json({
      ...result.rows[0],
      remarks: remarks.rows,
      duplicate_group: dupGroup.rows,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/inquiries/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM inquiries WHERE id = $1 AND is_deleted = false', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Inquiry not found', code: 'NOT_FOUND' });

    const inquiry = rows[0];
    // RBAC: sales can only edit own inquiries
    if (req.user.role === 'sales' && inquiry.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Can only edit your own inquiries', code: 'FORBIDDEN' });
    }
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot edit inquiries', code: 'FORBIDDEN' });
    }

    const {
      branch, sales_person, customer_name, inquiry_date,
      direction, pol, pod, cargo_description, no_of_packages,
      volume_frt, heavy_lifts, laycan, rate_per_frt, total_rate,
      target_per_frt, total_target, status, sales_support,
      customer_type, has_photographs, has_technical_diagrams,
    } = req.body;

    const computedTotalRate = rate_per_frt && volume_frt
      ? parseFloat(rate_per_frt) * parseFloat(volume_frt)
      : (total_rate || null);
    const computedTotalTarget = target_per_frt && volume_frt
      ? parseFloat(target_per_frt) * parseFloat(volume_frt)
      : (total_target || null);

    const result = await query(
      `UPDATE inquiries SET
        branch = COALESCE($1, branch),
        sales_person = COALESCE($2, sales_person),
        customer_name = COALESCE($3, customer_name),
        inquiry_date = COALESCE($4, inquiry_date),
        direction = COALESCE($5, direction),
        pol = COALESCE($6, pol),
        pod = COALESCE($7, pod),
        cargo_description = COALESCE($8, cargo_description),
        no_of_packages = COALESCE($9, no_of_packages),
        volume_frt = COALESCE($10, volume_frt),
        heavy_lifts = COALESCE($11, heavy_lifts),
        laycan = COALESCE($12, laycan),
        rate_per_frt = COALESCE($13, rate_per_frt),
        total_rate = $14,
        target_per_frt = COALESCE($15, target_per_frt),
        total_target = $16,
        status = COALESCE($17, status),
        sales_support = COALESCE($18, sales_support),
        customer_type = COALESCE($19, customer_type),
        has_photographs = COALESCE($20, has_photographs),
        has_technical_diagrams = COALESCE($21, has_technical_diagrams),
        last_modified_by = $22
       WHERE id = $23
       RETURNING *`,
      [
        branch?.toUpperCase(), sales_person?.toUpperCase(), customer_name,
        inquiry_date, direction?.toUpperCase(), pol?.toUpperCase(), pod?.toUpperCase(),
        cargo_description, no_of_packages, volume_frt, heavy_lifts, laycan,
        rate_per_frt, computedTotalRate, target_per_frt, computedTotalTarget,
        status, sales_support, customer_type, has_photographs, has_technical_diagrams,
        req.user.id, req.params.id,
      ]
    );

    await query(
      `INSERT INTO audit_log (inquiry_id, user_id, action) VALUES ($1, $2, 'updated')`,
      [req.params.id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/inquiries/:id/status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot change status', code: 'FORBIDDEN' });
    }
    const { status } = req.body;
    const validStatuses = ['OPEN', 'INITIATED WORKING', 'CLARIFICATIONS PENDING', 'BUDGETARY', 'QUOTED', 'UNDER FIRM DISCUSSIONS', 'SECURED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', code: 'VALIDATION_ERROR' });
    }

    const { rows } = await query('SELECT status FROM inquiries WHERE id = $1 AND is_deleted = false', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Inquiry not found', code: 'NOT_FOUND' });

    const oldStatus = rows[0].status;
    const result = await query(
      'UPDATE inquiries SET status = $1, last_modified_by = $2 WHERE id = $3 RETURNING *',
      [status, req.user.id, req.params.id]
    );

    await query(
      `INSERT INTO audit_log (inquiry_id, user_id, action, field_changed, old_value, new_value)
       VALUES ($1, $2, 'status_changed', 'status', $3, $4)`,
      [req.params.id, req.user.id, oldStatus, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/inquiries/:id (soft delete, admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE inquiries SET is_deleted = true, last_modified_by = $1 WHERE id = $2 AND is_deleted = false RETURNING id',
      [req.user.id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Inquiry not found', code: 'NOT_FOUND' });

    await query(
      `INSERT INTO audit_log (inquiry_id, user_id, action) VALUES ($1, $2, 'deleted')`,
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
