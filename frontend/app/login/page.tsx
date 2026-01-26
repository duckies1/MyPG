'use client';
import { useEffect, useState } from 'react';
import { AuthApi } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    AuthApi.getMe()
      .then(() => router.replace('/pg'))
      .catch(() => undefined);
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await AuthApi.login(email, password);
      const redirect = searchParams.get('redirect') || '/pg';
      router.push(redirect);
      router.refresh(); // Refresh to update nav state
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Login</button>
      </form>
      <p style={{marginTop:8}}>Cookie-based auth; keep same-origin via /api proxy.</p>
    </div>
  );
}