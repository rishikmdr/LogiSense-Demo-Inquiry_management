import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Plus, Link2, Upload, Settings, Ship, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/inquiries', icon: List, label: 'All Inquiries' },
  { to: '/inquiries/new', icon: Plus, label: 'New Inquiry' },
  { to: '/consolidation', icon: Link2, label: 'Consolidation' },
  { to: '/import', icon: Upload, label: 'Import / Export' },
];

const adminItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={clsx(
      'h-screen flex flex-col bg-bg-secondary border-r border-border-subtle transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border-subtle">
        <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Ship className="w-4 h-4 text-accent-blue" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-text-primary font-bold text-sm leading-tight">LogiSense</p>
            <p className="text-text-muted text-xs">Inquiry Management</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
              isActive
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && <p className="px-3 pt-4 pb-1 text-xs text-text-muted uppercase tracking-wider">Admin</p>}
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border-subtle p-3">
        <div className={clsx('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-blue text-xs font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-text-primary text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-text-muted text-xs capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="text-text-muted hover:text-accent-red transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
