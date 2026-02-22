import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, Edit, AlertTriangle, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge, ALL_STATUSES } from '../ui/StatusBadge';
import { useUpdateStatus } from '../../hooks/useInquiries';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import clsx from 'clsx';

function StatusDropdown({ inquiry }) {
  const { mutate, isPending } = useUpdateStatus(inquiry.id);

  return (
    <select
      value={inquiry.status}
      onChange={(e) => mutate(e.target.value)}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      className="bg-transparent border-0 text-text-secondary text-xs cursor-pointer focus:outline-none"
    >
      {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function formatCurrency(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

export function InquiryTable({ data, pagination, loading, onSelect, selectedId, onSort, sortBy, sortOrder, onPageChange }) {
  const [selectedRows, setSelectedRows] = useState(new Set());

  const toggleRow = (e, id) => {
    e.stopPropagation();
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const SortHeader = ({ field, label }) => (
    <th
      className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider cursor-pointer hover:text-text-secondary whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={clsx('w-3 h-3', sortBy === field ? 'text-accent-blue' : 'text-text-muted')} />
      </span>
    </th>
  );

  if (loading) return <LoadingSkeleton rows={8} />;

  if (!data?.length) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium text-text-secondary">No inquiries found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-bg-secondary border-b border-border-subtle">
            <tr>
              <th className="px-3 py-3 w-10">
                <input type="checkbox" className="rounded" onChange={() => {}} />
              </th>
              <SortHeader field="ref_no" label="Ref No." />
              <SortHeader field="inquiry_date" label="Date" />
              <SortHeader field="customer_name" label="Customer" />
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">Branch</th>
              <SortHeader field="direction" label="Route" />
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">POL → POD</th>
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider max-w-32">Cargo</th>
              <SortHeader field="volume_frt" label="FRT" />
              <SortHeader field="total_rate" label="Rate (USD)" />
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">Laycan</th>
              <SortHeader field="status" label="Status" />
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">Sales</th>
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider max-w-40">Last Remark</th>
              <th className="px-3 py-3 text-left text-xs text-text-muted font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.map((inq) => (
              <tr
                key={inq.id}
                onClick={() => onSelect(inq)}
                className={clsx(
                  'hover:bg-bg-elevated cursor-pointer transition-colors',
                  selectedId === inq.id && 'bg-accent-blue/10 border-l-2 border-accent-blue'
                )}
              >
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(inq.id)}
                    onChange={(e) => toggleRow(e, inq.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {inq.is_in_duplicate_group && <AlertTriangle className="w-3 h-3 text-accent-amber flex-shrink-0" title="Potential duplicate" />}
                    <span className="font-mono text-accent-blue text-xs font-medium">{inq.ref_no}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-text-muted text-xs whitespace-nowrap">
                  {inq.inquiry_date ? format(new Date(inq.inquiry_date), 'dd MMM yy') : '—'}
                </td>
                <td className="px-3 py-3 text-text-primary max-w-36">
                  <span className="truncate block" title={inq.customer_name}>{inq.customer_name || '—'}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs px-1.5 py-0.5 bg-bg-elevated border border-border-subtle rounded text-text-secondary">
                    {inq.branch}
                  </span>
                </td>
                <td className="px-3 py-3 text-text-secondary text-xs whitespace-nowrap max-w-28">
                  <span className="truncate block" title={inq.direction}>{inq.direction}</span>
                </td>
                <td className="px-3 py-3 text-text-secondary text-xs whitespace-nowrap">
                  <span className="text-text-muted">{inq.pol}</span>
                  <span className="mx-1">→</span>
                  <span>{inq.pod}</span>
                </td>
                <td className="px-3 py-3 text-text-muted text-xs max-w-32">
                  <span className="truncate block" title={inq.cargo_description}>{inq.cargo_description || '—'}</span>
                </td>
                <td className="px-3 py-3 text-right text-text-secondary text-xs whitespace-nowrap">
                  {inq.volume_frt ? Number(inq.volume_frt).toLocaleString() : '—'}
                </td>
                <td className="px-3 py-3 text-right text-text-secondary text-xs whitespace-nowrap">
                  {formatCurrency(inq.total_rate)}
                </td>
                <td className="px-3 py-3 text-text-muted text-xs max-w-24">
                  <span className="truncate block">{inq.laycan || '—'}</span>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={inq.status} />
                </td>
                <td className="px-3 py-3 text-text-secondary text-xs whitespace-nowrap">
                  {inq.sales_person?.split(' ')[0] || '—'}
                </td>
                <td className="px-3 py-3 text-text-muted text-xs max-w-40">
                  <span className="truncate block" title={inq.last_remark}>{inq.last_remark || '—'}</span>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <StatusDropdown inquiry={inq} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
          <span>{pagination.total} total · Page {pagination.page} of {pagination.total_pages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-elevated disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
