const { query } = require('../db/connection');

function scoreInquiry(candidate, input) {
  let score = 0;

  if (candidate.direction?.toLowerCase().trim() === input.direction?.toLowerCase().trim()) {
    score += 40;
  }
  if (candidate.pol?.toLowerCase().trim() === input.pol?.toLowerCase().trim()) {
    score += 20;
  }
  if (candidate.pod?.toLowerCase().trim() === input.pod?.toLowerCase().trim()) {
    score += 20;
  }
  // Fuzzy laycan match - check if any common words or date tokens overlap
  if (candidate.laycan && input.laycan) {
    const cWords = new Set(candidate.laycan.toLowerCase().split(/\s+/));
    const iWords = input.laycan.toLowerCase().split(/\s+/);
    const overlap = iWords.filter((w) => w.length > 2 && cWords.has(w));
    if (overlap.length > 0) score += 20;
  }

  return score;
}

async function findPotentialDuplicates({ pol, pod, direction, cargo_description, laycan, excludeId }) {
  const candidates = await query(
    `SELECT id, ref_no, customer_name, direction, pol, pod, laycan, status, sales_person, inquiry_date
     FROM inquiries
     WHERE is_deleted = false
     ${excludeId ? 'AND id != $1' : ''}
     ORDER BY created_at DESC
     LIMIT 200`,
    excludeId ? [excludeId] : []
  );

  const scored = candidates.rows
    .map((c) => ({ ...c, score: scoreInquiry(c, { pol, pod, direction, laycan }) }))
    .filter((c) => c.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const confidence =
    scored.length > 0 && scored[0].score >= 80
      ? 'high'
      : scored.length > 0 && scored[0].score >= 60
      ? 'medium'
      : 'low';

  return { potential_duplicates: scored, confidence };
}

module.exports = { findPotentialDuplicates };
