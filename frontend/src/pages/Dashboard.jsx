import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, AlertTriangle, CheckCircle, Link2, BarChart3 } from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { PipelineChart } from '../components/dashboard/PipelineChart';
import { RouteChart } from '../components/dashboard/RouteChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { KpiSkeleton } from '../components/ui/LoadingSkeleton';
import { useDashboardKpis, usePipelineData, useRouteData, useActivityFeed } from '../hooks/useDashboard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useInquiries } from '../hooks/useInquiries';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis();
  const { data: pipeline } = usePipelineData();
  const { data: routeData } = useRouteData();
  const { data: activity, isLoading: activityLoading } = useActivityFeed();

  const { data: atRisk } = useInquiries({
    status: 'CLARIFICATIONS PENDING',
    per_page: 10,
  });

  const fmt = (n) => n?.toLocaleString('en-US') ?? '—';
  const fmtUsd = (n) => n ? `USD ${(n / 1000000).toFixed(1)}M` : '—';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpisLoading ? (
          Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Open Inquiries" value={fmt(kpis?.open_inquiries)} subtitle={`+${kpis?.inquiries_added_this_week || 0} this week`} icon={BarChart3} color="blue"
              clickable onClick={() => navigate('/inquiries?status=OPEN')} />
            <KpiCard title="Pipeline Value" value={fmtUsd(kpis?.total_value_pipeline_usd)} icon={TrendingUp} color="teal" />
            <KpiCard title="Volume (FRT)" value={fmt(kpis?.total_volume_open_frt)} icon={Package} color="blue" />
            <KpiCard title="At Risk" value={fmt(kpis?.at_risk_count)} subtitle="Pending > 5 days" icon={AlertTriangle} color="amber"
              clickable onClick={() => navigate('/inquiries?status=CLARIFICATIONS+PENDING')} />
            <KpiCard title="Secured (MTD)" value={fmt(kpis?.inquiries_secured_this_month)} icon={CheckCircle} color="teal" />
            <KpiCard title="Consolidation" value={fmt(kpis?.consolidation_opportunities)} subtitle="Opportunities" icon={Link2} color="purple"
              clickable onClick={() => navigate('/consolidation')} />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <RouteChart data={routeData || []} />
        </div>
        <div className="xl:col-span-2">
          <PipelineChart data={pipeline || []} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ActivityFeed data={activity || []} loading={activityLoading} />

        {/* At-risk panel */}
        <div className="bg-bg-card border border-accent-red/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            <h3 className="text-text-primary font-semibold">At-Risk Inquiries</h3>
            {kpis?.at_risk_count > 0 && (
              <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-500/20 text-accent-red border border-red-500/30 rounded-full">
                {kpis.at_risk_count} flagged
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {!atRisk?.data?.length && (
              <p className="text-text-muted text-sm text-center py-8">No at-risk inquiries — great job! 🎉</p>
            )}
            {atRisk?.data?.map((inq) => (
              <div
                key={inq.id}
                className="flex items-center justify-between p-3 bg-bg-elevated border border-border-subtle rounded-lg hover:border-accent-red/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/inquiries?selected=${inq.id}`)}
              >
                <div>
                  <p className="text-accent-blue font-mono text-xs">{inq.ref_no}</p>
                  <p className="text-text-secondary text-xs mt-0.5">{inq.customer_name || '—'}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={inq.status} />
                  <p className="text-text-muted text-xs mt-0.5">
                    {inq.updated_at ? formatDistanceToNow(new Date(inq.updated_at), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
