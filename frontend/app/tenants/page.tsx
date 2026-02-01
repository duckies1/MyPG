'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TenantApi } from '../../lib/api';

type Tenant = {
  id: number;
  user_id: number;
  bed_id: number;
  move_in_date: string;
  user_name: string;
  user_email: string;
  room_number: number;
  pg_name: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(new Set());

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

  // Filter tenants based on search query
  const filteredTenants = tenants.filter(t => 
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pg_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.move_in_date.includes(searchQuery)
  );

  const totalTenants = tenants.length;
  const activeTenants = tenants.length;
  const leftTenants = 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleExpandRow = (tenantId: number) => {
    setExpandedRowIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

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
        <>
          {/* Search Input */}
          <div style={{marginBottom: 20}}>
            <input
              type="text"
              placeholder="Search by tenant name, PG name, or join date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 15,
                border: '1px solid #e0e7ff',
                borderRadius: '8px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e0e7ff'}
            />
          </div>

          {/* Results Count */}
          {filteredTenants.length !== tenants.length && (
            <p style={{fontSize: 13, color: '#718096', marginBottom: 16}}>
              Showing {filteredTenants.length} of {tenants.length} tenants
            </p>
          )}

          {/* Table */}
          <div className="card" style={{padding: 0, overflow: 'hidden'}}>
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>PG</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(t => (
                    <>
                      <tr key={t.id} style={{cursor: 'pointer'}}>
                        <td style={{fontWeight: 600}}>{t.user_name}</td>
                        <td>{t.pg_name}</td>
                        <td>{formatDate(t.move_in_date)}</td>
                        <td>
                          <button
                            onClick={() => toggleExpandRow(t.id)}
                            className="button secondary"
                            style={{
                              fontSize: 13,
                              padding: '8px 16px'
                            }}
                          >
                          {expandedRowIds.has(t.id) ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedRowIds.has(t.id) && (
                        <tr key={`details-${t.id}`}>
                          <td colSpan={4} style={{padding: 0, border: 'none'}}>
                            <div 
                              style={{
                                backgroundColor: '#f8f7ff',
                                padding: expandedRowIds.has(t.id) ? '20px 24px' : '0 24px',
                                borderTop: expandedRowIds.has(t.id) ? '1px solid #e0e7ff' : 'none',
                                maxHeight: expandedRowIds.has(t.id) ? '400px' : '0',
                                overflow: 'hidden',
                                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              }}
                            >
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
                                <div>
                                  <p style={{fontSize: 11, color: '#718096', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px'}}>ROOM NUMBER</p>
                                  <p style={{fontSize: 15, fontWeight: 600, color: '#1a202c'}}>Room {t.room_number}</p>
                                </div>
                                <div>
                                  <p style={{fontSize: 11, color: '#718096', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px'}}>EMAIL</p>
                                  <p style={{fontSize: 15, fontWeight: 600, color: '#1a202c'}}>{t.user_email}</p>
                                </div>
                                <div>
                                  <p style={{fontSize: 11, color: '#718096', marginBottom: 6, fontWeight: 600, letterSpacing: '0.5px'}}>STATUS</p>
                                  <span className="pill success">Active</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTenants.length === 0 && (
              <p style={{textAlign: 'center', color: '#718096', padding: '40px'}}>
                No tenants found matching your search.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}