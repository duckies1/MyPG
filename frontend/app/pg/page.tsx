'use client';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PgApi, AuthApi } from '../../lib/api';
import WaitScreen from '../components/WaitScreen';
import { PageLoadingFallback } from '../components/LoadingFallback';

function PgListContent() {
  const [pgs, setPgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState<{ code: string; pgName: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        const status = await AuthApi.getStatus();
        
        // Tenants cannot access PG management
        if (status.role === 'TENANT') {
          setHasAccess(false);
          setCheckingAccess(false);
          // Redirect tenants to tenants page
          router.push('/tenants');
          return;
        }
        
        setHasAccess(true);
        setCheckingAccess(false);
        
        // Fetch PGs for admin
        const data = await PgApi.list();
        setPgs(data);
      } catch (err) {
        setHasAccess(false);
        setPgs([]);
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    };
    checkAccessAndFetch();
  }, [router]);

  if (checkingAccess) {
    return null; // Loading...
  }

  if (!hasAccess) {
    return <WaitScreen />;
  }

  const handleGenerateInvite = async (pgId: number, pgName: string) => {
    try {
      const result = await AuthApi.generateInvite(pgId);
      setInviteData({ code: result.invite_code, pgName });
      setShowInviteModal(true);
      setCopied(false);
    } catch (err: any) {
      const message = typeof err === 'string' ? err : (err?.message || 'Failed to generate invite code');
      alert(message);
    }
  };

  const copyInviteLink = () => {
    if (!inviteData) return;
    const link = getInviteLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getInviteLink = () => {
    if (!inviteData) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/signup?invite=${inviteData.code}`;
  };

  const handleShare = async () => {
    if (!inviteData) return;
    const link = getInviteLink();
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${inviteData.pgName} on MyPG`,
          text: `Use this link to sign up for ${inviteData.pgName}.`,
          url: link
        });
        return;
      } catch {
        // User cancelled or share failed - fall through to copy
      }
    }
    copyInviteLink();
  };

  const closeModal = () => {
    setShowInviteModal(false);
    setCopied(false);
  };

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
        <div className="card" style={{textAlign: 'center', padding: 60}}>
          <div style={{fontSize: 48, marginBottom: 16}}>🏢</div>
          <p style={{fontSize: 16, color: '#718096'}}>Loading your PGs...</p>
        </div>
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

                <div style={{display: 'flex', gap: 8, marginTop: 16}}>
                  <Link href={`/pg/${pg.id}/rooms`} className="button secondary" style={{flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px 20px'}}>
                    View Rooms
                  </Link>
                  <button 
                    onClick={() => handleGenerateInvite(pg.id, pg.name)}
                    className="button"
                    style={{flex: 1, padding: '10px 20px', fontSize: 14}}
                  >
                    📧 Invite Tenant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && inviteData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeModal}>
          <div className="card" style={{maxWidth: 500, width: '90%', margin: 20}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20}}>
              <div>
                <h3 style={{margin: '0 0 4px 0'}}>Invite Tenant to {inviteData.pgName}</h3>
                <p style={{margin: 0, color: '#718096', fontSize: 14}}>Share this link with your tenant</p>
              </div>
              <button 
                onClick={closeModal}
                style={{background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#718096'}}
              >
                ×
              </button>
            </div>

            {/* Shareable Link Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <label style={{display: 'block', fontSize: 14, fontWeight: 600, color: '#1a202c', marginBottom: 12}}>
                Shareable link
              </label>

              <div style={{
                display: 'flex',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                overflow: 'hidden'
              }}>
                <input
                  type="text"
                  value={getInviteLink()}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: 'none',
                    fontSize: 13,
                    color: '#4a5568',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={copyInviteLink}
                  style={{
                    background: copied ? '#10b981' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s'
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy link'}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div style={{marginBottom: 16}}>
              <p style={{fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 12}}>Share via</p>
              <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
                <button
                  onClick={handleShare}
                  className="button secondary"
                  style={{flex: 1, minWidth: 120, padding: '10px 16px'}}
                >
                  🔗 Share
                </button>
                <a
                  href={getInviteLink() ? `https://wa.me/?text=${encodeURIComponent(`Join ${inviteData.pgName} on MyPG: ${getInviteLink()}`)}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="button secondary"
                  style={{flex: 1, minWidth: 120, padding: '10px 16px', textDecoration: 'none', textAlign: 'center'}}
                >
                  📱 WhatsApp
                </a>
                <a
                  href={getInviteLink() ? `mailto:?subject=${encodeURIComponent(`Invite to ${inviteData.pgName}`)}&body=${encodeURIComponent(`Use this link to sign up: ${getInviteLink()}`)}` : '#'}
                  className="button secondary"
                  style={{flex: 1, minWidth: 120, padding: '10px 16px', textDecoration: 'none', textAlign: 'center'}}
                >
                  ✉️ Email
                </a>
              </div>
            </div>

            <p style={{fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: 0, paddingTop: 12, borderTop: '1px solid #e2e8f0'}}>
              The tenant will be automatically linked to this PG when they sign up
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PgListPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <PgListContent />
    </Suspense>
  );
}