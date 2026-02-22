require('dotenv').config();
const { pool } = require('./connection');
const bcrypt = require('bcryptjs');

const BRANCHES = ['MUMBAI', 'PUNE', 'CHENNAI', 'KOLKATA', 'AHMEDABAD', 'HYDERABAD', 'VIZAG'];

const SALES_PERSONS = [
  { name: 'ABDULLAH QURESHI', branch: 'MUMBAI' },
  { name: 'AJAY YADAV', branch: 'MUMBAI' },
  { name: 'DEBASISH GHOSH', branch: 'KOLKATA' },
  { name: 'DHANASEKHAR', branch: 'CHENNAI' },
  { name: 'DINESH NAIK', branch: 'MUMBAI' },
  { name: 'DIPANKAR BANERJEE', branch: 'KOLKATA' },
  { name: 'HARDIK MEHTA', branch: 'AHMEDABAD' },
  { name: 'HITESH KARKERA', branch: 'MUMBAI' },
  { name: 'KAMLESH RAMAWAT', branch: 'MUMBAI' },
  { name: 'KIRAN BANGERA', branch: 'MUMBAI' },
  { name: 'MAYUR VISHARIA', branch: 'MUMBAI' },
  { name: 'NAYAN HEDAMBA', branch: 'MUMBAI' },
  { name: 'PRADEEP PANDA', branch: 'KOLKATA' },
  { name: 'RAHUL BARIA', branch: 'MUMBAI' },
  { name: 'RAVI KIRAN', branch: 'HYDERABAD' },
  { name: 'RIO PAREIRA', branch: 'MUMBAI' },
  { name: 'SAURAV BASUTKAR', branch: 'MUMBAI' },
  { name: 'SHUBHANGI UGHADE', branch: 'PUNE' },
  { name: 'VISHWA PAI', branch: 'MUMBAI' },
  { name: 'YASH TALEKAR', branch: 'MUMBAI' },
];

const SALES_SUPPORT = ['SMITA', 'ABIGAIL', 'SHUBHANGI', 'SHARAD', 'PRIYA', 'ANITA'];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    // Seed branches
    for (const name of BRANCHES) {
      await client.query(
        'INSERT INTO branches (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      );
    }
    console.log('Branches seeded.');

    // Seed sales persons
    for (const sp of SALES_PERSONS) {
      const branchRes = await client.query('SELECT id FROM branches WHERE name = $1', [sp.branch]);
      const branchId = branchRes.rows[0]?.id || null;
      await client.query(
        'INSERT INTO sales_persons (name, branch_id) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [sp.name, branchId]
      );
    }
    console.log('Sales persons seeded.');

    // Seed sales support staff
    for (const name of SALES_SUPPORT) {
      await client.query(
        'INSERT INTO sales_support_staff (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      );
    }
    console.log('Sales support staff seeded.');

    // Create default admin user
    const existing = await client.query("SELECT id FROM users WHERE username = 'admin'");
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('LogiSenseAdmin2026!', 12);
      await client.query(
        `INSERT INTO users (username, password_hash, full_name, role, branch)
         VALUES ('admin', $1, 'System Administrator', 'admin', 'MUMBAI')`,
        [hash]
      );
      console.log('Default admin user created: admin / LogiSenseAdmin2026!');
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seed };
