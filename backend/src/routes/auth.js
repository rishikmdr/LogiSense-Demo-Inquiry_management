const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');
const { authenticate } = require('../middleware/auth');

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required', code: 'VALIDATION_ERROR' });
    }

    const result = await query(
      'SELECT id, username, password_hash, full_name, role, branch, is_active FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutHash } = user;
    res.json({ token, user: userWithoutHash });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless — client should discard token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
