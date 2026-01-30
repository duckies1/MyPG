'use client';
import { useEffect, useState } from 'react';
import { AuthApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    AuthApi.getMe()
      .then(() => router.replace('/pg'))
      .catch(() => undefined);
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await AuthApi.signup(name, email, password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 140px)'}}>
      <div className="card" style={{maxWidth: 420, width: '100%'}}>
        <div style={{textAlign: 'center', marginBottom: 24}}>
          <div className="hero-icon" style={{margin: '0 auto 16px'}}>🏢</div>
          <h2 style={{marginBottom: 4}}>Create an Account</h2>
          <p>Start managing your PGs and tenants today</p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div>
            <label className="form-label">Full Name</label>
            <input 
              className="input" 
              placeholder="John Doe" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

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

          <button className="button" type="submit" style={{width: '100%', marginTop: 8}}>Create Account</button>
        </form>

        <p style={{textAlign: 'center', marginTop: 20, fontSize: 14}}>
          Already have an account? <Link href="/login" style={{color: '#6366f1', fontWeight: 600, textDecoration: 'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}