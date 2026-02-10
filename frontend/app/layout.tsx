'use client';
import './globals.css';
import Link from 'next/link';
import GlobalLoader from './components/GlobalLoader';
import { usePathname, useRouter } from 'next/navigation';
import { AuthApi } from '../lib/api';
import { useEffect, useState } from 'react';

function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthApi.getMe();
        setIsLoggedIn(true);
        setUserRole(user.role);
      } catch {
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [pathname]);
  
  const handleSignOut = async () => {
    try {
      await AuthApi.logout();
      setIsLoggedIn(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      setIsLoggedIn(false);
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
              <Link href="/pg" style={{color: pathname === '/pg' ? '#6366f1' : '#718096'}}>PGs</Link>
            )}
            <Link href="/tenants" style={{color: pathname === '/tenants' ? '#6366f1' : '#718096'}}>Tenants</Link>
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
        <GlobalLoader />
        <Nav />
        <main className="container" style={{paddingTop: 24}}>
          {children}
        </main>
        <footer className="footer">
          © 2026 MyPG. Simplifying PG management.
        </footer>
      </body>
    </html>
  );
}