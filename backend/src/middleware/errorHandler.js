const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Record already exists', code: 'DUPLICATE' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found', code: 'FOREIGN_KEY_VIOLATION' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
};

module.exports = { errorHandler };
