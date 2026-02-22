import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ALL_STATUSES } from '../ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

const DIRECTIONS = [
  'PERSIAN GULF', 'EAST AFRICA', 'WEST AFRICA', 'FAR EAST',
  'FAR EAST / SOUTH EAST ASIA', 'AUSTRALIA / NEW ZEALAND',
  'SOUTH AMERICA', 'USA', 'EUROPE', 'MEDITERRANEAN', 'RED SEA', 'SOUTH AFRICA',
];

const BRANCHES = ['MUMBAI', 'PUNE', 'CHENNAI', 'KOLKATA', 'AHMEDABAD', 'HYDERABAD', 'VIZAG'];

export function FilterBar({ filters, onChange, totalCount }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value.length === 0 || e.target.value.length >= 2) {
      onChange({ ...filters, search: e.target.value, page: 1 });
    }
  };

  const handleFilter = (key, val) => {
    onChange({ ...filters, [key]: val === filters[key] ? '' : val, page: 1 });
  };

  const clearAll = () => {
    setSearch('');
    onChange({ page: 1, per_page: 50 });
  };

  const activeFilterCount = [filters.status, filters.branch, filters.direction, filters.search]
    .filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search customer, cargo, port..."
            className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); onChange({ ...filters, search: '', page: 1 }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-border-active"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Branch filter */}
        <select
          value={filters.branch || ''}
          onChange={(e) => handleFilter('branch', e.target.value)}
          className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-border-active"
        >
          <option value="">All Branches</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Direction filter */}
        <select
          value={filters.direction || ''}
          onChange={(e) => handleFilter('direction', e.target.value)}
          className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-border-active"
        >
          <option value="">All Routes</option>
          {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <button
          onClick={() => navigate('/inquiries/new')}
          className="ml-auto px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + New Inquiry
        </button>

        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-sm transition-colors">
            <X className="w-3 h-3" /> Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Quick filter tabs */}
      <div className="flex gap-1 border-b border-border-subtle">
        {[
          { label: 'All', value: '' },
          { label: 'Open', value: 'OPEN' },
          { label: 'Active', value: 'INITIATED WORKING' },
          { label: 'Clarifications', value: 'CLARIFICATIONS PENDING' },
          { label: 'Quoted', value: 'QUOTED' },
          { label: 'Secured', value: 'SECURED' },
          { label: 'Lost', value: 'LOST' },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => handleFilter('status', value)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              (filters.status || '') === value
                ? 'border-accent-blue text-accent-blue'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-text-muted text-xs self-center pr-1">{totalCount} inquiries</span>
      </div>
    </div>
  );
}
