const XLSX = require('xlsx');

const STATUS_MAP = {
  'OPEN': 'OPEN',
  'INITIATED WORKING': 'INITIATED WORKING',
  'CLARIFICATIONS PENDING': 'CLARIFICATIONS PENDING',
  'BUDGETARY': 'BUDGETARY',
  'QUOTED': 'QUOTED',
  'UNDER FIRM DISCUSSIONS': 'UNDER FIRM DISCUSSIONS',
  'SECURED': 'SECURED',
  'LOST': 'LOST',
};

function normalizeStatus(val) {
  if (!val) return 'OPEN';
  const upper = String(val).trim().toUpperCase();
  return STATUS_MAP[upper] || 'OPEN';
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d);
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function parseSheet(worksheet, columnMap) {
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
  return rows.map((row) => {
    const mapped = {};
    for (const [excelCol, dbField] of Object.entries(columnMap)) {
      // Try exact match first, then case-insensitive
      let val = row[excelCol];
      if (val === undefined) {
        const key = Object.keys(row).find(
          (k) => k.trim().toUpperCase() === excelCol.trim().toUpperCase()
        );
        val = key ? row[key] : null;
      }
      mapped[dbField] = val;
    }
    return mapped;
  });
}

const COLUMN_MAP_2026 = {
  'BRANCH': 'branch',
  'REF NO.': 'ref_no',
  'SALES': 'sales_person',
  'CUSTOMER NAME': 'customer_name',
  'DATE': 'inquiry_date',
  'DIRECTION': 'direction',
  'POL': 'pol',
  'POD': 'pod',
  'CARGO DESCRIPTION': 'cargo_description',
  'NO. OF PKGS': 'no_of_packages',
  'VOLUME (IN FRT)': 'volume_frt',
  'HEAVY LIFTS (ABOVE 25 TONS)': 'heavy_lifts',
  'LAYCAN': 'laycan',
  'RATE PER FRT': 'rate_per_frt',
  'TOTAL RATE': 'total_rate',
  'TARGET PER FRT': 'target_per_frt',
  'TOTAL TARGET': 'total_target',
  'STATUS': 'status',
  'REMARKS': 'remarks',
  'SALES SUPPORT': 'sales_support',
  'CUSTOMER TYPE': 'customer_type',
};

function parseExcelFile(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const results = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = parseSheet(worksheet, COLUMN_MAP_2026);

    for (const row of rows) {
      if (!row.ref_no && !row.direction && !row.pol) continue; // skip empty rows

      const inquiry = {
        ref_no: row.ref_no ? String(row.ref_no).trim() : null,
        branch: row.branch ? String(row.branch).trim().toUpperCase() : 'MUMBAI',
        sales_person: row.sales_person ? String(row.sales_person).trim().toUpperCase() : 'UNKNOWN',
        customer_name: row.customer_name ? String(row.customer_name).trim() : null,
        inquiry_date: parseDate(row.inquiry_date),
        direction: row.direction ? String(row.direction).trim().toUpperCase() : null,
        pol: row.pol ? String(row.pol).trim().toUpperCase() : null,
        pod: row.pod ? String(row.pod).trim().toUpperCase() : null,
        cargo_description: row.cargo_description ? String(row.cargo_description).trim() : null,
        no_of_packages: parseNum(row.no_of_packages),
        volume_frt: parseNum(row.volume_frt),
        heavy_lifts: row.heavy_lifts ? String(row.heavy_lifts).trim() : null,
        laycan: row.laycan ? String(row.laycan).trim() : null,
        rate_per_frt: parseNum(row.rate_per_frt),
        total_rate: parseNum(row.total_rate),
        target_per_frt: parseNum(row.target_per_frt),
        total_target: parseNum(row.total_target),
        status: normalizeStatus(row.status),
        sales_support: row.sales_support ? String(row.sales_support).trim().toUpperCase() : null,
        customer_type: row.customer_type ? String(row.customer_type).trim().toUpperCase() : null,
        remarks: row.remarks ? String(row.remarks).trim() : null,
        sheet: sheetName,
      };

      if (inquiry.pol && inquiry.direction) {
        results.push(inquiry);
      }
    }
  }

  return results;
}

module.exports = { parseExcelFile };
