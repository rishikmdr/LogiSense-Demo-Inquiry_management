import { useState } from 'react';
import { Link2, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useConsolidationOpportunities } from '../hooks/useDashboard';
import { InquiryDetailPanel } from '../components/inquiries/InquiryDetailPanel';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function Consolidation() {
  const { data, isLoading } = useConsolidationOpportunities();
  const [selectedId, setSelectedId] = useState(null);

  if (isLoading) return <LoadingSkeleton rows={6} />;

  const groups = data?.groups || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link2 className="w-5 h-5 text-accent-teal" />
        <div>
          <p className="text-text-muted text-sm">{groups.length} route{groups.length !== 1 ? 's' : ''} with consolidation potential</p>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          <p className="text-4xl mb-3">🔗</p>
          <p className="font-medium text-text-secondary">No consolidation opportunities right now</p>
          <p className="text-sm mt-1">Opportunities appear when 2+ open inquiries share the same trade route and discharge port</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((group, idx) => (
          <div key={idx} className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden hover:border-accent-teal/40 transition-colors">
            {/* Header */}
            <div className="bg-bg-elevated px-5 py-4 border-b border-border-subtle">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-primary font-semibold">{group.direction}</p>
                  <p className="text-text-secondary text-sm flex items-center gap-1 mt-0.5">
                    {group.pol} <ArrowRight className="w-3 h-3" /> {group.pod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-accent-teal font-bold text-lg">{group.inquiry_count}</p>
                  <p className="text-text-muted text-xs">inquiries</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-text-muted">
                <span>Total: <span className="text-text-secondary font-medium">{group.total_volume_frt?.toLocaleString()} FRT</span></span>
                {group.total_value > 0 && (
                  <span>Value: <span className="text-text-secondary font-medium">${group.total_value?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></span>
                )}
              </div>
            </div>

            {/* Inquiries */}
            <div className="divide-y divide-border-subtle">
              {(group.inquiries || []).map((inq) => (
                <div
                  key={inq.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-bg-elevated cursor-pointer transition-colors"
                  onClick={() => setSelectedId(inq.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-accent-blue text-xs">{inq.ref_no}</span>
                    <span className="text-text-muted text-xs">{inq.sales_person?.split(' ')[0]}</span>
                    {inq.customer_name && <span className="text-text-secondary text-xs">{inq.customer_name}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-xs">{inq.volume_frt ? `${Number(inq.volume_frt).toLocaleString()} FRT` : '—'}</span>
                    <StatusBadge status={inq.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-accent-teal/5 border-t border-accent-teal/20">
              <p className="text-accent-teal text-xs">💡 {group.potential_saving_note}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <InquiryDetailPanel
          inquiryId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
