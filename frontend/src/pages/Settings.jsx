import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ROLES = ['admin', 'sales', 'sales_support', 'viewer'];
const BRANCHES = ['MUMBAI', 'PUNE', 'CHENNAI', 'KOLKATA', 'AHMEDABAD', 'HYDERABAD', 'VIZAG'];

function UserRow({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ role: user.role, branch: user.branch, is_active: user.is_active });

  const save = () => {
    onUpdate(user.id, form);
    setEditing(false);
  };

  return (
    <tr className="border-b border-border-subtle hover:bg-bg-elevated transition-colors">
      <td className="px-4 py-3 text-text-primary text-sm">{user.full_name}</td>
      <td className="px-4 py-3 text-text-muted text-sm font-mono">{user.username}</td>
      <td className="px-4 py-3">
        {editing ? (
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="bg-bg-elevated border border-border-subtle rounded px-2 py-1 text-xs text-text-secondary">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <span className="text-xs px-2 py-1 bg-bg-elevated border border-border-subtle rounded text-text-secondary capitalize">{user.role}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select value={form.branch || ''} onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="bg-bg-elevated border border-border-subtle rounded px-2 py-1 text-xs text-text-secondary">
            <option value="">None</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        ) : (
          <span className="text-text-muted text-sm">{user.branch || '—'}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${user.is_active ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'}`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex gap-2">
            <button onClick={save} className="p-1.5 bg-accent-teal/20 text-accent-teal rounded hover:bg-accent-teal/30 transition-colors">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 bg-bg-elevated text-text-muted rounded hover:bg-bg-card transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-text-muted hover:text-accent-blue text-xs transition-colors">Edit</button>
        )}
      </td>
    </tr>
  );
}

export default function Settings() {
  const { user: currentUser } = useAuthStore();
  const qc = useQueryClient();
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'sales', branch: 'MUMBAI' });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => client.get('/users').then((r) => r.data),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => client.put(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); },
  });

  const createUser = useMutation({
    mutationFn: (data) => client.post('/users', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      setShowNewUser(false);
      setNewUser({ username: '', password: '', full_name: '', role: 'sales', branch: 'MUMBAI' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create user'),
  });

  if (currentUser?.role !== 'admin') {
    return <p className="text-text-muted">Access restricted to administrators.</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h3 className="text-text-primary font-semibold">Users</h3>
          <button
            onClick={() => setShowNewUser(!showNewUser)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* New user form */}
        {showNewUser && (
          <div className="p-5 border-b border-border-subtle bg-bg-elevated">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Full name" value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active" />
              <input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active" />
              <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active" />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={newUser.branch} onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                className="bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none">
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <button
                onClick={() => createUser.mutate(newUser)}
                disabled={createUser.isPending || !newUser.username || !newUser.password || !newUser.full_name}
                className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {createUser.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Name', 'Username', 'Role', 'Branch', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Loading users...</td></tr>
            )}
            {users?.map((user) => (
              <UserRow key={user.id} user={user} onUpdate={(id, data) => updateUser.mutate({ id, data })} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
