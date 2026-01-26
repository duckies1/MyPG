import Link from 'next/link';
import { RoomApi } from '../../../../lib/api';

type Params = { params: { pgId: string } };

async function getRooms(pgId: number) {
  try { return await RoomApi.list(pgId); } catch { return []; }
}

export default async function RoomsPage({ params }: Params) {
  const pgId = Number(params.pgId);
  const rooms = await getRooms(pgId);
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