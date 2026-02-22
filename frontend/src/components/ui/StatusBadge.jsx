import clsx from 'clsx';

const STATUS_CONFIG = {
  'OPEN': { label: 'Open', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'INITIATED WORKING': { label: 'Initiated', color: 'bg-blue-400/20 text-blue-300 border-blue-400/30' },
  'CLARIFICATIONS PENDING': { label: 'Clarifications', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'BUDGETARY': { label: 'Budgetary', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'QUOTED': { label: 'Quoted', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'UNDER FIRM DISCUSSIONS': { label: 'Firm Disc.', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'SECURED': { label: 'Secured', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  'LOST': { label: 'Lost', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
      config.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {config.label}
    </span>
  );
}

export const STATUS_COLORS = STATUS_CONFIG;
export const ALL_STATUSES = Object.keys(STATUS_CONFIG);
