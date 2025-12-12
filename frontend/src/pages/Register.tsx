import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export function RegisterPage() {
  const [tenantName, setTenantName] = useState('Acme Logistics');
  const [name, setName] = useState('Alice Admin');
  const [email, setEmail] = useState('alice@acme.test');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { tenantName, name, email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={onSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold">Create tenant</h1>
          <p className="text-sm text-slate-400">Set up your company and first admin user.</p>
        </div>
        {error && <div className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</div>}
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Company name</label>
          <input
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-blue-500"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-blue-500"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-blue-500"
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          Register & Sign in
        </button>
        <p className="text-center text-xs text-slate-400">
          Already have an account? <Link to="/auth/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
