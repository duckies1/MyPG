'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TenantApi } from '../../lib/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await TenantApi.list();
        setTenants(data);
      } catch {
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const totalTenants = tenants.length;
  const activeTenants = tenants.length; // Would filter by status
  const leftTenants = 0; // Would calculate from data

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Tenants</h2>
          <p className="subtitle">Manage all your tenants across properties</p>
        </div>
        <Link href="/tenants/create" className="button" style={{alignSelf: 'flex-end'}}>+ Add Tenant</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{marginBottom: 32}}>
        <div className="stat-card">
          <div className="stat-icon primary">👥</div>
          <div className="stat-value">{totalTenants}</div>
          <div className="stat-label">Total Tenants</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-value">{activeTenants}</div>
          <div className="stat-label">Active Tenants</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">→</div>
          <div className="stat-value">{leftTenants}</div>
          <div className="stat-label">Left</div>
        </div>
      </div>

      {/* Tenants Table */}
      {loading ? null : tenants.length === 0 ? (
        <div className="card" style={{textAlign: 'center', padding: 40}}>
          <p style={{fontSize: 16, color: '#718096'}}>No tenants yet. Add one to get started.</p>
          <Link href="/tenants/create" className="button" style={{marginTop: 16, display: 'inline-block'}}>Add First Tenant</Link>
        </div>
      ) : (
        <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>PG</th>
                  <th>Room</th>
                  <th>Contact</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id}>
                    <td style={{fontWeight: 600}}>Tenant #{t.id}</td>
                    <td>Sunshine Heights</td>
                    <td>Room 101</td>
                    <td>+91 98765 43210</td>
                    <td>{new Date(t.move_in_date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                    <td><span className="pill success">Active</span></td>
                    <td><Link href="#" style={{color: '#6366f1', textDecoration: 'none', fontWeight: 600}}>View Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}