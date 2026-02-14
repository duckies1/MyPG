'use client';
import { useEffect, useState } from 'react';
import { AuthApi } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();

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
      await refreshAuth(); // Refresh auth state immediately
      const redirect = searchParams.get('redirect') || '/pg';
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 140px)'}}>
      <div className="card" style={{maxWidth: 420, width: '100%'}}>
        <div style={{textAlign: 'center', marginBottom: 24}}>
          <div className="hero-icon" style={{margin: '0 auto 16px'}}>🏢</div>
          <h2 style={{marginBottom: 4}}>Welcome to MyPG</h2>
          <p>Sign in to manage your PGs and tenants</p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div>
            <label className="form-label">Email</label>
            <input 
              className="input" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input 
              className="input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <div className="error-text" style={{color: '#dc2626'}}>{error}</div>}

          <button className="button" type="submit" style={{width: '100%', marginTop: 8}}>Sign In</button>
        </form>

        <p style={{textAlign: 'center', marginTop: 20, fontSize: 14}}>
          Don't have an account? <Link href="/signup" style={{color: '#6366f1', fontWeight: 600, textDecoration: 'none'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}