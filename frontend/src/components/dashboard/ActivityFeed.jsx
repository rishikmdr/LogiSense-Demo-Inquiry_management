import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const ACTION_LABELS = {
  created: 'created',
  updated: 'updated',
  status_changed: 'changed status on',
  remark_added: 'added a remark to',
  deleted: 'deleted',
};

export function ActivityFeed({ data = [], loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-accent-blue" />
        <h3 className="text-text-primary font-semibold">Recent Activity</h3>
      </div>
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" />
          ))}
        </div>
      )}
      {!loading && !data.length && (
        <p className="text-text-muted text-sm text-center py-8">No activity yet</p>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-bg-elevated cursor-pointer transition-colors"
            onClick={() => item.inquiry_id && navigate(`/inquiries?selected=${item.inquiry_id}`)}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-secondary text-xs">
                <span className="text-text-primary font-medium">{item.user_name || 'System'}</span>
                {' '}{ACTION_LABELS[item.action] || item.action}{' '}
                {item.ref_no && (
                  <span className="text-accent-blue font-mono">{item.ref_no}</span>
                )}
                {item.action === 'status_changed' && item.new_value && (
                  <span className="text-text-muted"> → {item.new_value}</span>
                )}
              </p>
              <p className="text-text-muted text-xs">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
