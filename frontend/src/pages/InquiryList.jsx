import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { FilterBar } from '../components/inquiries/FilterBar';
import { InquiryTable } from '../components/inquiries/InquiryTable';
import { InquiryDetailPanel } from '../components/inquiries/InquiryDetailPanel';
import { useInquiries } from '../hooks/useInquiries';
import client from '../api/client';

export default function InquiryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    branch: '',
    direction: '',
    search: '',
    sort_by: 'updated_at',
    sort_order: 'desc',
    page: 1,
    per_page: 50,
  });

  // Auto-open from URL param
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) setSelectedInquiry({ id: selectedId });
  }, []);

  const { data, isLoading } = useInquiries(filters);

  const handleSort = (field) => {
    setFilters((f) => ({
      ...f,
      sort_by: field,
      sort_order: f.sort_by === field && f.sort_order === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.branch) params.set('branch', filters.branch);
    if (filters.direction) params.set('direction', filters.direction);
    if (filters.search) params.set('search', filters.search);
    const url = `/api/v1/import/export-csv?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={data?.pagination?.total || 0}
        />
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 border border-border-subtle text-text-secondary hover:bg-bg-elevated text-sm rounded-lg transition-colors ml-2 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary bar */}
      {data?.summary && (
        <div className="flex gap-4 text-xs text-text-muted">
          <span>Volume: <span className="text-text-secondary">{data.summary.total_volume_frt?.toLocaleString() || 0} FRT</span></span>
          <span>Value: <span className="text-text-secondary">${data.summary.total_value_usd?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0}</span></span>
          {Object.entries(data.summary.by_status || {}).filter(([, v]) => v > 0).map(([k, v]) => (
            <span key={k}>{k}: <span className="text-text-secondary">{v}</span></span>
          ))}
        </div>
      )}

      <InquiryTable
        data={data?.data}
        pagination={data?.pagination}
        loading={isLoading}
        onSelect={(inq) => setSelectedInquiry(inq)}
        selectedId={selectedInquiry?.id}
        onSort={handleSort}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {selectedInquiry && (
        <InquiryDetailPanel
          inquiryId={selectedInquiry.id}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </div>
  );
}
