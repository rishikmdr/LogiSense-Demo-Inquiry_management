import { useState } from 'react';
import { Ship, Anchor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, loginLoading } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#2d7df6 1px, transparent 1px), linear-gradient(90deg, #2d7df6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-blue/20 border border-accent-blue/30 rounded-2xl mb-4">
            <Ship className="w-8 h-8 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">LogiSense IMS</h1>
          <p className="text-text-muted mt-1">Inquiry Management System</p>
          <p className="text-text-muted text-xs mt-1">Cargo • Maritime • Mumbai</p>
        </div>

        {/* Form */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-text-muted text-xs uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-text-muted text-xs uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading || !form.username || !form.password}
              className="w-full py-3 bg-accent-blue hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="text-text-muted text-xs text-center">
              Default admin: <span className="text-text-secondary font-mono">admin</span> /
              <span className="text-text-secondary font-mono"> LogiSenseAdmin2026!</span>
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          © 2026 LogiSense · Overseas Cargo Shipping
        </p>
      </div>
    </div>
  );
}
