'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthApi } from '../lib/api';
import { useEffect, useState } from 'react';

function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Check auth on mount and when pathname changes
    const checkAuth = async () => {
      try {
        await AuthApi.getMe();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [pathname]); // Recheck auth when route changes
  
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
        <Link href="/">Home</Link>
        {isLoggedIn && (
          <>
            <Link href="/pg">PGs</Link>
            <Link href="/tenants">Tenants</Link>
          </>
        )}
        {!isLoggedIn && !isChecking && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        )}
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8}}>
          <span className={`pill ${isLoggedIn ? 'success' : 'muted'}`}>
            {isLoggedIn ? 'Signed in' : 'Guest'}
          </span>
          {isLoggedIn && (
            <button className="button" onClick={handleSignOut}>Sign Out</button>
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
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}