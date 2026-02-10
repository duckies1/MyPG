'use client';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { TenantApi, AuthApi } from '../../lib/api';
import WaitScreen from '../components/WaitScreen';
import { PageLoadingFallback } from '../components/LoadingFallback';

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

const PAGE_SIZE = 50;

function TenantsContent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTenants, setTotalTenants] = useState(0);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        const status = await AuthApi.getStatus();
        setUserStatus(status);
        setCheckingAccess(false);
        
        // If tenant without bed, don't fetch tenants
        if (status.role === 'TENANT' && !status.has_bed) {
          setLoading(false);
          return;
        }
        
        // Fetch tenants (filtered by backend based on role)
        const data = await TenantApi.list(currentPage, PAGE_SIZE);
        // Handle both paginated and non-paginated responses
        if (Array.isArray(data)) {
          setTenants(data);
          setTotalTenants(data.length);
        } else {
          setTenants(data.items || []);
          setTotalTenants(data.total || 0);
        }
      } catch {
        setTenants([]);
        setTotalTenants(0);
      } finally {
        setLoading(false);
      }
    };
    checkAccessAndFetch();
  }, [currentPage]);

  if (checkingAccess) {
    return null; // Loading...
  }

  // Show wait screen for tenants without bed assignment
  if (userStatus?.role === 'TENANT' && !userStatus?.has_bed) {
    return <WaitScreen />;
  }

  // Filter tenants based on search query (client-side, on current page)
  const filteredTenants = tenants.filter(t => 
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pg_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.move_in_date.includes(searchQuery)
  );

  const activeTenants = tenants.length;
  const leftTenants = 0;
  const totalPages = Math.ceil(totalTenants / PAGE_SIZE);

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
          <p className="subtitle">
            {userStatus?.role === 'TENANT' ? 'View tenants from your PG' : 'Manage all your tenants across properties'}
          </p>
        </div>
        {userStatus?.role === 'ADMIN' && (
          <Link href="/tenants/create" className="button" style={{alignSelf: 'flex-end'}}>+ Add Tenant</Link>
        )}
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
      {loading ? (
        <div className="card" style={{textAlign: 'center', padding: 60}}>
          <div style={{fontSize: 48, marginBottom: 16}}>👥</div>
          <p style={{fontSize: 16, color: '#718096'}}>Loading tenants...</p>
        </div>
      ) : tenants.length === 0 ? (
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
              Showing {filteredTenants.length} of {tenants.length} on page {currentPage} (Total: {totalTenants})
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center'}}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="button secondary"
                style={{padding: '8px 16px', fontSize: 13}}
              >
                ← Previous
              </button>
              <span style={{fontSize: 13, color: '#718096'}}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="button secondary"
                style={{padding: '8px 16px', fontSize: 13}}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TenantsPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <TenantsContent />
    </Suspense>
  );
}