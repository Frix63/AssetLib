import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const { summary, activeCategory, setActiveCategory, openInfoModal } = useAppStore();

  const categories = summary?.categories || {};
  const totalShapes = summary?.total_shapes || 0;

  return (
    <aside>
      <div className="sidebar-header">CATEGORIES</div>
      <ul className="nav-list">
        <li
          className={`nav-item ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          <span>ALL CATEGORIES</span>
          <span className="nav-badge">{totalShapes}</span>
        </li>

        {Object.entries(categories).map(([id, info]) => (
          <li
            key={id}
            className={`nav-item ${activeCategory === id ? 'active' : ''}`}
            onClick={() => setActiveCategory(id)}
          >
            <span>{info.title.toUpperCase()}</span>
            <span className="nav-badge">{info.count}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button
          className="sidebar-link-btn"
          onClick={() => openInfoModal('license')}
          title="Commercial License & Terms"
        >
          LICENSE
        </button>
        <span style={{ opacity: 0.3 }}>&bull;</span>
        <button
          className="sidebar-link-btn"
          onClick={() => openInfoModal('faq')}
          title="Designer FAQ & Usage Guide"
        >
          FAQ
        </button>
      </div>
    </aside>
  );
};
