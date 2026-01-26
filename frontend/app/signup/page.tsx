'use client';
import { useEffect, useState } from 'react';
import { AuthApi } from '../../lib/api';
import { useRouter } from 'next/navigation';

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
    <div className="card">
      <h2>Signup</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Create account</button>
      </form>
    </div>
  );
}