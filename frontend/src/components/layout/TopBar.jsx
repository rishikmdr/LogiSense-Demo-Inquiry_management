import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/inquiries': 'All Inquiries',
  '/inquiries/new': 'New Inquiry',
  '/consolidation': 'Consolidation Opportunities',
  '/import': 'Import / Export',
  '/settings': 'Settings',
};

export function TopBar() {
  const location = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'Inquiry Management';

  return (
    <header className="h-14 bg-bg-secondary border-b border-border-subtle flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-text-primary font-semibold">{title}</h1>
      <div className="flex-1" />
      <button className="text-text-muted hover:text-text-secondary transition-colors">
        <Bell className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-7 h-7 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-xs font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </span>
        </div>
        <span className="text-text-secondary hidden sm:block">{user?.full_name}</span>
      </div>
    </header>
  );
}
