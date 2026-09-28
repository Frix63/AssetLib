import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AssetCard } from './AssetCard';
import { AssetItem, CollectionItem } from '../core/types';

const BATCH_SIZE = 48;

function getArchetypeKey(name: string): string {
  if (!name) return '';
  let k = name.replace(/_sw\d+/g, '');
  if (k.startsWith('organic_ribbon_')) {
    k = k.replace(/_t\d+/g, '');
  }
  if (/^(?:arrow_swoosh|lissajous|rose_rhodonea|halftone_rings|abstract_string_art|acid_vortex)/.test(k)) {
    k = k.replace(/_w\d+$/, '');
  }
  return k;
}

function deduplicateToArchetypes(items: AssetItem[]): AssetItem[] {
  const seen = new Set<string>();
  const result: AssetItem[] = [];
  for (const item of items) {
    const name = item.name || (item as any).id || '';
    const archKey = getArchetypeKey(name);
    if (!seen.has(archKey)) {
      seen.add(archKey);
      result.push(item);
    }
  }
  return result;
}

export const CardGrid: React.FC = () => {
  const {
    summary,
    activeCategory,
    viewMode,
    activeCollection,
    searchQuery,
    loadedCategories,
    allShapes,
    setViewMode,
    setActiveCollection,
    loadCategoryChunk
  } = useAppStore();

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const mainRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Auto-load current category chunk if not yet loaded
  useEffect(() => {
    if (activeCategory !== 'all') {
      loadCategoryChunk(activeCategory);
    }
  }, [activeCategory, loadCategoryChunk]);

  // Compute items to display based on viewMode, activeCategory, activeCollection, and searchQuery
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (viewMode === 'groups') {
      let cols = summary?.collections || [];
      if (activeCategory !== 'all') {
        cols = cols.filter(c => c.category === activeCategory);
      }
      if (q) {
        cols = cols.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return cols;
    }

    if (viewMode === 'group_detail') {
      if (!activeCollection) return [];
      const colItems: AssetItem[] = (activeCollection as any).items || [];
      let rawItems: AssetItem[] = [];

      if (colItems.length > 0) {
        rawItems = colItems;
      } else {
        const catShapes = loadedCategories[activeCollection.category] || [];
        rawItems = catShapes.filter(s =>
          s.collection_id === activeCollection.id ||
          (s.file && s.file.includes(activeCollection.id))
        );
      }

      if (rawItems.length === 0 && allShapes.length > 0) {
        rawItems = allShapes.filter(s =>
          s.collection_id === activeCollection.id ||
          (s.file && s.file.includes(activeCollection.id))
        );
      }

      let items = deduplicateToArchetypes(rawItems);

      if (q) {
        items = items.filter(s =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
      return items;
    }

    // viewMode === 'all'
    let shapes = allShapes;
    if (activeCategory !== 'all') {
      shapes = loadedCategories[activeCategory] || [];
    }
    if (q) {
      shapes = shapes.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return shapes;
  }, [summary, activeCategory, viewMode, activeCollection, searchQuery, loadedCategories, allShapes]);

  // Reset pagination on filter changes and scroll to top
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [viewMode, activeCategory, activeCollection, searchQuery]);

  // Auto-expand if viewport has room for more cards without scrolling
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    if (mainEl.scrollHeight <= mainEl.clientHeight + 200 && visibleCount < filteredItems.length) {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredItems.length));
    }
  }, [visibleCount, filteredItems.length]);

  // IntersectionObserver for infinite scrolling with main container as root
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const mainEl = mainRef.current;
    if (!sentinel || !mainEl) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredItems.length));
      }
    }, { root: mainEl, rootMargin: '400px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 500) {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredItems.length));
    }
  };

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const isCollection = viewMode === 'groups';

  // Breadcrumb formatting
  const breadcrumbText = useMemo(() => {
    if (viewMode === 'group_detail' && activeCollection) {
      const totalStyles = (activeCollection as any).items?.length || activeCollection.count || filteredItems.length;
      return (
        <>
          <button
            className="btn"
            style={{ padding: '0 4px', marginRight: '6px' }}
            onClick={() => {
              setActiveCollection(null);
              setViewMode('groups');
            }}
          >
            &larr; ALL GROUPS
          </button>
          <span>/</span>
          <span style={{ marginLeft: '6px', fontWeight: 800 }}>{activeCollection.title.toUpperCase()}</span>
          <span style={{ opacity: 0.6, marginLeft: '6px' }}>({totalStyles} STYLES)</span>
        </>
      );
    }
    if (viewMode === 'all') {
      const catTitle = activeCategory === 'all' ? 'ALL INDIVIDUAL SHAPES' : summary?.categories[activeCategory]?.title.toUpperCase() || 'SHAPES';
      return <span style={{ fontWeight: 800 }}>{catTitle}</span>;
    }
    const catTitle = activeCategory === 'all' ? 'ALL SHAPE GROUPS' : summary?.categories[activeCategory]?.title.toUpperCase() || 'GROUPS';
    return <span style={{ fontWeight: 800 }}>{catTitle}</span>;
  }, [viewMode, activeCollection, activeCategory, summary, filteredItems.length, setActiveCollection, setViewMode]);

  const statusLabel = useMemo(() => {
    if (viewMode === 'group_detail') {
      return `${filteredItems.length} ORIGINALS`;
    }
    if (viewMode === 'groups') {
      return `${filteredItems.length} GROUPS`;
    }
    return `${filteredItems.length} ${filteredItems.length === 1 ? 'ITEM' : 'ITEMS'}`;
  }, [viewMode, filteredItems.length]);

  return (
    <main ref={mainRef as React.RefObject<HTMLElement>} onScroll={handleScroll}>
      <div className="view-header">
        <div className="view-breadcrumb">
          {breadcrumbText}
        </div>
        <div id="statusText">
          {statusLabel}
        </div>
      </div>

      <div className="grid">
        {displayedItems.map((item, index) => {
          const key = (item as CollectionItem).id || (item as AssetItem).file || (item as any).name || index;
          return (
            <AssetCard
              key={key}
              item={item}
              itemsList={filteredItems}
              isCollection={isCollection}
            />
          );
        })}
      </div>

      <div ref={sentinelRef} style={{ height: '40px', width: '100%', pointerEvents: 'none' }} />
    </main>
  );
};
