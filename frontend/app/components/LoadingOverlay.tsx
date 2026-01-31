'use client';
import React, { useState } from 'react';

type LoadingOverlayProps = {
  show: boolean;
  label?: string;
  gifSrc?: string;
};

export default function LoadingOverlay({ show, label = 'Loading', gifSrc = '/loader.gif' }: LoadingOverlayProps) {
  const [gifFailed, setGifFailed] = useState(false);
  if (!show) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={label}>
      {!gifFailed && gifSrc ? (
        <img
          className="loading-gif"
          src={gifSrc}
          alt=""
          aria-hidden="true"
          onError={() => setGifFailed(true)}
        />
      ) : (
        <div className="loading-spinner" aria-hidden="true">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      )}
      <div className="loading-text">{label}...</div>
    </div>
  );
}
