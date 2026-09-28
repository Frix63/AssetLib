import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const {
    summary,
    activeCategory,
    isMobileNavOpen,
    setActiveCategory,
    openInfoModal,
    closeMobileNav
  } = useAppStore();

  const categories = summary?.categories || {};
  const totalShapes = summary?.total_shapes || 0;

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    closeMobileNav();
  };

  const handleOpenInfo = (type: 'license' | 'faq') => {
    openInfoModal(type);
    closeMobileNav();
  };

  return (
    <aside className={isMobileNavOpen ? 'mobile-open' : ''}>
      <div className="sidebar-top-bar">
        <div className="sidebar-header">CATEGORIES</div>
        <button
          className="sidebar-close-btn"
          onClick={closeMobileNav}
          aria-label="Close categories menu"
          title="Close"
        >
          &times;
        </button>
      </div>

      <ul className="nav-list">
        <li
          className={`nav-item ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleSelectCategory('all')}
        >
          <span>ALL CATEGORIES</span>
          <span className="nav-badge">{totalShapes}</span>
        </li>

        {Object.entries(categories).map(([id, info]) => (
          <li
            key={id}
            className={`nav-item ${activeCategory === id ? 'active' : ''}`}
            onClick={() => handleSelectCategory(id)}
          >
            <span>{info.title.toUpperCase()}</span>
            <span className="nav-badge">{info.count}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button
          className="sidebar-link-btn"
          onClick={() => handleOpenInfo('license')}
          title="Commercial License & Terms"
        >
          LICENSE
        </button>
        <span style={{ opacity: 0.3 }}>&bull;</span>
        <button
          className="sidebar-link-btn"
          onClick={() => handleOpenInfo('faq')}
          title="Designer FAQ & Usage Guide"
        >
          FAQ
        </button>
      </div>
    </aside>
  );
};
