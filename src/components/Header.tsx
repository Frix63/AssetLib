import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { getAssetUrl } from '../core/router';

export const Header: React.FC = () => {
  const {
    viewMode,
    searchQuery,
    isMobileNavOpen,
    setViewMode,
    setSearchQuery,
    setActiveCategory,
    setActiveCollection,
    toggleTheme,
    toggleMobileNav,
    openDownloadModal
  } = useAppStore();

  const handleBrandClick = () => {
    setActiveCategory('all');
    setActiveCollection(null);
    setViewMode('groups');
    setSearchQuery('');
  };

  return (
    <header>
      <div className="top-left">
        <button
          className={`btn mobile-menu-btn ${isMobileNavOpen ? 'active' : ''}`}
          onClick={() => toggleMobileNav()}
          aria-label="Toggle categories navigation"
          title="Categories"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'block' }}
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="mobile-menu-text">CATEGORIES</span>
        </button>

        <div className="brand-group">
          <div className="brand-title" onClick={handleBrandClick}>
            AssetLib
          </div>
          <a
            href="https://www.chris-creative.com"
            target="_blank"
            rel="noopener noreferrer"
            className="chris-creative-link"
            title="Chris Creative (www.chris-creative.com)"
          >
            <span className="chris-creative-by">- by</span>
            <img
              src={getAssetUrl('assets/brand/chris-creative/White-full.svg')}
              alt="Chris Creative"
              className="chris-creative-logo dark-only"
            />
            <img
              src={getAssetUrl('assets/brand/chris-creative/Black-full.svg')}
              alt="Chris Creative"
              className="chris-creative-logo light-only"
            />
          </a>
        </div>
      </div>

      <div className="top-center">
        <input
          type="text"
          className="search-input"
          placeholder="SEARCH (STAR, CROSSHAIR, DAISY)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="top-right">
        <button
          className="btn"
          onClick={openDownloadModal}
          title="Download all 2,069 assets in one ZIP pack"
          style={{ letterSpacing: '0.5px' }}
        >
          <span className="desktop-btn-label">DOWNLOAD ALL</span>
          <span className="mobile-btn-label">DL ALL</span>
        </button>
        <button
          className={`btn ${viewMode === 'groups' ? 'active' : ''}`}
          onClick={() => {
            setActiveCollection(null);
            setViewMode('groups');
          }}
        >
          GROUPS
        </button>
        <button
          className={`btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveCollection(null);
            setViewMode('all');
          }}
        >
          <span className="desktop-btn-label">ALL SHAPES</span>
          <span className="mobile-btn-label">ALL</span>
        </button>
        <button className="btn" onClick={toggleTheme}>
          B/W
        </button>
      </div>
    </header>
  );
};
