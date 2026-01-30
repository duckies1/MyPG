'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PgApi } from '../../lib/api';

export default function PgListPage() {
  const [pgs, setPgs] = useState<any[]>([]);

  useEffect(() => {
    const fetchPgs = async () => {
      try {
        const data = await PgApi.list();
        setPgs(data);
      } catch {
        setPgs([]);
      }
    };
    fetchPgs();
  }, []);
  return (
    <div>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>PGs</h2>
        <Link className="button" href="/pg/create">Create PG</Link>
      </div>
      <div className="grid">
        {pgs.map(pg => (
          <div key={pg.id} className="card">
            <h3>{pg.name}</h3>
            <p>{pg.address}</p>
            <div style={{display:'flex', gap:8}}>
              <Link className="button secondary" href={`/pg/${pg.id}/rooms`}>Rooms</Link>
            </div>
          </div>
        ))}
        {pgs.length === 0 && <div className="card">No PGs yet.</div>}
      </div>
    </div>
  );
}