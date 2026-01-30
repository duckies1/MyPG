'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PgApi } from '../../lib/api';

export default function PgListPage() {
  const [pgs, setPgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPgs = async () => {
      try {
        const data = await PgApi.list();
        setPgs(data);
      } catch {
        setPgs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPgs();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>My PGs</h2>
          <p className="subtitle">Manage your properties and accommodations</p>
        </div>
        <Link href="/pg/create" className="button" style={{alignSelf: 'flex-end'}}>+ Create PG</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : pgs.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: 40}}>
          <p style={{fontSize: 16, color: '#718096'}}>No PGs yet. Create one to get started.</p>
          <Link href="/pg/create" className="button" style={{marginTop: 16, display: 'inline-block'}}>Create Your First PG</Link>
        </div>
      ) : (
        <div className="grid-2">
          {pgs.map(pg => {
            return (
              <div key={pg.id} className="card" style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16}}>
                  <div className="hero-icon" style={{margin: 0, width: 40, height: 40}}>🏢</div>
                  <span className="pill" style={{background: '#f0fdf4', border: '1px solid #86efac', color: '#166534'}}>
                    {pg.occupied_beds}/{pg.total_beds} Beds
                  </span>
                </div>
                
                <h3 style={{marginBottom: 4}}>{pg.name}</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: '#718096', fontSize: 14}}>
                  <span>📍</span>
                  <span>{pg.address}</span>
                </div>

                <div style={{display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #e2e8f0', color: '#718096', fontSize: 13, marginBottom: 'auto'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                    <span>🏠</span>
                    <span>{pg.total_rooms} rooms</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                    <span>👥</span>
                    <span>{pg.total_tenants} tenants</span>
                  </div>
                </div>

                <Link href={`/pg/${pg.id}/rooms`} className="button secondary" style={{marginTop: 16, textAlign: 'center', textDecoration: 'none', alignSelf: 'flex-end', width: 'auto', padding: '10px 20px'}}>
                  View Rooms
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}