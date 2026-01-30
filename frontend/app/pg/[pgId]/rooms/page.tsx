'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RoomApi } from '../../../../lib/api';
import { useParams } from 'next/navigation';

export default function RoomsPage() {
  const params = useParams();
  const pgId = Number(params.pgId);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await RoomApi.list(pgId);
        setRooms(data);
      } catch {
        setRooms([]);
      }
    };
    fetchRooms();
  }, [pgId]);
  return (
    <div>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Rooms for PG {pgId}</h2>
        <Link className="button" href={`/pg/${pgId}/rooms/create`}>Add Room</Link>
      </div>
      <div className="grid">
        {rooms.map(room => (
          <div key={room.id} className="card">
            <h3>Room #{room.room_number}</h3>
            <div style={{display:'flex', gap:8}}>
              <Link className="button secondary" href={`/rooms/${room.id}/beds`}>Beds</Link>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <div className="card">No rooms yet.</div>}
      </div>
    </div>
  );
}