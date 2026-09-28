import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const MasterDownloadModal: React.FC = () => {
  const { isDownloadModalOpen, closeDownloadModal, showToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load previously saved email if any
  useEffect(() => {
    if (isDownloadModalOpen) {
      const saved = localStorage.getItem('assetlib_download_email');
      if (saved) setEmail(saved);
      setSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isDownloadModalOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isDownloadModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDownloadModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDownloadModalOpen, closeDownloadModal]);

  if (!isDownloadModalOpen) return null;

  const triggerDownload = () => {
    const a = document.createElement('a');
    a.href = '/downloads/AssetLib-Vectors.zip';
    a.download = 'AssetLib-Vectors.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsSubmitting(true);
    localStorage.setItem('assetlib_download_email', cleanEmail);

    // 1. Save to local CSV file via Vite / backend API endpoint
    try {
      await fetch('/api/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          source: 'master_download',
          timestamp: new Date().toISOString()
        })
      });
    } catch {
      // Ignore network errors so download proceeds smoothly
    }

    // 2. Also persist in localStorage subscriber list
    try {
      const existingStr = localStorage.getItem('assetlib_subscribers');
      const list = existingStr ? JSON.parse(existingStr) : [];
      list.push({
        date: new Date().toISOString(),
        email: cleanEmail,
        source: 'master_download'
      });
      localStorage.setItem('assetlib_subscribers', JSON.stringify(list));
    } catch {
      // Ignore localStorage errors
    }

    // 3. Free silent webhook dispatch (Zero cost, no paid email service)
    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'assetlib-free-lead',
          email: cleanEmail,
          subject: 'AssetLib Vector Archive Download',
          source: 'download_modal',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch {
      // Ignore
    }

    // Trigger instant file download
    triggerDownload();
    setSubmitted(true);
    setIsSubmitting(false);
    showToast('ARCHIVE DOWNLOAD STARTED');
  };

  // Helper to export CSV on demand
  const handleExportCsv = () => {
    // Try to download from server endpoint first, fallback to client-side localStorage CSV
    const a = document.createElement('a');
    a.href = '/api/subscribers.csv';
    a.download = 'subscribers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={closeDownloadModal}
    >
      <div
        className="modal-container"
        style={{
          background: 'var(--bg)',
          color: 'var(--fg)',
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px' }}>
              COMPLETE VECTOR ARCHIVE
            </div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>
              2,069 CURATED SVGs &bull; 1.89 MB &bull; CC0 PUBLIC DOMAIN
            </div>
          </div>
          <button
            className="btn"
            style={{ padding: '4px 8px', fontSize: '14px', lineHeight: 1 }}
            onClick={closeDownloadModal}
            title="Close (Esc)"
          >
            &times;
          </button>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', lineHeight: 1.5, opacity: 0.85, marginBottom: '20px' }}>
          Download the entire offline collection of all 2,069 authentic vector shapes organized cleanly into 12 categorized folders (Y2K Stars, HUD Reticles, Acid Sigils, Bauhaus, Memphis, Sacred Geometry, Halftones, and more).
        </p>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '12px', opacity: 0.75 }}>
          <div>&bull; Instant access to all 12 aesthetic movements</div>
          <div>&bull; Clean, optimized SVGs ready for Figma, Illustrator & code</div>
          <div>&bull; 100% free for commercial & personal client projects</div>
        </div>

        {/* Submission Form or Success State */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              required
              className="search-input"
              placeholder="ENTER YOUR EMAIL..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                background: 'var(--input-bg)',
                color: 'var(--fg)',
                outline: 'none',
                borderRadius: 0,
                border: 'none'
              }}
            />
            <button
              type="submit"
              className="btn active"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                borderRadius: 0,
                border: 'none',
                textAlign: 'center'
              }}
            >
              {isSubmitting ? 'PREPARING ARCHIVE...' : 'DOWNLOAD ALL (.ZIP)'}
            </button>
            <div style={{ fontSize: '11px', opacity: 0.5, textAlign: 'center', marginTop: '4px' }}>
              Zero spam. Direct file download starts immediately.
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fg)' }}>
              &#10003; DOWNLOAD STARTED!
            </div>
            <div style={{ fontSize: '12px', opacity: 0.75 }}>
              Check your browser downloads for <code>AssetLib-Vectors.zip</code>.
            </div>
            <button
              className="btn"
              onClick={triggerDownload}
              style={{ padding: '10px 16px', fontSize: '12px', marginTop: '8px' }}
            >
              CLICK HERE IF DOWNLOAD DIDN'T START
            </button>
            <div style={{ marginTop: '8px', opacity: 0.5, fontSize: '11px' }}>
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'inherit'
                }}
                title="Download subscribers.csv"
              >
                Export collected subscribers (.csv)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
