'use client';
import { useState } from 'react';
import { PgApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function PgCreatePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await PgApi.create(name, address);
      router.push('/pg');
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="card">
      <h2>Create PG (Admin)</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Create</button>
      </form>
      <p style={{marginTop:8}}>Requires admin role; backend returns 403 otherwise.</p>
    </div>
  );
}