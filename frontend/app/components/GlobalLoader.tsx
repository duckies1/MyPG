'use client';
import { useEffect, useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

export default function GlobalLoader() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const delta = (event as CustomEvent).detail?.delta ?? 0;
      setLoadingCount(count => Math.max(0, count + delta));
    };

    window.addEventListener('mypg-loading', handler as EventListener);
    return () => window.removeEventListener('mypg-loading', handler as EventListener);
  }, []);

  if (!mounted) return null;

  return <LoadingOverlay show={loadingCount > 0} label="Loading" />;
}
