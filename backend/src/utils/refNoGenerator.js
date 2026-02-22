const { query } = require('../db/connection');

async function generateRefNo(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `PROBBK${yy}${mm}`;

  const result = await query(
    `SELECT ref_no FROM inquiries WHERE ref_no LIKE $1 ORDER BY ref_no DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let seq = 1;
  if (result.rows.length > 0) {
    const lastRefNo = result.rows[0].ref_no;
    const lastSeq = parseInt(lastRefNo.slice(-2), 10);
    seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(2, '0')}`;
}

module.exports = { generateRefNo };
