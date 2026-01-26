'use client';
import { useState } from 'react';
import { TenantApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function TenantCreatePage() {
  const [userId, setUserId] = useState<number>(0);
  const [bedId, setBedId] = useState<number>(0);
  const [moveInDate, setMoveInDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await TenantApi.create(userId, bedId, moveInDate);
      router.push('/tenants');
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="card">
      <h2>Add Tenant</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" type="number" placeholder="User ID" value={userId} onChange={e => setUserId(Number(e.target.value))} required />
        <input className="input" type="number" placeholder="Bed ID" value={bedId} onChange={e => setBedId(Number(e.target.value))} required />
        <input className="input" type="date" placeholder="Move-in date" value={moveInDate} onChange={e => setMoveInDate(e.target.value)} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Create</button>
      </form>
      <p style={{marginTop:8}}>If bed is occupied, backend returns 400.</p>
    </div>
  );
}