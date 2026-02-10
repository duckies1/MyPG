'use client';
import './globals.css';
import Link from 'next/link';
import GlobalLoader from './components/GlobalLoader';
import { usePathname, useRouter } from 'next/navigation';
import { AuthApi } from '../lib/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { prefetchData } from '../lib/prefetch';
import { useCallback, useRef } from 'react';

function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isChecking, userRole } = useAuth();
  
  // Track which prefetch calls are in flight to avoid duplicates
  const prefetchInFlight = useRef<Set<string>>(new Set());
  
  const safePrefetch = useCallback((key: string, fn: () => Promise<void>) => {
    if (prefetchInFlight.current.has(key)) {
      return; // Already prefetching, skip
    }
    prefetchInFlight.current.add(key);
    fn().finally(() => {
      prefetchInFlight.current.delete(key);
    });
  }, []);

  const handlePgHover = useCallback(() => {
    safePrefetch('pgs', prefetchData.pgs);
  }, [safePrefetch]);

  const handleTenantsHover = useCallback(() => {
    safePrefetch('tenants', prefetchData.tenants);
  }, [safePrefetch]);
  
  const handleSignOut = async () => {
    try {
      await AuthApi.logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/login');
    }
  };

  return (
    <header className="header">
      <nav className="nav">
        <Link href="/" className="nav-brand">
          <div className="nav-brand-icon">🏢</div>
          MyPG
        </Link>
        
        {isLoggedIn && (
          <>
            {userRole === 'ADMIN' && (
              <Link 
                href="/pg" 
                style={{color: pathname === '/pg' ? '#6366f1' : '#718096'}}
                onMouseEnter={handlePgHover}
              >
                PGs
              </Link>
            )}
            <Link 
              href="/tenants" 
              style={{color: pathname === '/tenants' ? '#6366f1' : '#718096'}}
              onMouseEnter={handleTenantsHover}
            >
              Tenants
            </Link>
          </>
        )}
        
        <div className="nav-right">
          {isLoggedIn && (
            <>
              <span className="pill success">Signed in</span>
              <button className="button secondary" onClick={handleSignOut}>↗ Sign Out</button>
            </>
          )}
          {!isLoggedIn && !isChecking && (
            <>
              <Link href="/login" style={{color: '#6366f1', textDecoration: 'none', fontWeight: 600}}>Sign In</Link>
              <Link href="/signup" className="button">Create Account</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GlobalLoader />
          <Nav />
          <main className="container" style={{paddingTop: 24}}>
            {children}
          </main>
          <footer className="footer">
            © 2026 MyPG. Simplifying PG management.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}