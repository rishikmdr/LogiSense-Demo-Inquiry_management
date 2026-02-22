import { useEffect } from 'react';
import { X, Edit, ChevronDown, ArrowRight, Package, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, ALL_STATUSES } from '../ui/StatusBadge';
import { RemarksThread } from './RemarksThread';
import { useInquiry, useUpdateStatus } from '../../hooks/useInquiries';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import useAuthStore from '../../store/authStore';

function DetailField({ label, value, mono }) {
  if (!value && value !== false) return null;
  return (
    <div>
      <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-text-primary text-sm ${mono ? 'font-mono' : ''}`}>
        {value === true ? '✓ Yes' : value === false ? '✗ No' : value}
      </p>
    </div>
  );
}

export function InquiryDetailPanel({ inquiryId, onClose }) {
  const { data: inquiry, isLoading } = useInquiry(inquiryId);
  const { mutate: updateStatus } = useUpdateStatus(inquiryId);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-bg-secondary border-l border-border-active flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border-subtle flex-shrink-0">
          <div>
            {isLoading ? (
              <div className="h-6 w-40 bg-bg-elevated animate-pulse rounded" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-text-primary font-bold font-mono text-lg">{inquiry?.ref_no}</h2>
                  {inquiry?.is_in_duplicate_group && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">duplicate</span>
                  )}
                </div>
                <p className="text-text-muted text-sm mt-0.5">
                  {inquiry?.sales_person} · {inquiry?.direction} · {inquiry?.pol} → {inquiry?.pod}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {inquiry && user?.role !== 'viewer' && (
              <button
                onClick={() => navigate(`/inquiries/${inquiryId}/edit`)}
                className="p-2 hover:bg-bg-elevated rounded-lg text-text-muted hover:text-text-primary transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-bg-elevated rounded-lg text-text-muted hover:text-text-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status bar */}
        {inquiry && (
          <div className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-border-subtle flex-shrink-0">
            <div className="flex items-center gap-3">
              <StatusBadge status={inquiry.status} size="md" />
              {user?.role !== 'viewer' && (
                <select
                  value={inquiry.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="text-xs text-text-muted bg-bg-elevated border border-border-subtle rounded px-2 py-1 focus:outline-none focus:border-border-active"
                >
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
            <span className="text-text-muted text-xs">
              Created: {inquiry.inquiry_date ? format(new Date(inquiry.inquiry_date), 'dd MMM yyyy') : '—'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="p-5"><LoadingSkeleton rows={6} /></div>}
          {inquiry && (
            <div className="p-5 space-y-6">
              {/* Cargo Details */}
              <section>
                <h3 className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-3 h-3" /> Cargo Details
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-bg-card border border-border-subtle rounded-xl p-4">
                  <DetailField label="Customer" value={inquiry.customer_name} />
                  <DetailField label="Customer Type" value={inquiry.customer_type} />
                  <DetailField label="Trade Route" value={inquiry.direction} />
                  <DetailField label="Sales Support" value={inquiry.sales_support} />
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Route</p>
                    <p className="text-text-primary text-sm flex items-center gap-2">
                      {inquiry.pol} <ArrowRight className="w-3 h-3 text-text-muted" /> {inquiry.pod}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <DetailField label="Cargo Description" value={inquiry.cargo_description} />
                  </div>
                  <DetailField label="Packages" value={inquiry.no_of_packages} />
                  <DetailField label="Volume (FRT)" value={inquiry.volume_frt ? Number(inquiry.volume_frt).toLocaleString() : null} />
                  <DetailField label="Heavy Lifts" value={inquiry.heavy_lifts} />
                  <DetailField label="Laycan" value={inquiry.laycan} />
                  <DetailField label="Rate/FRT (USD)" value={inquiry.rate_per_frt ? `$${Number(inquiry.rate_per_frt).toLocaleString()}` : null} />
                  <DetailField label="Total Rate (USD)" value={inquiry.total_rate ? `$${Number(inquiry.total_rate).toLocaleString()}` : null} />
                  <DetailField label="Target/FRT (USD)" value={inquiry.target_per_frt ? `$${Number(inquiry.target_per_frt).toLocaleString()}` : null} />
                  <DetailField label="Total Target (USD)" value={inquiry.total_target ? `$${Number(inquiry.total_target).toLocaleString()}` : null} />
                  <DetailField label="Has Photographs" value={inquiry.has_photographs} />
                  <DetailField label="Has Tech Diagrams" value={inquiry.has_technical_diagrams} />
                </div>
              </section>

              {/* Duplicate group */}
              {inquiry.duplicate_group?.length > 0 && (
                <section>
                  <h3 className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-3">Related Inquiries (Duplicate Group)</h3>
                  <div className="flex flex-wrap gap-2">
                    {inquiry.duplicate_group.map((d) => (
                      <span key={d.inquiry_id} className="text-xs px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-mono">
                        {d.ref_no}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Remarks */}
              <section>
                <h3 className="text-text-secondary text-xs uppercase tracking-widest font-semibold mb-3">Remarks / Instructions</h3>
                <RemarksThread inquiryId={inquiry.id} remarks={inquiry.remarks || []} />
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
