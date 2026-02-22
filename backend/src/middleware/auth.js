const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, username, full_name, role, branch, is_active FROM users WHERE id = $1', [decoded.userId]);
    if (!result.rows[0] || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive', code: 'UNAUTHORIZED' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
  }
  next();
};

module.exports = { authenticate, requireRole };
