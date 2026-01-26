'use client';
import { useState } from 'react';
import { BedApi } from '../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function BedCreatePage() {
  const params = useParams();
  const roomId = Number(params?.roomId);
  const [rent, setRent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await BedApi.create(roomId, rent);
      router.push(`/rooms/${roomId}/beds`);
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="card">
      <h2>Add Bed</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" type="number" placeholder="Rent" value={rent} onChange={e => setRent(Number(e.target.value))} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Create</button>
      </form>
    </div>
  );
}