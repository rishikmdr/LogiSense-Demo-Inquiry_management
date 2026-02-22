require('dotenv').config();
const { pool } = require('./connection');

const migrationSQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'sales',
  branch VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  branch_id INTEGER REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS sales_support_staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_no VARCHAR(30) UNIQUE NOT NULL,
  branch VARCHAR(50) NOT NULL,
  sales_person VARCHAR(100) NOT NULL,
  customer_name VARCHAR(200),
  inquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  direction VARCHAR(100) NOT NULL,
  pol VARCHAR(200) NOT NULL,
  pod VARCHAR(200) NOT NULL,
  cargo_description TEXT,
  no_of_packages INTEGER,
  volume_frt NUMERIC(10,2),
  heavy_lifts VARCHAR(200),
  laycan VARCHAR(200),
  rate_per_frt NUMERIC(12,2),
  total_rate NUMERIC(14,2),
  target_per_frt NUMERIC(12,2),
  total_target NUMERIC(14,2),
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  sales_support VARCHAR(100),
  customer_type VARCHAR(50),
  has_photographs BOOLEAN DEFAULT FALSE,
  has_technical_diagrams BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  last_modified_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inquiry_remarks (
  id SERIAL PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  remark TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duplicate_groups (
  id SERIAL PRIMARY KEY,
  primary_inquiry_id UUID REFERENCES inquiries(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS duplicate_group_members (
  group_id INTEGER REFERENCES duplicate_groups(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, inquiry_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_direction ON inquiries(direction);
CREATE INDEX IF NOT EXISTS idx_inquiries_branch ON inquiries(branch);
CREATE INDEX IF NOT EXISTS idx_inquiries_sales_person ON inquiries(sales_person);
CREATE INDEX IF NOT EXISTS idx_inquiries_inquiry_date ON inquiries(inquiry_date);
CREATE INDEX IF NOT EXISTS idx_inquiry_remarks_inquiry_id ON inquiry_remarks(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_inquiry_id ON audit_log(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');
    await client.query(migrationSQL);
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { migrate };
