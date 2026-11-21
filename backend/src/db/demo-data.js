require('dotenv').config();
const { pool } = require('./connection');

const inquiries = [
  // OPEN inquiries - recent
  {
    ref_no: 'MUM/2026/001',
    branch: 'MUMBAI',
    sales_person: 'RAHUL BARIA',
    customer_name: 'TATA STEEL LIMITED',
    inquiry_date: '2026-11-18',
    direction: 'EXPORT',
    pol: 'NHAVA SHEVA (JNPT)',
    pod: 'ROTTERDAM, NETHERLANDS',
    cargo_description: 'Hot Rolled Steel Coils',
    no_of_packages: 24,
    volume_frt: 480.00,
    laycan: 'DEC 01-05, 2026',
    rate_per_frt: 28.50,
    total_rate: 13680.00,
    target_per_frt: 25.00,
    total_target: 12000.00,
    status: 'OPEN',
    sales_support: 'SMITA',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: true,
  },
  {
    ref_no: 'MUM/2026/002',
    branch: 'MUMBAI',
    sales_person: 'HITESH KARKERA',
    customer_name: 'LARSEN & TOUBRO LTD',
    inquiry_date: '2026-11-17',
    direction: 'IMPORT',
    pol: 'HAMBURG, GERMANY',
    pod: 'NHAVA SHEVA (JNPT)',
    cargo_description: 'Transformer & Electrical Equipment',
    no_of_packages: 6,
    volume_frt: 320.00,
    heavy_lifts: '1 x 85 MT Transformer',
    laycan: 'NOV 28-DEC 02, 2026',
    rate_per_frt: 42.00,
    total_rate: 13440.00,
    target_per_frt: 38.00,
    total_target: 12160.00,
    status: 'OPEN',
    sales_support: 'ABIGAIL',
    customer_type: 'DIRECT',
    has_photographs: false,
    has_technical_diagrams: true,
  },
  {
    ref_no: 'CHN/2026/015',
    branch: 'CHENNAI',
    sales_person: 'DHANASEKHAR',
    customer_name: 'BHARAT HEAVY ELECTRICALS LTD',
    inquiry_date: '2026-11-15',
    direction: 'EXPORT',
    pol: 'CHENNAI PORT',
    pod: 'DAMMAM, SAUDI ARABIA',
    cargo_description: 'Power Plant Equipment - Boiler Components',
    no_of_packages: 42,
    volume_frt: 1250.00,
    heavy_lifts: '3 x 60 MT + 1 x 95 MT',
    laycan: 'DEC 10-15, 2026',
    rate_per_frt: 35.00,
    total_rate: 43750.00,
    target_per_frt: 30.00,
    total_target: 37500.00,
    status: 'OPEN',
    sales_support: 'PRIYA',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: true,
  },
  {
    ref_no: 'KOL/2026/008',
    branch: 'KOLKATA',
    sales_person: 'DEBASISH GHOSH',
    customer_name: 'STEEL AUTHORITY OF INDIA LTD',
    inquiry_date: '2026-11-14',
    direction: 'IMPORT',
    pol: 'DUNKIRK, FRANCE',
    pod: 'HALDIA PORT',
    cargo_description: 'Mining Equipment & Conveyors',
    no_of_packages: 18,
    volume_frt: 740.00,
    heavy_lifts: '2 x 45 MT Crushers',
    laycan: 'DEC 05-10, 2026',
    rate_per_frt: 38.00,
    total_rate: 28120.00,
    target_per_frt: 34.00,
    total_target: 25160.00,
    status: 'OPEN',
    sales_support: 'SHARAD',
    customer_type: 'FREIGHT FORWARDER',
    has_photographs: false,
    has_technical_diagrams: false,
  },
  {
    ref_no: 'AHM/2026/011',
    branch: 'AHMEDABAD',
    sales_person: 'HARDIK MEHTA',
    customer_name: 'ADANI PORTS & SEZ LTD',
    inquiry_date: '2026-11-12',
    direction: 'EXPORT',
    pol: 'MUNDRA PORT',
    pod: 'FELIXSTOWE, UK',
    cargo_description: 'Wind Turbine Blades & Nacelles',
    no_of_packages: 12,
    volume_frt: 2100.00,
    heavy_lifts: '12 x 72m Blades',
    laycan: 'DEC 20-25, 2026',
    rate_per_frt: 55.00,
    total_rate: 115500.00,
    target_per_frt: 48.00,
    total_target: 100800.00,
    status: 'OPEN',
    sales_support: 'SHUBHANGI',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: true,
  },
  // AT RISK (pending > 5 days, still OPEN)
  {
    ref_no: 'MUM/2026/003',
    branch: 'MUMBAI',
    sales_person: 'MAYUR VISHARIA',
    customer_name: 'RELIANCE INDUSTRIES LTD',
    inquiry_date: '2026-11-10',
    direction: 'IMPORT',
    pol: 'HOUSTON, USA',
    pod: 'NHAVA SHEVA (JNPT)',
    cargo_description: 'Petrochemical Plant Modules',
    no_of_packages: 8,
    volume_frt: 980.00,
    heavy_lifts: '2 x 110 MT Reactors',
    laycan: 'NOV 25-30, 2026',
    rate_per_frt: 65.00,
    total_rate: 63700.00,
    target_per_frt: 58.00,
    total_target: 56840.00,
    status: 'OPEN',
    sales_support: 'ANITA',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: true,
  },
  {
    ref_no: 'HYD/2026/006',
    branch: 'HYDERABAD',
    sales_person: 'RAVI KIRAN',
    customer_name: 'NAGARJUNA CONSTRUCTION CO',
    inquiry_date: '2026-11-08',
    direction: 'IMPORT',
    pol: 'ANTWERP, BELGIUM',
    pod: 'VIZAG PORT',
    cargo_description: 'Tunnel Boring Machine Components',
    no_of_packages: 32,
    volume_frt: 1680.00,
    heavy_lifts: '1 x 180 MT TBM Cutterhead',
    laycan: 'NOV 28-DEC 03, 2026',
    rate_per_frt: 48.00,
    total_rate: 80640.00,
    target_per_frt: 42.00,
    total_target: 70560.00,
    status: 'OPEN',
    sales_support: 'SMITA',
    customer_type: 'DIRECT',
    has_photographs: false,
    has_technical_diagrams: true,
  },
  // SECURED inquiries
  {
    ref_no: 'MUM/2026/004',
    branch: 'MUMBAI',
    sales_person: 'KIRAN BANGERA',
    customer_name: 'HINDUSTAN PETROLEUM CORP LTD',
    inquiry_date: '2026-11-05',
    direction: 'IMPORT',
    pol: 'JUBAIL, SAUDI ARABIA',
    pod: 'NHAVA SHEVA (JNPT)',
    cargo_description: 'Refinery Heat Exchangers',
    no_of_packages: 14,
    volume_frt: 560.00,
    heavy_lifts: '4 x 35 MT Heat Exchangers',
    laycan: 'NOV 20-25, 2026',
    rate_per_frt: 44.00,
    total_rate: 24640.00,
    target_per_frt: 40.00,
    total_target: 22400.00,
    status: 'SECURED',
    sales_support: 'ABIGAIL',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: false,
  },
  {
    ref_no: 'PUN/2026/007',
    branch: 'PUNE',
    sales_person: 'SHUBHANGI UGHADE',
    customer_name: 'THERMAX LIMITED',
    inquiry_date: '2026-11-03',
    direction: 'EXPORT',
    pol: 'NHAVA SHEVA (JNPT)',
    pod: 'KARACHI, PAKISTAN',
    cargo_description: 'Industrial Boiler & Heat Recovery Units',
    no_of_packages: 28,
    volume_frt: 820.00,
    laycan: 'NOV 18-22, 2026',
    rate_per_frt: 32.00,
    total_rate: 26240.00,
    target_per_frt: 28.00,
    total_target: 22960.00,
    status: 'SECURED',
    sales_support: 'PRIYA',
    customer_type: 'FREIGHT FORWARDER',
    has_photographs: false,
    has_technical_diagrams: true,
  },
  {
    ref_no: 'MUM/2026/005',
    branch: 'MUMBAI',
    sales_person: 'ABDULLAH QURESHI',
    customer_name: 'JSW STEEL LTD',
    inquiry_date: '2026-10-28',
    direction: 'IMPORT',
    pol: 'YOKOHAMA, JAPAN',
    pod: 'NHAVA SHEVA (JNPT)',
    cargo_description: 'Steel Plant Rolling Mill Equipment',
    no_of_packages: 10,
    volume_frt: 430.00,
    heavy_lifts: '2 x 55 MT Roll Stands',
    laycan: 'NOV 15-20, 2026',
    rate_per_frt: 52.00,
    total_rate: 22360.00,
    target_per_frt: 46.00,
    total_target: 19780.00,
    status: 'SECURED',
    sales_support: 'SMITA',
    customer_type: 'DIRECT',
    has_photographs: true,
    has_technical_diagrams: true,
  },
  // LOST inquiries
  {
    ref_no: 'KOL/2026/009',
    branch: 'KOLKATA',
    sales_person: 'PRADEEP PANDA',
    customer_name: 'COAL INDIA LIMITED',
    inquiry_date: '2026-10-20',
    direction: 'IMPORT',
    pol: 'NEWCASTLE, AUSTRALIA',
    pod: 'HALDIA PORT',
    cargo_description: 'Coal Handling Plant Equipment',
    no_of_packages: 50,
    volume_frt: 2200.00,
    laycan: 'NOV 10-15, 2026',
    rate_per_frt: 22.00,
    total_rate: 48400.00,
    target_per_frt: 19.00,
    total_target: 41800.00,
    status: 'LOST',
    sales_support: 'SHARAD',
    customer_type: 'FREIGHT FORWARDER',
    has_photographs: false,
    has_technical_diagrams: false,
  },
  {
    ref_no: 'MUM/2026/010',
    branch: 'MUMBAI',
    sales_person: 'AJAY YADAV',
    customer_name: 'ESSAR STEEL INDIA LTD',
    inquiry_date: '2026-10-15',
    direction: 'EXPORT',
    pol: 'NHAVA SHEVA (JNPT)',
    pod: 'DUNKIRK, FRANCE',
    cargo_description: 'Steel Slabs & Billets',
    no_of_packages: 36,
    volume_frt: 900.00,
    laycan: 'OCT 30-NOV 05, 2026',
    rate_per_frt: 26.00,
    total_rate: 23400.00,
    target_per_frt: 23.00,
    total_target: 20700.00,
    status: 'LOST',
    sales_support: 'ANITA',
    customer_type: 'FREIGHT FORWARDER',
    has_photographs: false,
    has_technical_diagrams: false,
  },
];

const remarks = {
  'MUM/2026/001': [
    'Customer confirmed cargo readiness for Dec 1st. Awaiting final vessel nomination.',
    'Rate negotiation in progress. Customer has competing offer at USD 27/FRT.',
  ],
  'MUM/2026/002': [
    'L&T engineering team confirmed transformer specs. Special heavy-lift vessel required.',
    'Contacted Spliethoff and BigLift for vessel availability. Awaiting offers.',
  ],
  'CHN/2026/015': [
    'BHEL project engineer visited our Chennai office for route survey discussion.',
    'Dammam agent confirmed port handling capability for 95MT piece.',
    'Customer requested delivery by Dec 20 - critical for plant commissioning.',
  ],
  'MUM/2026/003': [
    'Reliance pushing for lower rates. Currently at 3rd round of negotiation.',
    'Last follow-up 5 days ago - customer not responding. URGENT: escalate.',
  ],
  'HYD/2026/006': [
    'TBM cutterhead requires special handling at Vizag. Port approval pending.',
    'Sent detailed stowage plan to customer. No response in last 6 days.',
  ],
  'MUM/2026/004': [
    'Vessel MV HAPPY DELTA confirmed. B/L draft sent for approval.',
    'Customer confirmed booking. PO received. Cargo loading NOV 22.',
  ],
  'KOL/2026/009': [
    'Lost to competitor who offered USD 19.5/FRT. Rate too aggressive to match.',
  ],
};

async function seedDemoData() {
  const client = await pool.connect();
  try {
    console.log('Inserting demo inquiries...');

    const adminRes = await client.query("SELECT id FROM users WHERE username = 'admin'");
    const adminId = adminRes.rows[0]?.id;

    for (const inq of inquiries) {
      await client.query(
        `INSERT INTO inquiries (
          ref_no, branch, sales_person, customer_name, inquiry_date, direction,
          pol, pod, cargo_description, no_of_packages, volume_frt, heavy_lifts,
          laycan, rate_per_frt, total_rate, target_per_frt, total_target,
          status, sales_support, customer_type, has_photographs, has_technical_diagrams,
          created_by, last_modified_by
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$23
        ) ON CONFLICT (ref_no) DO NOTHING`,
        [
          inq.ref_no, inq.branch, inq.sales_person, inq.customer_name,
          inq.inquiry_date, inq.direction, inq.pol, inq.pod,
          inq.cargo_description, inq.no_of_packages, inq.volume_frt,
          inq.heavy_lifts || null, inq.laycan || null,
          inq.rate_per_frt || null, inq.total_rate || null,
          inq.target_per_frt || null, inq.total_target || null,
          inq.status, inq.sales_support || null, inq.customer_type || null,
          inq.has_photographs, inq.has_technical_diagrams,
          adminId,
        ]
      );

      // Add remarks
      if (remarks[inq.ref_no]) {
        const inqRes = await client.query('SELECT id FROM inquiries WHERE ref_no = $1', [inq.ref_no]);
        const inqId = inqRes.rows[0]?.id;
        if (inqId) {
          for (const remark of remarks[inq.ref_no]) {
            await client.query(
              'INSERT INTO inquiry_remarks (inquiry_id, remark, created_by) VALUES ($1, $2, $3)',
              [inqId, remark, adminId]
            );
          }
        }
      }
    }

    console.log(`Inserted ${inquiries.length} demo inquiries with remarks.`);
  } catch (err) {
    console.error('Demo data seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDemoData().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDemoData };
