import Link from 'next/link';
import { PgApi } from '../../lib/api';

async function getPgs() {
  try { return await PgApi.list(); } catch { return []; }
}

export default async function PgListPage() {
  const pgs = await getPgs();
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