'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoggedIn, isChecking } = useAuth();
  const router = useRouter();

  // Redirect to PG page if already logged in
  useEffect(() => {
    if (!isChecking && isLoggedIn) {
      router.push('/pg');
    }
  }, [isLoggedIn, isChecking, router]);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-icon">🏢</div>
        <h1>MyPG</h1>
        <p>Managing a PG doesn't have to be complicated</p>
        <p className="subtitle">
          MyPG helps PG owners easily manage rooms, tenants, and day-to-day operations through a clean and modern dashboard. 
          Everything you need is organized in one place, so you can spend less time managing and more time growing.
        </p>
        {!isLoggedIn && (
          <>
            <div className="hero-actions">
              <Link href="/signup" className="button hero-link">Get Started Free</Link>
              <Link href="/login" className="button secondary hero-link" style={{background: '#fff', color: '#6366f1', border: '1px solid #e2e8f0'}}>Sign In</Link>
            </div>
            <p style={{fontSize: 12, marginTop: 16}}>No credit card required • Start managing in minutes</p>
          </>
        )}
      </div>

      {/* Features Section */}
      <div style={{marginBottom: 40}}>
        <div style={{textAlign: 'center', marginBottom: 40}}>
          <h2 className="section-title">Everything you need to manage your PGs</h2>
          <p className="section-desc">Powerful features designed specifically for PG owners</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Manage Multiple PGs</h3>
            <p>Track all your properties in one centralized dashboard</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Room Management</h3>
            <p>Keep track of room availability, types, and rent details</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Tenant Tracking</h3>
            <p>Monitor tenant information, status, and contact details</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Occupancy Insights</h3>
            <p>View real-time occupancy rates and availability</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Simple & Efficient</h3>
            <p>Streamlined interface designed for quick access</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Organized Data</h3>
            <p>All your PG information structured and easy to find</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="cta-section">
          <h2>Ready to simplify your PG management?</h2>
          <p>Join PG owners who are saving time and staying organized with MyPG</p>
          <div className="hero-actions">
            <Link href="/signup" className="button" style={{background: '#fff', color: '#6366f1'}}>Create Free Account</Link>
            <Link href="/login" className="button" style={{background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)'}}>Sign In</Link>
          </div>
        </div>
      )}
    </div>
  );
}