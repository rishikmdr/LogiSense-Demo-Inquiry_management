const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/v1/users
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, username, full_name, role, branch, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users
router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { username, password, full_name, role, branch } = req.body;
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ error: 'username, password, full_name, role required', code: 'VALIDATION_ERROR' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, role, branch)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, branch, is_active, created_at`,
      [username.toLowerCase(), hash, full_name, role, branch]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/:id
router.put('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { full_name, role, branch, is_active } = req.body;
    const result = await query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        branch = COALESCE($3, branch),
        is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING id, username, full_name, role, branch, is_active`,
      [full_name, role, branch, is_active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id/password
router.patch('/:id/password', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Can only change your own password', code: 'FORBIDDEN' });
    }
    const { current_password, new_password } = req.body;
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters', code: 'VALIDATION_ERROR' });
    }

    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });

    if (req.user.role !== 'admin') {
      const valid = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect', code: 'INVALID_CREDENTIALS' });
    }

    const hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/lookup (public lookup for forms)
router.get('/lookup', authenticate, async (req, res, next) => {
  try {
    const branches = await query('SELECT name FROM branches ORDER BY name');
    const salesPersons = await query('SELECT name FROM sales_persons ORDER BY name');
    const salesSupport = await query('SELECT name FROM sales_support_staff ORDER BY name');
    res.json({
      branches: branches.rows.map((r) => r.name),
      sales_persons: salesPersons.rows.map((r) => r.name),
      sales_support: salesSupport.rows.map((r) => r.name),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
