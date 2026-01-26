'use client';
import { useState } from 'react';
import { RoomApi } from '../../../../../lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function RoomCreatePage() {
  const params = useParams();
  const pgId = Number(params?.pgId);
  const [roomNumber, setRoomNumber] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await RoomApi.create(pgId, roomNumber);
      router.push(`/pg/${pgId}/rooms`);
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
  };

  return (
    <div className="card">
      <h2>Add Room</h2>
      <form className="form" onSubmit={onSubmit}>
        <input className="input" type="number" placeholder="Room number" value={roomNumber} onChange={e => setRoomNumber(Number(e.target.value))} required />
        {error && <div style={{color:'crimson'}}>{error}</div>}
        <button className="button" type="submit">Create</button>
      </form>
    </div>
  );
}