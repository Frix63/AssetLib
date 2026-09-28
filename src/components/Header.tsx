import React from 'react';
import { useAppStore } from '../store/useAppStore';


export const Header: React.FC = () => {
  const {
    viewMode,
    searchQuery,
    setViewMode,
    setSearchQuery,
    setActiveCategory,
    setActiveCollection,
    toggleTheme,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              src="/assets/brand/chris-creative/White-full.svg"
              alt="Chris Creative"
              className="chris-creative-logo dark-only"
            />
            <img
              src="/assets/brand/chris-creative/Black-full.svg"
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
          DOWNLOAD ALL
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
          ALL SHAPES
        </button>
        <button className="btn" onClick={toggleTheme}>
          B/W
        </button>
      </div>
    </header>
  );
};
