import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const InfoModal: React.FC = () => {
  const { activeInfoModal, closeInfoModal, openInfoModal } = useAppStore();

  // Handle ESC key
  useEffect(() => {
    if (!activeInfoModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInfoModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInfoModal, closeInfoModal]);

  if (!activeInfoModal) return null;

  const isLicense = activeInfoModal === 'license';

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
      onClick={closeInfoModal}
    >
      <div
        className="modal-container"
        style={{
          background: 'var(--bg)',
          color: 'var(--fg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
          padding: '0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--hover-bg)'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${isLicense ? 'active' : ''}`}
              onClick={() => openInfoModal('license')}
              style={{ fontSize: '12px', letterSpacing: '0.6px' }}
            >
              COMMERCIAL LICENSE
            </button>
            <button
              className={`btn ${!isLicense ? 'active' : ''}`}
              onClick={() => openInfoModal('faq')}
              style={{ fontSize: '12px', letterSpacing: '0.6px' }}
            >
              DESIGNER FAQ
            </button>
          </div>
          <button
            className="btn"
            style={{ padding: '4px 8px', fontSize: '16px', lineHeight: 1 }}
            onClick={closeInfoModal}
            title="Close (Esc)"
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLicense ? (
            <>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.8px', marginBottom: '6px' }}>
                  COMMERCIAL LICENSE &amp; USAGE RIGHTS
                </h2>
                <div style={{ fontSize: '12px', opacity: 0.6, letterSpacing: '0.4px' }}>
                  CREATIVE COMMONS ZERO (CC0 1.0 UNIVERSAL) &bull; PUBLIC DOMAIN DEDICATION
                </div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.9 }}>
                AssetLib provides free, high-precision vector shapes and design assets for the creative community. All shapes are released under the CC0 Public Domain dedication. You are free to copy, modify, distribute, and perform the work, even for commercial purposes, all without asking permission.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--fg)' }}>
                    &#10003; WHAT IS ALLOWED:
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.6, opacity: 0.85, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><strong>Client Work &amp; Branding:</strong> Unlimited commercial client projects, brand identities, pitch decks, and corporate collateral.</li>
                    <li><strong>Streetwear &amp; Apparel:</strong> Print on t-shirts, hoodies, sneakers, tags, and physical merchandise.</li>
                    <li><strong>Cover Art &amp; Packaging:</strong> Album covers, vinyl sleeves, book jackets, poster designs, and stickers.</li>
                    <li><strong>Digital &amp; Web Design:</strong> Figma files, websites, mobile applications, design systems, and icon sets.</li>
                    <li><strong>Motion &amp; Video:</strong> Animated graphics, title sequences, music videos, and social media reels.</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.5px', marginBottom: '8px', color: 'var(--fg)' }}>
                    &#9888; RESTRICTIONS:
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    <li>You may not re-upload the entire unmodified raw archive to sell as a standalone stock vector pack on marketplaces (like Envato or Creative Market). Use them in your creative work, not as a wholesale clone of the library.</li>
                  </ul>
                </div>

                <div style={{ fontSize: '12px', opacity: 0.65, lineHeight: 1.5 }}>
                  <strong>Attribution:</strong> Attribution is never legally required. If you share work created with AssetLib, tagging or crediting <code>chris-creative.com</code> is always appreciated.
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.8px', marginBottom: '6px' }}>
                  DESIGNER FAQ &amp; TOOL GUIDE
                </h2>
                <div style={{ fontSize: '12px', opacity: 0.6, letterSpacing: '0.4px' }}>
                  FREQUENTLY ASKED QUESTIONS ABOUT ASSETLIB
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    How are the shapes constructed?
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    Every asset is generated through exact geometric code and procedural vector algorithms—never autotraced from pixelated bitmaps. This ensures pure, lightweight SVG geometry with clean bezier curves, zero artifact points, and perfect scalability across print and screen.
                  </div>
                </div>

                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    How do I copy shapes directly into Figma or Adobe Illustrator?
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    Click on any shape to open the inspection modal, then click <strong>&quot;COPY SVG&quot;</strong>. In Figma or Illustrator, press <code>Ctrl+V</code> (or <code>Cmd+V</code>) on your canvas. The shape will paste instantly as native vector paths with fully editable anchor points and fills.
                  </div>
                </div>

                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    What file formats are included?
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    All shapes are provided in two formats:
                    <ul style={{ paddingLeft: '18px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li><strong>SVG:</strong> Ultra-clean, scalable vector code ready for Figma, Illustrator, and web development.</li>
                      <li><strong>PNG:</strong> 300 DPI high-resolution transparent raster images from 512px up to 2048px.</li>
                      <li><strong>Master ZIP:</strong> Click &quot;DOWNLOAD ALL&quot; to download all 2,069 assets organized into 12 categorized folders.</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    Can I customize points, arms, and shapes?
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    Yes! Over 1,175 shapes feature live sliders in the <strong>CUSTOMIZE</strong> drawer. You can manipulate points, density, frequency, arms, stroke weight, rotation, and scale in real time before exporting.
                  </div>
                </div>

                <div style={{ background: 'var(--input-bg)', padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                    Can I use these for commercial client projects?
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.85 }}>
                    Yes, 100%. All assets are released under Creative Commons Zero (CC0 Public Domain). You can use them freely in commercial client projects, apparel, album covers, and digital products with no royalties or fees.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
