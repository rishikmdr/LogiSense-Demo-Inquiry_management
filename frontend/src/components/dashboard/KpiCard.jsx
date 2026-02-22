import clsx from 'clsx';

export function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick, clickable }) {
  const colorMap = {
    blue: 'text-accent-blue bg-accent-blue/10',
    teal: 'text-accent-teal bg-accent-teal/10',
    amber: 'text-accent-amber bg-accent-amber/10',
    red: 'text-accent-red bg-accent-red/10',
    purple: 'text-accent-purple bg-accent-purple/10',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-bg-card border border-border-subtle rounded-xl p-5 transition-all',
        clickable && 'cursor-pointer hover:border-border-active hover:bg-bg-elevated'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider font-medium">{title}</p>
          <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
          {subtitle && <p className="text-text-secondary text-xs mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={clsx('p-2.5 rounded-lg', colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
