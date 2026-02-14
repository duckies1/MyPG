'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BedApi } from '../../../../lib/api';
import { useParams } from 'next/navigation';

export default function BedsPage() {
  const params = useParams();
  const roomId = Number(params.roomId);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomNumber, setRoomNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const data = await BedApi.list(roomId);
        setBeds(data);
        // Get room_number from first bed if available
        if (data.length > 0) {
          setRoomNumber(data[0].room_number);
        }
      } catch {
        setBeds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBeds();
  }, [roomId]);
  return (
    <div>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Beds for Room {roomNumber ?? roomId}</h2>
        <Link className="button" href={`/rooms/${roomId}/beds/create`}>Add Bed</Link>
      </div>
      {loading ? (
        <div className="card" style={{textAlign: 'center', padding: 60}}>
          <div style={{fontSize: 48, marginBottom: 16}}>🛏️</div>
          <p style={{fontSize: 16, color: '#718096'}}>Loading beds...</p>
        </div>
      ) : (
        <div className="grid">
          {beds.map(bed => (
            <div key={bed.id} className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12}}>
                <div>
                  <h3 style={{margin: '0 0 8px 0'}}>Bed #{bed.id}</h3>
                  <p style={{margin: 0, color: '#718096', fontSize: 14}}>Rent: ₹{bed.rent}</p>
                  <p style={{margin: '4px 0 0 0', color: bed.is_occupied ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 600}}>
                    {bed.is_occupied ? '✓ Occupied' : '○ Available'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm(`Delete Bed #${bed.id}?`)) {
                      try {
                        await BedApi.delete(bed.id);
                        setBeds(beds.filter(b => b.id !== bed.id));
                      } catch (err: any) {
                        alert(err.message || 'Failed to delete bed');
                      }
                    }
                  }}
                  disabled={bed.is_occupied}
                  title={bed.is_occupied ? "Cannot delete: bed is occupied" : "Delete bed"}
                  style={{
                    background: bed.is_occupied ? '#d1d5db' : '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: bed.is_occupied ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {beds.length === 0 && <div className="card">No beds yet.</div>}
        </div>
      )}
    </div>
  );
}