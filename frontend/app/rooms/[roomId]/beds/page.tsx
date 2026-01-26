import Link from 'next/link';
import { BedApi } from '../../../../lib/api';

type Params = { params: { roomId: string } };

async function getBeds(roomId: number) {
  try { return await BedApi.list(roomId); } catch { return []; }
}

export default async function BedsPage({ params }: Params) {
  const roomId = Number(params.roomId);
  const beds = await getBeds(roomId);
  return (
    <div>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Beds for Room {roomId}</h2>
        <Link className="button" href={`/rooms/${roomId}/beds/create`}>Add Bed</Link>
      </div>
      <div className="grid">
        {beds.map(bed => (
          <div key={bed.id} className="card">
            <h3>Bed #{bed.id}</h3>
            <p>Rent: ₹{bed.rent}</p>
            <p>Status: {bed.is_occupied ? 'Occupied' : 'Available'}</p>
          </div>
        ))}
        {beds.length === 0 && <div className="card">No beds yet.</div>}
      </div>
    </div>
  );
}