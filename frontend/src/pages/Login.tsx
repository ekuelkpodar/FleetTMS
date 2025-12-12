import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export function LoginPage() {
  const [email, setEmail] = useState('alice@acme.test');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold">FleetTMS Login</h1>
          <p className="text-sm text-slate-400">Enter your credentials to continue.</p>
        </div>
        {error && <div className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</div>}
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-blue-500"
          />
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
          Login
        </button>
        <p className="text-center text-xs text-slate-400">
          No account? <Link to="/auth/register" className="text-blue-400 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
